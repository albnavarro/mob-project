import { SimpleStore } from '../../store/simpleStore.js';
import { getTime, defaultTimestep } from '../../utils/time.js';
import { clamp } from '../../animation/utils/animationUtils.js';
import { handleSetUp } from '../../setup.js';
import { handleVisibilityChange } from '../visibilityChange/handleVisibilityChange.js';

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

    const fire = (time, fps) => {
        if (callback.length === 0) return;

        callback.sort((a, b) => a.priority - b.priority);
        callback.forEach(({ cb }) => cb(time, fps));
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

/*
 Global props use to get an fps much real as possibile
 */
let stopHeatFps = false;
let fpsLoopCounter = 0;

export const handleFrame = (() => {
    let frameIsRuning = false;
    let callback = [];
    let time = getTime();
    let prevTime = getTime();
    let startTime = 0;
    let lastUpdate = 0;
    let elapsed = 0;
    let isStopped = false;

    let fps = 60;

    // Clamp fps
    const maxFps = 150;
    const minFps = 10;

    // Fps data
    let fpsStack = [];

    // Indicate that fps is a real calucaltion and not the initial approssimation
    let _isRealFps = false;

    // Stop timer when user change tab
    handleVisibilityChange(({ visibilityState }) => {
        isStopped = visibilityState === 'visible';
    });

    const render = () => {
        time = getTime();
        elapsed = time - lastUpdate;

        if (isStopped) startTime += elapsed;
        lastUpdate += elapsed;
        time = lastUpdate - startTime;

        /*
        Fps calculation
        */
        while (fpsStack.length > 0 && fpsStack[0] <= time - 1000) {
            fpsStack.shift();
            fps = fpsStack.length;

            /*
            After two loop fps should be stable
            So stop startFps function and fire the callback
            */
            if (fpsLoopCounter > 1) {
                _isRealFps = true;
                stopHeatFps = true;
            } else {
                fpsLoopCounter++;
            }
        }

        fpsStack.push(time);

        /*
        Fire callbnack
        */
        callback.forEach((item) => item(time, fps));

        /*
        Reset props
        */
        prevTime = time;
        callback = [];
        isStopped = false;

        const nextTickFn = () => {
            /*
            RequestAnimationFrame is ended, ready for another
            */
            frameIsRuning = false;

            /*
            Fire next tick
            */
            handleNextTick.fire(time, fps);

            /*
            Get next callback
            */
            callback = [...callback, ...handleNextFrame.get()];
            if (callback.length > 0) {
                // Call Next animationFrame
                initFrame();
            } else {
                isStopped = true;
            }
        };

        const deferredNextTick = handleSetUp.get('deferredNextTick');

        if (deferredNextTick) {
            setTimeout(() => nextTickFn());
        } else {
            nextTickFn();
        }
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
     * Get fps status , approxuimation or real calculation
     */
    const isRealFps = () => _isRealFps;

    /**
     * Get fps value
     */
    const getFps = () => fps;

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
        getFps,
    };
})();

/**
 * Utils: fire script after heatFps is completed
 * const unsubscribe = framStore.watch('fpsIsReady', () => {
 *    ....
 *    unsubscribe();
 * });
 *
 */
export const frameStore = new SimpleStore({
    fpsIsReady: () => ({
        value: false,
        type: Boolean,
    }),
});

/**
 *  Intial loop fo reach the right fps
 */
export const startFps = () => {
    /*
    Reset prop to get some requestAnimationFrame and get a stable fps
    */
    stopHeatFps = false;
    fpsLoopCounter = 0;

    const loop = () => {
        if (stopHeatFps) {
            frameStore.set('fpsIsReady', true);
            return;
        }

        handleFrame.add(() => {
            handleNextTick.add(() => {
                loop();
            });
        });
    };

    handleFrame.add(() => {
        handleNextTick.add(() => {
            loop();
        });
    });
};
