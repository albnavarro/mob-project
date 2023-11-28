// @ts-check

import { getUnivoqueId } from '../../utils/index.js';
import { handleFrame } from '../rafutils/handleFrame.js';
import { handleNextTick } from '../rafutils/handleNextTick.js';
import { handleScrollImmediate } from './handleScrollImmediate.js';

/**
 * @type {Boolean}
 */
let initialized = false;

/**
 * @type {Map<String,Function>}
 */
const callbacks = new Map();

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
    if (callbacks.size === 0) {
        unsubscribe();

        initialized = false;
        return;
    }

    handleFrame.add(() => {
        handleNextTick.add(() => {
            for (const value of callbacks.values()) {
                value(scrollData);
            }
        }, 0);
    });
}

/**
 * init - if listener is not inizializad remove it
 *
 * @return {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    unsubscribe = handleScrollImmediate(handler);
}

/**
 * @description
 * Perform a callback to the first nextTick available after scrolling
 *
 * @param {import('./type.js').handleScrollCallback} cb - callback function
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
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof window !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

/**
 * @description
 * Perform a callback to the first nextTick available after scrolling
 */
export const handleScroll = (() => addCb)();
