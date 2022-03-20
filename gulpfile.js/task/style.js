const gulp = require('gulp');
const gulpif = require('gulp-if');
const path = require('path');
const sourcemaps = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const postcss = require('gulp-postcss');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const scssPath = path.join(themePath, 'scss');
const cssDest = path.join(destPath, 'assets/css');
const { browserSync } = require('./browserSync.js');
const store = require('../store.js');

/**
 * Process scss
 *
 * @return {stream}
 */
function style() {
    return gulp
        .src(path.join(scssPath, 'style.scss'), { sourcemaps: true })
        .pipe(
            sass({
                outputStyle: 'expanded',
            }).on('error', sass.logError)
        )
        .pipe(postcss([require('autoprefixer')()]))
        .pipe(gulpif(store.arg.prod, cleanCSS()))
        .pipe(gulpif(!store.arg.prod, gulp.dest(cssDest, { sourcemaps: true })))
        .pipe(gulpif(store.arg.prod, gulp.dest(cssDest)))
        .pipe(
            browserSync.stream({
                match: '**/*.css',
            })
        );
}

exports.style = style;
