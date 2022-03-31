import { SimpleStore } from '../../store/simpleStore.js';
import { getTime, defaultTimestep } from '../../utils/time.js';
import { clamp } from '../../animation/utils/animationUtils.js';

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
    let fps = 60;
    let isStopped = false;

    const render = () => {
        time = getTime();
        elapsed = time - lastUpdate;

        if (isStopped) startTime += elapsed;
        lastUpdate += elapsed;
        time = lastUpdate - startTime;

        // Update fps if is running ( at first run after raf sleep get last fps )
        if (!isStopped) fps = clamp(parseInt(1000 / (time - prevTime)), 25, 80);

        // Fire callback
        callback.forEach((item) => item(time, fps));

        // Reset
        prevTime = time;
        callback = [];
        frameIsRuning = false;
        isStopped = false;
        frameStore.set('time', time);

        callback = [...callback, ...handleNextFrame.get()];
        if (callback.length > 0) {
            initFrame();
        } else {
            isStopped = true;
        }

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
