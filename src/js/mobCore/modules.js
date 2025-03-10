import { eventStore } from './events/eventStore.js';
import { handleLoad } from './events/loadutils/handleLoad.js';
import {
    handleMouseClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseWheel,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
} from './events/mouseUtils/handleMouse.js';
import { handleCache } from './events/rafutils/handleCache.js';
import { handleFrame } from './events/rafutils/handleFrame.js';
import { handleFrameIndex } from './events/rafutils/handleFrameIndex.js';
import { handleNextFrame } from './events/rafutils/handleNextFrame.js';
import { handleNextTick } from './events/rafutils/handleNextTick.js';
import { loadFps } from './events/rafutils/loadFps.js';
import { handleResize } from './events/resizeUtils/handleResize.js';
import { handleScroll } from './events/scrollUtils/handleScroll.js';
import { handleScrollImmediate } from './events/scrollUtils/handleScrollImmediate.js';
import { handleScrollThrottle } from './events/scrollUtils/handleScrollThrottle.js';
import {
    handleScrollEnd,
    handleScrollStart,
} from './events/scrollUtils/handleScrollUtils';
import { handleVisibilityChange } from './events/visibilityChange/handleVisibilityChange.js';
import { mobStore } from './store';
import {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerOut,
    handlePointerOver,
    handlePointerUp,
} from './events/pointerEvent/handlePointer.js';

/**
 * @description
 * MobStore initialization.
 * The store accepts single properties or objects
 *  Each individual property can be initialized with a simple value or via a more complex setup.
 *  A complex set-up is created through a function that must return an object with the property `value` and at least one of the following properties:
 *  `type` || `validation` || `skipEqual` || `strict`
 *
 * `value`:
 *  Initial value.
 *
 * `type`:
 *  Supported types:
 * `String|Number|Object|Function|Array|Boolean|Element|HTMLElement|Map|Set|NodeList|"Any"`.
 *  The property will not be updated if it doesn't match, you will have a warning.
 *  For custom Object use 'Any'.
 *  Support Constructor || String.
 *  Es: type: Number || type: 'Number'
 *
 *  `validation`:
 *  Validation function to parse value.
 *  This function will have the current value and old value as input parameter and will return a boolean value.
 *  The validation status of each property will be displayed in the watchers and will be retrievable using the getValidation() method.
 *
 *  `strict`:
 *  If set to true, the validation function will become blocking and the property will be updated only if the validation function is successful.
 *  THe default value is `false`.
 *
 *  `skipEqual`:
 *  If the value is equal to the previous one, the property will not be updated. The watches will not be executed and the property will have no effect on the computed related to it.
 *  The default value is `true`.
 *
 *
 * @type {import('./store/type.js').MobStore}
 *
 * @example
 *
 * ```javascript
 *
 * const myStore = MobCore.createStore({
 *     prop1: 0,
 *     prop2: 0
 * });
 *
 * const myStore = MobCore.createStore({
 *     myProp: () => ({
 *         value: 10,
 *         type: Number,
 *         validate: (val, oldVal) => val < 10,
 *         strict: true,
 *         skipEqual: false,
 *     }),
 *     myPropWithObject: () => ({
 *         value: { prop: { prop1: 1}},
 *         type: 'Any',
 *     }),
 *     myObject: {
 *         prop1: () => ({
 *             value: 0,
 *             type: Number,
 *             validate: (val, oldVal) => val < 10,
 *             strict: true,
 *             skipEqual: true,
 *         }),
 *         prop2: () => ({
 *             value: document.createElement('div'),
 *             type: Element,
 *         }),
 *     }
 * });
 *
 *
 *
 * Available methods:
 * myStore.set();
 * myStore.setProp();
 * myStore.setProp();
 * myStore.setObj();
 * myStore.computed();
 * myStore.get();
 * myStore.getProp();
 * myStore.getValidation();
 * myStore.watch();
 * myStore.emit();
 * myStore.emitAsync();
 * myStore.debugStore();
 * myStore.debugValidate();
 * myStore.setStyle();
 * myStore.destroy();
 * ```
 */
