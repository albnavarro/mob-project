const path = require('path')
const themePath = path.resolve('src')
const templatePath = path.join(themePath, 'template')
const dataPath = path.join(themePath, 'data')
const componentPath = path.join(themePath, 'component')
const additionalDataPath = path.join(themePath, 'additionalData')
const store = require('../store.js')
// UTILS
const { getNameFile } = require('../functions/utils.js')


/*
* check if json or template is Changed
* @param file - path of file
*/
function taskIsSkippable(filepath, data, template) {

    /*
    track if _wrapper is mofiled , in case render alla pages
    */
    const isWrapper = ( `${templatePath}/default/_wrapper.pug` === store.fileModified ) ? true : false

    /*
    track if specific of shared includes pug ( in includes thempath ) file is changed in last 2 seonds
    */
    const includesFileIsChanged = store.includesFileMap.map((item) => {
        return item === store.fileModified;
    }).some((item) =>  item === true)


    /*
    track if specific includes pug ( in component path ) file is changed in last 2 seonds
    */
    const componentFileChecker = (data) => {
        return data.registerComponent.map((item) => {
                const filePath = `${componentPath}/${item}`
                return filePath === store.fileModified
            }).some((item) =>  item === true)
    }

    const componentFileIsChanged = ('registerComponent' in data) ? componentFileChecker(data) : false


    /*
    track if aditionalData is changed in last 2 seonds
    */
    const aditionDataChecker = (data) => {
        return data.additionalData.map((item) => {
                const filePath = `${additionalDataPath}/${item}`
                return filePath === store.fileModified
            }).some((item) =>  item === true)
    }

    const aditionDataIsChanged = ('additionalData' in data) ? aditionDataChecker(data) : false


    /*
    track if post is changed in last 2 seonds
    */
    const postDataChecker = (data) => {
        return Object.values(data.posts)
            .flat()
            .filter((item) => item.source !== undefined)
            .map((item) => store.fileModified === item.source)
            .some((item) =>  item === true)
    }

    const postDataIsChanged = ('posts' in data) ? postDataChecker(data) : false



    /*
    track if tag is changed in last 2 seonds
    */
    const tagDataChecker = (data) => {
        return data.tags
                .map((item) => store.fileModified === item.source)
                .some((item) =>  item === true)
    }
    const tagDataIsChanged = ('tags' in data) ? tagDataChecker(data) : false


    /*
    track if json is changed in last 2 seonds
    */
    const jsonIsChanged = filepath === store.fileModified

    /*
    track if template is changed in last 2 seonds
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
        !isWrapper
}

exports.taskIsSkippable = taskIsSkippable
