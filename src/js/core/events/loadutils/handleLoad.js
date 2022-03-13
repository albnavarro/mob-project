export const handleLoad = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;

    /**
     * handler - handler for scroll debounce
     *
     * @param  {event} e mouse move event
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
     * init - add call back to stack
     *
     * @return {function} unsubscribe function
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