function createStore(data) {
    return mobStore(data);
}

/**
 * @returns {number}
 *
 * @description
 * Get fps detect on page load.
 * Start from 60fps.
 * The real value is calculated after 30 Request animation frame.
 */
function getInstantFps() {
    return eventStore.getProp('instantFps');
}

/**
 * @returns {number}
 *
 * @description
 * Get current fps value.
 */
function getFps() {
    return handleFrame.getFps();
}

/**
 * @description
 * If the current FPS drops below `2/5` of its maximum value the methods return true.
 * The value will remain frozen for 4 seconds in order to have time to take the right countermeasures.
 *
 * Note: created for mobMotion internal use.
 */
function mustMakeSomething() {
    return handleFrame.mustMakeSomething();
}

/**
 * @description
 * If the current FPS drops below `1/5` of its maximum value the methods return true.
 * The value will remain frozen for 4 seconds in order to have time to take the right countermeasures.
 *
 * Note: created for mobMotion internal use.
 *
 */
function shouldMakeSomething() {
    return handleFrame.shouldMakeSomething();
}

/**
 * @description
 * Execute a callBack within the first available request animation frame.
 * Use this method to modify elements of the DOM
 *
 * @param {import('./events/rafutils/type.js').HandleFrameCallbak} callback - callback function
 * @returns {void}
 *
 * @example
 * ```javascript
 * MobCore.useframe(({ fps, shouldrender, time }) => {
 *     // code ...
 * });
 *
 * ```
 */
function useFrame(callback = () => {}) {
    return handleFrame.add(callback);
}

/**
 * @description
 * Execute callbacks after scheduling the request animation frame. Use this method to read data from the DOM. To execute callbacks exactly after the request animation frame, set the global property deferredNextTick to true.
 *
 * @param {import('./events/rafutils/type.js').HandleFrameCallbak} callback - callback function
 * @returns {void}
 *
 * @example
 * ```javascript
 * MobCore.useFrame(() => {
 *     MobCore.useNextTick(({ fps, time }) => {
 *         // code
 *     });
 * });
 *
 * Loop request animation frame using handleNextTick:
 *
 * const loop = () => {
 *     MobCore.useNextTick(() => {
 *         // read from DOM
 *
 *         MobCore.useFrame(() => {
 *             // write to the DOM
 *             loop();
 *         });
 *     });
 * };
 *
 * MobCore.useFrame(() => loop());
 *
 * To tick exactly after the request animation frame:
 * MobCore.default('set', { deferredNextTick: true });
 *
 * ```
 */
function useNextTick(callback = () => {}) {
    return handleNextTick.add(callback);
}

/**
 * @description
 * Execute a callback to the next available frame allowing the creation of a request animation frame loop
 *
 * @param {import('./events/rafutils/type.js').HandleFrameCallbak} callback - callback function
 * @returns {void}
 *
 * @example
 * ```javascript
 * const loop = () => {
 *     MobCore.useNextFrame(({ fps, time }) => {
 *         // code
 *         loop();
 *     });
 * };
 *
 * MobCore.useFrame(() => loop());
 *
 * ```
 */
function useNextFrame(callback = () => {}) {
    return handleNextFrame.add(callback);
}

/**
 * @description
 * Add callback to a specific frame.
 *
 * @param {import('./events/rafutils/type.js').HandleFrameCallbak} callback - callback function
 * @param {number} frame
 * @returns {void}
 *
 * @example
 * ```javascript
 * MobCore.useFrameIndex(({ fps, time }) => {
 *     // code ...
 * }, 5);
 *
 * ```
 */
function useFrameIndex(callback = () => {}, frame = 0) {
    return handleFrameIndex.add(callback, frame);
}

/**
 * @description
 * Runs a request animation frame loop to detect the frame rate of the monitor.
 * After the method will be resolved the first time, subsequent calls will be resolved immediately returning the previously calculated value.
 * The method is launched the first time automatically at the first loading.
 *
 * @param {import('./events/rafutils/type.js').LoadFpsCall} callback - callback function
 * @return {Promise<{averageFPS: number}>}
 *
 */
