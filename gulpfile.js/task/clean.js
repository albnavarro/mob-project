const path = require('path')
const del = require('del')
const deleteEmpty = require('delete-empty')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const distPath = path.join(destPath, 'assets/dist')
const dataDestFolder = path.join(destPath, 'assets/data')
const imgDest = path.join(destPath, 'assets/img')
const svgDest = path.join(destPath, 'assets/svg')
const cssDest = path.join(destPath, 'assets/css')
const jsDest = path.join(destPath, 'assets/js')
const jsFile = `${jsDest}/script.js`

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
    del.sync([
        path.join(cssDest, '**'),
        path.join(distPath, '*'),
        path.join(distPath, '*.*'),
        path.join(dataDestFolder, '*.*'),
        path.join(imgDest, '*.*'),
        path.join(destPath, '**/*.html'),
        path.join(svgDest, '*.*'),
        path.join(destPath, 'assets/js/async-assets-loading.min.js'),
        path.join(destPath, 'assets/js/script.js'),
        path.join(destPath, 'assets/js/script.js.map'),
        jsFile
    ], {force:true});
    done()
}

function deleteEmptyDirectories(done) {
    deleteEmpty.sync(destPath)
    done()
}


exports.cleanDist = cleanDist
exports.cleanAll = cleanAll
exports.deleteEmptyDirectories = deleteEmptyDirectories
