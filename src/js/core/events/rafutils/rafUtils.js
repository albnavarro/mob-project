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
    let time = getTime();
    let prevTime = getTime();
    let startTime = 0;
    let lastUpdate = 0;
    let elapsed = 0;
    let isStopped = false;

    // FPS
    const fpsLoopCycle = 30;
    // Clamp fps
    const maxFps = 80;
    const minFps = 25;
    //
    let fpsStack = [];
    let fpsCounter = 0;
    let averageFps = 60;
    const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const render = () => {
        time = getTime();
        elapsed = time - lastUpdate;

        if (isStopped) startTime += elapsed;
        lastUpdate += elapsed;
        time = lastUpdate - startTime;

        const fps = !isStopped
            ? clamp(parseInt(1000 / (time - prevTime)), minFps, maxFps)
            : 60;

        // get average of fps every 30 cycle (fpsLoopCycle)
        if (fpsCounter < fpsLoopCycle) {
            fpsCounter++;
            fpsStack.push(fps);
        } else {
            averageFps = parseInt(arrAvg(fpsStack));
            fpsCounter = 0;
            fpsStack = [];
        }

        // Fire callback
        callback.forEach((item) => item(time, averageFps));

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
