const gulp = require('gulp')
const glob = require('glob')
const pug = require('gulp-pug-3')
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
const { propValidate, sortbyDate, chunk, mergeDeep } = require('../functions/helpers.js')

// SKIPPABLE
const { taskIsSkippable } = require('../functions/taskIsSkippable.js')

// DEBUG
const { debugMandatoryPropierties, debugRenderHtml } = require('../functions/debug.js')

const { templateFunction } = require('../middleware/globals.js')

// UTILS
const {
    getPageType,
    getArchivePageName,
    getNameFile,
    getPermalink,
    getPathByLocale,
    getLanguage,
    getAdditionalData,
    getTemplate,
    getUnivoqueId,
    mergeData,
    langIsDisable,
    getPosts,
    checkIfPostHaveTag,
    getTags
} = require('../functions/function.js')


/*
* CREATE PUG FILE
*/

function html(done) {

    const manifestData = JSON.parse(fs.readFileSync(manifestFile))
    store.manifest = manifestData

    const sourcePath =  (!store.arg.page) ? path.join(dataPath, '/**/*.json') :  path.join(dataPath, store.arg.page)
    const files = glob.sync(sourcePath)

    const tasks = files.map(filepath => {

        /*
        Get json data of each file
        */
        const initialData = JSON.parse(fs.readFileSync(filepath))

        /*
        Get languages
        */
        const lang = getLanguage(filepath)

        /*
        Check if draft
        */
        const publish = (( 'draft' in initialData ) && initialData.draft === true || langIsDisable(lang)) ? false : true
        if(!publish) return {'skipTask' : true, 'publish' : false, 'fn': null};

        /*
        Get file name and final slug before merge data
        */
        const originalnameFile = getNameFile(filepath);
        const nameFile = (('slug' in initialData) && originalnameFile !== 'index') ? initialData.slug : originalnameFile


        /*
        Merge data with defult lang dat
        */
        const mergedData = mergeData(filepath, initialData, lang)


        /*
        Get language
        */
        mergedData.lang = lang

        /*
        get template
        */
        const template = getTemplate(mergedData)
        const templatename = getNameFile(template)


        /*
        Add page type
        */
        const pageType = getPageType(mergedData)
        const univoqueId = getUnivoqueId(filepath)


        /*
        Get mergedData from each json defined in additonalPata propierties [ array ] if exist
        */
        const additionalData = getAdditionalData(mergedData)


        /*
        List of pug include for track page refresh
        */
        const registerComponent = {}
        registerComponent.registerComponent = ('registerComponent' in mergedData) ? mergedData.registerComponent : []


        /*
        Get prod abient value
        */
        const prodData = {}
        prodData.isProd = (store.arg.prod) ? true : false;



        /*
        pathByLocale
        Create folder in accordion of json lang
        */
        const pathByLocale = getPathByLocale(filepath,mergedData.lang)

        /*
        Create pathByLocale if not exist
        */
        if(!fs.existsSync(`${destPath}/${pathByLocale}`)){
            fs.mkdirSync(`${destPath}/${pathByLocale}`, {
                recursive: true
            })
        }


        /*
        Get relative path
        */
        const relativePath = {}
        relativePath.relativePath = ( config.defaultLocales == mergedData.lang) ? `` : `/${mergedData.lang}`;


        /*
        Add permalink
        if in debug mode golbal stored info is bypass anche the mergedData il read form file
        */
        if(store.arg.debug) store.permalinkMapData = JSON.parse(fs.readFileSync(permalinkFile))

        const permalink = {}
        permalink.permalink = getPermalink(pathByLocale,nameFile)
        const validDomain = ( config.domain.substr(-1) == '/' ) ? config.domain.slice(0, -1) : config.domain
        permalink.staticPermalink = `${validDomain}${getPermalink(pathByLocale,nameFile)}`
        permalink.pageTitle = mergedData.pageTitle


        /*
        Add pageTitle map
        if in debug mode golbal stored info is bypass anche the mergedData il read form file
        */
        if(store.arg.debug) store.pageTitleMapData = JSON.parse(fs.readFileSync(pageTitleFile))


        /*
        Add imported categories
        if in debug mode golbal stored info is bypass anche the mergedData il read form file
        */
        if(store.arg.debug) store.categoryMapData = JSON.parse(fs.readFileSync(categoryFile))


        const categoryObj = {}
        categoryObj.posts = ('importPost' in mergedData) ? getPosts(mergedData) : {}



        const tagObj = {}
        tagObj.tags = ('importTag' in mergedData) ? sortbyDate(getTags(mergedData)) : []


        /*
        Criticalcss
        Create map of template with one page ( last ) for extract critical file
        */
        if(store.counterRun == 0) {
            const critcalCssByTemplate = {}
            critcalCssByTemplate[templatename] = {
                source : `${destPath}${pathByLocale}/${nameFile}.html`,
                template : templatename
            }
            Object.assign(store.criticalCssMapData, critcalCssByTemplate)
        }

        /*
        Criticalcss
        Load crircal file based on template
        */
        const critical = {}
        if(store.counterRun == 1) {
            const criticalFile = `${cssDest}/critical/${templatename}.css`

            if (store.arg.prod && fs.existsSync(criticalFile)) {
                const documentStyles = fs.readFileSync(criticalFile);
                critical.documentStyles = documentStyles.toString()
            }
        }

        /*
        Create empty chunkedAyrray ( pagination ) to avoid error
        */
        const chunkedPost = {}
        chunkedPost.chunkedPost = []


        /*
        concatenate all json
        */
        const allData = {
            ...critical,
            ...prodData,
            ...additionalData,
            ...permalink,
            ...categoryObj,
            ...tagObj,
            ...chunkedPost,
            ...relativePath,
            ...mergedData
        }

        /*
        Check if page is ready to render
        */
        const skipTask = (config.selectiveRefresh) ? taskIsSkippable(filepath, allData, template) : false


        /*
        Remove no more necessary propierties
        */
        delete allData.additionalData;
        delete allData.registerComponent;

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
        if((propValidate(['isArchive', 'pagination'], allData))
            && allData.isArchive.pagination === true
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
                        return getPermalink(pathByLocale,nameFile)
                    } else {
                        return getPermalink(pathByLocale,`${dinamicPageName}${index - 1}`)
                    }
                }

                /*
                Next page link
                */
                const getNextPage = () => {
                    if (index == pageData.length - 1) {
                        return null
                    } else {
                        return getPermalink(pathByLocale,`${dinamicPageName}${index + 1}`)
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


                return (taskDone) => {

                    templateFunction.ssgUnivoqueId = univoqueId,
                    templateFunction.ssgTemplateName = templatename,
                    templateFunction.ssgPageType = pageType
                    templateFunction.ssgLang = lang

                    const mergedLocals = { ... newData, ... templateFunction}

                    return gulp.src(template)
                        .pipe(pug({
                            locals: mergedLocals
                        }))
                        .pipe(rename(newName + '.html'))
                        .pipe(gulp.dest(`${destPath}/${pathByLocale}`))
                        .on('end', function () {
                            if(store.arg.debug) {
                                debugRenderHtml(newName, newData)
                                console.log(util.inspect('***************', { colors: true }))
                                console.log(util.inspect(`${newName} processed`, { colors: true }))
                                console.log(util.inspect('***************', { colors: true }))
                            }

                        })
                    }
            })

            const pagetask = pages.map((item, index) => {
                const newName = getArchivePageName(index, nameFile, dinamicPageName)
                item.displayName = `${getPermalink(getPathByLocale(filepath, getLanguage(filepath)), newName)}`;
                return {'skipTask' : skipTask, 'publish' : publish, 'fn': item};
            })

            return pagetask


        } else {


            function renderPage(taskDone) {

                templateFunction.ssgUnivoqueId = univoqueId,
                templateFunction.ssgTemplateName = templatename,
                templateFunction.ssgPageType = pageType
                templateFunction.ssgLang = lang

                const mergedLocals = { ... allData, ... templateFunction}

                return gulp.src(template)
                    .pipe(pug({
                        locals: mergedLocals
                    }))
                    .pipe(rename(nameFile + '.html'))
                    .pipe(gulp.dest(`${destPath}/${pathByLocale}`))
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
            return {'skipTask' : skipTask, 'publish' : publish, 'fn': renderPage};
        }

    })

    const flatTask = [ ... tasks].flat()

    const tasksToRender = (store.counterRun > 1 )
        ? flatTask.filter((item) => (item.skipTask === false && item.publish === true) ).map((item) => item.fn)
        : flatTask.filter((item) => item.publish === true ).map((item) => item.fn);

    return gulp.series(...tasksToRender, seriesDone => {
        seriesDone()
        done()
        store.counterRun = store.counterRun + 1
    })()
}


exports.html = html
