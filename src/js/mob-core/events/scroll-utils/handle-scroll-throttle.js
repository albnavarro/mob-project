import { handleFrame } from '../raf-utils/handle-frame.js';
import { handleNextTick } from '../raf-utils/handle-next-tick.js';
import { throttle } from '../throttle.js';
import { handleScrollImmediate } from './handle-scroll-immediate.js';
import { eventStore } from '../event-store.js';
import { getUnivoqueId } from '../../utils/index.js';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string, import('./type.js').HandleScrollCallback<import('./type.js').HandleScroll>>}
 */
const callbacks = new Map();

/**
 * @type {() => void}
 */
let throttleFunctionReference;

/**
 * @type Function():void
 */
let unsubscribe = () => {};

/**
 * @param {import('./type.js').HandleScroll} scrollData
 */
function handler(scrollData) {
    /**
     * If - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        unsubscribe();

        initialized = false;
        return;
    }

    handleFrame.add(() => {
        handleNextTick.add(() => {
            for (const value of callbacks.values()) {
                value(scrollData);
            }
        }, 0);
    });
}

/**
 * Init - if listener is not inizializad remove it
 *
 * @returns {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    // @ts-ignore
    throttleFunctionReference = throttle(
        (/** @type {any} */ scrollData) => handler(scrollData),
        eventStore.getProp('throttle')
    );

    // @ts-ignore
    unsubscribe = handleScrollImmediate(throttleFunctionReference);
}

/**
 * Performs a scroll callback using a throttle function
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleScrollThrottle(({ direction, scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe()
 *
 *     Define throttle value from default:
 *     handleSetUp.set({ throttle: 100 });
 *
 *     ```;
 *
 * @param {import('./type.js').HandleScrollCallback<import('./type.js').HandleScroll>} cb - Callback function
 * @returns {() => void} Unsubscribe callback
 */
const addCb = (cb) => {
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof globalThis !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

/**
 * Performs a scroll callback using a throttle function
 */
export const handleScrollThrottle = (() => addCb)();
