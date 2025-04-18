// @ts-check

import { getUnivoqueId } from '../../utils/index.js';
import { handleFrame } from '../raf-utils/handle-frame.js';
import { handleNextTick } from '../raf-utils/handle-next-tick.js';
import { handleScrollImmediate } from './handle-scroll-immediate.js';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string, import('./type.js').HandleScrollCallback<import('./type.js').HandleScroll>>}
 */
const callbacks = new Map();

/**
 * @type {() => void}
 */
let unsubscribe = () => {};

/**
 * @param {import('./type.js').HandleScroll} scrollData
 */
function handler(scrollData) {
    /**
     * If - if there is no subscritor remove handler
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
 * Init - if listener is not inizializad remove it
 *
 * @returns {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    unsubscribe = handleScrollImmediate(handler);
}

/**
 * Perform a callback to the first nextTick available after scrolling
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleScroll(({ direction, scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./type.js').HandleScrollCallback<import('./type.js').HandleScroll>} cb - Callback function
 * @returns {() => void} Unsubscribe callback
 */
const addCb = (cb) => {
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof globalThis !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

/**
 * Perform a callback to the first nextTick available after scrolling
 */
export const handleScroll = (() => addCb)();
