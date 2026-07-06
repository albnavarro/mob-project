import { getUnivoqueId } from '../../utils';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string, import('./type').EscHandlerCallback>}
 */
const callbacks = new Map();

/**
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handler(event) {
    /**
     * If - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        globalThis.removeEventListener('keydown', handler);

        initialized = false;
        return;
    }

    const eventKey = event.key;
    if (eventKey !== 'Escape') return;

    /**
     * Check if browser lost frame. If true skip.
     */
    for (const value of callbacks.values()) {
        value({ preventDefault: () => event.preventDefault() });
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

    globalThis.addEventListener('keydown', handler);
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
 * @param {import('./type').EscHandlerCallback} cb - Callback function
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
            globalThis.removeEventListener('keydown', handler);
            initialized = false;
        }
    };
};

/**
 * Execute a callback immediately on scroll
 */
export const handleEscHandler = (() => {
    return addCallback;
})();
