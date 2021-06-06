const config = require('../../config.json')
const store = require('../store.js')
const propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)

global.ssgSiteName = config.siteName
global.ssgLocales = config.locales

/*
* get obj nested value or 'not found string'
*/
global.ssgPrint = (obj, ...props) => {
    const deepCheck = (props, obj) => {
        return props.reduce((p, c) => {
            p = (p[c]) ? p[c] : 'not found'
            return p
        }, obj)
    }

    return (typeof obj !== "undefined") ? deepCheck(props, obj) : 'not found'
}



global.ssgBodyClass = () => {
    return `page-${ssgUnivoqueId} page-${ssgPageType} template-${ssgTemplateName}`
}


/*
* get category name by unique id
*/
global.ssgCategoryName = (univoqueId) => {
    return (propValidate([univoqueId, ssgLang, 'name'], config.categoryLocales))
        ? config.categoryLocales[univoqueId][ssgLang].name
        : 'not found'
}

/*
* get category permalink by unique id
*/
global.ssgCategoryPermalink = (univoqueId) => {
    return (univoqueId && propValidate([univoqueId, ssgLang, 'indexUnivoqueId'], config.categoryLocales))
        ? ssgPermalink(config.categoryLocales[univoqueId][ssgLang].indexUnivoqueId)
        : null
}



/*
* get tag name by unique id
*/
global.ssgTagName = (univoqueId) => {
    return (propValidate([univoqueId, ssgLang, 'name'], config.tagLocales))
        ? config.tagLocales[univoqueId][ssgLang].name
        : 'not found'
}


/*
* get tag permalink by unique id
*/
global.ssgTagPermalink = (univoqueId) => {
    return (univoqueId && propValidate([univoqueId, ssgLang, 'indexUnivoqueId'], config.tagLocales))
        ? ssgPermalink(config.tagLocales[univoqueId][ssgLang].indexUnivoqueId)
        : null
}


/*
* get page name by unique id
*/
global.ssgPageTitle = (univoqueId) => {
    return (propValidate([univoqueId, ssgLang], store.pageTitleMapData))
        ? store.pageTitleMapData[univoqueId][ssgLang]
        : 'not found2'
}



/*
* get permalink by unique id
*/
global.ssgPermalink = (univoqueId) => {
    return (propValidate([univoqueId, ssgLang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][ssgLang]
        : null
}


/*
* get permalink by unique id an lang
*/
global.ssgPermalinkByLang = (univoqueId, _lang) => {
    return (propValidate([univoqueId, _lang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][_lang]
        : null
}


/*
* get image form ssgManifest
*/
global.ssgImage = (image) => {
    return `/assets/dist/${store.manifest[image]}`
}

/*
* get scropt form ssgManifest
*/
global.ssgScript = () => {
    return store.manifest['script.js']
}

/*
* get scropt form ssgManifest
*/
global.ssgStyle = () => {
    return store.manifest['style.css']
}

/*
* get date by locale
*/
global.ssgDate = (date) => {
    const newDate = new Date(date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return newDate.toLocaleDateString(ssgLocales[ssgLang].code, options)
}
