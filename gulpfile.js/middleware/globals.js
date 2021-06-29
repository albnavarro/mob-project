const fs = require('fs')
const config = require('../../config.json')
const store = require('../store.js')
const sizeOf = require('image-size')
const staticImgPath = 'src/static/img'
const path = require('path')
const themePath = path.resolve('src')
const imgPath = path.join(themePath, 'static/img')

const propValidate = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
const { langIsDisable } = require('../functions/function.js')

const templateFunction = {}
templateFunction.ssgSiteName = config.siteName
templateFunction.ssgLocales = config.locales
templateFunction.domain = config.domain


/**
 * get obj nested value or 'not found string'
 *
 * @param  {obj} obj - source object
 * @param  {...props} object propierties to check
 * @return {string}
 */
const ssgPrint = (obj, ...props) => {

    const deepCheck = (props, obj) => {
        return props.reduce((p, c) => {
            p = (p[c]) ? p[c] : 'not found'
            return p
        }, obj)
    }

    return (typeof obj !== "undefined") ? deepCheck(props, obj) : 'not found'
}


/**
 * Detect if lang is disable
 *
 * @param  {string} lang
 * @return {string}
 */
const langIsDisabled = (lang) => {
    return langIsDisable(lang)
}


/**
 * Get category name by id
 *
 * @param  {string} id id of category
 * @return {string}
 */
const ssgCategoryName = (id) => {
    return (propValidate([id, 'name', templateFunction.ssgLang], config.categoryLocales))
        ? config.categoryLocales[id].name[templateFunction.ssgLang]
        : id
}


/**
 * Get category permalink by id
 *
 * @param  {string} id id of category
 * @return {string}
 */
const ssgCategoryPermalink = (id) => {
    return (id && propValidate([id, 'indexUnivoqueId'], config.categoryLocales))
        ? templateFunction.ssgPermalink(config.categoryLocales[id].indexUnivoqueId)
        : null
}


/**
 * Get tag name by id
 *
 * @param  {string} id id of tag
 * @return {string}
 */
const ssgTagName = (id) => {
    return (propValidate([id, 'name', templateFunction.ssgLang], config.tagLocales))
        ? config.tagLocales[id].name[templateFunction.ssgLang]
        : id
}


/**
 * Get tag permalink by id
 *
 * @param  {string} id id of tag
 * @return {string}
 */
const ssgTagPermalink = (id) => {
    return (id && propValidate([id, 'indexUnivoqueId'], config.tagLocales))
        ? templateFunction.ssgPermalink(config.tagLocales[id].indexUnivoqueId)
        : null
}


/**
 * Get get page name by unique id
 *
 * @param  {string} univoqueId uniqueId
 * @return {string}
 */
const ssgPageTitle = (univoqueId) => {
    return (propValidate([univoqueId, templateFunction.ssgLang], store.pageTitleMapData))
        ? store.pageTitleMapData[univoqueId][templateFunction.ssgLang]
        : 'not found2'
}


/**
 * Get permalink by unique id
 *
 * @param  {string} univoqueId uniqueId
 * @return {string}
 */
