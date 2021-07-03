const gulp = require('gulp');
const gulpif = require('gulp-if');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const cssmin = require('gulp-cssmin');
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
        .src(path.join(scssPath, 'style.scss'))
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                outputStyle: 'nested',
                includePaths: ['node_modules/susy/sass'],
            }).on('error', sass.logError)
        )
        .pipe(
            postcss([
                require('autoprefixer')(),
                require('css-mqpacker')({
                    sort: true,
                }),
            ])
        )
        .pipe(
            gulpif(
                !store.arg.prod,
                sourcemaps.write('maps', {
                    includeContent: false,
                    sourceRoot: scssPath,
                })
            )
        )
        .pipe(
            gulpif(
                store.arg.prod,
                cssmin({
                    keepSpecialComments: false,
                })
            )
        )
        .pipe(gulp.dest(cssDest))
        .pipe(
            browserSync.stream({
                match: '**/*.css',
            })
        );
}

exports.style = style;
