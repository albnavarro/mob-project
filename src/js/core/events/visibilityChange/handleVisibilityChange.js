/**
 * Utils to centralize scroll listener, all subscriber use the same listener
 * First subscriber create a listener, when there are no more listeners the listern is removed
 *
 * NOTE:
 * Use it inside onMount function to be sure callback is added after first rendering in case of server side rendering
 * https://svelte.dev/tutorial/onmount
 *
 * @example:
 * onMount(() => {
 *   const unsubscribe = handleScroll(({scrolY, direction}) => console.log(scrolY,direction));
 *   return(() => unsubscribe())
 * }
 *
 */

export const handleVisibilityChange = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;

    /**
     * handler - handler for mouse move
     *
     * @param  {event} e mouse move event
     * @return {void}   description
     */
    function handler(e) {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callback.length === 0) {
            window.removeEventListener('visibilitychange', handler);

            inizialized = false;
            return;
        }

        // Prepare data to callback
        const visibilityData = {
            visibilityState: document.visibilityState,
        };

        callback.forEach(({ cb }) => {
            cb(visibilityData);
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

        window.addEventListener('visibilitychange', handler, {
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
