export { throttle } from './events/throttle.js';
export { debounceFuncion as debounce } from './events/debounce.js';
import { eventStore } from './events/event-store.js';
import { handleLoad } from './events/load-utils/handle-load.js';
import {
    handleMouseClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseWheel,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
} from './events/mouse-utils/handle-mouse.js';
import { handleCache } from './events/raf-utils/handle-cache.js';
import { handleFrame } from './events/raf-utils/handle-frame.js';
import { handleFrameIndex } from './events/raf-utils/handle-frame-index.js';
import { handleNextFrame } from './events/raf-utils/handle-next-frame.js';
import { handleNextTick } from './events/raf-utils/handle-next-tick.js';
import { loadFps } from './events/raf-utils/load-fps.js';
import { handleResize } from './events/resize-utils/handle-resize.js';
import { handleScroll } from './events/scroll-utils/handle-scroll.js';
import { handleScrollImmediate } from './events/scroll-utils/handle-scroll-immediate.js';
import { handleScrollThrottle } from './events/scroll-utils/handle-scroll-throttle.js';
import {
    handleScrollEnd,
    handleScrollStart,
} from './events/scroll-utils/handle-scroll-utils.js';
import { handleVisibilityChange } from './events/visibility-change/handle-visibility-change.js';
import { mobStore } from './store';
import {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerOut,
    handlePointerOver,
    handlePointerUp,
} from './events/pointer-event/handle-pointer.js';

/**
 * MobStore initialization. The store accepts single properties or objects Each individual property can be initialized
 * with a simple value or via a more complex setup. A complex set-up is created through a function that must return an
 * object with the property `value` and at least one of the following properties: `type` || `validation` || `skipEqual`
 *
 * || `strict`
 *
 * `value`: Initial value.
 *
 * `type`: Supported types: `String|Number|Object|Function|Array|Boolean|Element|HTMLElement|Map|Set|NodeList|"Any"`.
 * The property will not be updated if it doesn't match, you will have a warning. For custom Object use 'Any'. Support
 * Constructor || String. Es: type: Number || type: 'Number'
 *
 * `validation`: Validation function to parse value. This function will have the current value and old value as input
 * parameter and will return a boolean value. The validation status of each property will be displayed in the watchers
 * and will be retrievable using the getValidation() method.
 *
 * `strict`: If set to true, the validation function will become blocking and the property will be updated only if the
 * validation function is successful. THe default value is `false`.
 *
 * `skipEqual`: If the value is equal to the previous one, the property will not be updated. The watches will not be
 * executed and the property will have no effect on the computed related to it. The default value is `true`.
 *
 * @example
 *     ```javascript
 *
 *     const myStore = MobCore.createStore({
 *         prop1: 0,
 *         prop2: 0
 *     });
 *
 *     const myStore = MobCore.createStore({
 *         myProp: () => ({
 *             value: 10,
 *             type: Number,
 *             validate: (val, oldVal) => val < 10,
 *             strict: true,
 *             skipEqual: false,
 *         }),
 *         myPropWithObject: () => ({
 *             value: { prop: { prop1: 1}},
 *             type: 'Any',
 *         }),
 *         myObject: {
 *             prop1: () => ({
 *                 value: 0,
 *                 type: Number,
 *                 validate: (val, oldVal) => val < 10,
 *                 strict: true,
 *                 skipEqual: true,
 *             }),
 *             prop2: () => ({
 *                 value: document.createElement('div'),
 *                 type: Element,
 *             }),
 *         }
 *     });
 *
 *
 *
 *     Available methods:
 *     myStore.set();
 *     myStore.setProp();
 *     myStore.setProp();
 *     myStore.setObj();
 *     myStore.computed();
 *     myStore.get();
 *     myStore.getProp();
 *     myStore.getValidation();
 *     myStore.watch();
 *     myStore.emit();
 *     myStore.emitAsync();
 *     myStore.debugStore();
 *     myStore.debugValidate();
 *     myStore.setStyle();
 *     myStore.destroy();
 *     ```;
 *
 * @type {import('./store/type.js').MobStore}
 */
function createStore(data) {
    return mobStore(data);
}

/**
 * Get fps detect on page load. Start from 60fps. The real value is calculated after 30 Request animation frame.
 *
 * @returns {number}
 */
