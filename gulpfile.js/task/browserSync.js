const browserSync = require('browser-sync').create()

/*
* BROWSER SYNC
*/
function browser_sync(done) {
    browserSync.init({
        server: {
            baseDir: "./www/"
        },
        open: false
    })

    done();
};

/*
* RELOAD PAGE
*/
function reloadPage(done) {
    browserSync.reload()
    done();
};

exports.browserSync = browserSync
exports.browser_sync = browser_sync
exports.reloadPage = reloadPage
