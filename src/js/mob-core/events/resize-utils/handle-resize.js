import { getUnivoqueId } from '../../utils/index.js';
import { debounceFuncion } from '../debounce.js';

/**
 * @type {boolean}
 */
let initialized = false;

/**
 * @type {Map<String, import('./type.js').HandleResizeCallback>}
 */
const callbacks = new Map();

/**
 * @type {() => void}
 */
let debouceFunctionReference = () => {};

/**
 * @type {number}
 */
let previousWindowHeight = 0;

/**
 * @type {number}
 */
let previousWindowWidth = 0;

/**
 * @returns {void}
 */
function handler() {
    /**
     * If there is no subscritor remove handler.
     */
    if (callbacks.size === 0) {
        globalThis.removeEventListener('resize', debouceFunctionReference);

        initialized = false;
        return;
    }

    // Check there is a vertical resizer

    /**
     * @type {number}
     */
    const windowsHeight = globalThis.innerHeight;

    /**
     * @type {number}
     */
    const windowsWidth = globalThis.innerWidth;

    /**
     * @type {boolean}
     */
    const verticalResize = windowsHeight !== previousWindowHeight;

    /**
     * @type {boolean}
     */
    const horizontalResize = windowsWidth !== previousWindowWidth;

    /**
     * @type {number}
     */
    previousWindowHeight = windowsHeight;

    /**
     * @type {number}
     */
    previousWindowWidth = windowsWidth;

    // Prepare data to callback
    const resizeData = {
        scrollY: globalThis.scrollY,
        windowsHeight,
        windowsWidth,
        documentHeight: document.documentElement.scrollHeight,
        verticalResize,
        horizontalResize,
    };

    // Fire end of resize
    for (const value of callbacks.values()) {
        value(resizeData);
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

    previousWindowHeight = globalThis.window.innerHeight;
    previousWindowWidth = globalThis.window.innerWidth;

    // Add debunce function to detect scroll end
    // @ts-ignore
    debouceFunctionReference = debounceFuncion(() => handler());

    globalThis.addEventListener('resize', debouceFunctionReference, {
        passive: false,
    });
}

/**
 * Add callback on resize using a debounce function.
 *
 * @example
 *     ```javascript
 *     handleResize(
 *         ({
 *             documentHeight,
 *             horizontalResize,
 *             scrollY,
 *             verticalResize,
 *             windowsHeight,
 *             windowsWidth,
 *         }) => {
 *             // code
 *         }
 *     );
 *
 *     ```;
 *
 * @param {import('./type.js').HandleResizeCallback} cb - Callback function fired on resize.
 * @returns {() => void}
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
            globalThis.removeEventListener('resize', debouceFunctionReference);
            initialized = false;
        }
    };
};

export const handleResize = (() => addCallback)();
