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
let prev = window.scrollY;

/**
 * @type {number}
 */
let val = window.scrollY;

/**
 * @type {import('./type').ScrollDirection}
 */
let direction = DOWN;

/**
 * @type {import('./type').HandleScroll}
 */
let scrollData = {
    scrollY: val,
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
        window.removeEventListener('scroll', handler);

        initialized = false;
        return;
    }

    prev = val;
    val = window.scrollY;
    direction = val > prev ? DOWN : UP;

    // Prepare data to callback
    scrollData = {
        scrollY: val,
        direction,
    };

    /**
     * Check if browser lost frame. If true skip.
     */
    // callback.forEach(({ cb }) => cb(scrollData));
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
const addCb = (cb) => {
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof globalThis !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

/**
 * Execute a callback immediately on scroll
 */
export const handleScrollImmediate = (() => {
    return addCb;
})();
