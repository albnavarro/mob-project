// @ts-check

/**
 * @type {{ priority: number; cb: (arg0: { time: number; fps: number }) => void }[]}
 */
const callbacks = [];

/**
 * Add callback
 *
 * @example
 *     ```javascript
 *     handleFrame.add(() => {
 *         handleNextTick.add(({ fps, time }) => {
 *             // code
 *         });
 *     });
 *
 *     Loop request animation frame using handleNextTick:
 *     const loop = () => {
 *         handleNextTick.add(() => {
 *             // read from DOM
 *
 *             handleFrame.add(() => {
 *                 // write to the DOM
 *                 loop();
 *             });
 *         });
 *     };
 *
 *     handleFrame.add(() => loop());
 *
 *     To tick exactly after the request animation frame:
 *     mobbu.default('set', { deferredNextTick: true });
 *     ```;
 *
 * @param {import('./type.js').HandleFrameCallbak} cb - Callback function
 * @param {number} [priority]
 */
const add = (cb = () => {}, priority = 100) => {
    callbacks.push({ cb, priority });
};

/**
 * Fire callback
 *
 * @example
 *     ```javascript
 *        handleNextTick.fire({ time, fps });
 *
 *     ```;
 *
 * @param {import('./type.js').HandleFrame} cb - Callback function
 */
const fire = ({ time, fps }) => {
    if (callbacks.length === 0) return;

    callbacks.sort((a, b) => a.priority - b.priority);
    callbacks.forEach(({ cb }) => cb({ time, fps }));
    callbacks.length = 0;
};

/**
 * Execute callbacks after scheduling the request animation frame. Use this method to read data from the DOM. To execute
 * callbacks exactly after the request animation frame, set the global property deferredNextTick to true.
 *
 * @module handleNextTick
 */
export const handleNextTick = (() => {
    return { add, fire };
})();
