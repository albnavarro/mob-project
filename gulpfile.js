"use strict"
let isProd = false

const
    path = require('path'),
    concat = require('gulp-concat'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch'),
    wrap = require('gulp-wrap'),
    critical = require('critical'),
    gulpif = require('gulp-if'),
    cssmin = require('gulp-cssmin'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    request = require('request'),
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    fs = require('fs'),
    specialHtml = require('gulp-special-html'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    pug = require('gulp-pug'),
    // babel = require("gulp-babel"),
    rev = require('gulp-rev'),
    revdel = require('rev-del'),
    del = require('del'),
    merge = require('gulp-merge-json'),
    replace = require('gulp-string-replace'),
    glob = require('glob'),
    es = require('event-stream'),
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
    componentPathVanilla = path.join(themePath, 'component-vanilla'),
    scssPath = path.join(themePath, 'scss'),
    svgPath = path.join(themePath, 'svg'),
    dataPath = path.join(themePath, 'data'),
    additionalDataPath = path.join(themePath, 'additionalData'),

    cssDest = path.join(destPath, 'assets/css'),
    jsDest = path.join(destPath, 'assets/js'),
    svgDest = path.join(destPath, 'assets/svg'),
    imgDest = path.join(destPath, 'assets/img'),

    distPath = path.join(destPath, 'assets/dist'),
    dataMerged = path.join(destPath, 'assets/data'),

    cssFile = `${cssDest}/main.css`,
    jsFile = `${jsDest}/main.js`,
    cssCritical = `${cssDest}/critical.css`,
    imgFiles = `${imgPath}/*`,
    jsFiles = `${jsPath}/**/*.js`,
    componentJsFiles = `${componentPath}/**/*.js`,
    componentJsFilesVanilla = `${componentPathVanilla}/**/*.js`,
    scssFiles = `${scssPath}/**/*.scss`,
    componentscssFiles = `${componentPath}/**/*.scss`,
    componentscssFilesVanilla = `${componentPathVanilla}/**/*.scss`,
    svgFiles = `${svgPath}/*.svg`,
    pugFiles = `${themePath}/*.pug`,
    allPugFiles = `${themePath}/**/*.pug`,
    dataFiles = `${themePath}/data/**/*.json`,
    additionalDataFiles = `${themePath}/additionalData/**/*.json`,
    dataDest = `${dataMerged}/data.json`,
    manifestFile = `${distPath}/manifest.json`





// BROWSER SYNC

function browser_sync(done) {
    browserSync.init({
        server: {
            baseDir: "./www/"
        },
        open: true
    })

    done();
};


function reloadPage(done) {
    browserSync.reload()
    done();
};


function enableProd(done) {
    isProd = true
    done();
};

function disableProd(done) {
    isProd = false
    done();
};


// SASS

function style() {
    return gulp.src(path.join(scssPath, 'main.scss'))
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
        .pipe(gulpif(!isProd, sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: scssPath
        })))
        .pipe(gulpif(isProd, cssmin({
            keepSpecialComments: false,
        })))
        .pipe(gulp.dest(cssDest))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }))
};


// JS
function minifyAssetsLoading() {
    return gulp.src(path.join(jsPath, 'async-assets-loading.js'))
        .pipe(uglify())
        .pipe(rename('async-assets-loading.min.js'))
        .pipe(gulp.dest(jsDest))
};


