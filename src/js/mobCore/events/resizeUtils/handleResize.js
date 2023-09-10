// @ts-check

import { debounceFuncion } from '../debounce.js';

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
    if (callback.length === 0) {
        // @ts-ignore
        window.removeEventListener('resize', debouceFunctionReference);

        inizialized = false;
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
    callback.forEach(({ cb }) => cb(resizeData));
}

/**
 * init - if listener is not inizializad add it
 *
 * @return {void}
 */
function init() {
    if (inizialized) return;
    inizialized = true;

    // Add debunce function to detect scroll end
    debouceFunctionReference = debounceFuncion(() => handler());
    // @ts-ignore
    window.addEventListener('resize', debouceFunctionReference, {
        passive: false,
    });
}

/**
 * @description
 * Add callback on resize using a debounce function.
 *
 * @param {function(handleResizeTypes):void } cb - callback function fired on resize.
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
 * @typedef {Object} handleResizeTypes
 * @prop {number} scrollY - Scroll postion
 * @prop {number} windowsHeight - Height of the window
 * @prop {number} windowsWidth - Width of the window
 * @prop {number} documentHeight - Height of the document
 * @prop {boolean} verticalResize - Boolean value indicating whether the height of the viewport changed during the resize.
 * @prop {boolean} horizontalResize - Boolean value indicating whether the width of the viewport changed during the resize.
 */
export const handleResize = (() => addCb)();
