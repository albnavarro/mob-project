// NOT USED

const gulp = require('gulp')
const imagemin = require('gulp-imagemin')
const path = require('path')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const imgPath = path.join(themePath, 'img')
const imgFiles = `${imgPath}/*`
const imgDest = path.join(destPath, 'assets/img')

/*
* Image min
*/
function image() {
    return gulp.src(imgFiles)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDest));
};

exports.image = image
