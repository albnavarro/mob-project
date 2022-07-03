const path = require('path');
const del = require('del');
const fs = require('fs');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const distPath = path.join(destPath, 'assets/dist');

/**
 * Delete all revision file
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function cleanDist(done) {
    del.sync([path.join(distPath, '*'), path.join(distPath, '*.*')]);
    done();
}

/**
 * Remove build folder
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function cleanAll(done) {
    if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true });
        done();
    } else {
        done();
    }
}

exports.cleanDist = cleanDist;
exports.cleanAll = cleanAll;
