// @ts-check

import { getUnivoqueId } from '../../utils';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string, () => void>}
 */
const callbacks = new Map();

/**
 * @returns {void}
 */
function handler() {
    /**
     * If - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        globalThis.removeEventListener('DOMContentLoaded', handler);

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
 * Init - if listener is not inizializad add it
 *
 * @returns {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    // Add debunce function to detect scroll end
    globalThis.addEventListener('DOMContentLoaded', handler, {
        passive: false,
    });
}

/**
 * Add callback on page load
 *
 * @example
 *     ```javascript
 *
 *     handleLoad(() => {
 *         ...
 *     });
 *
 *     ```;
 *
 * @param {() => void} cb - Callback function executed on page load
 * @returns {() => void}
 */
const addCallback = (cb) => {
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof globalThis !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

/**
 * Function to execute a callback on page load
 */
export const handleLoad = (() => addCallback)();
