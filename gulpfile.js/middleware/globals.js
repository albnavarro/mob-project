const config = require('../../config.json')

global.propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
global.siteName = config.siteName
global.locales = config.locales
global.categoryLocales = config.categoryLocales
global.tagLocales = config.tagLocales

/*
* get obj nested value or 'not found string'
*/
global.getVal = (obj, ...props) => {
    const deepCheck = (props, obj) => {
        return props.reduce((p, c) => {
            p = (p[c]) ? p[c] : 'not found'
            return p
        }, obj)
    }

    return (typeof obj !== "undefined") ? deepCheck(props, obj) : 'not found'
}



global.bodyClassPageId = () => {
    return `page-${univoqueId} page-${pageType} template-${templatename}`
}


/*
* get category name by unique id
*/
global.getCategoryName = (univoqueId) => {
    return (propValidate([univoqueId, lang, 'name'], categoryLocales))
        ? categoryLocales[univoqueId][lang].name
        : 'not found'
}

/*
* get category permalink by unique id
*/
global.getCategoryPermalink = (univoqueId) => {
    return (univoqueId && propValidate([univoqueId, lang, 'indexUnivoqueId'], categoryLocales))
        ? getPermalink(categoryLocales[univoqueId][lang].indexUnivoqueId)
        : null
}



/*
* get tag name by unique id
*/
global.getTagName = (univoqueId) => {
    return (propValidate([univoqueId, lang, 'name'], tagLocales))
        ? tagLocales[univoqueId][lang].name
        : 'not found'
}


/*
* get tag permalink by unique id
*/
global.getTagPermalink = (univoqueId) => {
    return (univoqueId && propValidate([univoqueId, lang, 'indexUnivoqueId'], tagLocales))
        ? getPermalink(tagLocales[univoqueId][lang].indexUnivoqueId)
        : null
}


/*
* get page name by unique id
*/
global.getPageTitle = (univoqueId) => {
    return (propValidate([univoqueId, lang], pageTitleMap))
        ? pageTitleMap[univoqueId][lang]
        : 'not found2'
}



/*
* get permalink by unique id
*/
global.getPermalink = (univoqueId) => {
    return (propValidate([univoqueId, lang], permalinkMap))
        ? permalinkMap[univoqueId][lang]
        : null
}


/*
* get permalink by unique id an lang
*/
global.getPermalinkByLang = (univoqueId, _lang) => {
    return (propValidate([univoqueId, _lang], permalinkMap))
        ? permalinkMap[univoqueId][_lang]
        : null
}


/*
* get image form manifest
*/
global.getImage = (image) => {
    return `/assets/dist/${manifest[image]}`
}

/*
* get scropt form manifest
*/
global.getScript = (image) => {
    return manifest['script.js']
}

/*
* get scropt form manifest
*/
global.getStyle = (image) => {
    return manifest['style.css']
}

/*
* get date by locale
*/
global.getDate = (date) => {
    const newDate = new Date(date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return newDate.toLocaleDateString(locales[lang].code, options)
}


exports.global = global
