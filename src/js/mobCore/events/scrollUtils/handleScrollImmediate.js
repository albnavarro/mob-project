// @ts-check

import { getUnivoqueId } from '../../utils';

/**
 * @type {Boolean}
 */
let initialized = false;

/**
 * @type {Map<String,Function>}
 */
const callbacks = new Map();
const UP = 'UP';
const DOWN = 'DOWN';

/**
 * @type {Number}
 */
let prev = window.pageYOffset;

/**
 * @type {Number}
 */
let val = window.pageYOffset;

/**
 * @type {import('./type').scrollDirection}
 */
let direction = DOWN;

/**
 * @type {import('./type').handleScrollTypes}
 */
let scrollData = {
    scrollY: val,
    direction,
};

/**
 * @returns void
 */
function handler() {
    /**
     * if - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        window.removeEventListener('scroll', handler);

        initialized = false;
        return;
    }

    prev = val;
    val = window.scrollY;
    direction = val > prev ? DOWN : UP;

    // Prepare data to callback
    scrollData = {
        scrollY: val,
        direction,
    };

    /**
     * Check if browser lost frame.
     * If true skip.
     */
    // callback.forEach(({ cb }) => cb(scrollData));
    for (const value of callbacks.values()) {
        value(scrollData);
    }
}

/**
 * init - if listener is not inizializad remove it
 *
 * @return {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    window.addEventListener('scroll', handler, {
        passive: true,
    });
}

/**
 * @description
 * Execute a callback immediately on scroll
 *
 * @param {import('./type').handleScrollCallback} cb - callback function
 * @return {Function} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = handleScrollImmediate(({ direction, scrollY }) => {
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
 * Execute a callback immediately on scroll
 */
export const handleScrollImmediate = (() => {
    return addCb;
})();
