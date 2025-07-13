import { MobScrollerConstant } from './animation/scroller/mob-scroller-constant.js';
import MobScroller from './animation/scroller/mob-scroller.js';

/**
 * Available methods:
 *
 * ```javascript
 * myParallax.init();
 * myParallax.destroy();
 * myParallax.refresh();
 * myParallax.move();
 * ```
 *
 * @example
 *     ```javascript
 *      Property schema:
 *
 *
 *      const myParallax = MobScroll.createParallax({
 *          item: String | Element,
 *          applyTo: [ String | Element ],
 *          trigger: [ String | Element ],
 *          screen: [ String | Element ],
 *          scroller: [ String | Element ],
 *          breakpoint: [ String ],
 *          queryType: [ String ],
 *          direction: [ String ],
 *          propierties: [ String ],
 *          tween: [ MobSequencer | MobScrollerTween ],
 *          range: [ String | Number ],
 *          align: [ String ],
 *          onSwitch: [ String ],
 *          reverse: [ Boolean ],
 *          ease: [ Boolean ],
 *          easeType: [ String ],
 *          lerpConfig: [ Number ],
 *          springConfig: [ String ],
 *          opacityEnd: [ Number ],
 *          opacityStart: [ Number ],
 *          limiterOff: [ Boolean ],
 *          perspective: [ Number ],
 *          disableForce3D: [ Boolean ],
 *          useThrottle: [ Boolean ],
 *      });
 *
 *
 *     ```;
 *
 * @param {import('./animation/scroller/type').MobScrollerCommon & import('./animation/scroller/type').Parallax} data
 * @returns {MobScroller}
 */
function createParallax(data) {
    return new MobScroller({
        ...data,
        // @ts-ignore
        type: MobScrollerConstant.TYPE_PARALLAX,
    });
}

/**
 * Available methods:
 *
 * ```javascript
 * myScrollTrigger.init();
 * myScrollTrigger.destroy();
 * myScrollTrigger.refresh();
 * myScrollTrigger.move();
 * ```
 *
 * @example
 *     ```javascript
 *       Property schema:
 *
 *
 *       const myScrollTrigger = MobScroll.createScrollTrigger({
 *           item: String | Element,
 *           applyTo: [ String | Element ],
 *           trigger: [ String | Element ],
 *           screen: [ String | Element ],
 *           scroller: [ String | Element ],
 *           breakpoint: [ String ],
 *           queryType: [ String ],
 *           direction: [ String ],
 *           propierties: [ String ],
 *           tween: [ MobSequencer | MobScrollerTween ],
 *           range: [ String ],
 *           dynamicRange: [ Function ],
 *           fromTo: [ Boolean ],
 *           start: [ String ],
 *           dynamicStart: {
 *              position: [ String ],
 *              value: [ Function ]
 *           },
 *           end: [ String ],
 *           dynamicEnd: {
 *              position: [ String ],
 *              value: [ Function ]
 *           },
 *           ease: [ Boolean ],
 *           easeType: [ String ],
 *           lerpConfig: [ Number ],
 *           springConfig: [ String ],
 *           pin: [ Boolean ],
 *           animatePin: [ Boolean ],
 *           anticipatePinOnLoad: [ Boolean ],
 *           marker: [ String ],
 *           forceTranspond: [ Boolean ],
 *           animateAtStart: [ Boolean ],
 *           disableForce3D: [ Boolean ],
 *           onEnter: [ Function ],
 *           onEnterBack: [ Function ],
 *           onLeave: [ Function ],
 *           onLeaveBack: [ Function ],
 *           onTick: [ Function ],
 *           perspective: [ Number ],
 *           useThrottle: [ Boolean ],
 *       });
 *
 *
 *
 *     ```;
 *
 * @param {import('./animation/scroller/type').MobScrollerCommon &
 *     import('./animation/scroller/type').ScrollTrigger} data
 * @returns {MobScroller}
 */
function createScrollTrigger(data) {
    return new MobScroller({
        ...data,
        // @ts-ignore
        type: MobScrollerConstant.TYPE_SCROLLTRIGGER,
    });
}

export { createParallax, createScrollTrigger };
