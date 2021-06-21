const config = require('../../config.json')
const fs = require('fs')
const path = require('path')
const themePath = path.resolve('src')
const additionalDataPath = path.join(themePath, 'additionalData')
const dataPath = path.join(themePath, 'data')
const templatePath = path.join(themePath, 'template')
const { propValidate, mergeDeep } = require('./helpers.js')
const store = require('../store.js')


/**
 * getPageType - Detect if is Archive Post or Page
 *
 * @param  {Object} data data obj from content
 * @return {string}
 */
function getPageType(data) {
    if('isArchive' in data) {
        return 'archive'
    } else if ('exportPost' in data) {
        return 'post'
    } else {
        return 'page'
    }
}


/**
 * getArchivePageName - get pagination page name index and next page
 *
 * @param  {number} index Archive page postion
 * @param  {string} nameFile original name file
 * @param  {string} dinamicPageName dinamic page name for index > 0
 * @return {string}
 */
function getArchivePageName(index, nameFile, dinamicPageName) {
    return (index == 0) ? nameFile : `${dinamicPageName}${index}`
}


/**
 * fileIschanged - Detect if file is changed in last 2 seconds
 *
 * @param  {string} filepath file path
 * @return {Boolean}
 */
function fileIschanged(filepath) {
    if(fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath)
        const datetime = new Date()
        const difference = datetime.getTime() - stats.mtime.getTime()
        const seconds = Math.abs(difference / 1000)
        return seconds < 2
    } else {
        return false
    }
}


/**
 * getNameFile - file name without .lang and .json
 *
 * @param  {string} filepath file path
 * @return {string}
 */
function getNameFile(filepath) {
    return filepath.split('/').pop().split('.').shift()
}


/**
 * getPermalink - Get permalink
 *
 * @param  {string} folder             destination folder wioth langh folder added
 * @param  {string} nameFile           slug ( file name or slug propierites from json)
 * @param  {bolean} prependSlash       prepend slash
 * @return {string}
 */
function getPermalink(destFolder,nameFile,prependSlash = false) {
    const slash = prependSlash ? '/' : ''
    return `${slash}${destFolder}/${nameFile}${getExtensionFile()}`
}


/**
 * getExtensionFile
 *
 * @return {string}  retutn html extension in dev mode
 */
function getExtensionFile() {
    return (store.arg.prod) ? "" :  ".html"
}


/**
 * getThemeSubFolder
 *
 * @param  {string} filepath source path file
 * @return {string}          source filepath without name file from the root of project
 */
