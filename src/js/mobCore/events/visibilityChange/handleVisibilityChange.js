// @ts-check

import { getUnivoqueId } from '../../utils';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string,import('./type').VisibilityChangeCallback>}
 */
const callbacks = new Map();

/**
 *
 */
function handler() {
    /**
     * if - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        globalThis.removeEventListener('visibilitychange', handler);

        initialized = false;
        return;
    }

    // Prepare data to callback
    const visibilityData = {
        visibilityState: document.visibilityState,
    };

    for (const value of callbacks.values()) {
        value(visibilityData);
    }
}

/**
 * init - if listener is not inizializad remove it
 *
 * @return {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    globalThis.addEventListener('visibilitychange', handler, {
        passive: false,
    });
}

/**
 * @description
 * Add callback on tab change
 *
 * @param {import('./type').VisibilityChangeCallback} cb - callback function fired on tab change.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 *  const unsubscribe = handleVisibilityChange(({ visibilityState }) => {
 *      // code
 *  });
 *
 *  unsubscribe()
 *
 * ```
 */
const addCb = (cb) => {
    const id = getUnivoqueId();
    callbacks.set(id, cb);

    if (typeof globalThis !== 'undefined') {
        init();
    }

    return () => callbacks.delete(id);
};

export const handleVisibilityChange = (() => addCb)();
