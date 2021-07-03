const gulp = require('gulp');
const fs = require('fs-extra');
const rev = require('gulp-rev');
const revdel = require('rev-del');
const path = require('path');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const imgPath = path.join(themePath, 'static/img');
const videoPath = path.join(themePath, 'static/video');
const jsPath = path.join(themePath, 'static/js');
const fontPath = path.join(themePath, 'static/fonts');
const fontDest = path.join(destPath, 'assets/fonts');
const distPath = path.join(destPath, 'assets/dist');
const cssDest = path.join(destPath, 'assets/css');
const jsDest = path.join(destPath, 'assets/js');
const imgDest = path.join(destPath, 'assets/img');
const cssFile = `${cssDest}/style.css`;
const jsFile = `${jsDest}/script.js`;
const imgFiles = `${imgPath}/**/*.*`;
const videoFiles = `${videoPath}/**/*.*`;

/**
 * Copy static file (font and ststic js) in build folder
 * Parse css, js, img, video files with hash and generate manifest.json file
 *
 * @return {stream}
 */
function assets() {
    // Copy font
    fs.copySync(fontPath, fontDest);
    fs.copySync(jsPath, jsDest);

    return gulp
        .src([cssFile, jsFile, imgFiles, videoFiles])

        .pipe(rev())
        .pipe(gulp.dest(distPath))
        .pipe(
            rev.manifest({
                path: 'manifest.json',
            })
        )
        .pipe(revdel(distPath))
        .pipe(gulp.dest(distPath));
}

exports.assets = assets;
