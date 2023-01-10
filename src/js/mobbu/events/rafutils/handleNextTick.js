/**
 * @description
 * Execute callbacks after scheduling the request animation frame. Use this method to read data from the DOM. To execute callbacks exactly after the request animation frame, set the global property deferredNextTick to true.
 */
export const handleNextTick = (() => {
    let callback = [];

    /**
     * @description
     * Add callback
     *
     * @param {function(import('./handleFrame.js').handleFrameTypes):void } cb - callback function
     *
     * @example
     * ```js
     * handleFrame.add(() => {
     *     handleNextTick.add(({ fps, shouldRender, time }) => {
     *         // code
     *     });
     * });
     *
     * Loop request animation frame using handleNextTick:
     * const loop = () => {
     *     handleNextTick.add(() => {
     *         // read from DOM
     *
     *         handleFrame.add(() => {
     *             // write to the DOM
     *             loop();
     *         });
     *     });
     * };
     *
     * handleFrame.add(() => loop());
     *
     * To tick exactly after the request animation frame:
     * mobbu.default('set', { deferredNextTick: true });
     * ```
     */
    const add = (cb, priority = 100) => {
        callback.push({ cb, priority });
    };

    /**
     * @description
     * Fire callback
     *
     * @param {function(import('./handleFrame.js').handleFrameTypes):void } cb - callback function
     *
     * @example
     * ```js
       handleNextTick.fire({ time, fps, shouldRender });
     *
     * ```
     */
    const fire = ({ time, fps, shouldRender }) => {
        if (callback.length === 0) return;

        callback.sort((a, b) => a.priority - b.priority);
        callback.forEach(({ cb }) => cb({ time, fps, shouldRender }));
        callback.length = 0;
    };

    return { add, fire };
})();
