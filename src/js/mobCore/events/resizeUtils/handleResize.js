// @ts-check

import { getUnivoqueId } from '../../utils/index.js';
import { debounceFuncion } from '../debounce.js';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<String,import('./type.js').HandleResizeCallback>}
 */
const callbacks = new Map();

/**
 * @type {() => void}
 */
let debouceFunctionReference = () => {};

/**
 * @type {number}
 */
let previousWindowHeight = window.innerHeight;

/**
 * @type {number}
 */
let previousWindowWidth = window.innerWidth;

/**
 * @returns void
 */
function handler() {
    /**
     * If there is no subscritor remove handler.
     */
    if (callbacks.size === 0) {
        // @ts-ignore
        window.removeEventListener('resize', debouceFunctionReference);

        initialized = false;
        return;
    }

    // Check there is a vertical resizer

    /**
     * @type {number}
     */
    const windowsHeight = window.innerHeight;

    /**
     * @type {number}
     */
    const windowsWidth = window.innerWidth;

    /**
     * @type {boolean}
     */
    const verticalResize = windowsHeight !== previousWindowHeight;

    /**
     * @type {boolean}
     */
    const horizontalResize = windowsWidth !== previousWindowWidth;

    /**
     * @type {number}
     */
    previousWindowHeight = windowsHeight;

    /**
     * @type {number}
     */
    previousWindowWidth = windowsWidth;

    // Prepare data to callback
    const resizeData = {
        scrollY: window.scrollY,
        windowsHeight,
        windowsWidth,
        documentHeight: document.documentElement.scrollHeight,
        verticalResize,
        horizontalResize,
    };

    // Fire end of resize
    for (const value of callbacks.values()) {
        value(resizeData);
    }
}

/**
 * init - if listener is not inizializad add it
 *
 * @return {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    // Add debunce function to detect scroll end
    // @ts-ignore
    debouceFunctionReference = debounceFuncion(() => handler());
    // @ts-ignore
    window.addEventListener('resize', debouceFunctionReference, {
        passive: false,
    });
}

/**
 * @param {import('./type.js').HandleResizeCallback} cb - callback function fired on resize.
 * @returns {() => void}
 *
 * @description
 * Add callback on resize using a debounce function.
 *
 * @example
 * ```javascript
 * handleResize(
 *     ({
 *         documentHeight,
 *         horizontalResize,
 *         scrollY,
 *         verticalResize,
 *         windowsHeight,
 *         windowsWidth,
 *     }) => {
 *         // code
 *     }
 * );
 *
 * ```
 */
const addCb = (cb) => {
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof globalThis !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

export const handleResize = (() => addCb)();
