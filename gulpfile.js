"use strict"

const
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

    rollup = require('rollup'),
    babel = require('@rollup/plugin-babel'),
    nodeResolve = require('@rollup/plugin-node-resolve'),
    commonjs = require('@rollup/plugin-commonjs'),
    terser = require('rollup-plugin-terser'),

    themePath = path.resolve('src'),
    destPath = path.resolve('www'),

    imgPath = path.join(themePath, 'img'),
    jsPath = path.join(themePath, 'js'),
    componentPath = path.join(themePath, 'component'),
    scssPath = path.join(themePath, 'scss'),
    svgPath = path.join(themePath, 'svg'),
    dataPath = path.join(themePath, 'data'),
    additionalDataPath = path.join(themePath, 'additionalData'),

    cssDest = path.join(destPath, 'assets/css'),
    jsDest = path.join(destPath, 'assets/js'),
    svgDest = path.join(destPath, 'assets/svg'),
    imgDest = path.join(destPath, 'assets/img'),

    distPath = path.join(destPath, 'assets/dist'),
    dataDestFolder = path.join(destPath, 'assets/data'),

    cssFile = `${cssDest}/style.css`,
    jsFile = `${jsDest}/script.js`,
    cssCritical = `${cssDest}/critical.css`,
    imgFiles = `${imgPath}/*`,
    jsFiles = `${jsPath}/**/*.js`,
    componentJsFiles = `${componentPath}/**/*.js`,
    scssFiles = `${scssPath}/**/*.scss`,
    componentscssFiles = `${componentPath}/**/*.scss`,
    svgFiles = `${svgPath}/*.svg`,
    pugFiles = `${themePath}/*.pug`,
    allPugFiles = `${themePath}/**/*.pug`,
    dataFiles = `${themePath}/data/**/*.json`,
    additionalDataFiles = `${themePath}/additionalData/**/*.json`,
    manifestFile = `${distPath}/manifest.json`,
    permalinkFile = `${dataDestFolder}/permalink.json`,
    slugFile = `${dataDestFolder}/slug.json`,
    categoryFile = `${dataDestFolder}/category.json`


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
* get json name from path
* @param filepath - path of .json file
*/
function getNameFile(filepath) {
    return filepath.split('/').pop().split('.').shift()
}


/*
* Usa permalink without .html on server in production mode
* .htaccess riles RewriteCond %{REQUEST_FILENAME}\.html -f
*/
function getExtensionFile() {
    return (arg.prod) ? "" :  ".html"
}


