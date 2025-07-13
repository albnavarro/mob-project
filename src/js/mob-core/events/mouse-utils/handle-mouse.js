import { clamp, getUnivoqueId } from '../../utils/index.js';
import { eventStore } from '../event-store.js';
import { normalizeWheel } from './normalize-whell.js';

/**
 * @param {Object} obj
 * @param {import('./type.js').MouseEventType} obj.type
 * @param {Object} obj.event
 * @returns {any}
 */
function getPageData({ type, event }) {
    const touchEvent = /** @type {TouchEvent} */ (event);

    /**
     * 'touchend'
     */
    if (type === 'touchend' && 'changedTouches' in event) {
        return touchEvent.changedTouches[0];
    }

    /**
     * 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
     */
    return 'touches' in touchEvent ? touchEvent.touches[0] : event;
}

/**
 * @param {Object} obj
 * @param {import('./type.js').MouseEventType} obj.type
 * @param {Object} obj.event
 * @returns {any}
 */
function getClientData({ type, event }) {
    const touchEvent = /** @type {TouchEvent} */ (event);

    /**
     * 'touchend'
     */
    if (type === 'touchend' && 'changedTouches' in event) {
        return touchEvent.changedTouches[0];
    }

    /**
     * 'mousedown', 'touchstart', 'mousemove', 'touchmove', 'mouseup'
     */
    return 'touches' in touchEvent ? touchEvent.touches[0] : event;
}

/**
 * @param {import('./type.js').MouseEventType} eventType
 */
function handleMouse(eventType) {
    /**
     * @type {boolean}
     */
    let initialized = false;

    /**
     * @type {Map<string, import('./type.js').MouseEventCallback>}
     */
    const callbacks = new Map();

    let { usePassive } = eventStore.get();

    /**
     * Switch passive event on setUp change.
     */
    eventStore.watch('usePassive', () => {
        globalThis.removeEventListener(eventType, handler);
        initialized = false;

        init();
    });

    /**
     * @param {MouseEvent | TouchEvent} event
     */
    function handler(event) {
        /**
         * If - if there is no subscritor remove handler
         */
        if (callbacks.size === 0) {
            globalThis.removeEventListener(eventType, handler);

            initialized = false;
            return;
        }

        const type = /** @type {import('./type.js').MouseEventType} */ (
            event.type
        );

        /**
         * @type {{ pageX: number; pageY: number }}
         */
        const { pageX, pageY } = getPageData({ type, event });

        /**
         * @type {{ clientX: number; clientY: number }}
         */
        const { clientX, clientY } = getClientData({ type, event });

        /** @type {EventTarget | null} */
        const target = event.target;

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
            preventDefault: () =>
                usePassive ? () => {} : event.preventDefault(),
        };

        // Add spin value if is wheel event
        if (type === 'wheel') {
            const spinYMaxValue = eventStore.getProp('spinYMaxValue');
            const spinXMaxValue = eventStore.getProp('spinXMaxValue');
            const { spinX, spinY, pixelX, pixelY } = normalizeWheel(event);

            Object.assign(mouseData, {
                spinX: clamp(spinX, -spinXMaxValue, spinXMaxValue),
                spinY: clamp(spinY, -spinYMaxValue, spinYMaxValue),
                pixelX,
                pixelY,
            });
        }

        for (const value of callbacks.values()) {
            value(mouseData);
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
        usePassive = eventStore.getProp('usePassive');

        globalThis.addEventListener(eventType, handler, {
            passive: usePassive,
        });
    }

    /**
     * Add callback on mouse action
     *
     * @param {import('./type.js').MouseEventCallback} cb - Callback function fired on mouse action.
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

    return addCb;
}

/**
 * Add callback on mouse click
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleMouseClick(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleMouseClick = handleMouse('click');

/**
 * Add callback on mouse down
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleMouseDown(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleMouseDown = handleMouse('mousedown');

/**
 * Add callback on touch start
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleTouchStart(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleTouchStart = handleMouse('touchstart');

/**
 * Add callback on handleMouseMove
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleMouseMove(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleMouseMove = handleMouse('mousemove');

/**
 * Add callback on touch move
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleTouchMove(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleTouchMove = handleMouse('touchmove');

/**
 * Add callback on mouse up
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleMouseUp(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleMouseUp = handleMouse('mouseup');

/**
 * Add callback on touc end
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleTouchEnd(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleTouchEnd = handleMouse('touchend');

/**
 * Add callback on mouse wheel
 *
 * @example
 *     ```javascript
 *     const unsubscribe = handleMouseWheel(
 *         ({
 *             client,
 *             page,
 *             preventDefault,
 *             target,
 *             type,
 *             pixelX,
 *             pixelY,
 *             spinX,
 *             spinY,
 *         }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 */
export const handleMouseWheel = handleMouse('wheel');
