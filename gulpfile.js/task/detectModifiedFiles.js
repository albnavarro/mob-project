const glob = require('glob');
const path = require('path');
const themePath = path.resolve('src');
const includesPugFile = `${themePath}/includes/**/*.pug`;
const store = require('../store.js');
const { fileIschanged } = require('../functions/function.js');

/**
 * Detect file saved, .pug or .json
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function detectModifiedFiles(done) {
    // get list of includes file
    store.includesFileMap = glob.sync(includesPugFile);

    // get last file saved
    const allFiles = glob.sync(
        `${themePath}{/**/*.{json,pug},/middleware/customFunction.js}`
    );
    const files = allFiles
        .map((item) => {
            return {
                modifies: fileIschanged(item),
                file: item,
            };
        })
        .find((item) => item.modifies === true);

    store.fileModified = files.file;
    done();
}

exports.detectModifiedFiles = detectModifiedFiles;
