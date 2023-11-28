// @ts-check

import { getUnivoqueId } from '../../utils/index.js';
import { eventStore } from '../eventStore.js';
import { normalizeWheel } from './normalizeWhell.js';

/**
 * @param {Object} obj
 * @param {import('./type.js').mouseEvent} obj.type
 * @param {Object} obj.e
 *
 * @returns { Object }
 */
function getPageData({ type, e }) {
    // 'touchend'
    if (type === 'touchend' && e.changedTouches) return e.changedTouches[0];

    // 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
    return e.touches ? e.touches[0] : e;
}

/**
 * @param {Object} obj
 * @param {import('./type.js').mouseEvent} obj.type
 * @param {Object} obj.e
 * @returns Object
 * @description
 */
function getClientData({ type, e }) {
    // 'touchend'
    if (type === 'touchend' && e.changedTouches) return e.changedTouches[0];

    // 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
    return e.touches ? e.touches[0] : e;
}

/**
 * @param {import('./type.js').mouseEvent} event
 */
function handleMouse(event) {
    /**
     * @type {boolean}
     */
    let initialized = false;

    /**
     * @type {Map<String,Function>}
     */
    const callbacks = new Map();

    /**
     * @type {{usePassive:( Boolean )}}
     */
    // @ts-ignore
    let { usePassive } = eventStore.get();

    /**
     * Switch passive event on setUp change.
     */
    eventStore.watch('usePassive', () => {
        window.removeEventListener(event, handler);
        initialized = false;

        init();
    });

    /**
     * @param {Object} e
     */
    function handler(e) {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callbacks.size === 0) {
            window.removeEventListener(event, handler);

            initialized = false;
            return;
        }

        /**
         * @type {import('./type.js').mouseEvent} event
         */
        const type = e.type;

        /**
         * @type {{ pageX:Number, pageY:Number }}
         */
        const { pageX, pageY } = getPageData({ type, e });

        /**
         * @type {{ clientX:Number, clientY:Number }}
         */
        const { clientX, clientY } = getClientData({ type, e });

        /**
         * @type {HTMLElement}
         */
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
            preventDefault: () => (usePassive ? () => {} : e.preventDefault()),
        };

        // Add spin value if is wheel event
        if (type === 'wheel') {
            const { spinX, spinY, pixelX, pixelY } = normalizeWheel(e);
            Object.assign(mouseData, { spinX, spinY, pixelX, pixelY });
        }

        for (const value of callbacks.values()) {
            value(mouseData);
        }
    }

    /**
     * @description
     * init - if listener is not inizializad remove it
     *
     * @return {void}
     */
    function init() {
        if (initialized) return;
        initialized = true;
        usePassive = eventStore.getProp('usePassive');

        window.addEventListener(event, handler, {
            passive: usePassive,
        });
    }

    /**
     * @description
     * add callback on mouse action
     *
     * @param {import('./type.js').mouseEventCallback} cb - callback function fired on mouse action.
     *
     * @example
     * ```javascript
     *
     * ```
     */
    const addCb = (cb) => {
        const id = getUnivoqueId();
        callbacks.set(id, cb);

        if (typeof window !== 'undefined') {
            init();
        }

        return () => callbacks.delete(id);
    };

    return addCb;
}

/**
 * @description
 * Add callback on mouse click
 *
 * @example
 * ```javascript
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
export const handleMouseClick = handleMouse('click');

/**
 * @description
 * Add callback on mouse down
 *
 * @example
 * ```javascript
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
export const handleMouseDown = handleMouse('mousedown');

/**
 * @description
 * Add callback on touch start
 *
 * @example
 * ```javascript
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
export const handleTouchStart = handleMouse('touchstart');

/**
 * @description
 * Add callback on handleMouseMove
 *
 * @example
 * ```javascript
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
export const handleMouseMove = handleMouse('mousemove');

/**
 * @description
 * Add callback on touch move
 *
 * @example
 * ```javascript
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
export const handleTouchMove = handleMouse('touchmove');

/**
 * @description
 * Add callback on mouse up
 *
 * @example
 * ```javascript
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
export const handleMouseUp = handleMouse('mouseup');

/**
 * @description
 * Add callback on touc end
 *
 * @example
 * ```javascript
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
export const handleTouchEnd = handleMouse('touchend');

/**
 * @description
 * Add callback on mouse wheel
 *
 * @example
 * ```javascript
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
export const handleMouseWheel = handleMouse('wheel');
