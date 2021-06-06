const config = require('../../config.json')
const fs = require('fs')
const path = require('path')
const themePath = path.resolve('src')
const additionalDataPath = path.join(themePath, 'additionalData')
const dataPath = path.join(themePath, 'data')
const templatePath = path.join(themePath, 'template')
const { propValidate, mergeDeep } = require('./helpers.js')
const store = require('../store.js')

/*
* Get page tye
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


/*
*/
function getArchivePageName(index, nameFile, dinamicPageName) {
    return (index == 0) ? nameFile : `${dinamicPageName}${index}`
}

/*
* check if fileis Changed
* @param file - path of file
*/
function fileIschanged(file) {
    if(fs.existsSync(file)) {
        const stats = fs.statSync(file)
        const datetime = new Date()
        const difference = datetime.getTime() - stats.mtime.getTime()
        const seconds = Math.abs(difference / 1000)
        return seconds < 2
    } else {
        return false
    }
}



/*
* get json name from path
* @param filepath - path of .json file
*/
function getNameFile(filepath) {
    return filepath.split('/').pop().split('.').shift()
}


/*
* get permalink
* @param subfolder
* @param namefile , form getNameFile function
* @param firstSlash : bollean , prepend '/'
*/
function getPermalink(subfolder,nameFile,prependSlash = false) {
    const slash = prependSlash ? '/' : ''
    return `${slash}${subfolder}/${nameFile}${getExtensionFile()}`
}


/*
* Usa permalink without .html on server in production mode
* .htaccess riles RewriteCond %{REQUEST_FILENAME}\.html -f
*/
function getExtensionFile() {
    return (store.arg.prod) ? "" :  ".html"
}


function extractThemeSubFolder(filepath) {
    const pattern = new RegExp(`${themePath}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}

function extractAdditionlSubFolder(filepath) {
    const pattern = new RegExp(`${additionalDataPath}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}

function getOriginalPath(filepath) {
    const pattern = new RegExp(`${dataPath}\/(.*\/).*$`);
    const path = filepath.match(pattern);
    return (!path) ? '' : path[1]
}

/*
* get path where .html will be saved
* @param filepath - {page}.json path
* @param config - data extract from config.json
* @param additionalData - all data extract from all json file associated to {page}.json
* return '' id {page}.json is in root or path form root
*/
function getPathByLocale(filepath, lang) {
    const pattern = new RegExp(`${dataPath}\/(.*\/).*$`);
    const path = filepath.match(pattern);
    const rootPath = (!path) ? '' : path[1]

    const dirArr = rootPath.split('/');
    dirArr.pop();

    const pathBySlug = dirArr.reduce((p, c, i) => {
        const parentData = JSON.parse(fs.readFileSync(`${dataPath}${p.original}/${c}/index.${lang}.json`))
        const slug = (propValidate(['slug'], parentData)) ? parentData.slug : c
        return { 'original':`${p.original}/${c}`, 'modified' : `${p.modified}/${slug}`}
    }, { 'original':'', 'modified' : ''})

    const pathBySlugAndLang = ( config.defaultLocales == lang) ? `${pathBySlug.modified}` : `/${lang}${pathBySlug.modified}`

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return pathBySlugAndLang;
}

function getUnivoqueId(filepath) {
    return `${getOriginalPath(filepath)}${getNameFile(filepath)}`
}


/*
* get lang of single {page}.json
* @param filepath - {page}.json path
* return lang flder name
*/
function getLanguage(filepath) {
    const nameFile = filepath.split('/').pop().split('.')
    return (nameFile.length == 3) ? nameFile[1] : config.defaultLocales
}


/*
* get an obj with all data in all json file associated to {page}.json
* @param data - data extract from {page}.json
* return an obj
*/
function extracAdditionalData(data) {
    const getAdditionalData = (data) => ('additionalData' in data) ? data.additionalData : [];
    const additionalDataFile = getAdditionalData(data);

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


/*
* Return default template or specific
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





function mergeData(filepath, parsed, lang) {
    const defaultLangFilePath = `${dataPath}/${getOriginalPath(filepath)}${getNameFile(filepath)}.${config.mergeDataFrom}.json`
    const defaultLangData = ( config.mergeDataFrom !== lang && fs.existsSync(defaultLangFilePath))
        ? JSON.parse(fs.readFileSync(defaultLangFilePath))
        : null

    return ( defaultLangData === null) ? { ... parsed } : mergeDeep(defaultLangData, parsed)
}



exports.getPageType = getPageType
exports.getArchivePageName = getArchivePageName
exports.fileIschanged = fileIschanged
exports.getNameFile = getNameFile
exports.getPermalink = getPermalink
exports.getExtensionFile = getExtensionFile
exports.extractThemeSubFolder = extractThemeSubFolder
exports.extractAdditionlSubFolder = extractAdditionlSubFolder
exports.getPathByLocale = getPathByLocale
exports.getLanguage = getLanguage
exports.extracAdditionalData = extracAdditionalData
exports.getTemplate = getTemplate
exports.getOriginalPath = getOriginalPath
exports.getUnivoqueId = getUnivoqueId
exports.mergeData = mergeData
