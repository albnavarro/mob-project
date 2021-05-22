const config = require('../../config.json')
const fs = require('fs')
const path = require('path')
const themePath = path.resolve('src')
const additionalDataPath = path.join(themePath, 'additionalData')
const dataPath = path.join(themePath, 'data')

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
function getPermalink(argProd,subfolder,nameFile,prependSlash = true) {
    const slash = prependSlash ? '/' : ''
    return `${slash}${subfolder}${nameFile}${getExtensionFile(argProd)}`
}


/*
* Usa permalink without .html on server in production mode
* .htaccess riles RewriteCond %{REQUEST_FILENAME}\.html -f
*/
function getExtensionFile(argProd) {
    return (argProd) ? "" :  ".html"
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

/*
* get path where .html will be saved
* @param filepath - {page}.json path
* @param config - data extract from config.json
* @param additionalData - all data extract from all json file associated to {page}.json
* return '' id {page}.json is in root or path form root
*/
function getPathByLocale(filepath, lang) {
    const pathRoot = ( config.defaultLocales == lang) ? `${dataPath}/${lang}` : `${dataPath}`
    const pattern = new RegExp(`${pathRoot}\/(.*\/).*$`);
    const path = filepath.match(pattern);

    /*
    * Return subfolder if match in regex or empty vaalue
    */
    return (!path) ? '' : path[1]
}


/*
* get lang of single {page}.json
* @param filepath - {page}.json path
* return lang flder name
*/
function getLanguage(filepath) {
    const pattern = new RegExp(`${dataPath}\/([^\/]*)`);
    const lang = filepath.match(pattern);

    return (!lang) ? '' : lang[1]
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
