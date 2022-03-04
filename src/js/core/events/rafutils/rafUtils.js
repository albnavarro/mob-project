import { SimpleStore } from '../../store/simpleStore.js';

/**
 * Utils to centralize all action form all components in one Request Animation Frame,
 * All subsciber use the same frame
 * handleFrame run once then delete all subscriber
 * Use inside a loop or inside eventListener like scroll or mousemove
 *
 * @example:
 *
 * handleFrame(() => {
 *     myFunction()
 * });
 *
 */

export const frameStore = new SimpleStore({ timestamp: 0 });

export const handleFrame = (() => {
    let frame = null;
    let callback = [];

    const render = (timestamp) => {
        callback.forEach((item) => item(timestamp));

        /**
         * Clear Callback
         */
        callback = [];
        cancelAnimationFrame(frame);
        frame = null;
        frameStore.set('timestamp', timestamp);
    };

    /**
     * Init new frame if is not running
     */
    const initFrame = () => {
        if (frame !== null) return;
        frame = requestAnimationFrame(render);
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

/**
 *
 * @example:
 *
 * handleNextFrame(() => {
 *     myFunction()
 * });
 *
 */
export const handleNextFrame = ((cb) => {
    let callback = [];

    frameStore.watch('timestamp', (val, prevVal) => {
        if (val === prevVal) return;
        callback.forEach((item) => handleFrame(() => item()));
        callback = [];
    });

    const addCb = (cb) => {
        callback.push(cb);
    };

    return addCb;
})();

/**
 *
 * @example:
 *
 * handleNextTick(() => {
 *     myFunction()
 * });
 *
 */
export const handleNextTick = ((cb) => {
    let callback = [];

    frameStore.watch('timestamp', (val, prevVal) => {
        if (val === prevVal) return;
        callback.forEach((item) => item());
        callback = [];
    });

    const addCb = (cb) => {
        callback.push(cb);
    };

    return addCb;
})();
