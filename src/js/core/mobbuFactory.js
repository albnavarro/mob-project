// Constant
import { parallaxConstant } from './animation/parallax/parallaxConstant.js';

// Instance
import { HandleLerp } from './animation/lerp/handleLerp.js';
import { HandleSpring } from './animation/spring/handleSpring.js';
import { HandleTween } from './animation/tween/handleTween.js';
import { HandleSequencer } from './animation/sequencer/handleSequencer.js';
import { HandleAsyncTimeline } from './animation/asyncTimeline/handleAsyncTimeline.js';
import { HandleSyncTimeline } from './animation/syncTimeline/handleSyncTimeline.js';
import { HandleMasterSequencer } from './animation/sequencer/handleMasterSequencer.js';
import { ParallaxItemClass } from './animation/parallax/parallaxItem.js';
import { ParallaxTween } from './animation/parallax/parallaxTween.js';
import { MouseParallaxItemClass } from './animation/mouseParallax/mouseParallaxitem.js';
import { SmoothScrollClass } from './animation/smoothScroller/smoothScroll.js';
import { SimpleStore } from './store/simpleStore.js';
import { createStaggers } from './animation/sequencer/sequencerUtils.js';

// Event
import { handleNextFrame } from './events/rafutils/handleNextFrame.js';
import { handleNextTick } from './events/rafutils/handleNextTick.js';
import { handleFrame } from './events/rafutils/handleFrame.js';
import { handleFrameIndex } from './events/rafutils/handleFrameIndex';
import { frameStore } from './events/rafutils/frameStore';
import { loadFps } from './events/rafutils/loadFps.js';
import { handleLoad } from './events/loadutils/handleLoad.js';
import { handleResize } from './events/resizeUtils/handleResize.js';
import { handleVisibilityChange } from './events/visibilityChange/handleVisibilityChange.js';
import {
    handleMouseClick,
    handleMouseDown,
    handleTouchStart,
    handleMouseMove,
    handleTouchMove,
    handleMouseUp,
    handleTouchEnd,
    handleMouseWheel,
} from './events/mouseUtils/handleMouse.js';
import { handleScroll } from './events/scrollUtils/handleScroll.js';
import { handleScrollImmediate } from './events/scrollUtils/handleScrollImmediate.js';
import { handleScrollThrottle } from './events/scrollUtils/handleScrollThrottle.js';
import {
    handleScrollStart,
    handleScrollEnd,
} from './events/scrollUtils/handleScrollUtils.js';

// Body scroll
import { bodyScroll } from './animation/bodyScroll/bodyScroll.js';
import { slide } from './animation/slide/slide.js';
import { LoadImages } from './utils/loadImages.js';
import { mq } from './utils/mediaManager.js';
import { handleSetUp } from './setup.js';
import { parallax } from './animation/parallax/parallax.js';
import { mouseParallax } from './animation/mouseParallax/mouseParallax.js';

// Easing list
import { printEaseKey } from './animation/tween/tweenConfig.js';

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
     * @typedef {Object} sequencerObj
     * @prop {Object} data Object
     * @prop {number} duration Number
     * @prop {('easeLinear'|'easeInQuad'|'easeOutQuad'|'easeInOutQuad'|'easeInCubic'|'easeOutCubic'|'easeInOutCubic'|'easeInQuart'|'easeOutQuart'|'easeInOutQuart'|'easeInQuint'|'easeOutQuint'|'easeInOutQuint'|'easeInSine'|'easeOutSine'|'easeInOutSine'|'easeInExpo'|'easeOutExpo'|'easeInOutExpo'|'easeInCirc'|'easeOutCirc'|'easeInOutCirc'|'easeInElastic'|'easeOutElastic'|'easeInOutElastic'|'easeInBack'|'easeOutBack'|'easeInOutBack'|'easeInBounce'|'easeOutBounce'|'easeInOutBounce')}  ease String
     * @prop {Object} stagger { each:Number, waitComplete:Boolean, from:Number|String|Object, grid:Object}
     * @prop {number} stagger.each Number
     * @prop {boolean} stagger.waitComplete Boolean
     * @prop {('start'|'end'|'center'|'edges'|'random')} stagger.from Number|Object|String
     * @prop {object} stagger.grid {col:Number, row:Number, direction:string}
     * @prop {Number} stagger.grid.col Number
     * @prop {Number} stagger.grid.row Number
     * @prop {('row'|'col'|'radial')} stagger.grid.direction String
     **/

    /**
     * @param {sequencerObj} obj
     * @description {data:Object, stagger:{each: number, waitComplete: boolean, from: Number|String|Object, grid: {col:Number, row:Number, direction:string}}, duration: number, ease: string }
     */
    createSequencer(obj = {}) {
        return new HandleSequencer(obj);
    },

    create(type = '', obj = {}) {
        switch (type) {
            case 'lerp':
                return new HandleLerp(obj);

            case 'spring':
                return new HandleSpring(obj);

            case 'tween':
                return new HandleTween(obj);

            case 'asyncTimeline':
                return new HandleAsyncTimeline(obj);

            case 'syncTimeline':
                return new HandleSyncTimeline(obj);

            case 'masterSequencer':
                return new HandleMasterSequencer(obj);

            case 'stagger':
                return createStaggers(obj);

            case 'parallax':
                return new ParallaxItemClass({
                    ...obj,
                    ...{ type: parallaxConstant.TYPE_DEFAULT },
                });

            case 'scrolltrigger':
                return new ParallaxItemClass({
                    ...obj,
                    ...{ type: parallaxConstant.TYPE_SCROLLTRIGGER },
                });

            case 'parallaxTween':
                return new ParallaxTween(obj);

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
     * @param {function} fn
     * @param {number} [ frame=0 ]
     **/
    use(type = '', fn = () => {}, frame = 0) {
        switch (type) {
            case 'frame':
                return handleFrame.add(fn);

            case 'nextTick':
                return handleNextTick.add(fn);

            case 'nextFrame':
                return handleNextFrame.add(fn);

            case 'frameIndex':
                return handleFrameIndex.add(fn, frame);

            case 'loadFps':
                return loadFps().then((obj) => fn(obj));

            case 'load':
                return handleLoad(fn);

            case 'resize':
                return handleResize(fn);

            case 'visibilityChange':
                return handleVisibilityChange(fn);

            case 'mouseClick':
                return handleMouseClick(fn);

            case 'mouseDown':
                return handleMouseDown(fn);

            case 'touchStart':
                return handleTouchStart(fn);

            case 'mouseMove':
                return handleMouseMove(fn);

            case 'touchMove':
                return handleTouchMove(fn);

            case 'mouseUp':
                return handleMouseUp(fn);

            case 'touchEnd':
                return handleTouchEnd(fn);

            case 'mouseWheel':
                return handleMouseWheel(fn);

            case 'scroll':
                return handleScroll(fn);

            case 'scrollImmediate':
                return handleScrollImmediate(fn);

            case 'scrollThrottle':
                return handleScrollThrottle(fn);

            case 'scrollStart':
                return handleScrollStart(fn);

            case 'scrollEnd':
                return handleScrollEnd(fn);

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
     * @param {scrollToObj} obj {taget:Number|HTMLElement, duration: number, ease: string, prevent:boolean}
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
     * @typedef {('min'|'max'|'get')} mqType - string
     **/

    /**
     * @param action {mqType} string
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
