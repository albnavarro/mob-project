const glob = require('glob')
const path = require('path')
const fs = require('fs')
const themePath = path.resolve('src')
const destPath = path.resolve('www')
const dataPath = path.join(themePath, 'data')
const dataDestFolder = path.join(destPath, 'assets/data')
const pageTitleFile = `${dataDestFolder}/pageTitleMap.json`
const store = require('../store.js')
const { getLanguage } = require('../functions/utils.js')


/*
* CREATE pageTitle MAP
* pageTitleMap: {
*     univoqueId: { en: '{pageTitle}', it: '{pageTitle}', ... },
      ....
 * }
*/
function pageTitle(done) {
    const allPath = glob.sync(path.join(dataPath, '/**/*.json'))

    const pageTitleObj = allPath.reduce((acc, curr) => {
      const data = JSON.parse(fs.readFileSync(curr))

      if('univoqueId' in data) {
          acc[data.univoqueId] = {...acc[data.univoqueId]}
          acc[data.univoqueId][getLanguage(curr)] = data.pageTitle
      }

      return acc;
    }, {});


    /*
    * DEBUG
    * gulp html -debug for debug
    */
    if(store.arg.debug) {
        console.log(pageTitleObj)
    }

    /*
    * Check if destination folder exist and save the file with permalink map
    */
    if(!fs.existsSync(dataDestFolder)){
        fs.mkdirSync(dataDestFolder, {
            recursive: true
        })
    }

    store.pageTitleMapData = pageTitleObj
    fs.writeFile(pageTitleFile, JSON.stringify(pageTitleObj), () => {})
    done()

}

exports.pageTitle = pageTitle