async function useFps(callback = () => {}) {
    const obj = await loadFps();
    callback(obj);
    return obj;
}

/**
 * @description
 * Add callback on page load
 *
 * @param {function():void } callback - Callback function executed on page load
 * @returns {() => void}
 *
 * @example
 * ```javascript
 *
 * MobCore.useLoad(() => {
 *     // code
 * });
 *
 * ```
 */
function useLoad(callback = () => {}) {
    return handleLoad(callback);
}

/**
 * @description
 * Get handleCache function.
 *
 * Note: created for mobMotion internal use.
 */
const useCache = handleCache;

/**
 * @description
 * Add callback on resize using a debounce function.
 *
 * @param {import('./events/resizeUtils/type.js').HandleResizeCallback} callback - callback function fired on resize.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * MobCore.useResize(
 *     ({
 *         documentHeight,
 *         horizontalResize,
 *         scrollY,
 *         verticalResize,
 *         windowsHeight,
 *         windowsWidth,
 *     }) => {
 *         // code
 *     }
 * );
 *
 * ```
 */
function useResize(callback = () => {}) {
    return handleResize(callback);
}

/**
 * @description
 * Add callback on tab change.
 *
 * @param {import('./events/visibilityChange/type.js').VisibilityChangeCallback} callback - callback function fired on tab change.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 *  const unsubscribe = MobCore.useVisibilityChange(({ visibilityState }) => {
 *      // code
 *  });
 *
 *  unsubscribe();
 *
 * ```
 */
function useVisibilityChange(callback = () => {}) {
    return handleVisibilityChange(callback);
}

/**
 * @description
 * Add callback on mouse click
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on mouse click.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useMouseClick(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function useMouseClick(callback = () => {}) {
    return handleMouseClick(callback);
}

/**
 * @description
 * Add callback on mouse down
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on mouse down.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useMouseDown(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function useMouseDown(callback = () => {}) {
    return handleMouseDown(callback);
}

/**
 * @description
 * Add callback on touch start
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on mouse touch start.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useTouchStart(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function useTouchStart(callback = () => {}) {
    return handleTouchStart(callback);
}

/**
 * @description
 * Add callback on mouse move
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on mouse move.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useMouseMove(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function useMouseMove(callback = () => {}) {
    return handleMouseMove(callback);
}

/**
 * @description
 * Add callback on touch move
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on touch move.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useTouchMove(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function useTouchMove(callback = () => {}) {
    return handleTouchMove(callback);
}

/**
 * @description
 * Add callback on mouse up
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on mouse up.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useMouseUp(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function useMouseUp(callback = () => {}) {
    return handleMouseUp(callback);
}

/**
 * @description
 * Add callback on touch end.
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on touch end.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useTouchEnd(
 *     ({ client, page, preventDefault, target, type }) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function useTouchEnd(callback = () => {}) {
    return handleTouchEnd(callback);
}

/**
 * @description
 * Add callback on mouse wheel.
 *
 * @param {import('./events/mouseUtils/type.js').MouseEventCallback} callback - callback function fired on mouse wheel.
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useMouseWheel(
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
function useMouseWheel(callback = () => {}) {
    return handleMouseWheel(callback);
}

/**
 * @description
 * Perform a callback to the first nextTick available after scrolling
 *
 * @param {import('./events/scrollUtils/type.js').HandleScrollCallback<import('./events/scrollUtils/type.js').HandleScroll>} callback - callback function
 * @return {() => void} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useScroll(({ direction, scrollY }) => {
 *     // code
 * });
 *
 * unsubscribe();
 *
 * ```
 */
function useScroll(callback = () => {}) {
    return handleScroll(callback);
}

/**
 * @description
 * Execute a callback immediately on scroll
 *
 * @param {import('./events/scrollUtils/type.js').HandleScrollCallback<import('./events/scrollUtils/type.js').HandleScroll>} callback - callback function
 * @return {() => void} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useScrollImmediate(({ direction, scrollY }) => {
 *     // code
 * });
 *
 * unsubscribe();
 *
 * ```
 */
