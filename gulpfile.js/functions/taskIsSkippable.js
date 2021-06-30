const config = require('../../config.json')
const path = require('path')
const themePath = path.resolve('src')
const templatePath = path.join(themePath, 'template')
const dataPath = path.join(themePath, 'data')
const componentPath = path.join(themePath, 'component')
const additionalDataPath = path.join(themePath, 'additionalData')
const store = require('../store.js')
// UTILS
const { getNameFile, getTranslationFilesList } = require('../functions/function.js')


/**
 * Detect if json || template || any data/component associated is changed
 *
 * @param  {string} filepath - source data json path
 * @param  {string} data     - source data merged with all map ...
 * @param  {string} template - template used for pug render
 * @return {boolean}
 */
function taskIsSkippable(filepath, data, template) {

    /*
    Detect if src/middleware/customFunction.js is mofiled , in case render alla pages
    */
    const isCustomFunction = ( `${themePath}/middleware/customFunction.js` === store.fileModified ) ? true : false


    /*
    Detect if _wrapper is mofiled , in case render alla pages
    */
    const isWrapper = ( `${templatePath}/default/_wrapper.pug` === store.fileModified ) ? true : false


    /*
    Detect if specific of shared includes pug ( in includes thempath ) file is changed in last 2 seonds
    */
    const includesFileIsChanged = store.includesFileMap.map((item) => {
        return item === store.fileModified;
    }).some((item) =>  item === true)


    /*
    Detect if includes pug ( from component path ) file is changed in last 2 seonds
    */
    const componentFileChecker = (data) => {
        return data.registerComponent.map((item) => {
                const filePath = `${componentPath}/${item}`
                return filePath === store.fileModified
            }).some((item) =>  item === true)
    }

    const componentFileIsChanged = ('registerComponent' in data) ? componentFileChecker(data) : false


    /*
    Detect if aditionalData is changed in last 2 seonds
    */
    const aditionDataChecker = (data) => {
        return data.additionalData.map((item) => {
                const filePath = `${additionalDataPath}/${item}`
                return filePath === store.fileModified
            }).some((item) =>  item === true)
    }

    const aditionDataIsChanged = ('additionalData' in data) ? aditionDataChecker(data) : false


    /*
    Detect if post is changed in last 2 seonds
    */
    const postDataChecker = (data) => {
        return Object.values(data.posts)
            .flat()
            .filter((item) => item.source !== undefined)
            .map((item) => {
                // store.fileModified === item.source
                const filePathMap = getTranslationFilesList(item.source)
                return filePathMap.includes(store.fileModified)
            })
            .some((item) =>  item === true)
    }

    const postDataIsChanged = ('posts' in data) ? postDataChecker(data) : false



    /*
    Detect if tag is changed in last 2 seonds
    */
    const tagDataChecker = (data) => {
        return data.tags
            .map((item) => {
                // store.fileModified === item.source
                const filePathMap = getTranslationFilesList(item.source)
                return filePathMap.includes(store.fileModified)
            })
            .some((item) =>  item === true)
    }
    const tagDataIsChanged = ('tags' in data) ? tagDataChecker(data) : false


    /*
    Detect if json is changed in last 2 seonds
    */
    const filePathMap = getTranslationFilesList(filepath)
    const jsonIsChanged = filePathMap.includes(store.fileModified)


    /*
    Detect if template is changed in last 2 seonds
    */
    const templateIsChanged = template === store.fileModified


    return (
        !jsonIsChanged &&
        !templateIsChanged &&
        !aditionDataIsChanged &&
        !postDataIsChanged &&
        !componentFileIsChanged &&
        !includesFileIsChanged &&
        !tagDataIsChanged) &&
        !isWrapper &&
        !isCustomFunction
}

exports.taskIsSkippable = taskIsSkippable