function js() {
    if (isProd) {
        return rollup.rollup({
            input: './src/js/index.js',
            plugins: [
                nodeResolve.nodeResolve(),
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
            input: './src/js/index.js',
            plugins: [
                nodeResolve.nodeResolve(),
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


// SVG
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





// CRITICAL CSS

function initializeCritical(done) {
    const dir = cssDest;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFile(cssCritical, '', done);
};


function criticalCss(done) {
    critical.generate({
        base: './www/',
        src: 'index.html',
        minify: true,
        width: 1024,
        height: 768,
        css: `${cssDest}/main.css`,
        target: `${cssDest}/critical.css`,
        include: ['.lightbox', '.parallax-container', '.parallax-item', '.gaspHorizontal__card']
    });
    done();
};


// PUG
function html(done) {
    const streams = glob.sync(path.join(dataPath, '/**/*.json'), {}).map((filepath) => {
        /*
        Subfolder
        Create folder in accordion of json folder position
        regex form 'data/'' to last slash
        return the exact path of json file
        */
        const pattern = /data\/(.*\/).*$/;
        const folder = filepath.match(pattern)
        let subfolder = ''
        // In case of subfolder create that if not exist and store subfolder path
        if (folder !== null && !fs.existsSync(`${destPath}/${folder[1]}`)) {
            fs.mkdirSync(`${destPath}/${folder[1]}`, {
                recursive: true
            });
            subfolder = folder[1]
        } else if (folder !== null) {
            subfolder = folder[1]
        }

        /*
        Get name of json file
        */
        const nameFile = filepath.split('/').pop().split('.').shift()

        /*
        Get json data of each file
        */
        const data = JSON.parse(fs.readFileSync(filepath))

        /*
        Get data from each json defined in additonalPata propierties [ array ]
        */
        const additionalDataFile = data.additionalData;
        let additionalData = {}
        if(additionalDataFile) {
            // merge all additional data in one obj
            for (const item of additionalDataFile) {
                additionalData = Object.assign(additionalData, JSON.parse(fs.readFileSync(`${additionalDataPath}/${item}.json`)));
            }
        }

        /*
        Get prod abient value
        */
        const prodData = {}
        prodData.isProd = isProd

        /*
        Get manifest.json for asset
        */
        const manifestData = JSON.parse(fs.readFileSync(manifestFile))

        /*
        merge all json
        */
        const dataMerged = Object.assign({}, additionalData, prodData, data, manifestData);

        // Debug
        // console.log(dataMerged)

        /*
        get template
        */
        const  templateDefault = ('template' in data)
            ? `${themePath}/${data.template}.pug`
            :`${themePath}/index.pug`;

        return gulp.src(templateDefault)
            .pipe(pug({
                data: dataMerged
            }))
            .pipe(rename(nameFile + '.html'))
            .pipe(gulp.dest(`${destPath}/${subfolder}`))
    })
    return es.merge(streams)
        .on('end', () => {
            done()
        })
};


// IMAGE
function image() {
    return gulp.src(imgFiles)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDest));
};


// PRODUCTION FUNCTION
function cleanDist() {
    return del([
        path.join(distPath, '*'),
        path.join(distPath, '*.*')
    ]);
}

/*
Remove dot from manifest, so pug doasn't crash
*/
function normalizeManifest() {
    return gulp.src(manifestFile)
        .pipe(replace('main.css', 'maincss'))
        .pipe(replace('main.js', 'mainjs'))
        .pipe(gulp.dest(distPath))
}

function dist() {
    return gulp.src([cssFile, jsFile])

        .pipe(rev())
        .pipe(gulp.dest(distPath))
        .pipe(rev.manifest({
            path: 'manifest.json'
        }))
        .pipe(revdel(distPath))
        .pipe(gulp.dest(distPath))
}


// REMOVE ALL GENERATED FILES
function cleanAll() {
    return del([
        path.join(cssDest, '**/*.*'),
        path.join(distPath, '*'),
        path.join(distPath, '*.*'),
        path.join(dataMerged, '*.*'),
        path.join(imgDest, '*.*'),
        path.join(destPath, '**/*.html'),
        path.join(svgDest, '*.*'),
        path.join(destPath, 'assets/js/async-assets-loading.min.js'),
        path.join(destPath, 'assets/js/main.js'),
        jsFile
    ]);
}


// LIVE RELOAD
function watch_files(done) {
    gulp.watch([scssFiles, componentscssFiles, componentscssFilesVanilla], style)
    gulp.watch([jsFiles, componentJsFiles, componentJsFilesVanilla], gulp.series(js, reloadPage))
    gulp.watch([allPugFiles, dataFiles, additionalDataFiles], gulp.series(html, reloadPage))

    done();
}


// TASK
gulp.task("initializeCritical", initializeCritical)
gulp.task("style", style)
gulp.task("js", js)
gulp.task("html", html)
gulp.task("image", image)
gulp.task("icons", icons)
gulp.task("minifyAssetsLoading", minifyAssetsLoading)
gulp.task("cleanDist", cleanDist)
gulp.task("dist", dist)
gulp.task("normalizeManifest", normalizeManifest)
gulp.task("cleanAll", cleanAll)
gulp.task("enableProd", enableProd)
gulp.task("disableProd", disableProd)



// MAIN TASK
gulp.task("init", gulp.series(
    disableProd,
    initializeCritical,
    icons,
    image,
    minifyAssetsLoading,
    style,
    js,
    cleanDist,
    dist,
    normalizeManifest,
    html
))

gulp.task('watch', gulp.parallel(
    browser_sync,
    watch_files))

gulp.task("criticalCss", gulp.series(
    style,
    criticalCss))

gulp.task('prod', gulp.series(
    enableProd,
    cleanDist,
    style,
    js,
    dist,
    normalizeManifest,
    html))
