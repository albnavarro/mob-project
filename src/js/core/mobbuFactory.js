import HandleAsyncTimeline from './animation/asyncTimeline/handleAsyncTimeline.js';
import { bodyScroll } from './animation/bodyScroll/bodyScroll.js';
import HandleLerp from './animation/lerp/handleLerp.js';
import { mouseParallax } from './animation/mouseParallax/mouseParallax.js';
import MouseParallaxItemClass from './animation/mouseParallax/mouseParallaxitem.js';
import { parallax } from './animation/parallax/parallax.js';
import { parallaxConstant } from './animation/parallax/parallaxConstant.js';
import ParallaxItemClass from './animation/parallax/parallaxItem.js';
import ParallaxTween from './animation/parallax/parallaxTween.js';
import HandleMasterSequencer from './animation/sequencer/handleMasterSequencer.js';
import HandleSequencer from './animation/sequencer/handleSequencer.js';
import { createStaggers } from './animation/sequencer/sequencerUtils.js';
import { slide } from './animation/slide/slide.js';
import SmoothScrollClass from './animation/smoothScroller/smoothScroll.js';
import HandleSpring from './animation/spring/handleSpring.js';
import HandleSyncTimeline from './animation/syncTimeline/handleSyncTimeline.js';
import HandleTween from './animation/tween/handleTween.js';
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
import { LoadImages } from './utils/loadImages.js';
import { mq } from './utils/mediaManager.js';

