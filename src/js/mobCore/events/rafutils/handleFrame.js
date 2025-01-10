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
import { useNextLoop } from '../../utils/nextTick.js';

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
 * @type {number}
 */
const firstRunDuration = 2000;

/**
 * @type {boolean}
 */
let frameIsRuning = false;

/**
 * @type {import('./type.js').handleFrameArrayType}
 */
let callback = [];

/**
 * @type {number}
 */
let time = getTime();

/**
 * @type {number}
 */
let startTime = 0;

/**
 * @type {number}
 */
let rawTime = 0;

/**
 * @type {number}
 */
let timeElapsed = 0;

/**
 * @type {number}
 */
let lastTime = 0;

/**
 * @type {number}
 */
let timeLost = 0;

/**
 * @type {boolean}
 */
let isStopped = false;

/**
 * @type {number}
 *
 * @description
 * Stable fps
 */
let fps = 60;

/**
 * @type {number}
 */
let maxFps = fps;

/**
 * @type {number}
 */
let frames = 0;

/**
 * @type {number}
 */
let fpsPrevTime = 0;

/**
 * @type {number}
 */
let currentFrame = 0;

/**
 * @type {boolean}
 */
let mustMakeSomethingIsActive = false;

/**
 * @type {boolean}
 */
let shouldMakeSomethingIsActive = false;

/**
 * @returns {boolean}
 *
 * @description
 * Check if frame dropped a lot.
 */
const mustMakeSomethingCheck = () => fps < (maxFps / 5) * 3;

/**
 * @returns {boolean}
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
 * @returns void
 *
 * @description
 * Next tick function
 */
const nextTickFn = () => {
    /*
     * If currentFrame reach currentFrameLimit back to zero to avoid big numbers
     * executte the operation outside requestAnimationFrame if deferredNextTick is active
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
    handleNextTick.fire({ time, fps });

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
        lastTime = time;
        eventStore.quickSetProp('currentFrame', currentFrame);
    }
};

/**
 * @param {number} timestamp
 * @returns void
 */
const render = (timestamp) => {
    /**
     * Update time
     **/
    time = timestamp;
    timeElapsed = time - rawTime;

    if (isStopped) startTime += timeElapsed;

    /**
     * Default time calculation.
     */
    rawTime += timeElapsed;
    time = Math.round(rawTime - startTime);

    /**
     * Get frame duration.
     */
    const frameDuration = Math.round(1000 / fps);

    /**
     * Get time lost
     * ( if the difference of current time with last time and frame duration is han 100ms ).
     * Problem with workspace and switch to dirrent application without fire visibilityChange event.
     */
    timeLost = Math.abs(time - lastTime - frameDuration);
    const timeToSubsctract = timeLost > 100 ? timeLost : 0;
    time = time - timeToSubsctract;
    lastTime = time;

    /**
     * Update frame counter for fps or reset id tab change.
     */
    if (isStopped) {
        fpsPrevTime = time;
        frames = 0;
        fps = eventStore.getProp('instantFps');
    } else {
        frames++;
    }

    /**
     * Get fps
     * Update fps every second
     **/
    if (time > fpsPrevTime + 1000 && !isStopped) {
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
         * Se a minimum of 30 fps.
         */
        fps = fps < 30 ? eventStore.getProp('instantFps') : fps;
    }

    /**
     * Update max fps
     */
    if (fps > maxFps) maxFps = fps;

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
    callback.forEach((item) => item({ time, fps }));

    /*
     * Fire callback related to specific index frame
     */
    handleFrameIndex.fire({ currentFrame, time, fps });

    /**
     *Fire handleCache callBack
     */
    handleCache.fire(currentFrame);

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
        useNextLoop(() => nextTickFn());
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

    if (typeof globalThis === 'undefined') {
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
     * @returns {boolean}
     *
     * @description
     * Return the mustMakeSomethingIsActive status.
     * If frame dropped the value is true for X seconds.
     */
    const mustMakeSomething = () => mustMakeSomethingIsActive;

    /**
     * @returns {boolean}
     *
     * @description
     * Return the mustMakeSomethingIsActive status.
     * If frame dropped the value is true for X seconds.
     */
    const shouldMakeSomething = () => shouldMakeSomethingIsActive;

    /**
     * @description
     * Add callback
     *
     * @param {import('./type.js').handleFrameCallbakType} cb - callback function
     * @returns void
     *
     * @example
     * ```javascript
     * handleFrame.add(({ fps, time }) => {
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
     * @param {import('./type.js').handleFrameArrayType} arr - array of callback
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
    };
})();
