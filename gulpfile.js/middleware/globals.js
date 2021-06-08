const config = require('../../config.json')
const store = require('../store.js')
const propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)

const globalProp = {}
globalProp.ssgSiteName = config.siteName
globalProp.ssgLocales = config.locales

/*
* get obj nested value or 'not found string'
*/
globalProp.ssgPrint = (obj, ...props) => {

    const deepCheck = (props, obj) => {
        return props.reduce((p, c) => {
            p = (p[c]) ? p[c] : 'not found'
            return p
        }, obj)
    }

    return (typeof obj !== "undefined") ? deepCheck(props, obj) : 'not found'
}



globalProp.ssgBodyClass = () => {
    const univoqueIdnoSlash = globalProp.ssgUnivoqueId.replace(/\//g, '-');
    const univoqueIdParsed = univoqueIdnoSlash.replace('-index', '');
    return `page-${univoqueIdParsed} page-type-${globalProp.ssgPageType} template-${globalProp.ssgTemplateName}`
}


/*
* get category name by unique id
*/
globalProp.ssgCategoryName = (univoqueId) => {
    return (propValidate([univoqueId, globalProp.ssgLang, 'name'], config.categoryLocales))
        ? config.categoryLocales[univoqueId][globalProp.ssgLang].name
        : 'not found'
}

/*
* get category permalink by unique id
*/
globalProp.ssgCategoryPermalink = (univoqueId) => {
    return (univoqueId && propValidate([univoqueId, globalProp.ssgLang, 'indexUnivoqueId'], config.categoryLocales))
        ? globalProp.ssgPermalink(config.categoryLocales[univoqueId][globalProp.ssgLang].indexUnivoqueId)
        : null
}



/*
* get tag name by unique id
*/
globalProp.ssgTagName = (univoqueId) => {
    return (propValidate([univoqueId, globalProp.ssgLang, 'name'], config.tagLocales))
        ? config.tagLocales[univoqueId][globalProp.ssgLang].name
        : 'not found'
}


/*
* get tag permalink by unique id
*/
globalProp.ssgTagPermalink = (univoqueId) => {
    return (univoqueId && propValidate([univoqueId, globalProp.ssgLang, 'indexUnivoqueId'], config.tagLocales))
        ? globalProp.ssgPermalink(config.tagLocales[univoqueId][globalProp.ssgLang].indexUnivoqueId)
        : null
}


/*
* get page name by unique id
*/
globalProp.ssgPageTitle = (univoqueId) => {
    return (propValidate([univoqueId, globalProp.ssgLang], store.pageTitleMapData))
        ? store.pageTitleMapData[univoqueId][globalProp.ssgLang]
        : 'not found2'
}



/*
* get permalink by unique id
*/
globalProp.ssgPermalink = (univoqueId) => {
    return (propValidate([univoqueId, globalProp.ssgLang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][globalProp.ssgLang]
        : null
}


/*
* get permalink by unique id an lang
*/
globalProp.ssgPermalinkByLang = (univoqueId, _lang) => {
    return (propValidate([univoqueId, _lang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][_lang]
        : null
}


/*
* get image form ssgManifest
*/
globalProp.ssgImage = (image) => {
    return `/assets/dist/${store.manifest[image]}`
}

/*
* get scropt form ssgManifest
*/
globalProp.ssgScript = () => {
    return store.manifest['script.js']
}

/*
* get scropt form ssgManifest
*/
globalProp.ssgStyle = () => {
    return store.manifest['style.css']
}

/*
* get date by locale
*/
globalProp.ssgDate = (date) => {
    const newDate = new Date(date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return newDate.toLocaleDateString(globalProp.ssgLocales[globalProp.ssgLang].code, options)
}

globalProp.ssgUnivoqueId = null
globalProp.ssgTemplateName = null
globalProp.ssgPageType = null
globalProp.ssgLang = null

exports.globalProp = globalProp
