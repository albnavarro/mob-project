import { getUnivoqueId } from '../../utils';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string, import('./type').HandleScrollCallback<import('./type').HandleScroll>>}
 */
const callbacks = new Map();
const UP = 'UP';
const DOWN = 'DOWN';

/**
 * @type {number}
 */
let previousScrollValue = 0;

/**
 * @type {number}
 */
let currentScrollValue = 0;

/**
 * @type {import('./type').ScrollDirection}
 */
let direction = DOWN;

/**
 * @type {import('./type').HandleScroll}
 */
let scrollData = {
    scrollY: currentScrollValue,
    direction,
};

/**
 * @returns {void}
 */
function handler() {
    /**
     * If - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        globalThis.removeEventListener('scroll', handler);

        initialized = false;
        return;
    }

    previousScrollValue = currentScrollValue;
    currentScrollValue = globalThis.scrollY;
    direction = currentScrollValue > previousScrollValue ? DOWN : UP;

    /**
     * Prepare data to callback
     */
    scrollData = {
        scrollY: currentScrollValue,
        direction,
    };

    /**
     * Check if browser lost frame. If true skip.
     */
    for (const value of callbacks.values()) {
        value(scrollData);
    }
}

/**
 * Init - if listener is not inizializad remove it
 *
 * @returns {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    previousScrollValue = globalThis.scrollY;
    currentScrollValue = globalThis.scrollY;

    window.addEventListener('scroll', handler, {
        passive: true,
    });
}

/**
 * Execute a callback immediately on scroll
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleScrollImmediate(({ direction, scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./type').HandleScrollCallback<import('./type').HandleScroll>} cb - Callback function
 * @returns {() => void} Unsubscribe callback
 */
const addCallback = (cb) => {
    if (globalThis.window === undefined) {
        return () => {};
    }

    const id = getUnivoqueId();
    callbacks.set(id, cb);
    init();

    return () => {
        callbacks.delete(id);

        if (callbacks.size === 0 && initialized) {
            globalThis.removeEventListener('scroll', handler);
            initialized = false;
        }
    };
};

/**
 * Execute a callback immediately on scroll
 */
export const handleScrollImmediate = (() => {
    return addCallback;
})();
