import { getUnivoqueId } from '../../utils/index.js';

/**
 * Native `scrollend` scroll-end detection.
 *
 * - NOT a drop-in for the debounced one: native `scrollend` fires at the end of EVERY scroll operation, so for a JS
 *   smooth-scroller doing programmatic `scrollTo` per frame ( eg. page-scroller / lerp ) it triggers on every wheel-end
 *   instead of once the whole interaction settles — that is why `useScrollEnd` stays on the debounce.
 * - Use this variant only when the scroll is genuinely native ( real user/native scroll, not JS-driven ) and you want the
 *   precise, no-delay native end signal.
 *
 * Available/parked: not exposed through `modules.js` by default. To wire it, add a `useScrollEndNative` wrapper in
 * `modules.js` importing `handleScrollNativeEnd` from this file.
 *
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<string, import('./type.js').HandleScrollCallback<import('./type.js').HandleScrollUtils>>}
 */
const callbacks = new Map();

/**
 * @returns {void}
 */
function handler() {
    /**
     * If - if there is no subscritor remove handler
     */
    if (callbacks.size === 0) {
        globalThis.removeEventListener('scrollend', handler);

        initialized = false;
        return;
    }

    /**
     * Prepare data to callback
     */
    const scrollData = {
        scrollY: globalThis.scrollY,
    };

    for (const value of callbacks.values()) {
        value(scrollData);
    }
}

/**
 * Init - if listener is not inizializad add it
 *
 * @returns {void}
 */
function init() {
    if (initialized) return;
    initialized = true;

    globalThis.addEventListener('scrollend', handler, {
        passive: true,
    });
}

/**
 * Execute a callback at the end of the scroll ( native scrollend )
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleScrollNativeEnd(({ scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./type.js').HandleScrollCallback<import('./type.js').HandleScrollUtils>} cb - Callback function
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
            globalThis.removeEventListener('scrollend', handler);
            initialized = false;
        }
    };
};

/**
 * Execute a callback at the end of the scroll ( native scrollend )
 */
export const handleNativeScrollEnd = addCallback;
