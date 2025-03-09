// @ts-check

/**
 * @type {import('./type.js').HandleFrameCallbak[]}
 */
const callbacks = [];

/**
 *
 * @description
 * Add callback
 *
 * @param {import('./type.js').HandleFrameCallbak} callBack - callback function
 *
 * @example
 * ```javascript
 * const loop = () => {
 *     handleNextFrame.add(({ fps, time }) => {
 *         // code
 *         loop();
 *     });
 * };
 *
 * handleFrame.add(() => loop());
 *
 * ```
 */
const add = (callBack) => {
    callbacks.push(callBack);
};

/**
 * @description
 * Reset callback
 *
 * @returns {import('./type.js').HandleFrameArray}
 *
 */
const get = () => {
    const callBackArray = [...callbacks];
    callbacks.length = 0;
    return callBackArray;
};

/**
 * @module handleNextFrame
 *
 * @description
 * Execute a callback to the next available frame allowing the creation of a request animation frame loop
 */
export const handleNextFrame = (() => {
    return { add, get };
})();
