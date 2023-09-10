import { ANIMATION_STOP_REJECT } from './events/errorHandler/catchAnimationReject.js';
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
import { normalizeWheel } from './events/mouseUtils/normalizeWhell.js';
import { handleCache } from './events/rafutils/handleCache.js';
import { handleFrame } from './events/rafutils/handleFrame.js';
import { handleFrameIndex } from './events/rafutils/handleFrameIndex.js';
import { handleNextFrame } from './events/rafutils/handleNextFrame.js';
import { handleNextTick } from './events/rafutils/handleNextTick.js';
import { loadFps } from './events/rafutils/loadFps.js';
import { getTime } from './events/rafutils/time.js';
import { handleResize } from './events/resizeUtils/handleResize.js';
import { handleScroll } from './events/scrollUtils/handleScroll.js';
import { handleScrollImmediate } from './events/scrollUtils/handleScrollImmediate.js';
import { handleScrollThrottle } from './events/scrollUtils/handleScrollThrottle.js';
import {
    handleScrollEnd,
    handleScrollStart,
} from './events/scrollUtils/handleScrollUtils';
import { handleVisibilityChange } from './events/visibilityChange/handleVisibilityChange.js';
import { SimpleStore } from './store/simpleStore.js';
import { checkType, getTypeName } from './store/storeType.js';

/**
 * @typedef {import('./store/simpleStore').SimpleStoreType} MobbuStoreType
 */

