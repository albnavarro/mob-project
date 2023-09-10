// @ts-check

import { handleVisibilityChange } from '../visibilityChange/handleVisibilityChange.js';
import { handleCache } from './handleCache.js';
import { handleNextTick } from './handleNextTick.js';
import { handleNextFrame } from './handleNextFrame.js';
import { handleFrameIndex } from './handleFrameIndex';
import { catchAnimationReject } from '../errorHandler/catchAnimationReject.js';
import { loadFps } from './loadFps.js';
import { eventStore } from '../eventStore.js';
import { defaultTimestep, getTime } from './time.js';

/**
 * @typedef {Object} handleFrameTypes
 * @prop {number} time
    The total activity time of the request animation frame
 * @prop {number} fps
    Current fps value, the starting fps value is 60.
    The effective value of the fps property will occur 30 frames after the initialization of handleFrame,
    30 frames the minimum interval to have a correct result.
 * @prop {boolean} shouldRender
    If the useScaleFps global property is on,
    the property indicates whether there is a drop in frame rate compared
    to the optimal frame rate calculated at application startup.
 */

/**
 * Calculate a precise fps
 */
loadFps();

/**
 * @description
 * 10000 is maximum stagger frame delay
 */
const currentFrameLimit = 10_000_000;

/**
 * @type {Number}
 */
const firstRunDuration = 2000;

/**
 * @type {Boolean}
 */
let frameIsRuning = false;

/**
 * @type {Array.<function(handleFrameTypes):void>}
 */
let callback = [];

/**
 * @type {Number}
 */
let time = getTime();

/**
 * @type {Number}
 */
let startTime = 0;

/**
 * @type {Number}
 */
let rawTime = 0;

/**
 * @type {Number}
 */
let timeElapsed = 0;

/**
 * @type {Boolean}
 */
let isStopped = false;

/**
 * @type {Number}
 *
 * @description
 * Stable fps
 */
let fps = 60;

/**
 * @type {Number}
 */
let maxFps = fps;

/**
 * @type {Number}
 */
let frames = 0;

/**
 * @type {Number}
 */
let fpsPrevTime = 0;

/**
 * @type {Number}
 */
let currentFrame = 0;

/**
 * Check if frame drop by fpsScalePercent value
 * when value is -1 || 2 animation ( or whoever use it ) is rendered
 * */
let dropFrameCounter = -1;

/**
 * @type {Boolean}
 */
let shouldRender = true;

/**
 * @type {Object.<number, number>}
 */
let fpsScalePercent = eventStore.getProp('fpsScalePercent');

/**
 * @type {Boolean}
 */
let useScaleFpsf = eventStore.getProp('useScaleFps');

/**
 * @type {Boolean}
 */
let mustMakeSomethingIsActive = false;

/**
 * @type {Boolean}
 */
let shouldMakeSomethingIsActive = false;

/**
 * @returns {Boolean}
 *
 * @description
 * Check if frame dropped a lot.
 */
const mustMakeSomethingCheck = () => fps < (maxFps / 5) * 3;

/**
 * @returns {Boolean}
 *
 * Check if frame dropped medium.
 */
const shouldMakeSomethingCheck = () => fps < (maxFps / 5) * 4;

/**
 * @returns void
 *
 * @description
 * If frame dropper for X seconds mustMakeSomethingIsActive = true
 */
const mustMakeSomethingStart = () => {
    if (!mustMakeSomethingCheck() || mustMakeSomethingIsActive) return;

    mustMakeSomethingIsActive = true;
    setTimeout(() => {
        mustMakeSomethingIsActive = false;
    }, 4000);
};

/**
 * @returns void
 *
 * @description
 * If frame dropper for X seconds shouldMakeSomethingIsActive = true
 */
const shouldMakeSomethingStart = () => {
    if (!shouldMakeSomethingCheck() || shouldMakeSomethingIsActive) return;

    shouldMakeSomethingIsActive = true;
    setTimeout(() => {
        shouldMakeSomethingIsActive = false;
    }, 4000);
};

/**
 *
 * @description
 * Stop timer when user change tab
 */
handleVisibilityChange(({ visibilityState }) => {
    isStopped = visibilityState === 'visible';
});

catchAnimationReject();

// Call new requestAnimationFrame on event emit
eventStore.watch('requestFrame', () => {
    initFrame();
});

/**
 * @returns {Boolean}
 *
 * @description
 * Check if animation is renderable in current frame
 */
const getRenderStatus = () => {
    if (!useScaleFpsf) return true;

    const activeModule = Object.entries(fpsScalePercent).reduce(
        (acc, [fpsValue, fpsModule]) => {
            // const delta = Math.abs(maxFps - fpsWithMinumVariation);
            const delta = Math.abs(maxFps - fps);

            /**
             * Get delta value in percent
             * Assuming that fpsValue in in percent
             * Compare and check if we are under fpsValue
             **/
            const deltaPercent = Math.round((delta * 100) / maxFps);
            const isOutOfRange = deltaPercent > Number.parseInt(fpsValue);
            return isOutOfRange ? fpsModule : acc;
        },
        1
    );
    dropFrameCounter = (dropFrameCounter + 1) % activeModule;
    return dropFrameCounter === 0;
};