function getInstantFps() {
    return eventStore.getProp('instantFps');
}

/**
 * Get current fps value.
 *
 * @returns {number}
 */
function getFps() {
    return handleFrame.getFps();
}

/**
 * If the current FPS drops below `2/5` of its maximum value the methods return true. The value will remain frozen for 4
 * seconds in order to have time to take the right countermeasures.
 *
 * Note: created for mobMotion internal use.
 */
function mustMakeSomething() {
    return handleFrame.mustMakeSomething();
}

/**
 * If the current FPS drops below `1/5` of its maximum value the methods return true. The value will remain frozen for 4
 * seconds in order to have time to take the right countermeasures.
 *
 * Note: created for mobMotion internal use.
 */
function shouldMakeSomething() {
    return handleFrame.shouldMakeSomething();
}

/**
 * Execute a callBack within the first available request animation frame. Use this method to modify elements of the DOM
 *
 * @example
 *     ```javascript
 *     MobCore.useframe(({ fps, shouldrender, time }) => {
 *         // code ...
 *     });
 *
 *     ```;
 *
 * @param {import('./events/raf-utils/type.js').HandleFrameCallbak} callback - Callback function
 * @returns {void}
 */
function useFrame(callback = () => {}) {
    return handleFrame.add(callback);
}

/**
 * Execute callbacks after scheduling the request animation frame. Use this method to read data from the DOM. To execute
 * callbacks exactly after the request animation frame, set the global property deferredNextTick to true.
 *
 * @example
 *     ```javascript
 *     MobCore.useFrame(() => {
 *         MobCore.useNextTick(({ fps, time }) => {
 *             // code
 *         });
 *     });
 *
 *     Loop request animation frame using handleNextTick:
 *
 *     const loop = () => {
 *         MobCore.useNextTick(() => {
 *             // read from DOM
 *
 *             MobCore.useFrame(() => {
 *                 // write to the DOM
 *                 loop();
 *             });
 *         });
 *     };
 *
 *     MobCore.useFrame(() => loop());
 *
 *     To tick exactly after the request animation frame:
 *     MobCore.default('set', { deferredNextTick: true });
 *
 *     ```;
 *
 * @param {import('./events/raf-utils/type.js').HandleFrameCallbak} callback - Callback function
 * @returns {void}
 */
function useNextTick(callback = () => {}) {
    return handleNextTick.add(callback);
}

/**
 * Execute a callback to the next available frame allowing the creation of a request animation frame loop
 *
 * @example
 *     ```javascript
 *     const loop = () => {
 *         MobCore.useNextFrame(({ fps, time }) => {
 *             // code
 *             loop();
 *         });
 *     };
 *
 *     MobCore.useFrame(() => loop());
 *
 *     ```;
 *
 * @param {import('./events/raf-utils/type.js').HandleFrameCallbak} callback - Callback function
 * @returns {void}
 */
function useNextFrame(callback = () => {}) {
    return handleNextFrame.add(callback);
}

/**
 * Add callback to a specific frame.
 *
 * @example
 *     ```javascript
 *     MobCore.useFrameIndex(({ fps, time }) => {
 *         // code ...
 *     }, 5);
 *
 *     ```;
 *
 * @param {import('./events/raf-utils/type.js').HandleFrameCallbak} callback - Callback function
 * @param {number} frame
 * @returns {void}
 */
function useFrameIndex(callback = () => {}, frame = 0) {
    return handleFrameIndex.add(callback, frame);
}

/**
 * Runs a request animation frame loop to detect the frame rate of the monitor. After the method will be resolved the
 * first time, subsequent calls will be resolved immediately returning the previously calculated value. The method is
 * launched the first time automatically at the first loading.
 *
 * @param {import('./events/raf-utils/type.js').LoadFpsCall} callback - Callback function
 * @returns {Promise<{ averageFPS: number }>}
 */
async function useFps(callback = () => {}) {
    const obj = await loadFps();
    callback(obj);
    return obj;
}

/**
 * Add callback on page load
 *
 * @example
 *     ```javascript
 *
 *     MobCore.useLoad(() => {
 *         // code
 *     });
 *
 *     ```;
 *
 * @param {function():void} callback - Callback function executed on page load
 * @returns {() => void}
 */
