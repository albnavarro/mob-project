import { SimpleStore } from '../../store/simpleStore.js';
import { getTime, defaultTimestep } from '../../utils/time.js';
import { clamp } from '../../animation/utils/animationUtils.js';

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

    const add = (cb, priority = 100) => {
        callback.push({ cb, priority });
    };

    const fire = (time, averageFps) => {
        if (callback.length === 0) return;

        callback.sort((a, b) => a.priority - b.priority);
        callback.forEach(({ cb }) => cb(time, averageFps));
        callback = [];
    };

    return { add, fire };
})();

/**
 *  Go to X frame from now
 */
export const handleFrameIndex = (fn, index) => {
    let start = 0;

    const loop = () => {
        if (start === index) {
            fn();
            return;
        }
        start++;
        handleNextFrame.add(() => loop());
    };
    handleNextFrame.add(() => loop());
};

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
    const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const fpsLoopCycle = 30;
    // Initial fps average
    let averageFps = 60;
    // Clamp fps
    const maxFps = 80;
    const minFps = 25;
    // Fps data
    let fpsStack = [];
    // After how many cicles fps is calculated
    let fpsCounter = 0;
    // Indicate that fps is a real calucaltion and not the initial approssimation
    let fpsIsReal = false;

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

            // After 1 cycles fps is stable
            fpsIsReal = true;
        }

        // Fire callback
        callback.forEach((item) => item(time, averageFps));

        // Reset
        prevTime = time;
        callback = [];
        frameIsRuning = false;
        isStopped = false;

        // Valutare requestIdleCallback con polifyll
        setTimeout(() => {
            // Fire next Tick outside asnimationframe
            handleNextTick.fire(time, averageFps);

            callback = [...callback, ...handleNextFrame.get()];
            if (callback.length > 0) {
                // Call Next animationFrame
                initFrame();
            } else {
                isStopped = true;
            }
        });
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

    const isRealFps = () => fpsIsReal;

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
        isRealFps,
    };
})();
