// @ts-check

/**
 * @typedef {Object} visibilityChangeTYpe
 * @prop {('hidden'|'visible')} visibilityState - Boolean value indicating the visibility status of the current tab-
 */

/**
 * @type {Boolean}
 */
let inizialized = false;

/**
 * @type {Array.<{id:number, cb:Function }>}
 */
let callback = [];

/**
 * @type {Number}
 */
let id = 0;

/**
 *
 */
function handler() {
    /**
     * if - if there is no subscritor remove handler
     */
    if (callback.length === 0) {
        window.removeEventListener('visibilitychange', handler);

        inizialized = false;
        return;
    }

    // Prepare data to callback
    const visibilityData = {
        visibilityState: document.visibilityState,
    };

    callback.forEach(({ cb }) => cb(visibilityData));
}

/**
 * init - if istener is not inizializad remove it
 *
 * @return {void}
 */
function init() {
    if (inizialized) return;
    inizialized = true;

    window.addEventListener('visibilitychange', handler, {
        passive: false,
    });
}

/**
 * @description
 * Add callback on tab change
 *
 * @param {function(visibilityChangeTYpe):void } cb - callback function fired on tab change.
 * @returns function
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
    callback.push({ cb, id: id });
    const cbId = id;
    id++;

    if (typeof window !== 'undefined') {
        init();
    }

    return () => {
        callback = callback.filter((item) => item.id !== cbId);
    };
};

export const handleVisibilityChange = (() => addCb)();