export const mobCore = {
    /**
     * @description
     * SimpleStore inizialization.
     * The store accepts single properties or objects
       Each individual property can be initialized with a simple value or via a more complex setup.
       A complex set-up is created through a function that must return an object with the property `value` and at least one of the following properties:
       `type` || `validation` || `skipEqual` || `strict`
     *
      `value`:
       Initial value.

      `type`:
       Supported types:
      `String|Number|Object|Function|Array|Boolean|Element|HTMLElement|Map|Set|NodeList|"Any"`.
       The property will not be updated if it doesn't match, you will have a waring.
       For custom Object use 'Any'.
       Support Contructor || String.
       Es: type: Number || type: 'Number'

       `validation`:
       Validation function to parse value.
       This function will have the current value and old value as input parameter and will return a boolean value.
       The validation status of each property will be displayed in the watchers and will be retrievable using the getValidation() method.

       `strict`:
       If set to true, the validation function will become blocking and the property will be updated only if the validation function is successful.
       THe default value is `false`.

       `skipEqual`:
       If the value is equal to the previous one, the property will not be updated. The watches will not be executed and the property will have no effect on the computed related to it.
       The default value is `true`.
     *
     *
     * @param {import('./store/simpleStore.js').SimpleStoreType} data
     *
     * @example
     *
     * ```javascript
     *
     * const myStore = mobCore.createStore({
     *     prop1: 0,
     *     prop2: 0
     * });
     *
     * const myStore = mobCore.createStore({
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
    createStore(data = {}) {
        return new SimpleStore(data);
    },

    getInstantFps() {
        return eventStore.getProp('instantFps');
    },

    getFps() {
        return handleFrame.getFps();
    },

    getShouldRender() {
        return handleFrame.getShouldRender();
    },

    /**
     * @description
      If the current FPS drops below `2/5` of its maximum value the methods return true.
      The value will remain frozen for 4 seconds in order to have time to take the right countermeasures.
     *
     */
    mustMakeSomething() {
        return handleFrame.mustMakeSomething();
    },

    /**
     * @description
      If the current FPS drops below `1/5` of its maximum value the methods return true.
      The value will remain frozen for 4 seconds in order to have time to take the right countermeasures.
     *
     */
    shouldMakeSomething() {
        return handleFrame.shouldMakeSomething();
    },

    /**
     * @description
    Execute a callBack within the first available request animation frame.
    Use this method to modify elements of the DOM
     *
     * @param {function(import('./events/rafutils/handleFrame.js').handleFrameTypes):void } callback - callback function
     *
     * @example
     * ```javascript
     * mobCore.useframe(({ fps, shouldrender, time }) => {
     *     // code ...
     * });
     *
     * ```
     */
    useFrame(callback = () => {}) {
        return handleFrame.add(callback);
    },

    /**
     * @description
     * Execute callbacks after scheduling the request animation frame. Use this method to read data from the DOM. To execute callbacks exactly after the request animation frame, set the global property deferredNextTick to true.
     *
     * @param {function(import('./events/rafutils/handleFrame.js').handleFrameTypes):void } callback - callback function
     *
     * @example
     * ```javascript
     * mobCore.useFrame(() => {
     *     mobCore.useNextTick(({ fps, shouldRender, time }) => {
     *         // code
     *     });
     * });
     *
     * Loop request animation frame using handleNextTick:
     *
     * const loop = () => {
     *     mobCore.useNextTick(() => {
     *         // read from DOM
     *
     *         mobCore.useFrame(() => {
     *             // write to the DOM
     *             loop();
     *         });
     *     });
     * };
     *
     * mobCore.useFrame(() => loop());
     *
     * To tick exactly after the request animation frame:
     * mobCore.default('set', { deferredNextTick: true });
     *
     * ```
     */
    useNextTick(callback = () => {}) {
        return handleNextTick.add(callback);
    },

    /**
     * @description
     * Execute a callback to the next available frame allowing the creation of a request animation frame loop
     *
     * @param {function(import('./events/rafutils/handleFrame.js').handleFrameTypes):void } callback - callback function
     *
     * @example
     * ```javascript
     * const loop = () => {
     *     mobCore.useNextFrame(({ fps, shouldRender, time }) => {
     *         // code
     *         loop();
     *     });
     * };
     *
     * mobCore.useFrame(() => loop());
     *
     * ```
     */
    useNextFrame(callback = () => {}) {
        return handleNextFrame.add(callback);
    },

    /**
     * @description
     * Add callback to a specific frame.
     *
     * @param {function(import('./events/rafutils/handleFrame.js').handleFrameTypes):void } callback - callback function
     * @pram {number} index
     *
     * @example
     * ```javascript
     * mobCore.useFrameIndex(({ fps, shouldRender, time }) => {
     *     // code ...
     * }, 5);
     *
     * ```
     */
    useFrameIndex(callback = () => {}, frame = 0) {
        return handleFrameIndex.add(callback, frame);
    },

    /**
     * @description
        Runs a request animation frame loop to detect the frame rate of the monitor.
        After the method will be resolved the first time, subsequent calls will be resolved immediately returning the previously calculated value.
        The method is launched the first time automatically at the first loading.
     *
     * @param {function(import('./events/rafutils/loadFps.js').loadFpsType):void } callback - callback function
     * @return {Promise}
     *
     */
    async useFps(callback = () => {}) {
        const obj = await loadFps();
        callback(obj);
        return obj;
    },

    /**
     * @description
     * Add callback on page load
     *
     * @param {function():void } callback - Callback function executed on page load
     *
     * @example
     * ```javascript
     *
     * mobCore.useLoad(() => {
     *     // code
     * });
     *
     * ```
     */
    useLoad(callback = () => {}) {
        return handleLoad(callback);
    },

    useCache: handleCache,

    /**
     * @description
     * Add callback on resize using a debounce function.
     *
     * @param {function(import('./events/resizeUtils/handleResize.js').handleResizeTypes):void } callback - callback function fired on resize.
     *
     * @example
     * ```javascript
     * mobCore.useResize(
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
    useResize(callback = () => {}) {
        return handleResize(callback);
    },

    /**
     * @description
     * Add callback on resize using a debounce function.
     *
     * @param {function(import('./events/visibilityChange/handleVisibilityChange.js').visibilityChangeTYpe):void } callback - callback function fired on tab change.
     *
     * @example
     * ```javascript
     *  const unsubscribe = mobCore.useVisibilityChange(({ visibilityState }) => {
     *      // code
     *  });
     *
     *  unsubscribe();
     *
     * ```
     */
    useVisibilityChange(callback = () => {}) {
        return handleVisibilityChange(callback);
    },

    /**
     * @description
     * Add callback on mouse click
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on mouse click.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useMouseClick(
     *     ({ client, page, preventDefault, target, type }) => {
     *         // code
     *     }
     * );
     *
     * unsubscribe();
     *
     * ```
     */
    useMouseClick(callback = () => {}) {
        return handleMouseClick(callback);
    },

    /**
     * @description
     * Add callback on mouse down
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on mouse down.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useMouseDown(
     *     ({ client, page, preventDefault, target, type }) => {
     *         // code
     *     }
     * );
     *
     * unsubscribe();
     *
     * ```
     */
    useMouseDown(callback = () => {}) {
        return handleMouseDown(callback);
    },

    /**
     * @description
     * Add callback on touch start
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on mouse touch start.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useTouchStart(
     *     ({ client, page, preventDefault, target, type }) => {
     *         // code
     *     }
     * );
     *
     * unsubscribe();
     *
     * ```
     */
    useTouchStart(callback = () => {}) {
        return handleTouchStart(callback);
    },

    /**
     * @description
     * Add callback on mouse move
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on mouse move.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useMouseMove(
     *     ({ client, page, preventDefault, target, type }) => {
     *         // code
     *     }
     * );
     *
     * unsubscribe();
     *
     * ```
     */
    useMouseMove(callback = () => {}) {
        return handleMouseMove(callback);
    },

    /**
     * @description
     * Add callback on touch move
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on touch move.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useTouchMove(
     *     ({ client, page, preventDefault, target, type }) => {
     *         // code
     *     }
     * );
     *
     * unsubscribe();
     *
     * ```
     */
    useTouchMove(callback = () => {}) {
        return handleTouchMove(callback);
    },

    /**
     * @description
     * Add callback on mouse up
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on mouse up.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useMouseUp(
     *     ({ client, page, preventDefault, target, type }) => {
     *         // code
     *     }
     * );
     *
     * unsubscribe();
     *
     * ```
     */
    useMouseUp(callback = () => {}) {
        return handleMouseUp(callback);
    },

    /**
     * @description
     * Add callback on touch end.
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on touch end.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useTouchEnd(
     *     ({ client, page, preventDefault, target, type }) => {
     *         // code
     *     }
     * );
     *
     * unsubscribe();
     *
     * ```
     */
    useTouchEnd(callback = () => {}) {
        return handleTouchEnd(callback);
    },

    /**
     * @description
     * Add callback on mouse wheel.
     *
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType):void } callback - callback function fired on mouse wheel.
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useMouseWheel(
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
    useMouseWheel(callback = () => {}) {
        return handleMouseWheel(callback);
    },

    /**
     * @description
     * Perform a callback to the first nextTick available after scrolling
     *
     * @param {function(import('./events/scrollUtils/handleScrollImmediate.js').handleScrollType):void } callback - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useScroll(({ direction, scrollY }) => {
     *     // code
     * });
     *
     * unsubscribe();
     *
     * ```
     */
    useScroll(callback = () => {}) {
        return handleScroll(callback);
    },

    /**
     * @description
     * Execute a callback immediately on scroll
     *
     * @param {function(import('./events/scrollUtils/handleScrollImmediate.js').handleScrollType):void } callback - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useScrollImmediate(({ direction, scrollY }) => {
     *     // code
     * });
     *
     * unsubscribe();
     *
     * ```
     */
    useScrollImmediate(callback = () => {}) {
        return handleScrollImmediate(callback);
    },

    /**
     * @description
     * Performs a scroll callback using a throttle function
     *
     * @param {function(import('./events/scrollUtils/handleScrollImmediate.js').handleScrollType):void } callback - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useScrollThrottle(({ direction, scrollY }) => {
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
    useScrollThrottle(callback = () => {}) {
        return handleScrollThrottle(callback);
    },

    /**
     * @description
     * Execute a callback at the beginning of the scroll
     *
     * @param {function(import('./events/scrollUtils/handleScrollUtils').handleScrollUtilsType):void } callback - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useScrollStart(({ scrollY }) => {
     *     // code
     * });
     *
     * unsubscribe();
     *
     * ```
     */
    useScrollStart(callback = () => {}) {
        return handleScrollStart(callback);
    },

    /**
     * @description
     * Execute a callback at the end of the scroll
     *
     * @param {function(import('./events/scrollUtils/handleScrollUtils').handleScrollUtilsType):void } callback - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```javascript
     * const unsubscribe = mobCore.useScrollEnd(({ scrollY }) => {
     *     // code
     * });
     *
     * unsubscribe()
     *
     * ```
     */
    useScrollEnd(callback = () => {}) {
        return handleScrollEnd(callback);
    },

    checkType(type, value) {
        return checkType(type, value);
    },

    getTypeName(type) {
        return getTypeName(type);
    },

    /**
     * @returns {String}
     *
     * @description
     * Generate univoque id
     */
    getUnivoqueId() {
        return `_${Math.random().toString(36).slice(2, 9)}`;
    },

    getTime() {
        return getTime();
    },

    store: eventStore,

    normalizeWheel: normalizeWheel,

    ANIMATION_STOP_REJECT: ANIMATION_STOP_REJECT,
};
