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
import { frameStore } from './events/rafutils/frameStore';
import { handleFrame } from './events/rafutils/handleFrame.js';
import { handleFrameIndex } from './events/rafutils/handleFrameIndex';
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
} from './events/scrollUtils/handleScrollUtils.js';
import { handleVisibilityChange } from './events/visibilityChange/handleVisibilityChange.js';
import { handleSetUp } from './setup.js';
import { SimpleStore } from './store/simpleStore.js';
import { mq } from './utils/mediaManager.js';

export const core = {
    /**
     * @description
     * - Here it is possible to modify the default values of the various modules of the library
     *
     * @param {import('./animation/utils/setUpValidation.js').handleSetUpSetType} props
     *
     *
     * @example
     * ```js
     * Default value schema:
     *
     * core.setDefault.set({
     *     startFps: 60,
     *     fpsScalePercent: {
     *         0: 1,
     *         15: 2,
     *         30: 3,
     *         45: 4,
     *     },
     *     useScaleFps: true,
     *     deferredNextTick: false,
     *     throttle: 100,
     *     usePassive: true
     *     mq: {
     *         xSmall: 320,
     *         small: 360,
     *         medium: 600,
     *         tablet: 768,
     *         desktop: 992,
     *         large: 1200,
     *         xLarge: 1400,
     *     },
     *     defaultMq: {
     *         value: 'desktop',
     *         type: 'min',
     *     },
     *     sequencer: {
     *         duration: 10,
     *         ease: 'easeLinear',
     *     },
     *     scrollTrigger: {
     *         springConfig: 'default',
     *         lerpConfig: 0.06,
     *         markerColor: {
     *             startEnd: '#ff0000',
     *             item: '#14df3b',
     *         },
     *     },
     *     parallax: {
     *         defaultRange: 8,
     *         springConfig: 'default',
     *         lerpConfig: 0.06,
     *     },
     *     parallaxTween: {
     *         duration: 10,
     *         ease: 'easeLinear',
     *     },
     *     tween: {
     *         duration: 1000,
     *         ease: 'easeLinear',
     *         relative: false,
     *     },
     *     spring: {
     *         relative: false,
     *         config: {
     *             default: {
     *                 tension: 20,
     *                 mass: 1,
     *                 friction: 5,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             gentle: {
     *                 tension: 120,
     *                 mass: 1,
     *                 friction: 14,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             wobbly: {
     *                 tension: 180,
     *                 mass: 1,
     *                 friction: 12,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             bounce: {
     *                 tension: 200,
     *                 mass: 3,
     *                 friction: 5,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             scroller: {
     *                 tension: 10,
     *                 mass: 1,
     *                 friction: 5,
     *                 velocity: 0,
     *                 precision: 0.5,
     *             },
     *         },
     *     },
     *     lerp: {
     *         relative: false,
     *         precision: 0.01,
     *         velocity: 0.06,
     *     },
     * });
     *
     *
     * ```
     */
    setDefault(props = {}) {
        handleSetUp.set(props);
    },

    /**
     * @description
     * Returns the value of a specific property
     *
     * @param {import('./setup.js').handleSetUpGetType} prop
     * @returns {Object}
     *
     * @example
     * ```js
     * core.getDefault('parallax');
     * ```
     */
    getDefault(prop = '') {
        return handleSetUp.get(prop);
    },

    /**
     * @description
     * Perform a console.log() of the default values
     *
     * @example
     * ```js
     * core.printDefault();
     * ```
     */
    printDefault() {
        handleSetUp.print();
    },

    getFps() {
        return handleFrame.getFps();
    },

    getInstantFps() {
        return frameStore.getProp('instantFps');
    },

    /**
     * @description
     * SimpleStore inizialization.
     * The store accepts single properties or objects
       If objects are used, it is not possible to nest more than two levels.
       Each individual property can be initialized with a simple value or via a more complex setup.
       A complex set-up is created through a function that must return an object with the property `value` and at least one of the following properties:
       `type` || `validation` || `skipEqual`
     *
      `value`:
       Initial value.

      `type`:
       Supported types:
      `String | Number | Object | Function | Array | Boolean | Element | NodeList`.
       The property will not be updated if it doesn't match, you will have a waring.

       `validation`:
       Validation function to parse value.
       This function will have the current value as input parameter and will return a boolean value.
       The validation status of each property will be displayed in the watchers and will be retrievable using the getValidation() method.

       `strict`:
       If set to true, the validation function will become blocking and the property will be updated only if the validation function is successful.
       THe default value is `false`.

       `skipEqual`:
       If the value is equal to the previous one, the property will not be updated. The watches will not be executed and the property will have no effect on the computed related to it.
       The default value is `true`.
     *
     *
     * @param {Object} data - local data of the store.
     *
     * @example
     * ```js
     *
     * Simlple propierties setup;
     * const myStore = core.createStore({
     *     prop1: 0,
     *     prop2: 0
     * });
     *
     * Complex propierties setup:
     * const myStore = core.createStore({
     *     myProp: () => ({
     *         value: 10,
     *         type: Number,
     *         validate: (val) => val < 10,
     *         strict: true,
     *         skipEqual: false,
     *     }),
     *     myObject: {
     *         prop1: () => ({
     *             value: 0,
     *             type: Number,
     *             validate: (val) => val < 10,
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
     * myStore.debugStore();
     * myStore.debugValidate();
     * myStore.setStyle();
     * myStore.destroy();
     * ```
     */
    createStore(data = {}) {
        return new SimpleStore(data);
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
     * ```js
     * core.useframe(({ fps, shouldrender, time }) => {
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
     * ```js
     * core.useFrame(() => {
     *     core.useNextTick(({ fps, shouldRender, time }) => {
     *         // code
     *     });
     * });
     *
     * Loop request animation frame using handleNextTick:
     *
     * const loop = () => {
     *     core.useNextTick(() => {
     *         // read from DOM
     *
     *         core.useFrame(() => {
     *             // write to the DOM
     *             loop();
     *         });
     *     });
     * };
     *
     * core.useFrame(() => loop());
     *
     * To tick exactly after the request animation frame:
     * core.default('set', { deferredNextTick: true });
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
     * ```js
     * const loop = () => {
     *     core.useNextFrame(({ fps, shouldRender, time }) => {
     *         // code
     *         loop();
     *     });
     * };
     *
     * core.useFrame(() => loop());
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
     * ```js
     * core.useFrameIndex(({ fps, shouldRender, time }) => {
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
    useFps(callback = () => {}) {
        return loadFps().then((obj) => callback(obj));
    },

    /**
     * @description
     * Add callback on page load
     *
     * @param {function():void } callback - Callback function executed on page load
     *
     * @example
     * ```js
     *
     * core.useLoad(() => {
     *     // code
     * });
     *
     * ```
     */
    useLoad(callback = () => {}) {
        return handleLoad(callback);
    },

    /**
     * @description
     * Add callback on resize using a debounce function.
     *
     * @param {function(import('./events/resizeUtils/handleResize.js').handleResizeTypes):void } callback - callback function fired on resize.
     *
     * @example
     * ```js
     * core.useResize(
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
     * ```js
     *  const unsubscribe = core.useVisibilityChange(({ visibilityState }) => {
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
     * ```js
     * const unsubscribe = core.useMouseClick(
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
     * ```js
     * const unsubscribe = core.useMouseDown(
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
     * ```js
     * const unsubscribe = core.useTouchStart(
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
     * ```js
     * const unsubscribe = core.useMouseMove(
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
     * ```js
     * const unsubscribe = core.useTouchMove(
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
     * ```js
     * const unsubscribe = core.useMouseUp(
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
     * ```js
     * const unsubscribe = core.useTouchEnd(
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
     * @param {function(import('./events/mouseUtils/handleMouse.js').mouseType & import('./events/mouseUtils/handleMouse.js').mouseWheelType):void } callback - callback function fired on mouse wheel.
     *
     * @example
     * ```js
     * const unsubscribe = core.useMouseWheel(
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
     * ```js
     * const unsubscribe = core.useScroll(({ direction, scrollY }) => {
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
     * ```js
     * const unsubscribe = core.useScrollImmediate(({ direction, scrollY }) => {
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
     * ```js
     * const unsubscribe = core.useScrollThrottle(({ direction, scrollY }) => {
     *    // code
     * });
     *
     * unsubscribe();
     *
     * To change the duration of the throttle, change the value of the throttle property to the defaults:
     *
     *
     * core.setDefault({throttle: 500});
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
     * ```js
     * const unsubscribe = core.useScrollStart(({ scrollY }) => {
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
     * ```js
     * const unsubscribe = core.useScrollEnd(({ scrollY }) => {
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

    /**
     * @param { import('./utils/mediaManager.js').mqType } action
     * @param { import('./utils/mediaManager.js').breackPointType } breackpoint
     *
     * @return {(Boolean|Number)} Returns a boolean value if the action value is equal to 'min' or 'max', returns a numeric value if it is equal to 'get'
     *
     * @description
     *
     * @example
     *
     * ```js
     *   Property schema:
     *   core.mq([String], [string])
     *
     *   const isDesktop = core.mq('min', 'desktop'); // true/false
     *   const isMobile = core.mq('max', 'desktop'); // true/false
     *   const desktopBreackPoint = core.mq('get', 'desktop'); // 992
     *
     *
     *
     * ```
     **/
    mq(action = '', breackpoint) {
        switch (action) {
            case 'min':
                return mq.min(breackpoint);

            case 'max':
                return mq.max(breackpoint);

            case 'get':
                return mq.getBreackpoint(breackpoint);

            default:
                console.warn(`${action} in core.mq not exist`);
        }
    },
};
