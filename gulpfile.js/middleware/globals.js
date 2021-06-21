const config = require('../../config.json')
const store = require('../store.js')
const propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
const { langIsDisable } = require('../functions/function.js')

const templateFunction = {}
templateFunction.ssgSiteName = config.siteName
templateFunction.ssgLocales = config.locales



/*
* get obj nested value or 'not found string'
*/
templateFunction.ssgPrint = (obj, ...props) => {

    const deepCheck = (props, obj) => {
        return props.reduce((p, c) => {
            p = (p[c]) ? p[c] : 'not found'
            return p
        }, obj)
    }

    return (typeof obj !== "undefined") ? deepCheck(props, obj) : 'not found'
}


templateFunction.langIsDisabled = (_lang) => {
    return langIsDisable(_lang)
}


templateFunction.ssgBodyClass = () => {
    const univoqueIdnoSlash = templateFunction.ssgUnivoqueId.replace(/\//g, '-');
    const univoqueIdParsed = univoqueIdnoSlash.replace('-index', '');
    return `page-${univoqueIdParsed} page-type-${templateFunction.ssgPageType} template-${templateFunction.ssgTemplateName}`
}


/*
* get category name by unique id
*/
templateFunction.ssgCategoryName = (name) => {
    return (propValidate([name, 'name', templateFunction.ssgLang], config.categoryLocales))
        ? config.categoryLocales[name].name[templateFunction.ssgLang]
        : name
}

/*
* get category permalink by unique id
*/
templateFunction.ssgCategoryPermalink = (name) => {
    return (name && propValidate([name, 'indexUnivoqueId'], config.categoryLocales))
        ? templateFunction.ssgPermalink(config.categoryLocales[name].indexUnivoqueId)
        : null
}



/*
* get tag name by unique id
*/
templateFunction.ssgTagName = (name) => {
    return (propValidate([name, 'name', templateFunction.ssgLang], config.tagLocales))
        ? config.tagLocales[name].name[templateFunction.ssgLang]
        : name
}


/*
* get tag permalink by unique id
*/
templateFunction.ssgTagPermalink = (name) => {
    return (name && propValidate([name, 'indexUnivoqueId'], config.tagLocales))
        ? templateFunction.ssgPermalink(config.tagLocales[name].indexUnivoqueId)
        : null
}


/*
* get page name by unique id
*/
templateFunction.ssgPageTitle = (univoqueId) => {
    return (propValidate([univoqueId, templateFunction.ssgLang], store.pageTitleMapData))
        ? store.pageTitleMapData[univoqueId][templateFunction.ssgLang]
        : 'not found2'
}



/*
* get permalink by unique id
*/
templateFunction.ssgPermalink = (univoqueId) => {
    return (propValidate([univoqueId, templateFunction.ssgLang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][templateFunction.ssgLang]
        : null
}


/*
* get permalink by unique id an lang
*/
templateFunction.ssgPermalinkByLang = (univoqueId, _lang) => {
    return (propValidate([univoqueId, _lang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][_lang]
        : null
}



/*
* get draft status by univoqueId
*/
templateFunction.ssgIsDraft = (univoqueId) => {
    return (propValidate([univoqueId, templateFunction.ssgLang], store.draftMapData))
        ? store.draftMapData[univoqueId][templateFunction.ssgLang]
        : false
}



/*
* get image form ssgManifest
*/
templateFunction.ssgAsset = (el) => {
    return `/assets/dist/${store.manifest[el]}`
}

/*
* get scropt form ssgManifest
*/
templateFunction.ssgScript = () => {
    return store.manifest['script.js']
}

/*
* get scropt form ssgManifest
*/
templateFunction.ssgStyle = () => {
    return store.manifest['style.css']
}

/*
* get date by locale
*/
templateFunction.ssgDate = (date) => {
    const newDate = new Date(date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return newDate.toLocaleDateString(templateFunction.ssgLocales[templateFunction.ssgLang].code, options)
}

templateFunction.ssgUnivoqueId = null
templateFunction.ssgTemplateName = null
templateFunction.ssgPageType = null
templateFunction.ssgLang = null

exports.templateFunction = templateFunction
