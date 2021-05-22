const gulp = require('gulp')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const path = require('path')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const jsPath = path.join(themePath, 'js')
const jsDest = path.join(destPath, 'assets/js')

/*
* Minify async-assets-loading
*/
function minifyAssetsLoading() {
    return gulp.src(path.join(jsPath, 'async-assets-loading.js'))
        .pipe(uglify())
        .pipe(rename('async-assets-loading.min.js'))
        .pipe(gulp.dest(jsDest))
}

exports.minifyAssetsLoading = minifyAssetsLoading
