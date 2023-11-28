// @ts-check

import { getUnivoqueId } from '../../utils';

/**
 * @type{Boolean}
 */
let initialized = false;

/**
 * @type {Map<String,Function>}
 */
const callbacks = new Map();

/**
 * @return void
 */
function handler() {
    /**
     * if - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        window.removeEventListener('DOMContentLoaded', handler);

        initialized = false;
        return;
    }

    // Fire end of resize
    for (const value of callbacks.values()) {
        value();
    }
    callbacks.clear();
}

/**
 * @description
 * init - if listener is not inizializad add it
 *
 * @return {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    // Add debunce function to detect scroll end
    window.addEventListener('DOMContentLoaded', handler, {
        passive: false,
    });
}

/**
 * @description
 * Add callback on page load
 *
 * @param {function} cb - Callback function executed on page load
 * @returns {function():void}
 *
 * @example
 * ```javascript
 *
 * handleLoad(() => {
 *     ...
 * });
 *
 * ```
 */
const addCallback = (cb) => {
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof window !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

/**
 * @description Function to execute a callback on page load
 */
export const handleLoad = (() => addCallback)();
