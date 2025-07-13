/**
 * @type {import('./type.js').HandleFrameCallbak[]}
 */
const callbacks = [];

/**
 * Add callback
 *
 * @example
 *     ```javascript
 *     const loop = () => {
 *         handleNextFrame.add(({ fps, time }) => {
 *             // code
 *             loop();
 *         });
 *     };
 *
 *     handleFrame.add(() => loop());
 *
 *     ```;
 *
 * @param {import('./type.js').HandleFrameCallbak} callBack - Callback function
 */
const add = (callBack) => {
    callbacks.push(callBack);
};

/**
 * Reset callback
 *
 * @returns {import('./type.js').HandleFrameArray}
 */
const get = () => {
    const callBackArray = [...callbacks];
    callbacks.length = 0;
    return callBackArray;
};

/**
 * Execute a callback to the next available frame allowing the creation of a request animation frame loop
 *
 * @module handleNextFrame
 */
export const handleNextFrame = (() => {
    return { add, get };
})();
