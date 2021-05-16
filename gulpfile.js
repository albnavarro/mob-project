"use strict"

const
    // CONFIG
    config = require('./config.json'),

    // GULP /NODE
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    del = require('del'),
    glob = require('glob'),
    deleteEmpty = require('delete-empty'),
    concat = require('gulp-concat'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch'),
    critical = require('critical').stream,
    gulpif = require('gulp-if'),
    cssmin = require('gulp-cssmin'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    imagemin = require('gulp-imagemin'),
    pug = require('gulp-pug'),
    rev = require('gulp-rev'),
    revdel = require('rev-del'),
    merge = require('gulp-merge-json'),
    replace = require('gulp-string-replace'),
    reload = browserSync.reload,

    // ROLLUP
    rollup = require('rollup'),
    babel = require('@rollup/plugin-babel'),
    nodeResolve = require('@rollup/plugin-node-resolve'),
    commonjs = require('@rollup/plugin-commonjs'),
    terser = require('rollup-plugin-terser'),

    // BASE PATH
    themePath = path.resolve('src'),
    destPath = path.resolve('www'),

    // PATH SOURCE
    imgPath = path.join(themePath, 'img'),
    jsPath = path.join(themePath, 'js'),
    componentPath = path.join(themePath, 'component'),
    scssPath = path.join(themePath, 'scss'),
    svgPath = path.join(themePath, 'svg'),
    dataPath = path.join(themePath, 'data'),
    additionalDataPath = path.join(themePath, 'additionalData'),

    // PATH DEST
    cssDest = path.join(destPath, 'assets/css'),
    jsDest = path.join(destPath, 'assets/js'),
    svgDest = path.join(destPath, 'assets/svg'),
    imgDest = path.join(destPath, 'assets/img'),
    distPath = path.join(destPath, 'assets/dist'),
    dataDestFolder = path.join(destPath, 'assets/data'),

    // FILES
    cssFile = `${cssDest}/style.css`,
    jsFile = `${jsDest}/script.js`,
    cssCritical = `${cssDest}/critical.css`,
    imgFiles = `${imgPath}/*`,
    jsFiles = `${jsPath}/**/*.js`,
    componentJsFiles = `${componentPath}/**/*.js`,
    scssFiles = `${scssPath}/**/*.scss`,
    componentscssFiles = `${componentPath}/**/*.scss`,
    svgFiles = `${svgPath}/*.svg`,
    allPugFiles = `${themePath}/**/*.pug`,
    includesPugFile = `${themePath}/includes/**/*.pug`,
    componentPugFile = `${componentPath}/**/*.pug`,
    dataFiles = `${themePath}/data/**/*.json`,
    additionalDataFiles = `${themePath}/additionalData/**/*.json`,
    manifestFile = `${distPath}/manifest.json`,
    permalinkFile = `${dataDestFolder}/permalink.json`,
    slugFile = `${dataDestFolder}/slug.json`,
    categoryFile = `${dataDestFolder}/category.json`

/*
How many time watch task is invoked
*/
let counterRun = 0

/*
last file saved
*/
let fileModified = ''

/*
Map of all includes file
*/
let includesFileMap = []

/*
Map of all slug
*/
let permalinkMapData = {}

/*
Map of all slug
*/
let slugMapData = {}

/*
Map of all cateogry
*/
let categoryMapData = {}




// fetch command line arguments
const arg = (argList => {

    let arg = {},
        a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {

        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {

            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;

        } else {

            // argument name
            curOpt = opt;
            arg[curOpt] = true;

        }

    }

    return arg;

})(process.argv);



/*
Check if mandatory propierties in {page}.joson is right
*/
function debugMandatoryPropierties(data) {
    if(!('template' in data) || data.template === undefined) {
        console.log('*****')
        console.log(`Error`)
        console.log(`template propierties is mandatory`)
        console.log(`at: ${data.permalink}`)
        console.log('*****')
        return true
    }

    if(!('univoqueId' in data) || data.univoqueId === undefined) {
        console.log('*****')
        console.log(`Error`)
        console.log(`univoqueId propierties is mandatory`)
        console.log(`at: ${data.permalink}`)
        console.log('*****')
        return true
    }

    if(!('description' in data) || data.description === undefined) {
        console.log('*****')
        console.log(`Error`)
        console.log(`description propierties is mandatory`)
        console.log(`at: ${data.permalink}`)
        console.log('*****')
        return true
    }

    if(!('slug' in data) || data.slug === undefined) {
        console.log('*****')
        console.log(`Error`)
        console.log(`slug propierties is mandatory`)
        console.log(`permalink: ${data.permalink}`)
        console.log('*****')
        return true
    }

    return false
}

/*
* HELPER FUNCTION
*/



/*
Debug file rendered
*/
function debugRenderHtml(nameFile, data) {
    if(arg.debug) {
        console.log(util.inspect('***************', { colors: true }))
        console.log(util.inspect(nameFile, { colors: true }))
        console.log(util.inspect('***************', { colors: true }))
        console.log(util.inspect(data, {showHidden: false, depth: null}))
    }
}

/*
* check if nested prop exist in obj
*/
const propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)


/*
* Sort by date utility
*/
function sortbyDate(arr) {
    return arr.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
}



function chunk(array, size) {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
}


/*
*/
function getArchivePageName(index, nameFile, dinamicPageName) {
    return (index == 0) ? nameFile : `${dinamicPageName}${index}`
}

/*
* check if fileis Changed
* @param file - path of file
*/
function fileIschanged(file) {
    if(fs.existsSync(file)) {
        const stats = fs.statSync(file)
        const datetime = new Date()
        const difference = datetime.getTime() - stats.mtime.getTime()
        const seconds = Math.abs(difference / 1000)
        return seconds < 2
    } else {
        return false
    }
}



/*
* check if json or template is Changed
* @param file - path of file
*/
function taskIsSkippable(filepath, data, template) {

    /*
    track if specific of shared includes pug ( in includes thempath ) file is changed in last 2 seonds
    */
    const includesFileIsChanged = includesFileMap.map((item) => {
        return item === fileModified;
    }).some((item) =>  item === true)


    /*
    track if specific includes pug ( in component path ) file is changed in last 2 seonds
    */
    const componentFileIsChanged = ('registerComponent' in data)
        ? data.registerComponent.map((item) => {
                const filePath = `${componentPath}/${item}`
                return filePath === fileModified
            }).some((item) =>  item === true)
        : false


    /*
    track if aditionalData is changed in last 2 seonds
    */
    const aditionDataIsChanged = ('additionalData' in data)
        ? data.additionalData.map((item) => {
                const filePath = `${additionalDataPath}/${item}`
                return filePath === fileModified
            }).some((item) =>  item === true)
        : false


    /*
    track if post is changed in last 2 seonds
    */
    const postDataChecker = () => {
        return Object.values(data.posts)
            .flat()
            .filter((item) => item.source !== undefined)
            .map((item) => fileModified === `${dataPath}/${item.source}`)
            .some((item) =>  item === true)
    }

    const postDataIsChanged = ('posts' in data) ? postDataChecker() : false


    /*
    track if json is changed in last 2 seonds
    */
    const jsonIsChanged = filepath === fileModified

    /*
    track if template is changed in last 2 seonds
    */
    const templateIsChanged = template === fileModified


    return (
        !jsonIsChanged &&
        !templateIsChanged &&
        !aditionDataIsChanged &&
        !postDataIsChanged &&
        !componentFileIsChanged &&
        !includesFileIsChanged)
}


/*
* get json name from path
* @param filepath - path of .json file
*/
function getNameFile(filepath) {
    return filepath.split('/').pop().split('.').shift()
}


/*
* get permalink
* @param subfolder
* @param namefile , form getNameFile function
* @param firstSlash : bollean , prepend '/'
*/
function getPermalink(subfolder,nameFile,prependSlash = true) {
    const slash = prependSlash ? '/' : ''
    return `${slash}${subfolder}${nameFile}${getExtensionFile()}`
}


/*
* Usa permalink without .html on server in production mode
* .htaccess riles RewriteCond %{REQUEST_FILENAME}\.html -f
*/
function getExtensionFile() {
    return (arg.prod) ? "" :  ".html"
}


function extractThemeSubFolder(filepath) {
    const pattern = new RegExp(`${themePath}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}

function extractAdditionlSubFolder(filepath) {
    const pattern = new RegExp(`${additionalDataPath}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}

/*
* get path where .html will be saved
* @param filepath - {page}.json path
* @param config - data extract from config.json
* @param additionalData - all data extract from all json file associated to {page}.json
* return '' id {page}.json is in root or path form root
*/
function extracSubFolder(filepath, lang) {
    const pathRoot = ( config.defaultLocales == lang) ? `${dataPath}/${lang}` : `${dataPath}`
    const pattern = new RegExp(`${pathRoot}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}


/*
* get lang of single {page}.json
* @param filepath - {page}.json path
* return lang flder name
*/
function getLanguage(filepath) {
    const pattern = new RegExp(`${dataPath}\/([^\/]*)`);
    const lang = filepath.match(pattern);

    return (!lang) ? '' : lang[1]
}


/*
* get an obj with all data in all json file associated to {page}.json
* @param data - data extract from {page}.json
* return an obj
*/
function extracAdditionalData(data) {
    const getAdditionalData = (data) => ('additionalData' in data) ? data.additionalData : [];
    const additionalDataFile = getAdditionalData(data);

    /*
    map function return an array of Object
    the reduce function retur an obj from the array
    */
    const additionalData = additionalDataFile.map((item) => {
        const filepath = `${additionalDataPath}/${item}`
            if(fs.existsSync(filepath)) {
                return JSON.parse(fs.readFileSync(filepath))
            } else {
                return []
            }
        }).reduce((a, c) => a = {...a, ...c}, {})

    return additionalData
}

/*
* END HELPER FUNCTION
*/


/*
* BROWSER SYNC
*/
function browser_sync(done) {
    browserSync.init({
        server: {
            baseDir: "./www/"
        },
        open: false
    })

    done();
};


/*
* RELOAD PAGE
*/
function reloadPage(done) {
    browserSync.reload()
    done();
};


/*
* SASS
*/
function style() {
    return gulp.src(path.join(scssPath, 'style.scss'))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'nested',
            includePaths: ['node_modules/susy/sass']
        }).on('error', sass.logError))
        .pipe(postcss([
            require('autoprefixer')(),
            require('css-mqpacker')({
                sort: true
            }),
        ]))
        .pipe(gulpif(!arg.prod, sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: scssPath
        })))
        .pipe(gulpif(arg.prod, cssmin({
            keepSpecialComments: false,
        })))
        .pipe(gulp.dest(cssDest))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }))
};



/*
* Minify async-assets-loading
*/
function minifyAssetsLoading() {
    return gulp.src(path.join(jsPath, 'async-assets-loading.js'))
        .pipe(uglify())
        .pipe(rename('async-assets-loading.min.js'))
        .pipe(gulp.dest(jsDest))
};


/*
* ROLLUP
*/
function js() {
    if (arg.prod) {
        return rollup.rollup({
            input: './src/js/script.js',
            plugins: [
                nodeResolve.nodeResolve({
                    browser: true,
                }),
                commonjs(),
                babel.babel({
                    babelHelpers: 'bundled',
                    exclude: 'node_modules/**',
                    babelrc: false,
                    presets: ["@babel/preset-env"]
                }),
                terser.terser()
            ]
        }).then(bundle => {
            return bundle.write({
                file: jsFile,
                format: 'umd',
                name: 'library',
                sourcemap: false
            });
        });
    } else {
        return rollup.rollup({
            input: './src/js/script.js',
            plugins: [
                nodeResolve.nodeResolve({
                    browser: true,
                }),
                commonjs(),
                babel.babel({
                    babelHelpers: 'bundled',
                    exclude: 'node_modules/**',
                    babelrc: false,
                    presets: ["@babel/preset-env"]
                })
            ]
        }).then(bundle => {
            return bundle.write({
                file: jsFile,
                format: 'umd',
                name: 'library',
                sourcemap: true
            });
        });
    }
};


/*
* SVG
*/
function icons() {
    return gulp.src(svgFiles)
        .pipe(svgmin({
            plugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(gulp.dest(svgDest))
}





/*
* CREATE CRITICAL CSS FOLDER
*/
function initializeCritical(done) {
    const dir = cssDest;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFile(cssCritical, '', done);
};


/*
* CRITICAL CSS
*/
function criticalCss(done) {
    if (arg.prod) {
        return gulp.src('www/**/*.html')
        .pipe(critical({
            base: 'www/',
            minify: true,
            width: 1024,
            height: 768,
            css: `${cssDest}/style.css`,
            include: ['.lightbox', '.parallax-container', '.parallax-item', '.gaspHorizontal__card']
        }))
        .pipe(gulp.dest(`${cssDest}/critical`))
    }

    done();
};


/*
* Detect file saved, .pug or .json
*/
function detectModifiedFiles(done) {
    // get list of includes file
    includesFileMap = glob.sync(includesPugFile)

    // get last file saved
    const allFiles = glob.sync(`${themePath}/**/*.{json,pug}`)
    const files = allFiles.map((item) => {
        return {
            'modifies' : fileIschanged(item),
            'file': item
        }
    })
    .find((item) => item.modifies === true)

    fileModified = files.file
    done()
}




/*
* CREATE SLUG MAP
* slugMap: {
*     univoqueId: { en: '{slug}', it: '{slug}', ... },
      ....
 * }
*/
function slug(done) {
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    const slugObj = allPath.reduce((acc, curr) => {
      const data = JSON.parse(fs.readFileSync(curr))

      if('univoqueId' in data) {
          acc[data.univoqueId] = {...acc[data.univoqueId]}
          acc[data.univoqueId][getLanguage(curr)] = data.slug
      }

      return acc;
    }, {});


    /*
    * DEBUG
    * gulp html -debug for debug
    */
    if(arg.debug) {
        console.log(slugObj)
    }

    /*
    * Check if destination folder exist and save the file with permalink map
    */
    if(!fs.existsSync(dataDestFolder)){
        fs.mkdirSync(dataDestFolder, {
            recursive: true
        })
    }

    slugMapData = slugObj
    fs.writeFile(slugFile, JSON.stringify(slugObj), () => {})
    done()

}


/*
* CREATE PERMALINKMAP
* permalinkMap: {
*     univoqueId: { en: '{pemalink}', it: '{pemalink}', ... },
      ....
 * }
*/
function permalink(done) {
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    const peramlinkObj = allPath.reduce((acc, curr) => {
      const data = JSON.parse(fs.readFileSync(curr))
      const lang = getLanguage(curr)
      const originalNameFile = getNameFile(curr)
      const nameFile = (arg.prod && originalNameFile === 'index') ? '' : originalNameFile
      const subfolder  = extracSubFolder(curr,lang)
      const permalinkUrl = getPermalink(subfolder,nameFile)

      if('univoqueId' in data) {
          acc[data.univoqueId] = {...acc[data.univoqueId]}
          acc[data.univoqueId][getLanguage(curr)] = permalinkUrl
      }

      return acc;
    }, {});

    /*
    * DEBUG
    * gulp html -debug for debug
    */
    if(arg.debug) {
        console.log(peramlinkObj)
    }

    /*
    * Check if destination folder exist and save the file with permalink map
    */
    if(!fs.existsSync(dataDestFolder)){
        fs.mkdirSync(dataDestFolder, {
            recursive: true
        })
    }

    permalinkMapData = peramlinkObj
    fs.writeFile(permalinkFile, JSON.stringify(peramlinkObj), () => {})
    done()

}



/*
* CREATE CATEGORYMAP
*/
function category(done) {
    /*
    * Create main obj
    */
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    const categoryObj = allPath.reduce((acc, curr, i) => {
        const parsed = JSON.parse(fs.readFileSync(curr));
        if ('exportPost' in parsed) {
            const lang = getLanguage(curr)
            const nameFile = getNameFile(curr)
            const subfolder  = extracSubFolder(curr,lang)
            const permalink = getPermalink(subfolder,nameFile)
            const sourceFilepath = (lang == config.defaultLocales) ? `${lang}/` : ''

            const category = parsed.exportPost.category;
            const obj = {
                permalink: permalink,
                category: category,
                source: `${sourceFilepath}${subfolder}${nameFile}.json`,
                date: parsed.exportPost.date,
                data: { ...parsed.exportPost.data }
            };

            /*
            * Merge lang obj with itself or crete a new obj if not exist,
            * in the first cicle of each lang the attribute not exist
            */
            acc[lang] = { ...acc[lang] };

            /*
            * Add new post to category or inizialize category
            */
            acc[lang][category] = (category in acc[lang]) ? acc[lang][category] : [];
            acc[lang][category].push(obj);
        }

        return acc;
    }, {});

    for (const [key, lang] of Object.entries(categoryObj)) {
        for (let [key, posts] of Object.entries(lang)) {
            posts = [ ... sortbyDate(posts) ]
        }
    }

    /*
    * DEBUG
    * gulp html -debug for debug
    */
    if(arg.debug) {
        console.log(util.inspect(categoryObj, {showHidden: false, depth: null}))
    }

    /*
    * Check if destination folder exist and save the file with permalink map
    */
    if(!fs.existsSync(dataDestFolder)){
        fs.mkdirSync(dataDestFolder, {
            recursive: true
        })
    }

    categoryMapData = categoryObj
    fs.writeFile(categoryFile, JSON.stringify(categoryObj), () => {})
    done()
}



/*
* CREATE PUG FILE
*/

function html(done) {
    const sourcePath =  (!arg.page) ? path.join(dataPath, '/**/*.json') :  path.join(dataPath, arg.page)
    const streams = glob.sync(sourcePath)

    const tasks = streams.map(filepath => {
        /*
        Get json data of each file
        */
        const data = JSON.parse(fs.readFileSync(filepath))

        /*
        get template
        */
        const template = `${themePath}/${data.template}.pug`

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
        prodData.isProd = (arg.prod) ? true : false;


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
        const subfolder = extracSubFolder(filepath,data.lang)


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
        */
        // const permalinkMap = JSON.parse(fs.readFileSync(permalinkFile))

        const permalink = {}
        permalink.permalink = getPermalink(subfolder,nameFile)
        permalink.staticPermalink = `${config.domain}${getPermalink(subfolder,nameFile,false)}`
        permalink.permalinkMap = permalinkMapData
        permalink.slug = data.slug

        /*
        Add slug map
        */
        // const slugMap = JSON.parse(fs.readFileSync(slugFile))
        const slugMapObj = {}
        slugMapObj.slugMap = slugMapData


        /*
        Add categry post map
        */
        // const categoryMap = JSON.parse(fs.readFileSync(categoryFile))
        const getPosts = (data) => {
            return data.importPost.reduce((acc, curr) => {
                if (propValidate([data.lang, curr], categoryMapData))  acc[curr] = categoryMapData[data.lang][curr]
                return acc
            }, {})
        }

        const categoryObj = {}
        categoryObj.posts = ('importPost' in data) ? getPosts(data) : {}

        /*
        criticalcss
        */
        const critical = {}
        const criticalFile = `${cssDest}/critical/${subfolder}${nameFile}.css`
        if (arg.prod && fs.existsSync(criticalFile)) {
            const documentStyles = fs.readFileSync(criticalFile);
            critical.documentStyles = documentStyles.toString()
        }


        /*
        merge all json
        */
        const allData = Object.assign({},
            critical,
            prodData,
            config,
            additionalData,
            permalink,
            slugMapObj,
            categoryObj,
            relativePath,
            data,
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

        if(('isArchive' in allData)) {

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
            */
            const flatData =  Object.values(allData.posts).flat()
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
                newData.posts = {}
                newData.posts.merged = item

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
                            if(arg.debug) {
                                debugRenderHtml(newName, newData)
                                console.log(util.inspect('***************', { colors: true }))
                                console.log(util.inspect(`${newName} processed`, { colors: true }))
                                console.log(util.inspect('***************', { colors: true }))
                            }

                        })
            })

            const pagetask = pages.map((item, index) => {
                const newName = getArchivePageName(index, nameFile, dinamicPageName)
                item.displayName = `${getPermalink(extracSubFolder(filepath, getLanguage(filepath)), newName)}`;
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
                        if(arg.debug) {
                            debugRenderHtml(nameFile, allData)
                            console.log(util.inspect('***************', { colors: true }))
                            console.log(util.inspect(`${nameFile} processed`, { colors: true }))
                            console.log(util.inspect('***************', { colors: true }))
                        }
                        taskDone()
                    })
            }

            renderPage.displayName = `${getPermalink(extracSubFolder(filepath, getLanguage(filepath)), getNameFile(filepath))}`;
            return {'skipTask' : skipTask, 'fn': renderPage};
        }

    })

    const flatTask = [ ... tasks].flat()

    const tasksToRender = (counterRun > 1 )
        ? flatTask.filter((item) => item.skipTask === false ).map((item) => item.fn)
        : flatTask.map((item) => item.fn);

    return gulp.series(...tasksToRender, seriesDone => {
        seriesDone()
        done()
        counterRun ++
    })()
}



/*
* Image min
*/
function image() {
    return gulp.src(imgFiles)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDest));
};


/*
* Delete js and css and manifest file for production
*/
function cleanDist() {
    return del([
        path.join(distPath, '*'),
        path.join(distPath, '*.*')
    ]);
}


/*
* Create css and js with hash
*/
function dist() {
    return gulp.src([cssFile, jsFile, imgFiles])

        .pipe(rev())
        .pipe(gulp.dest(distPath))
        .pipe(rev.manifest({
            path: 'manifest.json'
        }))
        .pipe(revdel(distPath))
        .pipe(gulp.dest(distPath))
}


/*
* Remove all generated files
*/
function cleanAll() {
    return del([
        path.join(cssDest, '**'),
        path.join(distPath, '*'),
        path.join(distPath, '*.*'),
        path.join(dataDestFolder, '*.*'),
        path.join(imgDest, '*.*'),
        path.join(destPath, '**/*.html'),
        path.join(svgDest, '*.*'),
        path.join(destPath, 'assets/js/async-assets-loading.min.js'),
        path.join(destPath, 'assets/js/script.js'),
        path.join(destPath, 'assets/js/script.js.map'),
        jsFile
    ], {force:true});
}

function deleteEmptyDirectories(done) {
    deleteEmpty.sync(destPath)
    done()
}


/*
* Live reload
*/
function watch_files(done) {
    gulp.watch([scssFiles, componentscssFiles], style)
    gulp.watch([jsFiles, componentJsFiles], gulp.series(js, reloadPage))
    gulp.watch([allPugFiles, dataFiles, additionalDataFiles], gulp.series(detectModifiedFiles, category, slug, permalink, html, reloadPage))

    done();
}


/*
* BUILD TASK
*/

const build = gulp.series(
    cleanAll,
    deleteEmptyDirectories,
    initializeCritical,
    icons,
    image,
    minifyAssetsLoading,
    style,
    js,
    cleanDist,
    dist,
    category,
    slug,
    permalink,
    html,
    criticalCss,
    dist,
    html
)

/*
* RESET BUILD
*/

const reset = gulp.series(
    cleanAll,
    deleteEmptyDirectories
)

/*
* DEV
*/
const dev = gulp.series(build, gulp.parallel(
    browser_sync,
    watch_files))

/*
* WATCH
*/
const watchTask = gulp.parallel(
    browser_sync,
    watch_files)


/*
* TASk
*/
exports.initializeCritical = initializeCritical
exports.style = style
exports.js = js
exports.html = html
exports.image = image
exports.icons = icons
exports.cleanDist = cleanDist
exports.dist = dist
exports.cleanAll = cleanAll
exports.deleteEmptyDirectories = deleteEmptyDirectories
exports.permalink = permalink
exports.category = category
exports.slug = slug
exports.detectModifiedFiles = detectModifiedFiles

/*
* MAIN TASK
*/
exports.build = build
exports.reset = reset
exports.dev = dev
exports.watch = watchTask



/*
* gulp build
* gulp build -debug -page "it/index.json"
* ....
* gulp build -prod -page "it/index.json"
*/


/*
* npm run dev
* npm run build
* npm run build -- --debug
*
* watch single page:
* npm run page "en/index.json"
*
* debug single page:
* npm run debugpage "en/articles/index.json"
* .....
*/
