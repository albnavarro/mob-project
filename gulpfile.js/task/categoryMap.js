const util = require('util')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const config = require('../../config.json')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const dataPath = path.join(themePath, 'data')
const dataDestFolder = path.join(destPath, 'assets/data')
const categoryFile = `${dataDestFolder}/categoryMap.json`
const {
    getNameFile,
    getPermalink,
    getPathByLocale,
    getLanguage,
    extracAdditionalData,
    getOriginalPath,
    mergeData,
    langIsDisable
} = require('../functions/utils.js')
const { sortbyDate } = require('../functions/helpers.js')
const store = require('../store.js')


/*
* CREATE CATEGORYMAP
*/
function category(done) {
    /*
    * Create main obj
    */
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    const categoryObj = allPath.reduce((acc, curr, i) => {
        const parsed = JSON.parse(fs.readFileSync(curr));
        const nameFile = getNameFile(curr)
        const slug = ('slug' in parsed) ? parsed.slug : nameFile
        const lang = getLanguage(curr)
        const data = mergeData(curr, parsed, lang)
        const publish = (( 'draft' in data ) && data.draft === true || langIsDisable(lang)) ? false : true

        if (('exportPost' in data) && publish) {
            const subfolder  = getPathByLocale(curr,lang)
            const permalink = getPermalink(subfolder,slug)
            const sourceFilepath = (lang == config.defaultLocales) ? `${lang}/` : ''

            const category = data.exportPost.category;
            const obj = {
                permalink: permalink,
                category: category,
                tag: ( 'tag' in data.exportPost ) ? data.exportPost.tag : [],
                source: curr,
                date: data.exportPost.date,
                data: { ...data.exportPost.data }
            };

            /*
            * Merge lang obj with itself or crete a new obj if not exist,
            * in the first cicle of each lang the attribute not exist
            */
            acc[lang] = { ...acc[lang] };

            /*
            * Add new post to category or inizialize category
            */
            acc[lang][category] = (category in acc[lang]) ? acc[lang][category] : [];
            acc[lang][category].push(obj);
        }

        return acc;
    }, {});

    for (const [key, lang] of Object.entries(categoryObj)) {
        for (let [key, posts] of Object.entries(lang)) {
            posts = [ ... sortbyDate(posts) ]
        }
    }

    /*
    * DEBUG
    * gulp html -debug for debug
    */
    if(store.arg.debug) {
        console.log(util.inspect(categoryObj, {showHidden: false, depth: null}))
    }

    /*
    * Check if destination folder exist and save the file with permalink map
    */
    if(!fs.existsSync(dataDestFolder)){
        fs.mkdirSync(dataDestFolder, {
            recursive: true
        })
    }

    store.categoryMapData = categoryObj

    if(store.arg.debug) {
        fs.writeFileSync(categoryFile, JSON.stringify(categoryObj))
    } else {
        fs.writeFile(categoryFile, JSON.stringify(categoryObj), () => {})
    }

    done()
}

exports.category = category