function getThemeSubFolder(filepath) {
    const pattern = new RegExp(`${themePath}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}


/**
 * getThemeSubFolder - description
 *
 * @param  {string} filepath source additional data path file
 * @return {string}         additional data filepath without name file from the root of project
 */
function getThemeSubFolder(filepath) {
    const pattern = new RegExp(`${additionalDataPath}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}


/**
 * getOriginalPath
 *
 * @param  {string} filepath source file path
 * @return {string}          filepath without name file from the root of project
 */
function getOriginalPath(filepath) {
    const pattern = new RegExp(`${dataPath}\/(.*\/).*$`);
    const path = filepath.match(pattern);
    return (!path) ? '' : path[1]
}


/**
 * getPathByLocale
 * Return destination folder where page will saved
 * Prepend lang if needed
 * Check parent slug ( every index in folder ) and self folder index to create final path ( used for permalink )
 *
 * @param  {string} filepath source filpath
 * @param  {string} lang     page lang
 * @return {string}          destination folder with lang folder prepended if needed
 */
function getPathByLocale(filepath, lang) {
    const pattern = new RegExp(`${dataPath}\/(.*\/).*$`);
    const path = filepath.match(pattern);
    const rootPath = (!path) ? '' : path[1]

    const dirArr = rootPath.split('/');
    dirArr.pop();

    /*
    * Create path slug of parent
    */
    const pathBySlug = dirArr.reduce((p, c, i) => {
        const file = `${dataPath}${p.original}/${c}/index.${lang}.json`
        const fileDefaultLang = `${dataPath}${p.original}/${c}/index.${config.defaultLocales}.json`

        // parse index of current local if exist or default index lang
        const parentData = (fs.existsSync(file)) ? JSON.parse(fs.readFileSync(file)) : JSON.parse(fs.readFileSync(fileDefaultLang))
        const slug = (propValidate(['slug'], parentData)) ? parentData.slug : c
        return { 'original':`${p.original}/${c}`, 'modified' : `${p.modified}/${slug}`}
    }, { 'original':'', 'modified' : ''})

    const pathBySlugAndLang = ( config.defaultLocales == lang) ? `${pathBySlug.modified}` : `/${lang}${pathBySlug.modified}`

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return pathBySlugAndLang;
}


/**
 * getUnivoqueId - get uniqueId for each type of content
 *
 * @param  {string} filepath source file path
 * @return {string}          source file path with name without lang and file extension
 */
function getUnivoqueId(filepath) {
    return `${getOriginalPath(filepath)}${getNameFile(filepath)}`
}



/**
 * getLanguage - get language from file name
 *
 * @param  {string} filepath source file path
 * @return {string}          get language from file name
 */
function getLanguage(filepath) {
    const nameFile = filepath.split('/').pop().split('.')
    return (nameFile.length == 3) ? nameFile[1] : config.defaultLocales
}


/**
 * getAdditionalData - get an obj with all data in all json file associated to {page}.json
 *
 * @param  {Array} data  data obj from content
 * @return {Object}      merged obj
 */
function getAdditionalData(data) {
    const additionalDataList = (data) => ('additionalData' in data) ? data.additionalData : [];
    const additionalDataFile = additionalDataList(data);

    /*
    map function return an array of Object
    the reduce function retur an obj from the array
    */
    const additionalData = additionalDataFile.map((item) => {
        const filepath = `${additionalDataPath}/${item}`
            if(fs.existsSync(filepath)) {
                return JSON.parse(fs.readFileSync(filepath))
            } else {
                return []
            }
        }).reduce((a, c) => a = {...a, ...c}, {})

    return additionalData
}


 /**
  * getTemplate - Detecty template for render
  *
  * @param  {Object} data data obj from content
  * @return {string}      Return default template or specific
  */
function getTemplate(data) {
    const getDefaultTemplate = (data) => {
        if(propValidate(['isArchive', 'pagination'], data) && data.isArchive.pagination === true) {
            return config.defaultTemplate.paginationArchive

        } else if (('isArchive' in data) && ('importPost' in data)) {
            return config.defaultTemplate.postArchive

        } else if (('isArchive' in data) && ('importTag' in data)) {
            return config.defaultTemplate.tagArchive

        } else if('exportPost' in data) {
            return config.defaultTemplate.post

        } else {
            return config.defaultTemplate.page
        }
    }

    return ('template' in data) ?  `${templatePath}/${data.template}.pug` :  `${templatePath}/${getDefaultTemplate(data)}`
}



/**
 * mergeData - merge content data with default lang content if content lang is not default
 *
 * @param  {string} filepath source file path of content
 * @param  {object} parsed   data of content
 * @param  {string} lang     lang of content
 * @return {type}            return merged object
 */
function mergeData(filepath, parsed, lang) {
    const defaultLangFilePath = `${dataPath}/${getOriginalPath(filepath)}${getNameFile(filepath)}.${config.mergeDataFrom}.json`
    const defaultLangData = ( config.mergeDataFrom !== lang && fs.existsSync(defaultLangFilePath))
        ? JSON.parse(fs.readFileSync(defaultLangFilePath))
        : null

    return ( defaultLangData === null) ? { ... parsed } : mergeDeep(defaultLangData, parsed)
}



/**
 * langIsDisable - check if lang is disabled
 *
 * @param  {string} lang description
 * @return {boolean}      description
 */
function langIsDisable(lang) {
    return  ('disableLocales' in config ) ? config.disableLocales.includes(lang) : false
}



/**
 * getPosts - gt post from array of Category
 *
 * @param  {Object} data content
 * @return {Object}   Object of post
 */
function getPosts (data) {
    return data.importPost.reduce((acc, curr) => {
        if (propValidate([data.lang, curr], store.categoryMapData))  acc[curr] = store.categoryMapData[data.lang][curr]
        return acc
    }, {})
}



/**
 * checkIfPostHaveTag - detect if tag is defined in a post data with some or every method
 *
 * @param  {Object} data - content data
 * @param  {type} post - post target to serch tag
 * @return {Boleean} true if tag is finded finded
 */
function checkIfPostHaveTag (filterType, data, post){
    let tagIsFinded = false

    switch (filterType) {
        case 'some':
            tagIsFinded = data.importTag.some(item => post.tag.includes(item))
            break;
        case 'every':
            tagIsFinded = data.importTag.every(item => post.tag.includes(item))
            break;
    }

    return tagIsFinded
}




/**
 * getTags - get all post filtered by tag
 *
 * @param  {Object} data content object
 * @return {<Array[Object]>}   Array of post
 */
function getTags(data) {

    const filterType = (propValidate(['tagFilter', 'type'], data)
        && config.tagFilterType.includes(data.tagFilter.type))
        ? data.tagFilter.type
        : 'some' // default value

    const flatCategory = (data.lang in store.categoryMapData)
        ? Object.values(store.categoryMapData[data.lang]).flat()
        : []

    const result = flatCategory.reduce((acc, curr) => {

        // Filter postMap by tag some|every
        const postFilterByType = checkIfPostHaveTag(filterType, data, curr)

        // Filter postMap by category if required
        const postFilterByCategory = (propValidate(['tagFilter', 'category'], data))
            ? data.tagFilter.category.some(item => item == curr.category)
            : true

        if (postFilterByType && postFilterByCategory) acc.push(curr)
        return acc
    }, [])
    return result
}


/**
 * getTranslationFilesList - get an array of all path file for each language related to filepath info
 *
 * @param  {string} filepath - path of content file
 * @return {<array[string]>} - Array of all path file for all languageses related to the input file path
 */
function getTranslationFilesList(filepath) {
    // get path without file name
    const contentPath = () => {
        const pattern = new RegExp(`\/(.*\/).*$`);
        const path = filepath.match(pattern);
        return (!path) ? '' : path[1]
    }

    return Object.keys(config.locales).reduce((p, c) => {
        const path = `/${contentPath(filepath)}${getNameFile(filepath)}.${c}.json`
        p.push(path)
        return p
    }, [])
}



exports.getPageType = getPageType
exports.getArchivePageName = getArchivePageName
exports.fileIschanged = fileIschanged
exports.getNameFile = getNameFile
exports.getPermalink = getPermalink
exports.getExtensionFile = getExtensionFile
exports.getThemeSubFolder = getThemeSubFolder
exports.getThemeSubFolder = getThemeSubFolder
exports.getPathByLocale = getPathByLocale
exports.getLanguage = getLanguage
exports.getAdditionalData = getAdditionalData
exports.getTemplate = getTemplate
exports.getOriginalPath = getOriginalPath
exports.getUnivoqueId = getUnivoqueId
exports.mergeData = mergeData
exports.langIsDisable = langIsDisable
exports.getPosts = getPosts
exports.checkIfPostHaveTag = checkIfPostHaveTag
exports.getTags = getTags
exports.getTranslationFilesList = getTranslationFilesList
