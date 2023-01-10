/**
 * @description Function to execute a callback on page load
 */
export const handleLoad = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;

    /**
     * @return {void}   description
     */
    function handler() {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callback.length === 0) {
            window.removeEventListener('DOMContentLoaded', handler);

            inizialized = false;
            return;
        }

        // Fire end of resize
        callback.forEach(({ cb }) => {
            cb();
        });

        callback = [];
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
        window.addEventListener('DOMContentLoaded', () => handler(), {
            passive: false,
        });
    }

    /**
     * @description
     * Add callback on page load
     *
     * @param {function():void } cb - Callback function executed on page load
     *
     * @example
     * ```js
     *
     * handleLoad(() => {
     *     // code
     * });
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
