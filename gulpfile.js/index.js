'use strict';

const config = require('../config.json');
const path = require('path');
const gulp = require('gulp');
const watch = require('gulp');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const jsPath = path.join(themePath, 'js');
const componentPath = path.join(themePath, 'component');
const scssPath = path.join(themePath, 'scss');
const jsFiles = `${jsPath}/**/*.js`;
const scssFiles = `${scssPath}/**/*.scss`;
const allPugFiles = `${themePath}/**/*.pug`;
const dataFiles = `${themePath}/data/**/*.json`;
const customFunctionFile = `${themePath}/middleware/customFunction.js`;
const additionalDataFiles = `${themePath}/additionalData/**/*.json`;
const componentscssFiles = `${componentPath}/**/*.scss`;
const componentJsFiles = `${componentPath}/**/*.js`;
const staticFiles = `${themePath}/static/**/*.*`;
const store = require('./store.js');

const { html } = require('./task/html.js');
const { detectModifiedFiles } = require('./task/detectModifiedFiles.js');
const { pageTitle } = require('./task/pageTitleMap.js');
const { permalink } = require('./task/permalinkMap.js');
const { category } = require('./task/categoryMap.js');
const { browser_sync, reloadPage } = require('./task/browserSync.js');
const { style } = require('./task/style.js');
const { minifyAssetsLoading } = require('./task/minifyAssetsLoading.js');
const { js } = require('./task/script.js');
const { icons } = require('./task/icons.js');
const { initializeCritical, criticalCss } = require('./task/critical.js');
const { assets } = require('./task/assets.js');
const { htaccess } = require('./task/htaccess.js');
const { createFolder } = require('./task/createFolder.js');
const { draftMap } = require('./task/draftMap.js');
const { cleanDist, cleanAll } = require('./task/clean.js');

/*
 * Live reload
 */
function watch_files(done) {
    gulp.watch([staticFiles], gulp.series(icons, assets));
    gulp.watch([scssFiles, componentscssFiles], style);
    gulp.watch([jsFiles, componentJsFiles], gulp.series(js, reloadPage));
    gulp.watch(
        [customFunctionFile, allPugFiles, dataFiles, additionalDataFiles],
        gulp.series(
            detectModifiedFiles,
            category,
            pageTitle,
            permalink,
            draftMap,
            html,
            reloadPage
        )
    );

    done();
}

/*
 * BUILD TASK
 */

const build = gulp.series(
    cleanAll,
    createFolder,
    htaccess,
    initializeCritical,
    icons,
    minifyAssetsLoading,
    style,
    js,
    cleanDist,
    assets,
    category,
    pageTitle,
    permalink,
    draftMap,
    html,
    criticalCss,
    html
);

/*
 * RESET BUILD
 */

const reset = gulp.series(cleanAll);

/*
 * DEV
 */
const dev = gulp.series(build, gulp.parallel(browser_sync, watch_files));

/*
 * WATCH
 */
const watchTask = gulp.parallel(browser_sync, watch_files);

/*
 * TASk
 */
exports.initializeCritical = initializeCritical;
exports.style = style;
exports.js = js;
exports.html = html;
exports.icons = icons;
exports.cleanDist = cleanDist;
exports.assets = assets;
exports.cleanAll = cleanAll;
exports.permalink = permalink;
exports.category = category;
exports.pageTitle = pageTitle;
exports.detectModifiedFiles = detectModifiedFiles;
exports.htaccess = htaccess;
exports.createFolder = createFolder;
exports.draftMap = draftMap;
/*
 * MAIN TASK
 */
exports.build = build;
exports.reset = reset;
exports.dev = dev;
exports.watch = watchTask;

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
