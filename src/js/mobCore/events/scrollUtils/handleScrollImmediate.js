// @ts-check

/**
 * @typedef {Object} handleScrollType
 * @prop {number} scrollY - Scroll position
 * @prop {('UP'|'DOWN')} direction
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
 * @type {String}
 */
const UP = 'UP';

/**
 * @type {String}
 */
const DOWN = 'DOWN';

/**
 * @type {Number}
 */
let prev = window.pageYOffset;

/**
 * @type {Number}
 */
let val = window.pageYOffset;

/**
 * @type {String}
 */
let direction = DOWN;

/**
 * @type {{scrollY: Number, direction:String}}
 */
let scrollData = {
    scrollY: val,
    direction,
};

/**
 * @returns void
 */
function handler() {
    /**
     * if - if there is no subscritor remove handler
     */
    if (callback.length === 0) {
        window.removeEventListener('scroll', handler);

        inizialized = false;
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
     * Check if browser lost frame.
     * If true skip.
     */
    callback.forEach(({ cb }) => cb(scrollData));
}

/**
 * init - if istener is not inizializad remove it
 *
 * @return {void}
 */
function init() {
    if (inizialized) return;
    inizialized = true;

    window.addEventListener('scroll', handler, {
        passive: true,
    });
}

/**
 * @description
 * Execute a callback immediately on scroll
 *
 * @param {function(handleScrollType):void } cb - callback function
 * @return {Function} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = handleScrollImmediate(({ direction, scrollY }) => {
 *     // code
 * });
 *
 * unsubscribe();
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

/**
 * @description
 * Execute a callback immediately on scroll
 */
export const handleScrollImmediate = (() => {
    return addCb;
})();
