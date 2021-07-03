const util = require('util');
const store = require('../store.js');

/**
 * debugMandatoryPropierties - check if mandatory attribute is finded
 *
 * @param  {object} data json data for each file
 * @return {boolean}   true if pageTitle and description is finded
 */
function debugMandatoryPropierties(data) {
    if (!('description' in data) || data.description === undefined) {
        console.log('*****');
        console.log(`Error`);
        console.log(`description propierties is mandatory`);
        console.log(`at: ${data.permalink}`);
        console.log('*****');
        return true;
    }

    if (!('pageTitle' in data) || data.pageTitle === undefined) {
        console.log('*****');
        console.log(`Error`);
        console.log(`pageTitle propierties is mandatory`);
        console.log(`permalink: ${data.permalink}`);
        console.log('*****');
        return true;
    }

    return false;
}

/**
 *
 * @param  {string} nameFile rendered file name
 * @param  {type} data  json data for each file
 * @return {void} log for debug
 */
function debugRenderHtml(nameFile, data) {
    if (store.arg.debug) {
        console.log(util.inspect('***************', { colors: true }));
        console.log(util.inspect(nameFile, { colors: true }));
        console.log(util.inspect('***************', { colors: true }));
        console.log(util.inspect(data, { showHidden: false, depth: null }));
    }
}

exports.debugMandatoryPropierties = debugMandatoryPropierties;
exports.debugRenderHtml = debugRenderHtml;
