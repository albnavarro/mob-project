// @ts-check

import { getUnivoqueId } from '../../utils/index.js';

/**
 * @param {import('./type.js').PointerEventType} eventType
 */
function handlePointer(eventType) {
    /**
     * @type {boolean}
     */
    let initialized = false;

    /**
     * @type {Map<string,import('./type.js').PointerEventCallback>}
     */
    const callbacks = new Map();

    /**
     * @param {PointerEvent} event
     * @returns {void}
     */
    function handler(event) {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callbacks.size === 0) {
            globalThis.removeEventListener(eventType, handler);

            initialized = false;
            return;
        }

        for (const value of callbacks.values()) {
            value(event);
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

        globalThis.addEventListener(eventType, handler);
    }

    /**
     * @description
     * add callback on mouse action
     * @param {import('./type.js').PointerEventCallback} cb - callback function fired on mouse action.
     * @returns {() => void}
     *
     */
    const addCallback = (cb) => {
        const id = getUnivoqueId();
        callbacks.set(id, cb);

        if (typeof globalThis !== 'undefined') {
            init();
        }

        return () => callbacks.delete(id);
    };

    return addCallback;
}

/**
 * @example
 * ```javascript
 * const unsubscribe = handlePointerOver((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handlePointerOver = handlePointer('pointerover');

/**
 * @example
 * ```javascript
 * const unsubscribe = handlePointerDown((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handlePointerDown = handlePointer('pointerdown');

/**
 * @example
 * ```javascript
 * const unsubscribe = handlePointerMove((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handlePointerMove = handlePointer('pointermove');

/**
 * @example
 * ```javascript
 * const unsubscribe = handlePointerUp((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handlePointerUp = handlePointer('pointerup');

/**
 * @example
 * ```javascript
 * const unsubscribe = handlePointerOut((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handlePointerOut = handlePointer('pointerout');

/**
 * @example
 * ```javascript
 * const unsubscribe = handlePointerOut((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
export const handlePointerLeave = handlePointer('pointerleave');
