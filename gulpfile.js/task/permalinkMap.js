const util = require('util')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const dataPath = path.join(themePath, 'data')
const dataDestFolder = path.join(destPath, 'assets/data')
const permalinkFile = `${dataDestFolder}/permalinkMap.json`
const {
    getNameFile,
    ssgPermalink,
    getPathByLocale,
    getLanguage,
    extracAdditionalData,
    getUnivoqueId
} = require('../functions/utils.js')
const store = require('../store.js')

/*
* CREATE PERMALINKMAP
* permalinkMap: {
*     univoqueId: { en: '{pemalink}', it: '{pemalink}', ... },
      ....
 * }
*/
function permalink(done) {
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    const peramlinkObj = allPath.reduce((acc, curr) => {
      const data = JSON.parse(fs.readFileSync(curr))
      const lang = getLanguage(curr)
      const originalNameFile = getNameFile(curr)
      const nameFile = (store.arg.prod && originalNameFile === 'index') ? '' : originalNameFile
      const slug = (('slug' in data) && originalNameFile !== 'index') ? data.slug : nameFile
      const subfolder  = getPathByLocale(curr,lang)
      const permalinkUrl = ssgPermalink(subfolder,slug)
      const univoqueId = getUnivoqueId(curr)

      acc[univoqueId] = {...acc[univoqueId]}
      acc[univoqueId][getLanguage(curr)] = permalinkUrl


      return acc;
    }, {});

    /*
    * DEBUG
    * gulp html -debug for debug
    */
    if(store.arg.debug) {
        console.log(peramlinkObj)
    }

    /*
    * Check if destination folder exist and save the file with permalink map
    */
    if(!fs.existsSync(dataDestFolder)){
        fs.mkdirSync(dataDestFolder, {
            recursive: true
        })
    }

    store.permalinkMapData = peramlinkObj
    fs.writeFile(permalinkFile, JSON.stringify(peramlinkObj), () => {})
    done()

}

exports.permalink = permalink
