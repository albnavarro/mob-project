import { debounceFuncion } from '../debounce.js';

/**
 * @typedef {Object} handleResizeTypes
 * @prop {number} scrollY - Scroll postion
 * @prop {number} windowsHeight - Height of the window
 * @prop {number} windowsWidth - Width of the window
 * @prop {number} documentHeight - Height of the document
 * @prop {boolean} verticalResize - Boolean value indicating whether the height of the viewport changed during the resize.
 * @prop {boolean} horizontalResize - Boolean value indicating whether the width of the viewport changed during the resize.
 */

export const handleResize = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;
    let debouceFunctionReference = () => {};
    let previousWindowHeight = window.innerHeight;
    let previousWindowWidth = window.innerWidth;

    /**
     *
     */
    function handler() {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callback.length === 0) {
            window.removeEventListener('resize', debouceFunctionReference);

            inizialized = false;
            return;
        }

        // Check there is a vertical resizer
        const windowsHeight = window.innerHeight;
        const windowsWidth = window.innerWidth;
        const verticalResize = windowsHeight !== previousWindowHeight;
        const horizontalResize = windowsWidth !== previousWindowWidth;
        previousWindowHeight = windowsHeight;
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
        callback.forEach(({ cb }) => {
            cb(resizeData);
        });
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
        debouceFunctionReference = debounceFuncion((e) => handler(e));
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
     * ```js
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

    return addCb;
})();
