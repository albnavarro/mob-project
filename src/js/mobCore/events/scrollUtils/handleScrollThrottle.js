// @ts-check

import { handleFrame } from '../rafutils/handleFrame.js';
import { handleNextTick } from '../rafutils/handleNextTick.js';
import { throttle } from '../throttle.js';
import { handleScrollImmediate } from './handleScrollImmediate.js';
import { eventStore } from '../eventStore.js';
import { getUnivoqueId } from '../../utils/index.js';

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
 * @param {import('./type.js').handleScrollCallback} cb - callback function
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
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof window !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

/**
 * @description
 * Performs a scroll callback using a throttle function
 */
export const handleScrollThrottle = (() => addCb)();
