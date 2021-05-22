const gulp = require('gulp')
const fs = require('fs')
const critical = require('critical').stream
const path = require('path')
const destPath = path.resolve('www')
const cssDest = path.join(destPath, 'assets/css')
const cssCritical = `${cssDest}/critical.css`
const store = require('../store.js')

/*
* CREATE CRITICAL CSS FOLDER
*/
function initializeCritical(done) {
    const dir = cssDest;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFile(cssCritical, '', done);
};


/*
* CRITICAL CSS
*/
function criticalCss(done) {
    if (store.arg.prod) {
        return gulp.src('www/**/*.html')
        .pipe(critical({
            base: 'www/',
            minify: true,
            width: 1024,
            height: 768,
            css: `${cssDest}/style.css`,
            include: ['.lightbox', '.parallax-container', '.parallax-item', '.gaspHorizontal__card']
        }))
        .pipe(gulp.dest(`${cssDest}/critical`))
    }

    done();
};


exports.initializeCritical = initializeCritical
exports.criticalCss = criticalCss
