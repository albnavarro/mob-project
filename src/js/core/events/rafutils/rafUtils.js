import { SimpleStore } from '../../store/simpleStore.js';
import { getTime, defaultTimestep } from '../../utils/time.js';

export const frameStore = new SimpleStore({ time: 0 });

/**
 *
 * @example:
 *
 * handleNextFrame.add(() => {
 *     myFunction()
 * });
 *
 */
export const handleNextFrame = ((cb) => {
    let callback = [];

    const add = (cb) => {
        callback.push(cb);
    };

    const get = () => {
        const cb = [...callback];
        callback = [];
        return cb;
    };

    return { add, get };
})();

/**
 *
 * @example:
 *
 * handleNextTick.add(() => {
 *     myFunction()
 * });
 *
 */
export const handleNextTick = ((cb) => {
    let callback = [];

    const add = (cb) => {
        callback.push(cb);
    };

    const fire = () => {
        if (callback.length === 0) return;

        callback.forEach((item) => item());
        callback = [];
    };

    return { add, fire };
})();

/**
 * Utils to centralize all action form all components in one Request Animation Frame,
 * All subsciber use the same frame
 * handleFrame run once then delete all subscriber
 * Use inside a loop or inside eventListener like scroll or mousemove
 *
 * @example:
 *
 * handleFrame.add(() => {
 *     myFunction()
 * });
 *
 */
export const handleFrame = (() => {
    let frameIsRuning = false;
    let callback = [];

    const lagThreshold = 500;
    const adjustedLag = 33;
    let time = getTime();
    let prevTime = getTime();
    let startTime = 0;
    let lastUpdate = 0;
    let elapsed = 0;
    let fps = 0;

    const render = () => {
        time = getTime();

        /**
         * Time start form last time when RAF is inactive ( elapsed more than 500ms )
         */
        elapsed = time - lastUpdate;

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
        prevTime = time;
        callback = [];
        frameIsRuning = false;
        frameStore.set('time', time);

        callback = [...callback, ...handleNextFrame.get()];
        if (callback.length > 0) initFrame();
        handleNextTick.fire();
    };

    /**
     * Init new frame if is not running
     */
    const initFrame = () => {
        if (frameIsRuning) return;

        if (typeof window !== 'undefined') {
            requestAnimationFrame(render);
        } else {
            setTimeout(() => render(), defaultTimestep);
        }

        frameIsRuning = true;
    };

    /**
     *  Add callback
     */
    const add = (cb) => {
        callback.push(cb);
        initFrame();
    };

    /**
     *  Add multiple callback
     */
    const addMultiple = (arr) => {
        callback = [...callback, ...arr];
        initFrame();
    };

    return {
        add,
        addMultiple,
    };
})();