const ssgPermalink = (univoqueId) => {
    return (propValidate([univoqueId, templateFunction.ssgLang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][templateFunction.ssgLang]
        : null
}



/**
 * Get permalink by unique id and lang
 *
 * @param  {string} univoqueId uniqueId
 * @param  {string} lang
 * @return {string}
 */
const ssgPermalinkByLang = (univoqueId, lang) => {
    return (propValidate([univoqueId, lang], store.permalinkMapData))
        ? store.permalinkMapData[univoqueId][lang]
        : null
}


/**
 * Get draft status by univoqueId
 *
 * @param  {string} univoqueId uniqueId
 * @return {string}
 */
const ssgIsDraft = (univoqueId) => {
    return (propValidate([univoqueId, templateFunction.ssgLang], store.draftMapData))
        ? store.draftMapData[univoqueId][templateFunction.ssgLang]
        : false
}

/**
 * Crete class with page type, template name, univoqueid name
 *
 * @return {string}
 */
const ssgBodyClass = () => {
    const univoqueIdnoSlash = templateFunction.ssgUnivoqueId.replace(/\//g, '-');
    const univoqueIdParsed = univoqueIdnoSlash.replace('-index', '');
    return `page-${univoqueIdParsed} page-type-${templateFunction.ssgPageType} template-${templateFunction.ssgTemplateName}`
}


/**
 * get image path form ssgManifest
 *
 * @param  {string} el asset name
 * @return {string}
 */
const ssgAsset = (el) => {
    return `/assets/dist/${store.manifest[el]}`
}


/**
 * get script.js path form ssgManifest
 *
 * @param  {string} el asset name
 * @return {string}
 */
const ssgScript = () => {
    return store.manifest['script.js']
}


/**
 * get style.css path form ssgManifest
 *
 * @param  {string} el asset name
 * @return {string}
 */
const ssgStyle = () => {
    return store.manifest['style.css']
}


/**
 * Convert date output in locale lanuguage
 *
 * @param  {string} date
 * @return {string}
 */
const ssgDate = (date) => {
    const newDate = new Date(date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return (propValidate([templateFunction.ssgLang, 'code'], templateFunction.ssgLocales))
        ? newDate.toLocaleDateString(templateFunction.ssgLocales[templateFunction.ssgLang].code, options)
        : date
}

/**
 * Get lang code of page
 *
 */
const getlangCode = () => {
    return (propValidate([templateFunction.ssgLang, 'code'], config.locales))
         ? config.locales[templateFunction.ssgLang].code
         : null
}

/**
 * Get all alternate lang for the site ( specific for og:locale:alternate)
 */
const getAlternateLangCode = () => {
    return Object.entries(config.locales).reduce((p, c) => {

        // check if alternate exist ( check file in permalink map) file is in draft mode
        const isDraft = (propValidate([templateFunction.ssgUnivoqueId, c[0]], store.permalinkMapData))
            ? templateFunction.ssgIsDraft(templateFunction.ssgUnivoqueId)
            : true

        if(c[0] !== templateFunction.ssgLang && !isDraft) p.push(c)
        return p
    }, [])
}

/**
 * get imagePath form domain
 *
 * @param  {string} image
 * @return {string}
 */
const getFullImagePath = (image) => {
    const imageUrl = templateFunction.ssgAsset(image)
    const imageUrlLessFirstSlash = imageUrl.substr(imageUrl.indexOf('/') + 1)
    return `${templateFunction.domain}${imageUrlLessFirstSlash}`
}


/**
 * get with, height, type of image
 *
 * @param  {string} image
 * @return {Object}
 */
const getImageSizie = (image) => {
    return (fs.existsSync(`${imgPath}/${image}`))
        ? sizeOf(`${staticImgPath}/${image}`)
        : { width: 0, height: 0, type: '' }
}


templateFunction.ssgPrint = ssgPrint
templateFunction.langIsDisabled = langIsDisabled
templateFunction.ssgBodyClass  = ssgBodyClass
templateFunction.ssgCategoryName  = ssgCategoryName
templateFunction.ssgCategoryPermalink = ssgCategoryPermalink
templateFunction.ssgTagName = ssgTagName
templateFunction.ssgTagPermalink = ssgTagPermalink
templateFunction.ssgPageTitle = ssgPageTitle
templateFunction.ssgPermalink = ssgPermalink
templateFunction.ssgPermalinkByLang = ssgPermalinkByLang
templateFunction.ssgIsDraft = ssgIsDraft
templateFunction.ssgAsset = ssgAsset
templateFunction.ssgScript = ssgScript
templateFunction.ssgStyle = ssgStyle
templateFunction.ssgDate = ssgDate
templateFunction.getlangCode = getlangCode
templateFunction.getAlternateLangCode = getAlternateLangCode
templateFunction.getFullImagePath = getFullImagePath
templateFunction.getImageSizie = getImageSizie
templateFunction.ssgUnivoqueId = null
templateFunction.ssgTemplateName = null
templateFunction.ssgPageType = null
templateFunction.ssgLang = null

exports.templateFunction = templateFunction
