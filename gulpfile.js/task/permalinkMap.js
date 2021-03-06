const util = require('util');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const dataPath = path.join(themePath, 'data');
const dataDestFolder = path.join(destPath, 'assets/data');
const permalinkFile = `${dataDestFolder}/permalinkMap.json`;
const {
    getNameFile,
    getPermalink,
    getPathByLocale,
    getLanguage,
    getUnivoqueId,
    mergeData,
    langIsDisable,
} = require('../functions/function.js');
const store = require('../store.js');

/**
 * Create a mapping of all permalink
 * The map is stored in store.js for runtime access locally in and in www/assets/data/permalinkMap.json
 *
 * @param  {function} done - async completion function
 * @return {function}
 */
function permalink(done) {
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'));

    const peramlinkObj = allPath.reduce((acc, curr) => {
        const data = JSON.parse(fs.readFileSync(curr));
        const lang = getLanguage(curr);
        const originalNameFile = getNameFile(curr);
        const nameFile =
            store.arg.prod && originalNameFile === 'index'
                ? ''
                : originalNameFile;
        const slug =
            'slug' in data && originalNameFile !== 'index'
                ? data.slug
                : nameFile;
        const subfolder = getPathByLocale(curr, lang);
        const permalinkUrl = getPermalink(subfolder, slug);
        const univoqueId = getUnivoqueId(curr);
        const publish =
            ('draft' in data && data.draft === true) || langIsDisable(lang)
                ? false
                : true;

        if (publish) {
            acc[univoqueId] = {
                ...acc[univoqueId],
            };
            acc[univoqueId][getLanguage(curr)] = permalinkUrl;
        }

        return acc;
    }, {});

    /*
     * DEBUG
     * gulp html -debug for debug
     */
    if (store.arg.debug) {
        console.log(peramlinkObj);
    }

    /*
     * Check if destination folder exist and save the file with permalink map
     */
    if (!fs.existsSync(dataDestFolder)) {
        fs.mkdirSync(dataDestFolder, {
            recursive: true,
        });
    }

    store.permalinkMapData = peramlinkObj;

    if (store.arg.debug) {
        fs.writeFileSync(permalinkFile, JSON.stringify(peramlinkObj));
    } else {
        fs.writeFile(permalinkFile, JSON.stringify(peramlinkObj), () => {});
    }

    done();
}

exports.permalink = permalink;
