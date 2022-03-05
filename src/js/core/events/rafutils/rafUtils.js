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

    const lagThreshold = 500;
    const adjustedLag = 33;
    let time = 0;
    let startTime = 0;
    let lastUpdate = 0;
    let prevTime = 0;
    let elapsed = 0;
    let fps = 0;

    const render = (timestamp) => {
        prevTime = time;

        /**
         * Time start form last time when RAF is inactive ( elapsed more than 500ms )
         */
        elapsed = timestamp - lastUpdate;

        // When broswer stop for more of 500 ms the time reset to 33ms form last tick (GSAP trick)
        if (elapsed > lagThreshold) startTime += elapsed - adjustedLag;
        lastUpdate += elapsed;

        // Update global time
        time = lastUpdate - startTime;

        // Get fps
        fps = 1000 / (time - prevTime);

        // Fire callback
        callback.forEach((item) => item(time, fps));

        // Reset
        callback = [];
        frame = null;
        frameStore.set('timestamp', time);
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
        callback.forEach((item) =>
            handleFrame((timestamp, fps) => item(timestamp, fps))
        );
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
