/**
 * Utils to centralize all action form all components in one Request Animation Frame,
 * All subsciber use the same frame
 * mobFrame run once then delete all subscriber
 * Use inside a loop or inside eventListener like scroll or mousemove
 *
 * @example:
 *
 * Default 60fps
 * mobFrame(() => {
 *     myFunction()
 * });
 *
 * Custom fps
 * mobFrame(() => {
 *     myFunction()
 * }, 20);
 *
 */

export const mobFrame = (() => {
    let inizialized = false;
    let callback = [];

    // Get 60 fps per seconds
    let framRate = null;
    let now;
    let then;
    let fpsInterval = 1000 / framRate;

    // Get right time if server side or client side
    const getTime = () => {
        return typeof window !== 'undefined'
            ? window.performance.now()
            : Date.now();
    };

    const render = () => {
        /**
         * if - exit form RAF if callback queque is empty
         */
        if (callback.length === 0) {
            inizialized = false;
            return;
        }

        // Refresh date for fps
        now = getTime();
        const elapsed = now - then;

        // If 60 fps
        if (elapsed > fpsInterval && framRate) {
            then = now - (elapsed % fpsInterval);
            /**
             * Ececute callback
             */
            callback.forEach((item) => {
                item();
            });
        } else if (!framRate) {
            callback.forEach((item) => {
                item();
            });
        }

        /**
         * Cler Callback
         */
        callback = [];

        /**
         * Next frame
         */
        requestAnimationFrame(render);
    };

    /**
     * Init new frame if is not running
     */
    const initFrame = () => {
        if (inizialized === true) return;
        inizialized = true;
        then = getTime();

        requestAnimationFrame(render);
    };

    /**
     *  Add callback
     */
    const addCb = (cb, fps = null) => {
        framRate = fps;
        fpsInterval = 1000 / framRate;
        callback.push(cb);
        initFrame();
    };

    return addCb;
})();
