const path = require('path')
const del = require('del')
const fs = require('fs')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const distPath = path.join(destPath, 'assets/dist')

/*
* Delete js and css and manifest file for production
*/
function cleanDist(done) {
    del.sync([
        path.join(distPath, '*'),
        path.join(distPath, '*.*')
    ]);
    done()
}


/*
* Remove all generated files
*/
function cleanAll(done) {
    fs.rmdirSync(destPath, { recursive: true })
    done()
}



exports.cleanDist = cleanDist
exports.cleanAll = cleanAll
