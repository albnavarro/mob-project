const gulp = require('gulp');
const glob = require('glob');
const pug = require('gulp-pug-3');
const rename = require('gulp-rename');
const fs = require('fs');
const config = require('../../config.json');
const util = require('util');
const path = require('path');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const templatePath = path.join(themePath, 'template');
const dataPath = path.join(themePath, 'data');
const distPath = path.join(destPath, 'assets/dist');
const dataDestFolder = path.join(destPath, 'assets/data');
const manifestFile = `${distPath}/manifest.json`;
const permalinkFile = `${dataDestFolder}/permalinkMap.json`;
const pageTitleFile = `${dataDestFolder}/pageTitleMap.json`;
const categoryFile = `${dataDestFolder}/categoryMap.json`;
const cssDest = path.join(destPath, 'assets/css');

const store = require('../store.js');

// HELPERS
const {
    propValidate,
    sortbyDate,
    chunk,
    mergeDeep,
    isEmptyObject,
} = require('../functions/helpers.js');

// SKIPPABLE
const { taskIsSkippable } = require('../functions/taskIsSkippable.js');

// DEBUG
const {
    debugMandatoryPropierties,
    debugRenderHtml,
} = require('../functions/debug.js');

// CORE FUNCTION
const { templateFunction } = require('../middleware/globals.js');

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
    getTags,
} = require('../functions/function.js');

/**
 * Render html
 *
 * @param  {function}  done - async completion function
 * @return {function}
 */
