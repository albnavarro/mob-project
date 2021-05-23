const gulp = require('gulp')
const glob = require('glob')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const fs = require('fs')
const config = require('../../config.json')
const util = require('util')
const path = require('path')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const templatePath = path.join(themePath, 'template')
const dataPath = path.join(themePath, 'data')
const distPath = path.join(destPath, 'assets/dist')
const dataDestFolder = path.join(destPath, 'assets/data')
const manifestFile = `${distPath}/manifest.json`
const permalinkFile = `${dataDestFolder}/permalinkMap.json`
const pageTitleFile = `${dataDestFolder}/pageTitleMap.json`
const categoryFile = `${dataDestFolder}/categoryMap.json`
const cssDest = path.join(destPath, 'assets/css')

const store = require('../store.js')

// HELPERS
const { propValidate, sortbyDate, chunk } = require('../functions/helpers.js')

// SKIPPABLE
const { taskIsSkippable  } = require('../functions/taskIsSkippable.js')

// DEBUG
const { debugMandatoryPropierties, debugRenderHtml} = require('../functions/debug.js')

// UTILS
const {
    getPageType,
    getArchivePageName,
    getNameFile,
    getPermalink,
    getPathByLocale,
    getLanguage,
    extracAdditionalData,
    getTemplate
} = require('../functions/utils.js')


/*
* CREATE PUG FILE
*/

