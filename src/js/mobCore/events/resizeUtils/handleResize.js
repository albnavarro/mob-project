// @ts-check

import { getUnivoqueId } from '../../utils/index.js';
import { debounceFuncion } from '../debounce.js';

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
     * @type {Boolean}
     */
    const verticalResize = windowsHeight !== previousWindowHeight;

    /**
     * @type {Boolean}
     */
    const horizontalResize = windowsWidth !== previousWindowWidth;

    /**
     * @type {Number}
     */
    previousWindowHeight = windowsHeight;

    /**
     * @type {Number}
     */
    previousWindowWidth = windowsWidth;

    // Prepare data to callback
    const resizeData = {
        scrollY: window.pageYOffset,
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
    debouceFunctionReference = debounceFuncion(() => handler());
    // @ts-ignore
    window.addEventListener('resize', debouceFunctionReference, {
        passive: false,
    });
}

/**
 * @param {import('./type.js').handleResizeCallback} cb - callback function fired on resize.
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

    if (typeof window !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

export const handleResize = (() => addCb)();
