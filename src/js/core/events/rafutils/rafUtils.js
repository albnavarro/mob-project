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
        callback.length = 0;
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
        callback.length = 0;
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

/*
 Global props use to get an fps much real as possibile
 */
let loadFpsComplete = false;

export const handleFrame = (() => {
    /*
    10000 is maximum stagger frame delay
    */
    const maxFramecounter = 10000;

    let frameIsRuning = false;
    let callback = [];
    let indexCallback = [];
    let time = getTime();
    let prevTime = getTime();
    let startTime = 0;
    let lastUpdate = 0;
    let elapsed = 0;
    let isStopped = false;
    let fps = handleSetUp.get('startFps');
    let maxFps = fps;
    let frames = 0;
    let fpsPrevTime = time;
    let frameCounter = 0;

    /**
     * First fps loop is 1 second;
     **/
    let fpsCheckDuration = 1000;

    /**
     * Check if frame drop by fpsThreshold value
     * when value is -1 || 2 animation ( or whoever use it ) is rendered
     * */
    let dropFrameCounter = -1;

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

        /**
         * Get fps
         * Update fps every second
         **/
        if (!isStopped) frames++;

        if (time > fpsPrevTime + fpsCheckDuration) {
            /**
             * Update fpsCheckDuration time
             **/
            fpsCheckDuration = handleSetUp.get('fpsCheckDuration');

            /**
             * Calc fps
             **/
            fps = Math.round((frames * 1000) / (time - fpsPrevTime));
            fpsPrevTime = time;
            frames = 0;
            loadFpsComplete = true;
        }

        /**
         * Update max fps
         * */
        if (fps > maxFps) maxFps = fps;

        /**
         * Update dropFrameCounter ( form 0 to 2 use % operator) if drop frame or reset
         * */
        dropFrameCounter =
            Math.abs(maxFps - fps) < handleSetUp.get('fpsThreshold')
                ? -1
                : (dropFrameCounter + 1) % 3;

        /*
        Fire callbnack
        */
        callback.forEach((item, i) => item(time, fps));

        /*
        Fire callback related to specific index frame
        */

        /*
        Get arrays of callBack related to the current frameCounter
        */
        const item = indexCallback.find(
            ({ index }, i) => index === frameCounter
        );

        /*
        If there is some callback related to the current frameCounter
        fire all the callback
        */
        if (item && item?.cb) {
            item.cb.forEach((item) => item(time, fps));

            // Get current index and remove item from array
            const index = indexCallback.findIndex(
                ({ index }, i) => index === frameCounter
            );
            indexCallback.splice(index, 1);
        }

        /*
        Update frameCounter
        */
        frameCounter++;

        /*
        If frameCounter reach maxFramecounter back to zero to avoid big numbers
        */
        if (frameCounter === maxFramecounter) {
            frameCounter = 0;
            indexCallback.forEach((item, i) => {
                indexCallback[i].index =
                    indexCallback[i].index - maxFramecounter;
            });
        }

        /*
        Reset props
        */
        prevTime = time;
        callback.length = 0;
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

            if (callback.length > 0 || indexCallback.length) {
                // Call Next animationFrame
                initFrame();
            } else {
                isStopped = true;
                frameCounter = 0;
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
     * Get fps value
     */
    const getFps = () => fps;

    /**
     * Get dropFrameCounter value
     */
    const getDropFrameCounter = () => dropFrameCounter;

    /**
     *  Add callback
     */
    const add = (cb) => {
        callback.push(cb);
        initFrame();
    };

    /**
     *  Add callback at index
     */
    const addIndex = (cb, index) => {
        const frameIndex = index + frameCounter;

        /**
         *  Add callback to array related to specific index idf exxist or create
         */
        const item = indexCallback.find(({ index }) => index === frameIndex);
        if (item && item?.cb) {
            item.cb.push(cb);
        } else {
            indexCallback.push({ index: frameIndex, cb: [cb] });
        }

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
        getFps,
        getDropFrameCounter,
        addIndex,
    };
})();

/**
 *  Intial loop fo reach the right fps
 *  loadFps().then(() => ... );
 */
export const loadFps = () => {
    /*
    Reset prop to get some requestAnimationFrame and get a stable fps
    */
    loadFpsComplete = false;

    return new Promise((resolve, reject) => {
        const loop = () => {
            if (loadFpsComplete) {
                resolve();
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
    });
};
