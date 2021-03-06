const util = require('util');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const dataPath = path.join(themePath, 'data');
const dataDestFolder = path.join(destPath, 'assets/data');
const pageTitleFile = `${dataDestFolder}/pageTitleMap.json`;
const store = require('../store.js');
const {
    getLanguage,
    getUnivoqueId,
    mergeData,
    langIsDisable,
} = require('../functions/function.js');

/**
 * Create a mapping of all page title
 * The map is stored in store.js for runtime access locally in and in www/assets/data/pageTitleMap.json
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function pageTitle(done) {
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'));

    const pageTitleObj = allPath.reduce((acc, curr) => {
        const parsed = JSON.parse(fs.readFileSync(curr));
        const lang = getLanguage(curr);
        const univoqueId = getUnivoqueId(curr);
        const data = mergeData(curr, parsed, lang);
        const publish =
            ('draft' in parsed && parsed.draft === true) || langIsDisable(lang)
                ? false
                : true;

        if (publish) {
            acc[univoqueId] = {
                ...acc[univoqueId],
            };
            acc[univoqueId][lang] = data.pageTitle;
        }

        return acc;
    }, {});

    /*
     * DEBUG
     * gulp html -debug for debug
     */
    if (store.arg.debug) {
        console.log(pageTitleObj);
    }

    /*
     * Check if destination folder exist and save the file with permalink map
     */
    if (!fs.existsSync(dataDestFolder)) {
        fs.mkdirSync(dataDestFolder, {
            recursive: true,
        });
    }

    store.pageTitleMapData = pageTitleObj;

    if (store.arg.debug) {
        fs.writeFileSync(pageTitleFile, JSON.stringify(pageTitleObj));
    } else {
        fs.writeFile(pageTitleFile, JSON.stringify(pageTitleObj), () => {});
    }

    done();
}

exports.pageTitle = pageTitle;
