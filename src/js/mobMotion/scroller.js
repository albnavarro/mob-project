// @ts-check

import { parallaxConstant } from './animation/parallax/parallaxConstant.js';
import ParallaxClass from './animation/parallax/parallax.js';

export const scroller = {
    /**
     * @param {import('./animation/parallax/type.js').parallaxCommonType & import('./animation/parallax/type.js').parallaxType} data
     *
     * @example
     * ```javascript
     *  Property schema:
     *
     *
     *  const myParallax = scroller.createParallax({
     *      item: String | Element,
     *      applyTo: [ String | Element ],
     *      trigger: [ String | Element ],
     *      screen: [ String | Element ],
     *      scroller: [ String | Element ],
     *      breakpoint: [ String ],
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
     * ```javascript
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
    createParallax(data) {
        return new ParallaxClass({
            ...data,
            // @ts-ignore
            type: parallaxConstant.TYPE_PARALLAX,
        });
    },

    /**
     * @param {import('./animation/parallax/type.js').parallaxCommonType & import('./animation/parallax/type.js').scrollTriggerType } data
     *
     * @example
     *
     * ```javascript
     *   Property schema:
     *
     *
     *   const myScrollTrigger = scroller.createScrollTrigger({
     *       item: String | Element,
     *       applyTo: [ String | Element ],
     *       trigger: [ String | Element ],
     *       screen: [ String | Element ],
     *       scroller: [ String | Element ],
     *       breakpoint: [ String ],
     *       queryType: [ String ],
     *       direction: [ String ],
     *       propierties: [ String ],
     *       tween: [ HandleSequencer | ParallaxTween ],
     *       range: [ String ],
     *       dynamicRange: [ Function ],
     *       fromTo: [ Boolean ],
     *       start: [ String ],
     *       dynamicStart: {
     *          position: [ String ],
     *          value: [ Function ]
     *       },
     *       end: [ String ],
     *       dynamicEnd: {
     *          position: [ String ],
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
     * ```javascript
     *
     *
     * myScrollTrigger.init()
     * myScrollTrigger.destroy()
     * myScrollTrigger.refresh()
     * myScrollTrigger.move()
     *
     * ```
     */
    createScrollTrigger(data) {
        return new ParallaxClass({
            ...data,
            // @ts-ignore
            type: parallaxConstant.TYPE_SCROLLTRIGGER,
        });
    },
};
