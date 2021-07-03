const gulp = require('gulp');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const path = require('path');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const svgPath = path.join(themePath, 'static/svg');
const svgFiles = `${svgPath}/*.svg`;
const svgDest = path.join(destPath, 'assets/svg');

/**
 * Generate svg sprite
 *
 * @return {stream}
 */
function icons() {
    return gulp
        .src(svgFiles)
        .pipe(
            svgmin({
                plugins: [
                    {
                        removeViewBox: false,
                    },
                ],
            })
        )
        .pipe(
            svgstore({
                inlineSvg: true,
            })
        )
        .pipe(gulp.dest(svgDest));
}

exports.icons = icons;
