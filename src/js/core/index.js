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
    handleFrame,
    loadFps,
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

// utils
export { bodyScroll } from './animation/bodyScroll/bodyScroll.js';
export { slide } from './animation/slide/slide.js';
export { springConfig } from './animation/spring/springConfig.js';
export { tweenConfig } from './animation/tween/tweenConfig.js';

// parallax
export { parallax } from './animation/parallax/parallax.js';

// Factory class
export { mobbu } from './createInstance.js';
