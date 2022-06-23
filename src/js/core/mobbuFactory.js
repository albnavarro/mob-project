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
import {
    handleNextFrame,
    handleNextTick,
    handleFrameIndex,
    handleFrame,
    loadFps,
} from './events/rafutils/rafUtils.js';
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

export const mobbu = {
    default(action, props) {
        switch (action) {
            case 'get':
                return handleSetUp.get(props);

            case 'set':
                return handleSetUp.set(props);

            case 'print':
                return handleSetUp.print();

            default:
                console.warn(`${action} in mobbu.default not exist`);
        }
    },
    create(type, obj) {
        switch (type) {
            case 'lerp':
                return new HandleLerp(obj);

            case 'spring':
                return new HandleSpring(obj);

            case 'tween':
                return new HandleTween(obj);

            case 'sequencer':
                return new HandleSequencer(obj);

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

            default:
                console.warn(`${type} in mobbu.create not exist`);
        }
    },
    use(type, fn, option) {
        switch (type) {
            case 'frame':
                return handleFrame.add(fn);

            case 'nextTick':
                return handleNextTick.add(fn);

            case 'nextFrame':
                return handleNextFrame.add(fn);

            case 'frameIndex':
                return handleFrameIndex(fn, option);

            case 'loadFps':
                return loadFps().then(() => fn());

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
    scrollTo(obj) {
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
    loadImages(images) {
        return new LoadImages(images);
    },
    mq(action, breackpoint) {
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
    run(prop) {
        switch (prop) {
            case 'parallax':
                return parallax.init();

            case 'mouseParallax':
                return mouseParallax.init();

            default:
                console.warn(`${prop} in mobbu.run not exist`);
        }
    },
};
