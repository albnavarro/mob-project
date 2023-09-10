// @ts-check

import { handleFrame } from '../rafutils/handleFrame.js';
import { handleNextTick } from '../rafutils/handleNextTick.js';
import { throttle } from '../throttle.js';
import { handleScrollImmediate } from './handleScrollImmediate.js';
import { eventStore } from '../eventStore.js';

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
let throttleFunctionReference;

/**
 * @type Function():void
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

    throttleFunctionReference = throttle(
        (/** @type{Object} */ scrollData) => handler(scrollData),
        eventStore.getProp('throttle')
    );

    // @ts-ignore
    unsubscribe = handleScrollImmediate(throttleFunctionReference);
}

/**
 * @description
 * Performs a scroll callback using a throttle function
 *
 * @param {function(import('./handleScrollImmediate.js').handleScrollType):void } cb - callback function
 * @return {Function} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = handleScrollThrottle(({ direction, scrollY }) => {
 *     // code
 * });
 *
 * unsubscribe()
 *
 * Define throttle value from default:
 * handleSetUp.set({ throttle: 100 });
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
 * Performs a scroll callback using a throttle function
 */
export const handleScrollThrottle = (() => addCb)();
