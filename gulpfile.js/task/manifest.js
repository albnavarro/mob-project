const gulp = require('gulp')
const rev = require('gulp-rev')
const revdel = require('rev-del')
const path = require('path')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const distPath = path.join(destPath, 'assets/dist')
const imgPath = path.join(themePath, 'img')
const cssDest = path.join(destPath, 'assets/css')
const jsDest = path.join(destPath, 'assets/js')
const imgDest = path.join(destPath, 'assets/img')
const cssFile = `${cssDest}/style.css`
const jsFile = `${jsDest}/script.js`
const imgFiles = `${imgPath}/*`

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

exports.dist = dist
