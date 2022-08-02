import { debounceFuncion } from '../debounce.js';

export const handleResize = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;
    let debouceFunctionReference = () => {};
    let previousWindowHeight = window.innerHeight;
    let previousWindowWidth = window.innerWidth;

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