function useLoad(callback = () => {}) {
    return handleLoad(callback);
}

/**
 * Get handleCache function.
 *
 * Note: created for mobMotion internal use.
 */
const useCache = handleCache;

/**
 * Add callback on resize using a debounce function.
 *
 * @example
 *     ```javascript
 *      const unsubscribe = MobCore.useResize(
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
 * @param {import('./events/resize-utils/type.js').HandleResizeCallback} callback - Callback function fired on resize.
 * @returns {() => void}
 */
function useResize(callback = () => {}) {
    return handleResize(callback);
}

/**
 * Add callback on tab change.
 *
 * @example
 *     ```javascript
 *      const unsubscribe = MobCore.useVisibilityChange(({ visibilityState }) => {
 *          // code
 *      });
 *
 *      unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/visibility-change/type.js').VisibilityChangeCallback} callback - Callback function fired on
 *   tab change.
 * @returns {() => void}
 */
function useVisibilityChange(callback = () => {}) {
    return handleVisibilityChange(callback);
}

/**
 * Add callback on mouse click
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useMouseClick(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on mouse click.
 * @returns {() => void}
 */
function useMouseClick(callback = () => {}) {
    return handleMouseClick(callback);
}

/**
 * Add callback on mouse down
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useMouseDown(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on mouse down.
 * @returns {() => void}
 */
function useMouseDown(callback = () => {}) {
    return handleMouseDown(callback);
}

/**
 * Add callback on touch start
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useTouchStart(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on mouse touch
 *   start.
 * @returns {() => void}
 */
function useTouchStart(callback = () => {}) {
    return handleTouchStart(callback);
}

/**
 * Add callback on mouse move
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useMouseMove(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on mouse move.
 * @returns {() => void}
 */
function useMouseMove(callback = () => {}) {
    return handleMouseMove(callback);
}

/**
 * Add callback on touch move
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useTouchMove(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on touch move.
 * @returns {() => void}
 */
function useTouchMove(callback = () => {}) {
    return handleTouchMove(callback);
}

/**
 * Add callback on mouse up
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useMouseUp(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on mouse up.
 * @returns {() => void}
 */
function useMouseUp(callback = () => {}) {
    return handleMouseUp(callback);
}

/**
 * Add callback on touch end.
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useTouchEnd(
 *         ({ client, page, preventDefault, target, type }) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on touch end.
 * @returns {() => void}
 */
function useTouchEnd(callback = () => {}) {
    return handleTouchEnd(callback);
}

/**
 * Add callback on mouse wheel.
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useMouseWheel(
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
 *
 * @param {import('./events/mouse-utils/type.js').MouseEventCallback} callback - Callback function fired on mouse wheel.
 * @returns {() => void}
 */
function useMouseWheel(callback = () => {}) {
    return handleMouseWheel(callback);
}

/**
 * Perform a callback to the first nextTick available after scrolling
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useScroll(({ direction, scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/scroll-utils/type.js').HandleScrollCallback<
 *     import('./events/scroll-utils/type.js').HandleScroll
 * >} callback
 *   - Callback function
 *
 * @returns {() => void} Unsubscribe callback
 */
function useScroll(callback = () => {}) {
    return handleScroll(callback);
}

/**
 * Execute a callback immediately on scroll
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useScrollImmediate(({ direction, scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/scroll-utils/type.js').HandleScrollCallback<
 *     import('./events/scroll-utils/type.js').HandleScroll
 * >} callback
 *   - Callback function
 *
 * @returns {() => void} Unsubscribe callback
 */
function useScrollImmediate(callback = () => {}) {
    return handleScrollImmediate(callback);
}

/**
 * Performs a scroll callback using a throttle function
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useScrollThrottle(({ direction, scrollY }) => {
 *        // code
 *     });
 *
 *     unsubscribe();
 *
 *     To change the duration of the throttle, change the value of the throttle property to the defaults:
 *     TODO
 *     Use store.
 *
 *
 *
 *     ```;
 *
 * @param {import('./events/scroll-utils/type.js').HandleScrollCallback<
 *     import('./events/scroll-utils/type.js').HandleScroll
 * >} callback
 *   - Callback function
 *
 * @returns {() => void} Unsubscribe callback
 */