function html(done) {
    // Custom function hot reload
    delete require.cache[
        require.resolve('../../src/middleware/customFunction.js')
    ];
    const {
        customFunction,
    } = require('../../src/middleware/customFunction.js');

    // Get data from manifest.json
    const manifestData = JSON.parse(fs.readFileSync(manifestFile));
    store.manifest = manifestData;

    // Create a glob all json file in data folder or a specific file ( es: npm run debugpage "index.it.json" )
    const sourcePath = !store.arg.page
        ? path.join(dataPath, '/**/*.json')
        : path.join(dataPath, store.arg.page);
    const files = glob.sync(sourcePath);

    const tasks = files.map((filepath) => {
        // Get json data
        const initialData = JSON.parse(fs.readFileSync(filepath));

        // Get languages
        const lang = getLanguage(filepath);

        // Check if source data is in draft mode
        const publish =
            ('draft' in initialData && initialData.draft === true) ||
            langIsDisable(lang)
                ? false
                : true;
        if (!publish) return { skipTask: true, publish: false, fn: null };

        // Get final slug
        const originalnameFile = getNameFile(filepath);
        const nameFile =
            'slug' in initialData && originalnameFile !== 'index'
                ? initialData.slug
                : originalnameFile;

        // Merge the data with the respective default language file
        const mergedData = mergeData(filepath, initialData, lang);

        // Add language to data object
        mergedData.lang = lang;

        // Get template
        const { template, isValid } = getTemplate(mergedData);
        const templatename = getNameFile(template);
        if (!isValid) return { skipTask: true, publish: false, fn: null };

        // get page type
        const pageType = getPageType(mergedData);

        // get univoqueId
        const univoqueId = getUnivoqueId(filepath);

        // Get data from each json defined in additonalPata propierties [ array ] if exist
        const additionalData = getAdditionalData(mergedData);

        // Get list of pug include for track page refresh
        const registerComponent = {};
        registerComponent.registerComponent =
            'registerComponent' in mergedData
                ? mergedData.registerComponent
                : [];

        // Get prod argument
        const prodData = {};
        prodData.isProd = store.arg.prod ? true : false;

        // Get folder destination of html page
        const pathByLocale = getPathByLocale(filepath, mergedData.lang);

        // Create folder destination if not exist
        if (!fs.existsSync(`${destPath}/${pathByLocale}`)) {
            fs.mkdirSync(`${destPath}/${pathByLocale}`, {
                recursive: true,
            });
        }

        // merge og data defulat ( form config ) and specific from data
        const ogObject = { ...config.ogDefault };
        const ogData =
            'og' in mergedData
                ? Object.assign(ogObject, mergedData.og)
                : { ...ogObject };

        mergedData.og = ogData;

        // Get language path
        const languagePath = {
            languagePath:
                config.defaultLocales == mergedData.lang
                    ? ``
                    : `/${mergedData.lang}`,
        };

        // If run script debug mode there is no global stored data so data is directly read form file
        if (store.arg.debug)
            store.permalinkMapData = JSON.parse(fs.readFileSync(permalinkFile));

        // Add permalink
        const permalink = {};
        permalink.permalink = getPermalink(pathByLocale, nameFile);
        const domain = 'domain' in config ? config.domain : '';
        const validDomain =
            domain.substr(-1) == '/' ? domain.slice(0, -1) : domain;
        permalink.staticPermalink = `${validDomain}${getPermalink(
            pathByLocale,
            nameFile
        )}`;
        permalink.pageTitle = mergedData.pageTitle;

        // If run script debug mode there is no global stored data so data is directly read form file
        if (store.arg.debug)
            store.pageTitleMapData = JSON.parse(fs.readFileSync(pageTitleFile));

        // If run script debug mode there is no global stored data so data is directly read form file
        if (store.arg.debug)
            store.categoryMapData = JSON.parse(fs.readFileSync(categoryFile));

        // Get post by category if 'importPost' propierties is declared
        const categoryObj = {
            posts: 'importPost' in mergedData ? getPosts(mergedData) : {},
        };

        // Get post by tag if 'importTag' propierties is declared
        const tagObj = {
            tags:
                'importTag' in mergedData
                    ? sortbyDate(getTags(mergedData))
                    : [],
        };

        // Create critical css map where each template is associated to la st render file with that template
        if (store.counterRun == 0) {
            const critcalCssByTemplate = {};
            critcalCssByTemplate[templatename] = {
                source: `${destPath}${pathByLocale}/${nameFile}.html`,
                template: templatename,
            };
            Object.assign(store.criticalCssMapData, critcalCssByTemplate);
        }

        // Load crircal file based on template
        const critical = {};
        if (store.counterRun == 1) {
            const criticalFile = `${cssDest}/critical/${templatename}.css`;

            if (store.arg.prod && fs.existsSync(criticalFile)) {
                const documentStyles = fs.readFileSync(criticalFile);
                critical.documentStyles = documentStyles.toString();
            }
        }

        // Create empty chunkedAyrray ( for archive pagination ) to avoid error
        const chunkedPost = {};
        chunkedPost.chunkedPost = [];

        // concatenate all json
        const allData = {
            ...critical,
            ...prodData,
            ...additionalData,
            ...permalink,
            ...categoryObj,
            ...tagObj,
            ...chunkedPost,
            ...languagePath,
            ...mergedData,
        };

        // Check if the page is renderable
        const skipTask = config.selectiveRefresh
            ? taskIsSkippable(filepath, allData, template)
            : false;

        // Remove no more necessary propierties
        delete allData.additionalData;
        delete allData.registerComponent;

        // Check for mandatory propierties in json
        // const error = debugMandatoryPropierties(allData);
        // if(error) {
        //     process.exit(0);
        // }

        /*
        Create tasks for archive page with pagination
        Check if there is a pagination attribute in isArchive
        Check id there is some post or tag imported
        */
        if (
            propValidate(['isArchive', 'pagination'], allData) &&
            allData.isArchive.pagination === true &&
            (allData.tags.length || Object.keys(allData.posts).length)
        ) {
            /*
            Define number of post per page, config definition si defulat
            otherwise is overrride from postPerPage attribute
            */
            const postPerPage =
                'postPerPage' in allData.isArchive
                    ? parseInt(allData.isArchive.postPerPage)
                    : parseInt(config.postPerPage);

            // Get page name for page with index > 0
            const dinamicPageName =
                'dinamicPageName' in allData.isArchive
                    ? allData.isArchive.dinamicPageName
                    : config.dinamicPageName;

            /*
            Create chunk array with all post
            If there is importTag and importPost defined in same file importTag takes precedence.
            */
            const flatData = allData.tags.length
                ? allData.tags
                : Object.values(allData.posts).flat();
            const sortedData = sortbyDate(flatData);
            const pageData = chunk(sortedData, postPerPage);

            // Loop in chunked array to create each archive page
            const pages = pageData.map((item, index) => {
                // Copy data in a new reference
                const newData = { ...allData };

                // Reset post data and add the new data for specific page
                newData.chunkedPost = item;

                // Get previous page link
                const getPreviousPage = () => {
                    if (index == 0) {
                        return null;
                    } else if (index == 1) {
                        return getPermalink(pathByLocale, nameFile);
                    } else {
                        return getPermalink(
                            pathByLocale,
                            `${dinamicPageName}${index - 1}`
                        );
                    }
                };

                // Get next page link
                const getNextPage = () => {
                    if (index == pageData.length - 1) {
                        return null;
                    } else {
                        return getPermalink(
                            pathByLocale,
                            `${dinamicPageName}${index + 1}`
                        );
                    }
                };

                // Define pagination data
                newData.pagination = {
                    total: pageData.length,
                    current: index + 1,
                    previousPage: getPreviousPage(),
                    nextPage: getNextPage(),
                };

                // Set specific pagination page name
                const newName = getArchivePageName(
                    index,
                    nameFile,
                    dinamicPageName
                );

                // Render each pagination file
                return (taskDone) => {
                    (templateFunction.ssgUnivoqueId = univoqueId),
                        (templateFunction.ssgTemplateName = templatename),
                        (templateFunction.ssgPageType = pageType);
                    templateFunction.ssgLang = lang;

                    const mergedLocals = {
                        ...newData,
                        ...templateFunction,
                        ...customFunction,
                    };

                    return gulp
                        .src(template)
                        .pipe(
                            pug({
                                locals: mergedLocals,
                            })
                        )
                        .pipe(rename(newName + '.html'))
                        .pipe(gulp.dest(`${destPath}/${pathByLocale}`))
                        .on('end', function () {
                            if (store.arg.debug) {
                                debugRenderHtml(newName, newData);
                                console.log(
                                    util.inspect('***************', {
                                        colors: true,
                                    })
                                );
                                console.log(
                                    util.inspect(`${newName} processed`, {
                                        colors: true,
                                    })
                                );
                                console.log(
                                    util.inspect('***************', {
                                        colors: true,
                                    })
                                );
                            }
                        });
                };
            });

            /*
            Return a array of object with some information:
            skipTask: page is rendarable ( depend on which file is saved )
            publish: page is not in draft mode
            fn: gulp task for page render
            */
            const pagetask = pages.map((item, index) => {
                const newName = getArchivePageName(
                    index,
                    nameFile,
                    dinamicPageName
                );
                item.displayName = `${getPermalink(
                    getPathByLocale(filepath, getLanguage(filepath)),
                    newName
                )}`;
                return { skipTask: skipTask, publish: publish, fn: item };
            });

            return pagetask;
        } else {
            // Render single page ( is not archive page )
            function renderPage(taskDone) {
                (templateFunction.ssgUnivoqueId = univoqueId),
                    (templateFunction.ssgTemplateName = templatename),
                    (templateFunction.ssgPageType = pageType);
                templateFunction.ssgLang = lang;

                const mergedLocals = {
                    ...allData,
                    ...templateFunction,
                    ...customFunction,
                };

                return gulp
                    .src(template)
                    .pipe(
                        pug({
                            locals: mergedLocals,
                        })
                    )
                    .pipe(rename(nameFile + '.html'))
                    .pipe(gulp.dest(`${destPath}/${pathByLocale}`))
                    .on('end', function () {
                        if (store.arg.debug) {
                            debugRenderHtml(nameFile, allData);
                            console.log(
                                util.inspect('***************', {
                                    colors: true,
                                })
                            );
                            console.log(
                                util.inspect(`${nameFile} processed`, {
                                    colors: true,
                                })
                            );
                            console.log(
                                util.inspect('***************', {
                                    colors: true,
                                })
                            );
                        }
                        taskDone();
                    });
            }

            /*
            Return an object with some information:
            skipTask: page is rendarable ( depend on which file is saved )
            publish: page is not in draft mode
            fn: gulp task for page render
            */
            renderPage.displayName = `${getPermalink(
                getPathByLocale(filepath, getLanguage(filepath)),
                getNameFile(filepath)
            )}`;
            return { skipTask: skipTask, publish: publish, fn: renderPage };
        }
    });

    // Flat all task in a new array
    const flatTask = [...tasks].flat();

    /*
    Filter task to execute
    In the first two laps alla fine not in draft is render ( it is used to create critical css )
    Afterwards, only the tasks whose dependencies have changed are rendered
    */
    const tasksToRender =
        store.counterRun > 1
            ? flatTask
                  .filter(
                      (item) => item.skipTask === false && item.publish === true
                  )
                  .map((item) => item.fn)
            : flatTask
                  .filter((item) => item.publish === true)
                  .map((item) => item.fn);

    // Return task to execute
    return gulp.series(...tasksToRender, (seriesDone) => {
        seriesDone();
        done();
        store.counterRun = store.counterRun + 1;
    })();
}

exports.html = html;
