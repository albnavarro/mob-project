// @ts-check

import { handleFrame } from '../rafutils/handleFrame.js';
import { handleNextTick } from '../rafutils/handleNextTick.js';
import { handleScrollImmediate } from './handleScrollImmediate.js';

/**
 * @type {Boolean}
 */
let inizialized = false;

/**
 * @type {Array.<{id:number, cb:Function }>}
 */
let callback = [];

/**
 * @type {Number}
 */
let id = 0;

/**
 * @type {Function}
 */
let unsubscribe = () => {};

/**
 * @param {Object} scrollData
 */
function handler(scrollData) {
    /**
     * if - if there is no subscritor remove handler
     */
    if (callback.length === 0) {
        unsubscribe();

        inizialized = false;
        return;
    }

    handleFrame.add(() => {
        handleNextTick.add(() => {
            callback.forEach(({ cb }) => {
                cb(scrollData);
            });
        }, 0);
    });
}

/**
 * init - if istener is not inizializad remove it
 *
 * @return {void}
 */
function init() {
    if (inizialized) return;
    inizialized = true;

    unsubscribe = handleScrollImmediate(handler);
}

/**
 * @description
 * Perform a callback to the first nextTick available after scrolling
 *
 * @param {function(import('./handleScrollImmediate.js').handleScrollType):void } cb - callback function
 * @return {Function} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = handleScroll(({ direction, scrollY }) => {
 *     // code
 * });
 *
 * unsubscribe();
 *
 * ```
 */
const addCb = (cb) => {
    callback.push({ cb, id: id });
    const cbId = id;
    id++;

    if (typeof window !== 'undefined') {
        init();
    }

    return () => {
        callback = callback.filter((item) => item.id !== cbId);
    };
};

/**
 * @description
 * Perform a callback to the first nextTick available after scrolling
 */
export const handleScroll = (() => addCb)();