export const mobbu = {
    /**
     * @description
     * - Here it is possible to modify the default values of the various modules of the library
     *
     * @param {import('./setup.js').handleSetUpSetType} props
     *
     *
     * @example
     * ```js
     * Default value schema:
     *
     * mobbu.setDefault.set({
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
     * mobbu.getDefault('parallax');
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
     * mobbu.printDefault();
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
     * @param {import('./animation/sequencer/handleSequencer.js').sequencerTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('../core/animation/tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const mySequencer  = mobbu.createSequencer({
     *   data: Object.<string, number>,
     *   duration: [ Number ],
     *   ease: [ String ],
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * mySequencer.goTo()
     * mySequencer.goFrom()
     * mySequencer.goFromTo()
     * mySequencer.add()
     * mySequencer.label()
     * mySequencer.subscribe()
     * mySequencer.subscribeCache()
     * mySequencer.onStop()
     *
     * ```
     */
    createSequencer(data = {}) {
        return new HandleSequencer(data);
    },

    /**
     * @param {import('./animation/syncTimeline/handleSyncTimeline.js').syncTimelineTypes } data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myTimeline = mobbu.createSyncTimeline({
     *   duration: [ Number ],
     *   yoyo: [ Boolean ],
     *   repeat: [ Number ]
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * myTimeline.add()
     * myTimeline.onLoopEnd()
     * myTimeline.onComplete()
     * myTimeline.onUpdate()
     * myTimeline.stop()
     * myTimeline.play()
     * myTimeline.playReverse()
     * myTimeline.playFrom()
     * myTimeline.playFromReverse()
     * myTimeline.reverse()
     * myTimeline.pause()
     * myTimeline.resume()
     * myTimeline.isActive()
     * myTimeline.isPaused()
     * myTimeline.getDirection()
     * myTimeline.getTime()
     * myTimeline.destroy()
     * ```
     */
    createSyncTimeline(data = {}) {
        return new HandleSyncTimeline(data);
    },

    /**
     * @param { import('./animation/sequencer/sequencerUtils.js').createSequencerTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes } data
     * @returns {Array<{ start: Number, end: Number,index: Number, item: (HTMLElement|Object) }>} Stagger array
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const staggers = mobbu.createStaggers({
     *     items: Array.<Element|Object>,
     *     stagger: {
     *         type: [ String ],
     *         from: [ Number|String|{x:number,y:number} ],
     *         grid: {
     *             col: [ Number ],
     *             row: [ Number ],
     *             direction: [ String ]
     *         },
     *     },
     *     duration: [ Number ],
     * });
     *
     *
     * staggers.forEach(({ item, start, end, index }) => {
     *     const sequencer = mobbu
     *         .createSequencer({ ... })
     *         .goTo({ ... }, { start, end ...});
     *     sequencer.subscribe(({ ... }) => { ... });
     *     masterSequencer.add(sequencer);
     * });
     *
     * ```
     *
     * @description
     *
     * ```
     */
    createStaggers(data = {}) {
        return createStaggers(data);
    },

    /**
     * @param { import('./animation/parallax/parallaxTween.js').parallaxTweenTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('./animation/tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myParallaxTween = mobbu.createParallaxTween({
     *   from: Object.<string, number>,
     *   to: Object.<string, number>,
     *   duration: [ Number ],
     *   ease: [ String ],
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Simplified tween specific to be used with scrollTrigger as an alternative to the more complex sequencer, ParallaxTween requires only one mutation step (from / to).
     * <br/>
     *
     * Available methods:
     * ```js
     * myParallaxTween.subscribe()
     * myParallaxTween.subscribeCache()
     * myParallaxTween.onStop()
     *
     * ```
     */
    createParallaxTween(data = {}) {
        return new ParallaxTween(data);
    },

    /**
     * @description
     *
     * Support class for grouping multiple sequencers.
     * Very useful when generating sequencers dynamically, such as through the use of a createStagger.
     * <br/>
     * The following example uses a timeline but the same can be done using a scrollTrigger
     * <br/>
     *
     *
     * @example
     *
     * ```js
     * cont masterSequencer = mobbu.createMasterSequencer();
     * const staggers = mobbu.createStaggers({})
     * staggers.forEach(({ item, start, end, index }) => {
     *     const sequencer = mobbu
     *         .createSequencer({ ... })
     *         .goTo({ ... }, { start, end ...});
     *     sequencer.subscribe(({ ... }) => { ... });
     *     masterSequencer.add(sequencer);
     * });
     * const timeline = mobbu.createSyncTimeline({}).add(masterSequencer)
     * ```
     */
    createMasterSequencer() {
        return new HandleMasterSequencer();
    },

    /**
     * @param { import('./animation/tween/handleTween.js').tweenTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('./animation/tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myTween = mobbu.createTween({
     *   data: Object.<string, number>,
     *   duration: [ Number ],
     *   ease: [ String ],
     *   relative: [ Boolean ]
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *      waitComplete: [ Boolean ],
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * myTween.set()
     * myTween.goTo()
     * myTween.goFrom()
     * myTween.goFromTo()
     * myTween.subscribe()
     * myTween.subscribeCache()
     * myTween.onComplete()
     * myTween.updateEase()
     * myTween.getId()
     * myTween.get()
     * myTween.getTo()
     * myTween.getFrom()
     * myTween.getToNativeType()
     * myTween.getFromNativeType()
     *
     * ```
     */
    createTween(data = {}) {
        return new HandleTween(data);
    },

    /**
     * @param { import('./animation/spring/handleSpring.js').springTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes & import('./animation/spring/springConfig.js').springConfigTypes & import('./animation/spring/springConfig.js').springConfigPropsTypes} data
     *
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const mySpring = new createSpring({
     *   data: Object.<string, number>,
     *   config: [ String ],
     *   configProp: {
     *      tension: [ Number ],
     *      mass: [ Number ],
     *      friction: [ Number ],
     *      velocity: [ Number ],
     *      precision: [ Number ],
     *   },
     *   relative: [ Boolean ]
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ],
     *      },
     *      waitComplete: [ Boolean ],
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * mySpring.set()
     * mySpring.goTo()
     * mySpring.goFrom()
     * mySpring.goFromTo()
     * mySpring.subscribe()
     * mySpring.subscribeCache()
     * mySpring.onComplete()
     * mySpring.updateConfigProp()
     * mySpring.updateConfig()
     * mySpring.getId()
     * mySpring.get()
     * mySpring.getTo()
     * mySpring.getFrom()
     * mySpring.getToNativeType()
     * mySpring.getFromNativeType()
     *
     * ```
     */
    createSpring(data = {}) {
        return new HandleSpring(data);
    },

    /**
     * @param { import('./animation/lerp/handleLerp.js').lerpTypes & import('./animation/lerp/handleLerp.js').lerpPropTypes & import('./animation/utils/stagger/staggerCostant.js').staggerTypes } data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myLerp = new mobbu.createLerp({
     *   data: Object.<string, number>,
     *   precision: [ Number ],
     *   velocity: [ Number ],
     *   relative: [ Boolean ]
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ],
     *      },
     *      waitComplete: [ Boolean ],
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * myLerp.set()
     * myLerp.goTo()
     * myLerp.goFrom()
     * myLerp.goFromTo()
     * myLerp.subscribe()
     * myLerp.subscribeCache()
     * myLerp.onComplete()
     * myLerp.updateVelocity()
     * myLerp.updatePrecision()
     * myLerp.getId()
     * myLerp.get()
     * myLerp.getTo()
     * myLerp.getFrom()
     * myLerp.getToNativeType()
     * myLerp.getFromNativeType()
     *
     * ```
     */
    createLerp(data = {}) {
        return new HandleLerp(data);
    },

    /**
     * @param { import('./animation/asyncTimeline/handleAsyncTimeline.js').asyncTimelineTypes } data
     *
     * @example
     * ```js
     * Property schema:
     *
     *
     * const myTimeline = mobbu.createAsyncTimeline({
     *   yoyo: [ Boolean ],
     *   repeat: [ Number ],
     *   freeMode: [ Number ],
     *   autoSet: [ Number ],
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     *
     *
     * `Methods to create timeline`
     * myTimeline.set()
     * myTimeline.goTo()
     * myTimeline.goFrom()
     * myTimeline.goFromTo()
     * myTimeline.add()
     * myTimeline.addAsync()
     * myTimeline.sync()
     * myTimeline.createGroup()
     * myTimeline.closeGroup()
     * myTimeline.suspend()
     * myTimeline.label()
     *
     *
     * `Methods to control timeline`
     * myTimeline.play()
     * myTimeline.playFromLabel()
     * myTimeline.playFrom()
     * myTimeline.playFromReverse()
     * myTimeline.playReverse()
     * myTimeline.reverseNext()
     * myTimeline.stop()
     * myTimeline.pause()
     * myTimeline.resume()
     * myTimeline.isActive()
     * myTimeline.isPaused()
     * myTimeline.isSuspended()
     * myTimeline.getDirection()
     * myTimeline.setTween()
     * myTimeline.get()
     * myTimeline.onLoopEnd()
     * myTimeline.onComplete()
     * myTimeline.destroy()
     * ```
     */
    createAsyncTimeline(data = {}) {
        return new HandleAsyncTimeline(data);
    },

    /**
     * @param { import('./animation/parallax/parallaxItem.js').parallaxDefaultTypes & import('./utils/mediaManager.js').breackPointTypeObj & import('./animation/spring/springConfig.js').springConfigParallaxTypes & import('./utils/mediaManager.js').mqTypeObject & import('./animation/parallax/parallaxItem.js').parallaxSpecificTypes } data
     *
     * @example
     * ```js
     *  Property schema:
     *
     *
     *  const myParallax = mobbu.createParallax({
     *      item: String | Element,
     *      applyTo: [ String | Element ],
     *      trigger: [ String | Element ],
     *      screen: [ String | Element ],
     *      scroller: [ String | Element ],
     *      breackpoint: [ String ],
     *      queryType: [ String ],
     *      direction: [ String ],
     *      propierties: [ String ],
     *      tween: [ HandleSequencer | ParallaxTween ],
     *      range: [ String | Number ],
     *      align: [ String ],
     *      onSwitch: [ String ],
     *      reverse: [ Boolean ],
     *      ease: [ Boolean ],
     *      easeType: [ String ],
     *      lerpConfig: [ Number ],
     *      springConfig: [ String ],
     *      opacityEnd: [ Number ],
     *      opacityStart: [ Number ],
     *      limiterOff: [ Boolean ],
     *      perspective: [ Number ],
     *      disableForce3D: [ Boolean ],
     *      useThrottle: [ Boolean ],
     *  });
     *
     *
     * ```
     *
     * @description
     * Available methods:
     *
     * ```js
     *
     *
     * myParallax.init()
     * myParallax.destroy()
     * myParallax.refresh()
     * myParallax.move()
     *
     * ```
     *
     */
    createParallax(data = {}) {
        return new ParallaxItemClass({
            ...data,
            ...{ type: parallaxConstant.TYPE_PARALLAX },
        });
    },

    /**
     * @param { import('./animation/parallax/parallaxItem.js').parallaxDefaultTypes & import('./utils/mediaManager.js').breackPointTypeObj & import('./animation/spring/springConfig.js').springConfigParallaxTypes & import('./utils/mediaManager.js').mqTypeObject & import('./animation/parallax/parallaxItem.js').scrolltriggerSpecificTypes  } data
     *
     * @example
     *
     * ```js
     *   Property schema:
     *
     *
     *   const myScrollTrigger = mobbu.createScrollTrigger({
     *       item: String | Element,
     *       applyTo: [ String | Element ],
     *       trigger: [ String | Element ],
     *       screen: [ String | Element ],
     *       scroller: [ String | Element ],
     *       breackpoint: [ String ],
     *       queryType: [ String ],
     *       direction: [ String ],
     *       propierties: [ String ],
     *       tween: [ HandleSequencer | ParallaxTween ],
     *       range: [ String ],
     *       dynamicRange: [ Function ],
     *       fromTo: [ Boolean ],
     *       start: [ String ],
     *       dynamicStart: {
     *          postion: [ String ],
     *          value: [ Function ]
     *       },
     *       end: [ String ],
     *       dynamicEnd: {
     *          postion: [ String ],
     *          value: [ Function ]
     *       },
     *       ease: [ Boolean ],
     *       easeType: [ String ],
     *       lerpConfig: [ Number ],
     *       springConfig: [ String ],
     *       pin: [ Boolean ],
     *       animatePin: [ Boolean ],
     *       anticipatePinOnLoad: [ Boolean ],
     *       marker: [ String ],
     *       forceTranspond: [ Boolean ],
     *       animateAtStart: [ Boolean ],
     *       disableForce3D: [ Boolean ],
     *       onEnter: [ Function ],
     *       onEnterBack: [ Function ],
     *       onLeave: [ Function ],
     *       onLeaveBack: [ Function ],
     *       onTick: [ Function ],
     *       perspective: [ Number ],
     *       useThrottle: [ Boolean ],
     *   });
     *
     *
     *
     * ```
     *
     * @description
     * Available methods:
     *
     * ```js
     *
     *
     * myScrollTrigger.init()
     * myScrollTrigger.destroy()
     * myScrollTrigger.refresh()
     * myScrollTrigger.move()
     *
     * ```
     */
    createScrollTrigger(data = {}) {
        return new ParallaxItemClass({
            ...data,
            ...{ type: parallaxConstant.TYPE_SCROLLTRIGGER },
        });
    },

    /**
     * @description
     * Execute a callBack within the first available request animation frame. Use this method to modify elements of the DOM
     *
     * @param {function(import('./events/rafutils/handleFrame.js').handleFrameTypes):void } callback - callback function
     *
     * @example
     * ```js
     * mobbu.useframe(({ fps, shouldrender, time }) => {
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
     * mobbu.useFrame(() => {
     *     mobbu.useNextTick(({ fps, shouldRender, time }) => {
     *         // code
     *     });
     * });
     *
     * Loop request animation frame using handleNextTick:
     *
     * const loop = () => {
     *     mobbu.useNextTick(() => {
     *         // read from DOM
     *
     *         mobbu.useFrame(() => {
     *             // write to the DOM
     *             loop();
     *         });
     *     });
     * };
     *
     * mobbu.useFrame(() => loop());
     *
     * To tick exactly after the request animation frame:
     * mobbu.default('set', { deferredNextTick: true });
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
     *     mobbu.useNextFrame(({ fps, shouldRender, time }) => {
     *         // code
     *         loop();
     *     });
     * };
     *
     * mobbu.useFrame(() => loop());
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
     * mobbu.useFrameIndex(({ fps, shouldRender, time }) => {
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
     * Runs a request animation frame loop to detect the frame rate of the monitor. After the method will be resolved the first time, subsequent calls will be resolved immediately returning the previously calculated value. The method is launched the first time automatically at the first loading.
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
     * mobbu.useLoad(() => {
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
     * mobbu.useResize(
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
     *  const unsubscribe = mobbu.useVisibilityChange(({ visibilityState }) => {
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
     * const unsubscribe = mobbu.useMouseClick(
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
     * const unsubscribe = mobbu.useMouseDown(
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
     * const unsubscribe = mobbu.useTouchStart(
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
     * const unsubscribe = mobbu.useMouseMove(
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
     * const unsubscribe = mobbu.useTouchMove(
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
     * const unsubscribe = mobbu.useMouseUp(
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
     * const unsubscribe = mobbu.useTouchEnd(
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
     * const unsubscribe = mobbu.useMouseWheel(
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
     * const unsubscribe = mobbu.useScroll(({ direction, scrollY }) => {
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
     * const unsubscribe = mobbu.useScrollImmediate(({ direction, scrollY }) => {
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
     * TODO aggiungere refernza al defualt di throttle
     *
     * @param {function(import('./events/scrollUtils/handleScrollImmediate.js').handleScrollType):void } callback - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```js
     * const unsubscribe = mobbu.useScrollThrottle(({ direction, scrollY }) => {
     *    // code
     * });
     *
     * unsubscribe();
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
     * const unsubscribe = mobbu.useScrollStart(({ scrollY }) => {
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
     * const unsubscribe = mobbu.useScrollEnd(({ scrollY }) => {
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
     * @typedef {Object} scrollToObj
     * @prop {number|HTMLElement} target
     * @prop {number}  duration
     * @prop {('easeLinear'|'easeInQuad'|'easeOutQuad'|'easeInOutQuad'|'easeInCubic'|'easeOutCubic'|'easeInOutCubic'|'easeInQuart'|'easeOutQuart'|'easeInOutQuart'|'easeInQuint'|'easeOutQuint'|'easeInOutQuint'|'easeInSine'|'easeOutSine'|'easeInOutSine'|'easeInExpo'|'easeOutExpo'|'easeInOutExpo'|'easeInCirc'|'easeOutCirc'|'easeInOutCirc'|'easeInElastic'|'easeOutElastic'|'easeInOutElastic'|'easeInBack'|'easeOutBack'|'easeInOutBack'|'easeInBounce'|'easeOutBounce'|'easeInOutBounce')}  ease
     * @prop {boolean}  prevent
     **/

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
     *   mobbu.mq([String], [string])
     *
     *   const isDesktop = mobbu.mq('min', 'desktop'); // true/false
     *   const isMobile = mobbu.mq('max', 'desktop'); // true/false
     *   const desktopBreackPoint = mobbu.mq('get', 'desktop'); // 992
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
                console.warn(`${action} in mobbu.mq not exist`);
        }
    },

    /**
     * @param {scrollToObj} obj
     * @description
     * {
     *     target: Number|HTMLElement,
     *     duration: number,
     *     ease: string,
     *     prevent: boolean
     * }
     */
    scrollTo(obj = {}) {
        return bodyScroll.to(obj);
    },

    slide(action, el) {
        switch (action) {
            case 'subscribe':
                return slide.subscribe(el);

            case 'reset':
                return slide.reset(el);

            case 'up':
                return slide.up(el);

            case 'down':
                return slide.down(el);

            default:
                console.warn(`${action} in mobbu.slide not exist`);
        }
    },

    create(type = '', obj = {}) {
        switch (type) {
            case 'mouseParallax':
                return new MouseParallaxItemClass(obj);

            case 'smoothScroll':
                return new SmoothScrollClass(obj);

            case 'store':
                return new SimpleStore(obj);

            case 'loadImages':
                if (obj && 'images' in obj) {
                    return new LoadImages(obj.images);
                } else {
                    console.warn(
                        `loadImages need a Object with an array of images: {images: [...]}`
                    );
                }
                break;

            default:
                console.warn(`${type} in mobbu.create not exist`);
        }
    },

    /**
     * @typedef {('parallax'|'mouseParallax')} runType - string
     **/

    /**
     * @param prop {runType} string
     **/
    run(prop = '') {
        switch (prop) {
            case 'parallax':
                parallax.init();
                return parallax;

            case 'mouseParallax':
                mouseParallax.init();
                return mouseParallax;

            default:
                console.warn(`${prop} in mobbu.run not exist`);
        }
    },
};
