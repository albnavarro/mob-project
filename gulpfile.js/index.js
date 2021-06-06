"use strict"

const config = require('../config.json')
const path = require('path')
const gulp = require('gulp')
const watch = require('gulp-watch')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const jsPath = path.join(themePath, 'js')
const componentPath = path.join(themePath, 'component')
const scssPath = path.join(themePath, 'scss')
const jsFiles = `${jsPath}/**/*.js`
const scssFiles = `${scssPath}/**/*.scss`
const allPugFiles = `${themePath}/**/*.pug`
const dataFiles = `${themePath}/data/**/*.json`
const additionalDataFiles = `${themePath}/additionalData/**/*.json`
const componentscssFiles = `${componentPath}/**/*.scss`
const componentJsFiles = `${componentPath}/**/*.js`
const store = require('./store.js')


const { html } = require('./task/html.js')
const { detectModifiedFiles } = require('./task/detectModifiedFiles.js')
const { pageTitle } = require('./task/pageTitleMap.js')
const { permalink } = require('./task/permalinkMap.js')
const { category } = require('./task/categoryMap.js')
const { browser_sync, reloadPage } = require('./task/browserSync.js')
const { style } = require('./task/style.js')
const { minifyAssetsLoading } = require('./task/minifyAssetsLoading.js')
const { js } = require('./task/script.js')
const { icons } = require('./task/icons.js')
const { initializeCritical, criticalCss } = require('./task/critical.js')
const { image } = require('./task/image.js')
const { dist } = require('./task/manifest.js')
const { cleanDist, cleanAll, deleteEmptyDirectories } = require('./task/clean.js')


/*
* Live reload
*/
function watch_files(done) {
    gulp.watch([scssFiles, componentscssFiles], style)
    gulp.watch([jsFiles, componentJsFiles], gulp.series(js, reloadPage))
    gulp.watch([allPugFiles, dataFiles, additionalDataFiles], gulp.series(detectModifiedFiles, category, pageTitle, permalink, html, reloadPage))

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
    pageTitle,
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
exports.pageTitle = pageTitle
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
* npm run debugpage "index.it.json"
* .....
*/
