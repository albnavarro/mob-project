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
import { printEaseKey } from './animation/tween/tweenConfig.js';
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
     * @typedef {('get'|'set'|'print')} defaultType - string
     **/

    /**
     * @param action {defaultType} string
     **/
    default(action = '', props) {
        switch (action) {
            case 'get':
                handleSetUp.get(props);
                break;

            case 'set':
                handleSetUp.set(props);
                break;

            case 'print':
                // Writable props
                handleSetUp.print();

                // Readable props
                console.log('Readable props:');
                printEaseKey();
                break;

            default:
                console.warn(`${action} in mobbu.default not exist`);
        }
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
     * @typedef {('frame'|'nextTick'|'nextFrame'|'frameIndex'|'loadFps'|'load'|'resize'|'visibilityChange'|'mouseClick'|'mouseDown'|'touchStart'|'mouseMove'|'touchMove'|'mouseUp'|'touchEnd'|'mouseWheel'|'scoll'|'scrollImmediate'|'scrollThrottle'|'scrollStart'|'scrollEnd')} useType - string
     **/

    /**
     * @param type {useType} string
     * @param {function} callback
     * @param {Number} [ frame=0 ]
     **/
    use(type = '', callback = () => {}, frame = 0) {
        switch (type) {
            case 'frame':
                return handleFrame.add(callback);

            case 'nextTick':
                return handleNextTick.add(callback);

            case 'nextFrame':
                return handleNextFrame.add(callback);

            case 'frameIndex':
                return handleFrameIndex.add(callback, frame);

            case 'loadFps':
                return loadFps().then((obj) => callback(obj));

            case 'load':
                return handleLoad(callback);

            case 'resize':
                return handleResize(callback);

            case 'visibilityChange':
                return handleVisibilityChange(callback);

            case 'mouseClick':
                return handleMouseClick(callback);

            case 'mouseDown':
                return handleMouseDown(callback);

            case 'touchStart':
                return handleTouchStart(callback);

            case 'mouseMove':
                return handleMouseMove(callback);

            case 'touchMove':
                return handleTouchMove(callback);

            case 'mouseUp':
                return handleMouseUp(callback);

            case 'touchEnd':
                return handleTouchEnd(callback);

            case 'mouseWheel':
                return handleMouseWheel(callback);

            case 'scroll':
                return handleScroll(callback);

            case 'scrollImmediate':
                return handleScrollImmediate(callback);

            case 'scrollThrottle':
                return handleScrollThrottle(callback);

            case 'scrollStart':
                return handleScrollStart(callback);

            case 'scrollEnd':
                return handleScrollEnd(callback);

            default:
                console.warn(`${type} in mobbu.use not exist`);
        }
    },

    /**
     * @typedef {Object} scrollToObj
     * @prop {number|HTMLElement} target
     * @prop {number}  duration
     * @prop {('easeLinear'|'easeInQuad'|'easeOutQuad'|'easeInOutQuad'|'easeInCubic'|'easeOutCubic'|'easeInOutCubic'|'easeInQuart'|'easeOutQuart'|'easeInOutQuart'|'easeInQuint'|'easeOutQuint'|'easeInOutQuint'|'easeInSine'|'easeOutSine'|'easeInOutSine'|'easeInExpo'|'easeOutExpo'|'easeInOutExpo'|'easeInCirc'|'easeOutCirc'|'easeInOutCirc'|'easeInElastic'|'easeOutElastic'|'easeInOutElastic'|'easeInBack'|'easeOutBack'|'easeInOutBack'|'easeInBounce'|'easeOutBounce'|'easeInOutBounce')}  ease
     * @prop {boolean}  prevent
     **/

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