function useScrollThrottle(callback = () => {}) {
    return handleScrollThrottle(callback);
}

/**
 * Execute a callback at the beginning of the scroll
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useScrollStart(({ scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/scroll-utils/type.js').HandleScrollCallback<
 *     import('./events/scroll-utils/type.js').HandleScrollUtils
 * >} callback
 *   - Callback function
 *
 * @returns {() => void} Unsubscribe callback
 */
function useScrollStart(callback = () => {}) {
    return handleScrollStart(callback);
}

/**
 * Execute a callback at the end of the scroll
 *
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.useScrollEnd(({ scrollY }) => {
 *         // code
 *     });
 *
 *     unsubscribe()
 *
 *     ```;
 *
 * @param {import('./events/scroll-utils/type.js').HandleScrollCallback<
 *     import('./events/scroll-utils/type.js').HandleScrollUtils
 * >} callback
 *   - Callback function
 *
 * @returns {() => void}
 */
function useScrollEnd(callback = () => {}) {
    return handleScrollEnd(callback);
}

/**
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.usePointerOver((event) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/pointer-event/type.js').PointerEventCallback} callback - Callback function
 * @returns {() => void}
 */
function usePointerOver(callback = () => {}) {
    return handlePointerOver(callback);
}

/**
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.usePointerDown((event) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/pointer-event/type.js').PointerEventCallback} callback - Callback function
 * @returns {() => void}
 */
function usePointerDown(callback = () => {}) {
    return handlePointerDown(callback);
}

/**
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.usePointerMove((event) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/pointer-event/type.js').PointerEventCallback} callback - Callback function
 * @returns {() => void}
 */
function usePointerMove(callback = () => {}) {
    return handlePointerMove(callback);
}

/**
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.usePointerUp((event) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/pointer-event/type.js').PointerEventCallback} callback - Callback function
 * @returns {() => void}
 */
function usePointerUp(callback = () => {}) {
    return handlePointerUp(callback);
}

/**
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.usePointerOut((event) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/pointer-event/type.js').PointerEventCallback} callback - Callback function
 * @returns {() => void}
 */
function usePointerOut(callback = () => {}) {
    return handlePointerOut(callback);
}

/**
 * @example
 *     ```javascript
 *     const unsubscribe = MobCore.usePointerLeave((event) => {
 *             // code
 *         }
 *     );
 *
 *     unsubscribe();
 *
 *     ```;
 *
 * @param {import('./events/pointer-event/type.js').PointerEventCallback} callback - Callback function
 * @returns {() => void}
 */
function usePointerLeave(callback = () => {}) {
    return handlePointerLeave(callback);
}

/**
 * Get event store ( es modify defaults or get current value ) Props:
 *
 * - UsePassive: true
 * - InstantFps: 60
 * - DeferredNextTick: true
 * - Throttle: 60
 *
 * @example
 *     ``` javascript
 *     MobCore.store.set('throttle', 300);
 *     const { throttle } = MobCore.store.get();
 *     ....
 *
 *     ```;
 *
 * @returns {Object}
 */
const store = eventStore;

export {
    store,
    usePointerLeave,
    usePointerOut,
    usePointerUp,
    usePointerMove,
    usePointerDown,
    usePointerOver,
    useScrollEnd,
    useScrollStart,
    useScrollThrottle,
    useScrollImmediate,
    useScroll,
    useMouseWheel,
    useTouchEnd,
    useMouseUp,
    useTouchMove,
    useMouseMove,
    useTouchStart,
    useMouseDown,
    useMouseClick,
    useVisibilityChange,
    useResize,
    useCache,
    useLoad,
    useFps,
    useFrameIndex,
    useNextFrame,
    useNextTick,
    useFrame,
    shouldMakeSomething,
    mustMakeSomething,
    getFps,
    getInstantFps,
    createStore,
};

export { normalizeWheel } from './events/mouse-utils/normalize-whell.js';
export { ANIMATION_STOP_REJECT } from './events/error-handler/catch-animation-reject.js';
export { useNextLoop } from './utils/next-tick.js';
export { getTime } from './events/raf-utils/time.js';
export { checkType, getTypeName } from './store/store-type.js';
export { getUnivoqueId } from './utils/index.js';
export { debounceFuncion as useDebounce } from './events/debounce.js';
