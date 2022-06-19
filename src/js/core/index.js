export { handleSetUp } from './setup.js';

/*
UTILS
*/
export { loadImages } from './utils/loadImages.js';
export { mq } from './utils/mediaManager.js';
export {
    outerHeight,
    outerWidth,
    offset,
    position,
    getSiblings,
    getParents,
    isDescendant,
    simulateClick,
    getTranslateValues,
    isNode,
    isElement,
} from './utils/vanillaFunction.js';

/*
STORE
*/
export { SimpleStore } from './store/simpleStore.js';

/*
EVENTS
*/

/*
EVENTS LOAD
*/
export { handleLoad } from './events/loadutils/handleLoad.js';

/*
EVENTS MOUSE
*/
export {
    handleMouseClick,
    handleMouseDown,
    handleTouchStart,
    handleMouseMove,
    handleTouchMove,
    handleMouseUp,
    handleTouchEnd,
    handleMouseWheel,
} from './events/mouseUtils/handleMouse.js';

/*
EVENTS REQUEST ANIMATUION FRAME
*/
export {
    handleNextFrame,
    handleNextTick,
    handleFrameIndex,
    frameStore,
    handleFrame,
    startFps,
} from './events/rafutils/rafUtils.js';

/*
EVENTS RESIZE
*/
export { handleResize } from './events/resizeUtils/handleResize.js';

/*
EVENTS SCROLL
*/
export { handleScroll } from './events/scrollUtils/handleScroll.js';
export { handleScrollImmediate } from './events/scrollUtils/handleScrollImmediate.js';
export { handleScrollThrottle } from './events/scrollUtils/handleScrollThrottle.js';
export {
    handleScrollStart,
    handleScrollEnd,
} from './events/scrollUtils/handleScrollUtils.js';

/*
EVENTS VISIBILITY
*/
export { handleVisibilityChange } from './events/visibilityChange/handleVisibilityChange.js';

/*
ANIMATION
*/

// basic animation
export { HandleLerp } from './animation/lerp/handleLerp.js';
export { HandleSpring } from './animation/spring/handleSpring.js';
export { HandleTween } from './animation/tween/handleTween.js';
export { HandleSequencer } from './animation/sequencer/handleSequencer.js';
// timeline
export { HandleAsyncTimeline } from './animation/asyncTimeline/handleAsyncTimeline.js';
export { HandleSyncTimeline } from './animation/syncTimeline/handleSyncTimeline.js';
export { HandleMasterSequencer } from './animation/sequencer/handleMasterSequencer.js';
// utils
export { bodyScroll } from './animation/bodyScroll/bodyScroll.js';
export { slide } from './animation/slide/slide.js';
export { createStaggers } from './animation/sequencer/sequencerUtils.js';
export { springConfig } from './animation/spring/springConfig.js';
export { tweenConfig } from './animation/tween/tweenConfig.js';
// parallax
export { parallax } from './animation/parallax/parallax.js';
export { ParallaxItemClass } from './animation/parallax/parallaxItem.js';
export { ParallaxTween } from './animation/parallax/parallaxTween.js';
