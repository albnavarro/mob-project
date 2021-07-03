const browserSync = require('browser-sync').create();

/**
 * Browser sync configuration
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function browser_sync(done) {
    browserSync.init({
        server: {
            baseDir: './www/',
        },
        open: false,
    });

    done();
}

/**
 * Reload page function configuration
 *
 * @param  {function}  done - async completion function
 * @return {function}
 */
function reloadPage(done) {
    browserSync.reload();
    done();
}

exports.browserSync = browserSync;
exports.browser_sync = browser_sync;
exports.reloadPage = reloadPage;