function useScrollImmediate(callback = () => {}) {
    return handleScrollImmediate(callback);
}

/**
 * @description
 * Performs a scroll callback using a throttle function
 *
 * @param {import('./events/scrollUtils/type.js').HandleScrollCallback<import('./events/scrollUtils/type.js').HandleScroll>} callback - callback function
 * @return {() => void} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useScrollThrottle(({ direction, scrollY }) => {
 *    // code
 * });
 *
 * unsubscribe();
 *
 * To change the duration of the throttle, change the value of the throttle property to the defaults:
 * TODO
 * Use store.
 *
 *
 *
 * ```
 */
function useScrollThrottle(callback = () => {}) {
    return handleScrollThrottle(callback);
}

/**
 * @description
 * Execute a callback at the beginning of the scroll
 *
 * @param {import('./events/scrollUtils/type.js').HandleScrollCallback<import('./events/scrollUtils/type.js').HandleScrollUtils>} callback - callback function
 * @return {() => void} unsubscribe callback
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useScrollStart(({ scrollY }) => {
 *     // code
 * });
 *
 * unsubscribe();
 *
 * ```
 */
function useScrollStart(callback = () => {}) {
    return handleScrollStart(callback);
}

/**
 * @description
 * Execute a callback at the end of the scroll
 *
 * @param {import('./events/scrollUtils/type.js').HandleScrollCallback<import('./events/scrollUtils/type.js').HandleScrollUtils>} callback - callback function
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.useScrollEnd(({ scrollY }) => {
 *     // code
 * });
 *
 * unsubscribe()
 *
 * ```
 */
function useScrollEnd(callback = () => {}) {
    return handleScrollEnd(callback);
}

/**
 * @param {import('./events/pointerEvent/type.js').PointerEventCallback} callback - callback function
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.usePointerOver((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function usePointerOver(callback = () => {}) {
    return handlePointerOver(callback);
}

/**
 * @param {import('./events/pointerEvent/type.js').PointerEventCallback} callback - callback function
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.usePointerDown((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function usePointerDown(callback = () => {}) {
    return handlePointerDown(callback);
}

/**
 * @param {import('./events/pointerEvent/type.js').PointerEventCallback} callback - callback function
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.usePointerMove((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function usePointerMove(callback = () => {}) {
    return handlePointerMove(callback);
}

/**
 * @param {import('./events/pointerEvent/type.js').PointerEventCallback} callback - callback function
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.usePointerUp((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function usePointerUp(callback = () => {}) {
    return handlePointerUp(callback);
}

/**
 * @param {import('./events/pointerEvent/type.js').PointerEventCallback} callback - callback function
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.usePointerOut((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function usePointerOut(callback = () => {}) {
    return handlePointerOut(callback);
}

/**
 * @param {import('./events/pointerEvent/type.js').PointerEventCallback} callback - callback function
 * @returns {() => void}
 *
 * @example
 * ```javascript
 * const unsubscribe = MobCore.usePointerLeave((event) => {
 *         // code
 *     }
 * );
 *
 * unsubscribe();
 *
 * ```
 */
function usePointerLeave(callback = () => {}) {
    return handlePointerLeave(callback);
}

/**
 * @returns {Object}
 *
 * @description
 * Get event store ( es modify defaults or get current value )
 * Props:
 * - usePassive: true
 * - instantFps: 60
 * - deferredNextTick: true
 * - throttle: 60
 *
 *
 * @example
 * ``` javascript
 * MobCore.store.set('throttle', 300);
 * const { throttle } = MobCore.store.get();
 * ....
 *
 * ```
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

export { normalizeWheel } from './events/mouseUtils/normalizeWhell.js';
export { ANIMATION_STOP_REJECT } from './events/errorHandler/catchAnimationReject.js';
export { useNextLoop } from './utils/nextTick.js';
export { getTime } from './events/rafutils/time.js';
export { checkType, getTypeName } from './store/storeType.js';
export { getUnivoqueId } from './utils/index.js';