/*
* get path where .html will be saved
* @param filepath - {page}.json path
* @param config - data extract from config.json
* @param additionalData - all data extract from all json file associated to {page}.json
* return '' id {page}.json is in root or path form root
*/
function extracSubFolder(filepath, config, lang) {
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
        open: true
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
* CREATE PERMALINKMAP
* permalinkMap: {
*     univoqueId: { en: '{pemalink}', it: '{pemalink}', ... },
      ....
 * }
*/
function permalink(done) {
    /*
    * Creat main obj
    */
    const peramlinkObj = {}
    const slugObj = {}

    const config = JSON.parse(fs.readFileSync(`config.json`))
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    allPath.forEach((filepath) => {
        const data = JSON.parse(fs.readFileSync(filepath))

        /*
        Get language
        */
        const lang = getLanguage(filepath)

        /*
        Get file name
        */
        const originalNameFile = getNameFile(filepath)

        /*
        In production mode 'index' is removed in permalink
        */
        const nameFile = (arg.prod && originalNameFile === 'index') ? '' : originalNameFile

        /*
        * Get subfolder according to to default languages
        */
        const subfolder  = extracSubFolder(filepath,config,lang)

        if (data.univoqueId) {
            /*
            * Get permalink
            */
            const permalink = `/${subfolder}${nameFile}${getExtensionFile()}`
            const slug = data.slug

            /*
            * Check if obj for each univoqueId exist
            * Rutun a new empty obj or the obj if exist
            */
            const singleLocaleParmalinkObj = (data.univoqueId in peramlinkObj) ? peramlinkObj[data.univoqueId] : {}

            /*
            * Check if obj for each univoqueId exist
            * Rutun a new empty obj or the obj if exist
            */
            const singleSlugObj = (data.univoqueId in slugObj) ? slugObj[data.univoqueId] : {}

            /*
            * Merge the new parmalinkObj with older one
            * Merge the new slugObj with older one
            */
            peramlinkObj[data.univoqueId] = Object.assign( singleLocaleParmalinkObj, { [lang] : permalink})
            slugObj[data.univoqueId]= Object.assign( singleSlugObj, { [lang] : slug})
        }

    });

    /*
    * DEBUG
    * gulp html -debug for debug
    */
    if(arg.debug) {
        console.log(peramlinkObj)
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

    fs.writeFileSync(permalinkFile, JSON.stringify(peramlinkObj));
    fs.writeFileSync(slugFile, JSON.stringify(slugObj));
    done()

}



/*
* CREATE CATEGORYMAP
* it: {
*     "articles": [
*         { permalink: '....', data: '....', ... },
*         { permalink: '....', data: '....', ... },
 * }
*/
function category(done) {
    /*
    * Creat main obj
    */
    const categoryObj = {}

    const config = JSON.parse(fs.readFileSync(`config.json`))
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    allPath.forEach((filepath) => {
        const data = JSON.parse(fs.readFileSync(filepath))

        /*
        Get language
        */
        const lang = getLanguage(filepath)

        /*
        Get file name
        */
        const nameFile = getNameFile(filepath)

        /*
        * Get subfolder according to to default languages
        */
        const subfolder  = extracSubFolder(filepath,config,lang)

        /*
        * Get permalink
        */
        const permalink = `/${subfolder}${nameFile}${getExtensionFile()}`
        const slug = nameFile

        /*
        * Inizialize lang obj if not exixst
        */
        if (!(lang in categoryObj)) categoryObj[lang] = {}


        /*
        *  If there is data to eport
        */
        if (data.exportPost && data.exportPost.category && lang) {

            /*
            *  create post obj
            */
            const post = {
                "permalink" : permalink,
                "date" : data.exportPost.date,
                "data" : data.exportPost.data
            }


            /*
            *  get category in categoryObj[lang] if exist or a ampty array
            */
            const categorySingleObj = (data.exportPost.category in categoryObj[lang]) ? categoryObj[lang][data.exportPost.category] : []

            /*
            *  Copy the array, and push in new post
            */
            const postArray = [ ... categorySingleObj ]
            postArray.push(post)

            /*
            *  Assign the final array
            */
            categoryObj[lang][data.exportPost.category] = postArray
        }

    });

    /*
    *  For each lanugages
    */
    for (const [key, lang] of Object.entries(categoryObj)) {

        /*
        *  For each category
        */
        for (const [key, posts] of Object.entries(lang)) {

            /*
            *  Order post by date
            */
            posts.sort(function compare(a, b) {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateA - dateB;
            });
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

    fs.writeFileSync(categoryFile, JSON.stringify(categoryObj));
    done()
}





/*
* CREATE PUG FILE
*/

function html(done) {
    const config = JSON.parse(fs.readFileSync(`config.json`))
    const sourcePath =  (!arg.page) ? path.join(dataPath, '/**/*.json') :  path.join(dataPath, arg.page)
    const streams = glob.sync(sourcePath)

    const tasks = streams.map(filepath => {
        return taskDone => {

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
        const subfolder = extracSubFolder(filepath,config,data.lang)


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
        const permalinkMap = JSON.parse(fs.readFileSync(permalinkFile))

        const permalink = {}
        permalink.permalink = `/${subfolder}${nameFile}${getExtensionFile()}`
        permalink.staticPermalink = `${config.domain}${subfolder}${nameFile}${getExtensionFile()}`
        permalink.permalinkMap = permalinkMap
        permalink.slug = data.slug

        /*
        Add slug map
        */
        const slugMap = JSON.parse(fs.readFileSync(slugFile))
        const slugMapObj = {}
        slugMapObj.slugMap = slugMap


        /*
        Add categry post map
        */
        const categoryObj = {}
        if(data.importPost && data.lang) {
            const categoryMap = JSON.parse(fs.readFileSync(categoryFile))
            categoryObj.posts = {}

            /*
            loop thru all catogory defined in {page}.json import propierties
            */
            for (const posts of data.importPost) {
                /*
                Check if category {posts} defined in {page}.json exist in categoryMap[lang] json file
                if not, return an empty obj to avoid error
                */
                const postsObj = ( categoryMap[data.lang][posts] ) ? categoryMap[data.lang][posts] : {}

                /*
                Assign catogory post list
                */
                categoryObj.posts[posts] = postsObj
            }

            /*
            Clean final data obj
            */
            delete data.importPost;
        }


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
        const allData = Object.assign({},critical, prodData, config, additionalData, permalink, slugMapObj, categoryObj, relativePath, data, manifest);


        /*
        get template
        */
        const template = `${themePath}/${data.template}.pug`

        /*
        Check if mandatory propierties in {page}.joson is right
        If here is some error exit fomr gulp
        */
        const error = debugMandatoryPropierties(allData);
        if(error) {
            process.exit(0);
            taskDone()
        }

        /*
        * remove propierties no more necessary
        */
        delete allData.additionalData;
        delete allData.template;


        /*
        * DEBUG
        * gulp html -debug for debug

        es:
        gulp html -prod
        gulp html -debug -page "it/index.json"
        gulp html -prod -page "it/index.json"

        */
        if(arg.debug) {
            console.log()
            console.log('***************')
            console.log(nameFile)
            console.log('***************')
            console.log(util.inspect(allData, {showHidden: false, depth: null}))
            console.log()
        }

        return gulp.src(template)
            .pipe(pug({
                data: allData
            }))
            .pipe(rename(nameFile + '.html'))
            .pipe(gulp.dest(`${destPath}/${subfolder}`))
            .on('end', function () {
                if(arg.debug) {
                    console.log('***************')
                    console.log(`${nameFile} processed`)
                }
            })
        }
    })

    return gulp.series(...tasks, seriesDone => {
        seriesDone()
        done()
    })()
}

/*
* Alternative pattern promise all
*/
// function html(done) {
//     ...
//
//     const tasks = streams.map(filepath => {
//         return new Promise((resolve, reject) => {
//             ....
//             return gulp.src(template)
//                 ....
//
//                 .on('end', function () {
//                     resolve()
//
//                 })
//         })
//     })
//
//     Promise.all([...tasks]).then(() => {
//         done()
//     })
// }


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
    gulp.watch([allPugFiles, dataFiles, additionalDataFiles], gulp.series(category, permalink, html, reloadPage))

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
* .....
*/
