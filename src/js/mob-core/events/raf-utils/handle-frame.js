import { handleVisibilityChange } from '../visibility-change/handle-visibility-change.js';
import { handleCache } from './handle-cache.js';
import { handleNextTick } from './handle-next-tick.js';
import { handleNextFrame } from './handle-next-frame.js';
import { handleFrameIndex } from './handle-frame-index.js';
import { catchAnimationReject } from '../error-handler/catch-animation-reject.js';
import { loadFps } from './load-fps.js';
import { eventStore } from '../event-store.js';
import { defaultTimestep, getTime } from './time.js';
import { useNextLoop } from '../../utils/next-tick.js';

/**
 * Calculate a precise fps
 */
loadFps();

/**
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
 * @type {import('./type.js').HandleFrameArray}
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
 * RawTime accumula il tempo reale del browser.
 *
 * - Nella prima versione il valore di rawTime partiva da 0.
 * - Nella versioen attuale il tempo parte allineato a time.
 *
 * @type {number}
 */
let rawTime = getTime();

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
 * ATTENZIONE: isStopped ha due significati:
 *
 * 1. Tab in background (da handleVisibilityChange)
 * 2. Loop fermo per mancanza di lavoro (da nextTickFn)
 *
 * @type {boolean}
 */
let isStopped = false;

/**
 * Stable fps
 *
 * @type {number}
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
 * Check if frame dropped a lot.
 *
 * @returns {boolean}
 */
const mustMakeSomethingCheck = () => fps < (maxFps / 5) * 3;

/**
 * @returns {boolean}
 *
 *   Check if frame dropped medium.
 */
const shouldMakeSomethingCheck = () => fps < (maxFps / 5) * 4;

/**
 * If frame dropper for X seconds mustMakeSomethingIsActive = true
 *
 * @returns {void}
 */
const mustMakeSomethingStart = () => {
    if (!mustMakeSomethingCheck() || mustMakeSomethingIsActive) return;

    mustMakeSomethingIsActive = true;
    setTimeout(() => {
        mustMakeSomethingIsActive = false;
    }, 4000);
};

/**
 * If frame dropper for X seconds shouldMakeSomethingIsActive = true
 *
 * @returns {void}
 */
const shouldMakeSomethingStart = () => {
    if (!shouldMakeSomethingCheck() || shouldMakeSomethingIsActive) return;

    shouldMakeSomethingIsActive = true;
    setTimeout(() => {
        shouldMakeSomethingIsActive = false;
    }, 4000);
};

/**
 * Reset frame counter.
 *
 * - CurrentFrame > frame limit
 */
const performFrameCounterReset = () => {
    currentFrame = 0;
    eventStore.quickSetProp('currentFrame', currentFrame);
    handleFrameIndex.updateKeys(currentFrameLimit);
    handleCache.updateFrameId(currentFrameLimit);
};

/**
 * Stop timer when user change tab
 */
handleVisibilityChange(({ visibilityState }) => {
    isStopped = visibilityState !== 'visible';
});

catchAnimationReject();

// Call new requestAnimationFrame on event emit
eventStore.watch('requestFrame', () => {
    initFrame();
});

/**
 * Next tick function
 *
 * @returns {void}
 */
const nextTickFn = () => {
    /*
     * If currentFrame reach currentFrameLimit back to zero to avoid big numbers
     * executte the operation outside requestAnimationFrame if deferredNextTick is active
     */
    if (currentFrame >= currentFrameLimit) {
        performFrameCounterReset();
    }

    /*
        Fire next tick
        */
    handleNextTick.fire({ time, fps });

    /**
     * Get next callback
     */
    const nextFrames = handleNextFrame.get();
    if (nextFrames.length > 0) {
        for (const nextFrame of nextFrames) {
            callback.push(nextFrame);
        }
    }

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

        /**
         * - Non ci sono piu frame futuri.
         * - PerformReset non é necessario ( non abbiamo callback in coda da riallineare ) ).
         * - Avendo una cosa vuota basta resettare currentFrame per poter partire da un counter 0.
         */
        currentFrame = 0;
        lastTime = time;
        eventStore.quickSetProp('currentFrame', currentFrame);
    }
};

/**
 * @param {number} timestamp
 * @returns {void}
 */
const render = (timestamp) => {
    /**
     * Update time
     */
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
     * Compensazione lag non rilevato da visibilitychange.
     *
     * Meccanismo: quando rilevato scostamento significativo (>100ms):
     *
     * - Applica correzione costante frame-dopo-frame.
     * - Il delta-time viene mantenuto stabile.
     * - L'offset rimane fisso fino al reset del loop.
     *
     * Priorità: garantire avanzamento fluido delle animazioni piuttosto che sincronizzazione assoluta col tempo di
     * sistema.
     *
     * - Soglia 100ms: valore percettivo, non tecnico.
     * - Rappresenta il tempo minimo di freeze percepibile dall'utente.
     * - Costante indipendentemente dal frame rate (30/60/144Hz)
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
     * - Calcolo FPS ogni secondo.
     * - Condizione time > fpsPrevTime + 1000 garantisce timeDelta > 1000,
     * - Quindi divisione sempre sicura.
     */
    if (time > fpsPrevTime + 1000 && !isStopped) {
        /**
         * Calc fps Set fps when stable after 2 seconds otherwise use instantFps
         */
        fps =
            time > firstRunDuration
                ? Math.round((frames * 1000) / (time - fpsPrevTime))
                : eventStore.getProp('instantFps');
        fpsPrevTime = time;
        frames = 0;
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
     * Fire callbnack
     */
    callback.forEach((item) => item({ time, fps }));

    /*
     * Fire callback related to specific index frame
     */
    handleFrameIndex.fire({ currentFrame, time, fps });

    /**
     * Fire handleCache callBack
     */
    handleCache.fire(currentFrame);

    /**
     * Update currentFrame
     */
    currentFrame++;
    eventStore.quickSetProp('currentFrame', currentFrame);

    /**
     * Reset props
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
 * Init new frame if is not running
 *
 * @returns {void}
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
 * Execute a callBack within the first available request animation frame. Use this method to modify elements of the DOM
 */
export const handleFrame = (() => {
    /**
     * Get current fps
     *
     * @returns {number}
     */
    const getFps = () => fps;

    /**
     * Return the mustMakeSomethingIsActive status. If frame dropped the value is true for X seconds.
     *
     * @returns {boolean}
     */
    const mustMakeSomething = () => mustMakeSomethingIsActive;

    /**
     * Return the mustMakeSomethingIsActive status. If frame dropped the value is true for X seconds.
     *
     * @returns {boolean}
     */
    const shouldMakeSomething = () => shouldMakeSomethingIsActive;

    /**
     * Add callback
     *
     * @example
     *     ```javascript
     *     handleFrame.add(({ fps, time }) => {
     *         // code ...
     *     });
     *
     *     ```;
     *
     * @param {import('./type.js').HandleFrameCallbak} cb - Callback function
     * @returns {void}
     */
    const add = (cb) => {
        callback.push(cb);
        initFrame();
    };

    /**
     * Add an array of callback
     *
     * @param {import('./type.js').HandleFrameArray} arr - Array of callback
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
