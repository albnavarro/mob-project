import { getTime, defaultTimestep } from '../../utils/time.js';
import { handleSetUp } from '../../setup.js';
import { handleVisibilityChange } from '../visibilityChange/handleVisibilityChange.js';

export const handleCache = (() => {
    let id = 0;
    let cacheCoutner = 0;
    const subscriber = {};

    const add = (el, fn) => {
        subscriber[id] = {
            el,
            fn,
            data: {},
        };

        const prevId = id;
        id++;

        return {
            id: prevId,
            unsubscribe: () => delete subscriber[prevId],
        };
    };

    const update = ({ id, cbObject, frame }) => {
        if (!subscriber[id]) return;

        const currentFrame = handleFrame.getCurrentFrame();
        const { data } = subscriber[id];
        if (data[frame + currentFrame]) return;
        data[frame + currentFrame] = cbObject;
        cacheCoutner++;
    };

    const remove = (id) => {
        if (id in subscriber) delete subscriber[id];
    };

    const get = (id) => {
        return subscriber?.[id];
    };

    const fire = (frameCounter, shouldRender) => {
        Object.values(subscriber).forEach(({ data, fn, el }) => {
            const cbObject = data?.[frameCounter];

            if (cbObject) {
                if (shouldRender) {
                    fn(cbObject, el);
                }
                data[frameCounter] = null;
                delete data[frameCounter];
                cacheCoutner--;
            }
        });
    };

    const fireObject = ({ id, obj }) => {
        const { el, fn } = subscriber[id];
        fn(obj, el);
    };

    const getCacheCounter = () => cacheCoutner;

    const updateFrameId = (maxFramecounter) => {
        Object.values(subscriber).forEach(({ data }) => {
            Object.keys(data).forEach((key) => {
                delete Object.assign(data, {
                    [`${parseInt(key) - maxFramecounter}`]: data[key],
                })[key];
            });
        });
    };

    return {
        add,
        get,
        update,
        remove,
        fire,
        fireObject,
        getCacheCounter,
        updateFrameId,
    };
})();

/**
 * https://itecnote.com/tecnote/javascript-recording-fps-in-webgl/
 *  Intial loop fo reach the right fps
 *  loadFps().then(() => ... );
 *  To get the right FPS immediatly use a different calcultation respect handleFrame
 *  More Havier but run in a very limited time
 */
let loadFpsIsReady = false;

