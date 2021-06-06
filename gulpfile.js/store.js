const arg = require('./functions/arg.js')

class storeClass {
    constructor() {
        /*
        How many time watch task is invoked
        */
        this._counterRun = 0

        /*
        last file saved
        */
        this._fileModified = ''

        /*
        Map of all includes file
        */
        this._includesFileMap = []

        /*
        Map of all pageTitle
        */
        this._permalinkMapData = {}

        /*
        Map of all pageTitle
        */
        this._pageTitleMapData = {}

        /*
        Map of all cateogry
        */
        this._categoryMapData = {}

        /*
        Map of all asstes
        */
        this._manifest = {}

        /*
        Argument
        */
        this._arg = {}
    }

    set counterRun(value) {
        this._counterRun = value
    }

    get counterRun() {
        return this._counterRun
    }

    set fileModified(value) {
        this._fileModified = value
    }

    get fileModified() {
        return this._fileModified
    }

    set includesFileMap(value) {
        this._includesFileMap = value
    }

    get includesFileMap() {
        return this._includesFileMap
    }

    set permalinkMapData(value) {
        this._permalinkMapData = value
    }

    get permalinkMapData() {
        return this._permalinkMapData
    }

    set pageTitleMapData(value) {
        this._pageTitleMapData = value
    }

    get pageTitleMapData() {
        return this._pageTitleMapData
    }

    set categoryMapData(value) {
        this._categoryMapData = value
    }

    get categoryMapData() {
        return this._categoryMapData
    }

    set manifest(value) {
        this._manifest = value
    }

    get manifest() {
        return this._manifest
    }

    set arg(value) {
        this._arg = value
    }

    get arg() {
        return this._arg
    }
}



const store = new storeClass()
store.arg = arg
module.exports = store
