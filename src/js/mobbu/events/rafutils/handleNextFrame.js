/**
 * @description
 * Execute a callback to the next available frame allowing the creation of a request animation frame loop
 */
export const handleNextFrame = (() => {
    let callback = [];

    /**
     * @description
     * Add callback
     *
     * @param {function(import('./handleFrame.js').handleFrameTypes):void } cb - callback function
     *
     * @example
     * ```js
     * const loop = () => {
     *     handleNextFrame.add(({ fps, shouldRender, time }) => {
     *         // code
     *         loop();
     *     });
     * };
     *
     * handleFrame.add(() => loop());
     *
     * ```
     */
    const add = (cb) => {
        callback.push(cb);
    };

    /**
     * Reset callback
     */
    const get = () => {
        const cb = [...callback];
        callback.length = 0;
        return cb;
    };

    return { add, get };
})();