/**
 * @returns void
 *
 * @description
 * Next tick function
 */
const nextTickFn = () => {
    /*
     * If currentFrame reach currentFrameLimit back to zero to avoid big numbers
     * executte the opration outside requestAnimationFrame if deferredNextTick is active
     */
    if (currentFrame === currentFrameLimit) {
        currentFrame = 0;
        eventStore.quickSetProp('currentFrame', currentFrame);
        handleFrameIndex.updateKeys(currentFrameLimit);
        handleCache.updateFrameId(currentFrameLimit);
    }

    /*
        Fire next tick
        */
    handleNextTick.fire({ time, fps, shouldRender });

    /**
     * Get next callback
     */
    callback = [...callback, ...handleNextFrame.get()];

    /**
     * Next frame condition
     */

    /**
     * RequestAnimationFrame is ended, ready for another
     */
    frameIsRuning = false;

    if (
        callback.length > 0 ||
        handleFrameIndex.getAmountOfFrameToFire() > 0 ||
        handleCache.getCacheCounter() > 0 ||
        time < firstRunDuration
    ) {
        /**
         * Call Next animationFrame
         */
        initFrame();
    } else {
        isStopped = true;
        currentFrame = 0;
        eventStore.quickSetProp('currentFrame', currentFrame);
    }
};

/**
 * @param {Number} timestamp
 * @returns void
 */
const render = (timestamp) => {
    /**
     * Update time
     **/
    time = timestamp;
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
         */
        fps =
            time > firstRunDuration
                ? Math.round((frames * 1000) / (time - fpsPrevTime))
                : eventStore.getProp('instantFps');
        fpsPrevTime = time;
        frames = 0;

        /**
         * Prevent fps error;
         */
        if (fps === 0) fps = eventStore.getProp('instantFps');

        /**
         * Update value every seconds
         **/
        fpsScalePercent = eventStore.getProp('fpsScalePercent');
        useScaleFpsf = eventStore.getProp('useScaleFps');
    }

    /**
     * Update max fps
     */
    if (fps > maxFps) maxFps = fps;

    /**
     * Chek if current frame can fire animation
     * */
    shouldRender = getRenderStatus();

    /**
     * Start frame check for mustMakeSomething methods.
     */
    mustMakeSomethingStart();

    /**
     * Start frame check for shouldMakeSomething methods.
     */
    shouldMakeSomethingStart();

    /**
     *Fire callbnack
     */
    callback.forEach((item) => item({ time, fps, shouldRender }));

    /*
     * Fire callback related to specific index frame
     */
    handleFrameIndex.fire({ currentFrame, time, fps, shouldRender });

    /**
     *Fire handleCache callBack
     */
    handleCache.fire(currentFrame, shouldRender);

    /**
     *  Update currentFrame
     */
    currentFrame++;
    eventStore.quickSetProp('currentFrame', currentFrame);

    /**
     *Reset props
     */
    callback.length = 0;
    isStopped = false;

    const deferredNextTick = eventStore.getProp('deferredNextTick');

    if (deferredNextTick) {
        setTimeout(() => nextTickFn());
    } else {
        nextTickFn();
    }
};

/**
 * @returns void
 *
 * @description
 * Init new frame if is not running
 */
const initFrame = () => {
    if (frameIsRuning) return;

    if (typeof window === 'undefined') {
        setTimeout(() => render(getTime()), defaultTimestep);
    } else {
        requestAnimationFrame(render);
    }

    frameIsRuning = true;
};

/**
 * @description
    Execute a callBack within the first available request animation frame.
    Use this method to modify elements of the DOM
 */
export const handleFrame = (() => {
    /**
     * @description
     * Get current fps
     *
     * @returns {number}
     */
    const getFps = () => fps;

    /**
     * @returns {Boolean}
     *
     * @description
     * Return the mustMakeSomethingIsActive status.
     * If frame dropped the value is true for X seconds.
     */
    const mustMakeSomething = () => mustMakeSomethingIsActive;

    /**
     * @returns {Boolean}
     *
     * @description
     * Return the mustMakeSomethingIsActive status.
     * If frame dropped the value is true for X seconds.
     */
    const shouldMakeSomething = () => shouldMakeSomethingIsActive;

    /**
     * @returns {Boolean}
     *
     * @description
     * Get drop frame status.
     */
    const getShouldRender = () => shouldRender;

    /**
     * @description
     * Add callback
     *
     * @param {function(handleFrameTypes):void } cb - callback function
     * @returns void
     *
     * @example
     * ```javascript
     * handleFrame.add(({ fps, shouldRender, time }) => {
     *     // code ...
     * });
     *
     * ```
     */
    const add = (cb) => {
        callback.push(cb);
        initFrame();
    };

    /**
     * @description
     * Add an array of callback
     *
     * @param {Array.<function(handleFrameTypes):void >} arr - array of callback
     */
    const addMultiple = (arr = []) => {
        callback = [...callback, ...arr];
        initFrame();
    };

    return {
        add,
        addMultiple,
        getFps,
        mustMakeSomething,
        shouldMakeSomething,
        getShouldRender,
    };
})();