function html(done) {
    const sourcePath =  (!store.arg.page) ? path.join(dataPath, '/**/*.json') :  path.join(dataPath, store.arg.page)
    const streams = glob.sync(sourcePath)

    const tasks = streams.map(filepath => {
        /*
        Get json data of each file
        */
        const data = JSON.parse(fs.readFileSync(filepath))

        /*
        Get language
        */
        data.lang = getLanguage(filepath)

        /*
        Get file name
        */
        const nameFile = getNameFile(filepath)


        /*
        Get data from each json defined in additonalPata propierties [ array ] if exist
        */
        const additionalData = extracAdditionalData(data)


        /*
        List of pug include for track page refresh
        */
        const registerComponent = {}
        registerComponent.registerComponent = ('registerComponent' in data) ? data.registerComponent : []


        /*
        Get prod abient value
        */
        const prodData = {}
        prodData.isProd = (store.arg.prod) ? true : false;


        /*
        Get manifest.json for asset
        */
        const manifest = {}
        const manifestData = JSON.parse(fs.readFileSync(manifestFile))
        manifest.manifest = manifestData

        /*
        Subfolder
        Create folder in accordion of json folder position
        regex form 'data/'' to last slash
        return the exact path of json file
        */
        const subfolder = getPathByLocale(filepath,data.lang)


        /*
        Create subfolder if not exist
        */
        if(!fs.existsSync(`${destPath}/${subfolder}`)){
            fs.mkdirSync(`${destPath}/${subfolder}`, {
                recursive: true
            })
        }


        /*
        Get relative path
        */
        const relativePath = {}
        relativePath.relativePath = ( config.defaultLocales == data.lang) ? `` : `/${data.lang}`;


        /*
        Add permalink
        if in debug mode golbal stored info is bypass anche the data il read form file
        */
        if(store.arg.debug) store.permalinkMapData = JSON.parse(fs.readFileSync(permalinkFile))

        const permalink = {}
        permalink.permalink = getPermalink(subfolder,nameFile)
        permalink.staticPermalink = `${config.domain}${getPermalink(subfolder,nameFile,false)}`
        permalink.permalinkMap = store.permalinkMapData
        permalink.pageTitle = data.pageTitle

        /*
        Add pageTitle map
        if in debug mode golbal stored info is bypass anche the data il read form file
        */
        if(store.arg.debug) store.pageTitleMapData = JSON.parse(fs.readFileSync(pageTitleFile))

        const pageTitleMapObj = {}
        pageTitleMapObj.pageTitleMap = store.pageTitleMapData




        /*
        Add imported categories
        if in debug mode golbal stored info is bypass anche the data il read form file
        */
        if(store.arg.debug) store.categoryMapData = JSON.parse(fs.readFileSync(categoryFile))

        const getPosts = (data) => {
            return data.importPost.reduce((acc, curr) => {
                if (propValidate([data.lang, curr], store.categoryMapData))  acc[curr] = store.categoryMapData[data.lang][curr]
                return acc
            }, {})
        }

        const categoryObj = {}
        categoryObj.posts = ('importPost' in data) ? getPosts(data) : {}


        /*
        Add imported tags
        Check if filterType is registerd in congif
        anche the switch to every or ome method
        */
        const tagFilterType = (propValidate(['tagFilter', 'type'], data)
            && config.tagFilterType.includes(data.tagFilter.type))
            ? data.tagFilter.type
            : 'some'


        const getTags = (data) => {
            const flatCategory = Object.values(store.categoryMapData[data.lang]).flat()
            const result = flatCategory.reduce((acc, curr) => {

                // Filter postMap by tag some|every
                const postFilterByType = (tagFilterType === 'some')
                    ? data.importTag.some(item => curr.tag.includes(item))
                    : data.importTag.every(item => curr.tag.includes(item))

                // Filter postMap by category if required
                const postFilterByCategory = (propValidate(['tagFilter', 'category'], data))
                    ? data.tagFilter.category.some(item => item == curr.category)
                    : true

                if (postFilterByType && postFilterByCategory) acc.push(curr)
                return acc
            }, [])
            return result
        }

        const tagObj = {}
        tagObj.tags = ('importTag' in data) ? sortbyDate(getTags(data)) : []


        /*
        criticalcss
        */
        const critical = {}
        const criticalFile = `${cssDest}/critical/${subfolder}${nameFile}.css`
        if (store.arg.prod && fs.existsSync(criticalFile)) {
            const documentStyles = fs.readFileSync(criticalFile);
            critical.documentStyles = documentStyles.toString()
        }


        /*
        get template
        */
        // const template = `${templatePath}/${data.template}.pug`
        const template = getTemplate(data)

        const templatename = {}
        templatename.templatename = getNameFile(template)

        /*
        Add page type
        */
        const pageType = {}
        pageType.pageType = getPageType(data)


        /*
        Create empty chunkedAyrray ( pagination ) to avoid error
        */
        const chunkedPost = {}
        chunkedPost.chunkedPost = []

        /*
        merge all json
        */
        const allData = Object.assign({},
            critical,
            prodData,
            config,
            additionalData,
            permalink,
            pageTitleMapObj,
            categoryObj,
            tagObj,
            chunkedPost,
            relativePath,
            data,
            templatename,
            pageType,
            manifest
        );

        /*
        Check if page is ready to render
        */
        const skipTask = (config.selectiveRefresh) ? taskIsSkippable(filepath, allData, template) : false

        /*
        Check for mandatory propierties in json
        */
        const error = debugMandatoryPropierties(allData);
        if(error) {
            process.exit(0);
        }

        /*
        Same checkof tag and post pagination
        */
        if((propValidate(['isArchive', 'pagination'], data))
            && data.isArchive.pagination === true
            && (allData.tags.length || Object.keys(allData.posts).length)) {

            /*
            Get post per page, config si defulat otherwise is overrride form data josn
            */
            const postPerPage = ('postPerPage' in allData.isArchive)
                ? parseInt(allData.isArchive.postPerPage)
                : parseInt(config.postPerPage)

            /*
            Get dynamic page name
            */
            const dinamicPageName = ('dinamicPageName' in allData.isArchive)
                ? allData.isArchive.dinamicPageName
                : config.dinamicPageName


            /*
            Chunk array post for pagination
            Flat all category post in one array
            if there is importTag and importPost in smae file importTag win.
            */
            const flatData = (allData.tags.length) ? allData.tags : Object.values(allData.posts).flat()
            const sortedData = sortbyDate(flatData)
            const pageData = chunk(sortedData, postPerPage)

            /*
            Loop in chunked array to create each post page
            */
            const pages = pageData.map((item, index) => {
                const newData = { ... allData}

                /*
                Reset post data and add the new data for specific page
                */
                newData.chunkedPost = item

                /*
                Previous page link
                */
                const getPreviousPage = () => {
                    if (index == 0) {
                        return null
                    } else if (index == 1) {
                        return getPermalink(subfolder,nameFile)
                    } else {
                        return getPermalink(subfolder,`${dinamicPageName}${index - 1}`)
                    }
                }

                /*
                Next page link
                */
                const getNextPage = () => {
                    if (index == pageData.length - 1) {
                        return null
                    } else {
                        return getPermalink(subfolder,`${dinamicPageName}${index + 1}`)
                    }
                }

                /*
                Pagination data
                */
                newData.pagination = {
                    'total' : pageData.length,
                    'current' : index + 1,
                    'previousPage' : getPreviousPage(),
                    'nextPage' : getNextPage()
                }

                /*
                Set specific name page
                */
                const newName = getArchivePageName(index, nameFile, dinamicPageName)


                return (taskDone) =>
                    gulp.src(template)
                        .pipe(pug({
                            data: newData
                        }))
                        .pipe(rename(newName + '.html'))
                        .pipe(gulp.dest(`${destPath}/${subfolder}`))
                        .on('end', function () {
                            if(store.arg.debug) {
                                debugRenderHtml(newName, newData)
                                console.log(util.inspect('***************', { colors: true }))
                                console.log(util.inspect(`${newName} processed`, { colors: true }))
                                console.log(util.inspect('***************', { colors: true }))
                            }

                        })
            })

            const pagetask = pages.map((item, index) => {
                const newName = getArchivePageName(index, nameFile, dinamicPageName)
                item.displayName = `${getPermalink(getPathByLocale(filepath, getLanguage(filepath)), newName)}`;
                return {'skipTask' : skipTask, 'fn': item};
            })

            return pagetask


        } else {
            function renderPage(taskDone) {
                return gulp.src(template)
                    .pipe(pug({
                        data: allData
                    }))
                    .pipe(rename(nameFile + '.html'))
                    .pipe(gulp.dest(`${destPath}/${subfolder}`))
                    .on('end', function () {
                        if(store.arg.debug) {
                            debugRenderHtml(nameFile, allData)
                            console.log(util.inspect('***************', { colors: true }))
                            console.log(util.inspect(`${nameFile} processed`, { colors: true }))
                            console.log(util.inspect('***************', { colors: true }))
                        }
                        taskDone()
                    })
            }

            renderPage.displayName = `${getPermalink(getPathByLocale(filepath, getLanguage(filepath)), getNameFile(filepath))}`;
            return {'skipTask' : skipTask, 'fn': renderPage};
        }

    })

    const flatTask = [ ... tasks].flat()

    const tasksToRender = (store.counterRun > 1 )
        ? flatTask.filter((item) => item.skipTask === false ).map((item) => item.fn)
        : flatTask.map((item) => item.fn);

    return gulp.series(...tasksToRender, seriesDone => {
        seriesDone()
        done()
        store.counterRun = store.counterRun + 1
    })()
}


exports.html = html
