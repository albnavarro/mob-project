import { normalizeWheel } from './normalizeWhell.js';

/**
 * @typedef {Object} mouseType
 * @prop {Object} page
 * @prop {Number} page.x
 * @prop {Number} page.y
 * @prop {Object} client
 * @prop {Number} client.x
 * @prop {Number} client.y
 * @prop {Element} target
 * @prop {('click'|'mousedown'|'mousemove'|'mouseup'|'touchstart'|'touchmove'|'touchend'|'wheel')} type
 * @prop {function} preventDefault
 */

/**
 * @typedef {Object} mouseWheelType
 * @prop {Number} spinX
 * @prop {Number} spinY
 * @prop {Number} pixelX
 * @prop {Number} pixelY
 *
 */

/**
 * @constructor
 */
function handleMouse(event) {
    let inizialized = false;
    let callback = [];
    let id = 0;

    /**
     *
     */
    function handler(e) {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callback.length === 0) {
            window.removeEventListener(event, handler);

            inizialized = false;
            return;
        }

        // Get event type
        const type = e.type;

        // Get page coord
        const { pageX, pageY } = (() => {
            // 'touchend'
            if (type === 'touchend' && e.changedTouches)
                return e.changedTouches[0];

            // 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
            return e.touches ? e.touches[0] : e;
        })();

        // Get client coord
        const { clientX, clientY } = (() => {
            // 'touchend'
            if (type === 'touchend' && e.changedTouches)
                return e.changedTouches[0];

            // 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
            return e.touches ? e.touches[0] : e;
        })();

        // Get target
        const target = e.target;

        // Prepare data to callback
        const mouseData = {
            page: {
                x: pageX,
                y: pageY,
            },
            client: {
                x: clientX,
                y: clientY,
            },
            target,
            type,
            preventDefault: () => e.preventDefault(),
        };

        // Add spin value if is wheel event
        if (type === 'wheel') {
            const { spinX, spinY, pixelX, pixelY } = normalizeWheel(e);
            Object.assign(mouseData, { spinX, spinY, pixelX, pixelY });
        }

        callback.forEach(({ cb }) => {
            cb(mouseData);
        });
    }

    /**
     * init - if istener is not inizializad remove it
     *
     * @return {void}
     */
    function init() {
        if (inizialized) return;
        inizialized = true;

        window.addEventListener(event, handler, {
            passive: false,
        });
    }

    /**
     * @description
     * add callback on mouse action
     *
     * @param {function(mouseType):void } cb - callback function fired on mouse action.
     *
     * @example
     * ```js
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

    return addCb;
}

/**
 * @description
 * Add callback on mouse click
 *
 * @example
 * ```js
 * const unsubscribe = handleMouseClick(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleMouseClick = new handleMouse(['click']);

/**
 * @description
 * Add callback on mouse down
 *
 * @example
 * ```js
 * const unsubscribe = handleMouseDown(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleMouseDown = new handleMouse(['mousedown']);

/**
 * @description
 * Add callback on touch start
 *
 * @example
 * ```js
 * const unsubscribe = handleTouchStart(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleTouchStart = new handleMouse(['touchstart']);

/**
 * @description
 * Add callback on handleMouseMove
 *
 * @example
 * ```js
 * const unsubscribe = handleMouseMove(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleMouseMove = new handleMouse(['mousemove']);

/**
 * @description
 * Add callback on touch move
 *
 * @example
 * ```js
 * const unsubscribe = handleTouchMove(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleTouchMove = new handleMouse(['touchmove']);

/**
 * @description
 * Add callback on mouse up
 *
 * @example
 * ```js
 * const unsubscribe = handleMouseUp(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleMouseUp = new handleMouse(['mouseup']);

/**
 * @description
 * Add callback on touc end
 *
 * @example
 * ```js
 * const unsubscribe = handleTouchEnd(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleTouchEnd = new handleMouse(['touchend']);

/**
 * @description
 * Add callback on mouse wheel
 *
 * @example
 * ```js
 * const unsubscribe = handleMouseWheel(
 *     ({
 *         client,
 *         page,
 *         preventDefault,
 *         target,
 *         type,
 *         pixelX,
 *         pixelY,
 *         spinX,
 *         spinY,
 *     }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handleMouseWheel = new handleMouse(['wheel']);
