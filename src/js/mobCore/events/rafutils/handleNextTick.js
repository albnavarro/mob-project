// @ts-check

/**
 * @type {Array}
 */
const callbacks = [];

/**
 * @description
 * Add callback
 *
 * @param {import('./type.js').handleFrameCallbakType} cb - callback function
 * @param {Number} [ priority ]
 *
 * @example
 * ```javascript
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
const add = (cb = () => {}, priority = 100) => {
    callbacks.push({ cb, priority });
};

/**
 * @description
 * Fire callback
 *
 * @param {import('./type.js').handleFrameType} cb - callback function
 *
 * @example
 * ```javascript
   handleNextTick.fire({ time, fps, shouldRender });
 *
 * ```
 */
const fire = ({ time, fps, shouldRender }) => {
    if (callbacks.length === 0) return;

    callbacks.sort((a, b) => a.priority - b.priority);
    callbacks.forEach(({ cb }) => cb({ time, fps, shouldRender }));
    callbacks.length = 0;
};

/**
 * @module handleNextTick
 *
 * @description
 * Execute callbacks after scheduling the request animation frame. Use this method to read data from the DOM. To execute callbacks exactly after the request animation frame, set the global property deferredNextTick to true.
 */
export const handleNextTick = (() => {
    return { add, fire };
})();
