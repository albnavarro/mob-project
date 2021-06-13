const gulp = require('gulp')
const rename = require('gulp-rename')
const fs = require('fs')
const critical = require('critical').stream
const path = require('path')
const destPath = path.resolve('www')
const cssDest = path.join(destPath, 'assets/css')
const store = require('../store.js')

/*
* CREATE CRITICAL CSS FOLDER
*/
function initializeCritical(done) {
    const dir = cssDest;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        done()
    } else {
        done()
    }
};


/*
* CRITICAL CSS
*/
function criticalCss(done) {
    if (store.arg.prod) {
        const criticalArr = Object.values(store.criticalCssMapData)
        const tasks = criticalArr.map(item => {
            function renderCritical(taskDone) {
                return gulp.src(item.source)
                .pipe(critical({
                    base: 'www/',
                    minify: true,
                    width: 1024,
                    height: 768,
                    css: `${cssDest}/style.css`,
                    include: ['.lightbox', '.parallax-container', '.parallax-item', '.gaspHorizontal__card']
                }))
                .pipe(rename(item.template + '.css'))
                .pipe(gulp.dest(`${cssDest}/critical`))
            }
            renderCritical.displayName = item.template
            return renderCritical
        })

        return gulp.series(...tasks, seriesDone => {
            seriesDone()
            done()
        })()

    } else {
        done()
    }

};


exports.initializeCritical = initializeCritical
exports.criticalCss = criticalCss
