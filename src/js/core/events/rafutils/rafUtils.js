/**
 * Utils to centralize all action form all components in one Request Animation Frame,
 * All subsciber use the same frame
 * handleFrame run once then delete all subscriber
 * Use inside a loop or inside eventListener like scroll or mousemove
 *
 * @example:
 *
 * Default 60fps
 * handleFrame(() => {
 *     myFunction()
 * });
 *
 * Custom fps
 * handleFrame(() => {
 *     myFunction()
 * }, 20);
 *
 */

export const handleFrame = (() => {
    let inizialized = false;
    let callback = [];

    const render = () => {
        /**
         * if - exit form RAF if callback queque is empty
         */
        if (callback.length === 0) {
            inizialized = false;
            return;
        }

        callback.forEach((item) => {
            item();
        });

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
        requestAnimationFrame(render);
    };

    /**
     *  Add callback
     */
    const addCb = (cb) => {
        callback.push(cb);
        initFrame();
    };

    return addCb;
})();

export const handleNextFrame = (cb) => {
    Promise.resolve().then(() => {
        handleFrame(() => {
            cb();
        });
    });
};
