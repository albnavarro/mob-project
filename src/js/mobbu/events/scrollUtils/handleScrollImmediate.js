/**
 * @typedef {Object} handleScrollType
 * @prop {number} scrollY - Scroll position
 * @prop {('UP'|'DOWN')} direction
 */

/**
 * @description
 * Execute a callback immediately on scroll
 */
export const handleScrollImmediate = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;
    const UP = 'UP';
    const DOWN = 'DOWN';
    let prev = window.pageYOffset;
    let val = window.pageYOffset;
    let direction = DOWN;
    let scrollData = {
        scrollY: val,
        direction,
    };

    function handler() {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callback.length === 0) {
            window.removeEventListener('scroll', handler);

            inizialized = false;
            return;
        }

        prev = val;
        val = window.pageYOffset;
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
        callback.forEach(({ cb }) => {
            cb(scrollData);
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

        window.addEventListener('scroll', handler, {
            passive: true,
        });
    }

    /**
     * @description
     * Execute a callback immediately on scroll
     *
     * @param {function(handleScrollType):void } cb - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```js
     * const unsubscribe = handleScrollImmediate(({ direction, scrollY }) => {
     *     // code
     * });
     *
     * unsubscribe();
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
