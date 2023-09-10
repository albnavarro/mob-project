// @ts-check

/**
 * @type {Array}
 */
const callbacks = [];

/**
 *
 * @description
 * Add callback
 *
 * @param {function(import('./handleFrame.js').handleFrameTypes):void } callBack - callback function
 *
 * @example
 * ```javascript
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
const add = (callBack) => {
    callbacks.push(callBack);
};

/**
 * @description
 * Reset callback
 *
 * @returns {Array.<function(import('./handleFrame.js').handleFrameTypes):void >}
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