export const loadFps = (duration = 30) => {
    if (loadFpsIsReady) {
        return new Promise((resolve) => {
            resolve({ averageFPS: handleFrame.getInstantFps() });
        });
    }

    return new Promise((resolve) => {
        const frameTimes = [];
        const maxFrames = 20;
        let frameCursor = 0;
        let numFrames = 0;
        let totalFPS = 0;
        let then = 0;
        let frameCounter = 0;

        const render = (now) => {
            now *= 0.001; // convert to seconds
            const deltaTime = now - then; // compute time since last frame
            then = now; // remember time for next frame
            const fps = 1 / deltaTime; // compute frames per second

            // add the current fps and remove the oldest fps
            totalFPS += fps - (frameTimes[frameCursor] || 0);

            // record the newest fps
            frameTimes[frameCursor++] = fps;

            // needed so the first N frames, before we have maxFrames, is correct.
            numFrames = Math.max(numFrames, frameCursor);

            // wrap the cursor
            frameCursor %= maxFrames;

            const averageFPS = parseInt(totalFPS / numFrames);

            frameCounter++;

            if (frameCounter >= duration) {
                handleFrame.setInstantFps(averageFPS);
                loadFpsIsReady = true;
                resolve({
                    averageFPS: averageFPS,
                });
                return;
            }

            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    });
};

/**
 *
 * @example:
 *
 * handleNextFrame.add(() => {
 *     myFunction()
 * });
 *
 */
export const handleNextFrame = (() => {
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
export const handleNextTick = (() => {
    let callback = [];

    const add = (cb, priority = 100) => {
        callback.push({ cb, priority });
    };

    const fire = ({ time, fps, shouldRender }) => {
        if (callback.length === 0) return;

        callback.sort((a, b) => a.priority - b.priority);
        callback.forEach(({ cb }) => cb({ time, fps, shouldRender }));
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

export const handleFrame = (() => {
    /*
    10000 is maximum stagger frame delay
    */
    const maxFramecounter = 10000000;
    const firstRunDuration = 2000;

    let frameIsRuning = false;
    let callback = [];
    let indexCallback = {};
    let indexCallbackLength = 0;
    let time = getTime();
    let startTime = 0;
    let rawTime = 0;
    let timeElapsed = 0;
    let isStopped = false;
    let fps = handleSetUp.get('startFps');
    let instantFps = fps;
    let maxFps = fps;
    let frames = 0;
    let fpsPrevTime = 0;
    let frameCounter = 0;
    let indexCb = null;

    /**
     * Check if frame drop by fpsScalePercent value
     * when value is -1 || 2 animation ( or whoever use it ) is rendered
     * */
    let dropFrameCounter = -1;
    let shouldRender = true;
    let fpsScalePercent = handleSetUp.get('fpsScalePercent');
    let useScaleFpsf = handleSetUp.get('useScaleFps');

    // Stop timer when user change tab
    handleVisibilityChange(({ visibilityState }) => {
        isStopped = visibilityState === 'visible';
    });

    /*
     * Check if animation is renderable in current frame
     *
     **/
    const getRenderStatus = () => {
        if (!useScaleFpsf) return true;

        const activeModule = Object.entries(fpsScalePercent).reduce(
            (acc, [fpsValue, fpsModule]) => {
                const delta = Math.abs(maxFps - fps);

                /**
                 * Get delta value in percent
                 * Assuming that fpsValue in in percent
                 * Compare and check if we are under fpsValue
                 **/
                const deltaPercent = Math.round((delta * 100) / maxFps);
                const isOutOfRange = deltaPercent > parseInt(fpsValue);
                return isOutOfRange ? fpsModule : acc;
            },
            1
        );

        dropFrameCounter = (dropFrameCounter + 1) % activeModule;
        return dropFrameCounter === activeModule - 1;
    };

    /*
     * Next tick function
     **/
    const nextTickFn = () => {
        /*
         * If frameCounter reach maxFramecounter back to zero to avoid big numbers
         * executte the opration outside requestAnimationFrame if deferredNextTick is active
         */
        if (frameCounter === maxFramecounter) {
            frameCounter = 0;

            Object.keys(indexCallback).forEach((key) => {
                delete Object.assign(indexCallback, {
                    [`${parseInt(key) - maxFramecounter}`]: indexCallback[key],
                })[key];
            });

            handleCache.updateFrameId(maxFramecounter);
        }

        /*
        RequestAnimationFrame is ended, ready for another
        */
        frameIsRuning = false;

        /*
        Fire next tick
        */
        handleNextTick.fire({ time, fps, shouldRender });

        /*
        Get next callback
        */
        callback = [...callback, ...handleNextFrame.get()];
        /*
        Next frame condition
        */
        if (
            callback.length > 0 ||
            indexCallbackLength > 0 ||
            handleCache.getCacheCounter() > 0 ||
            time < firstRunDuration
        ) {
            // Call Next animationFrame
            initFrame();
        } else {
            isStopped = true;
            frameCounter = 0;
        }
    };

    const render = () => {
        /**
         * Update time
         **/
        time = getTime();
        timeElapsed = time - rawTime;

        if (isStopped) startTime += timeElapsed;

        rawTime += timeElapsed;
        time = rawTime - startTime;

        /**
         * Get fps
         * Update fps every second
         **/
        if (!isStopped) frames++;

        if (time > fpsPrevTime + 1000) {
            /**
             * Calc fps
             * Set fps when stable after 2 seconds otherwise use instantFps
             **/
            fps =
                time > firstRunDuration
                    ? Math.round((frames * 1000) / (time - fpsPrevTime))
                    : instantFps;
            fpsPrevTime = time;
            frames = 0;

            /**
             * Update value every seconds
             **/
            fpsScalePercent = handleSetUp.get('fpsScalePercent');
            useScaleFpsf = handleSetUp.get('useScaleFps');
        }

        /**
         * Update max fps
         * */
        if (fps > maxFps) maxFps = fps;

        /**
         * Chek if current frame can fire animation
         * */
        shouldRender = getRenderStatus();

        /*
        Fire callbnack
        */
        callback.forEach((item) => item({ time, fps, shouldRender }));

        /*
        Fire callback related to specific index frame
        */

        /*
        Get arrays of callBack related to the current frameCounter
        indexCb is a 'global' variables instead constant to reduce garbage collector
        */
        indexCb = indexCallback[frameCounter];
        if (indexCb) {
            indexCb.forEach((item) => item({ time, fps, shouldRender }));
            /*
            Remove cb array once fired
            */
            indexCallback[frameCounter] = null;
            delete indexCallback[frameCounter];
            indexCallbackLength--;
        } else {
            indexCb = null;
        }

        /*
        Fire handleCache callBack
        */
        handleCache.fire(frameCounter, shouldRender);
        //

        /*
        Update frameCounter
        */
        frameCounter++;

        /*
        Reset props
        */
        callback.length = 0;
        isStopped = false;

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
     * Get/set fps value
     */
    const getFps = () => fps;

    /**
     * Get/set initial fps value
     */
    const getInstantFps = () => instantFps;

    const setInstantFps = (val) => (instantFps = val);

    const getCurrentFrame = () => frameCounter;

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
         *  use frameIndex for key of Object so i can get the sb array in in the fastest way possible
         *  in a bigger set of callaback
         */
        if (indexCallback[frameIndex]) {
            indexCallback[frameIndex].push(cb);
        } else {
            indexCallback[frameIndex] = [cb];
            indexCallbackLength++;
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
        getInstantFps,
        setInstantFps,
        getCurrentFrame,
        addIndex,
    };
})();

/**
 *  Load fos to set initial stabel fps
 */
loadFps();
