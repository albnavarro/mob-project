import { getUnivoqueId } from '../../utils';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string, import('./type').VisibilityChangeCallback>}
 */
const callbacks = new Map();

function handler() {
    /**
     * If - if there is no subscritor remove handler
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
 * Init - if listener is not inizializad remove it
 *
 * @returns {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    globalThis.addEventListener('visibilitychange', handler, {
        passive: false,
    });
}

/**
 * Add callback on tab change
 *
 * @example
 *     ```javascript
 *      const unsubscribe = handleVisibilityChange(({ visibilityState }) => {
 *          // code
 *      });
 *
 *      unsubscribe()
 *
 *     ```;
 *
 * @param {import('./type').VisibilityChangeCallback} cb - Callback function fired on tab change.
 * @returns {() => void}
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
