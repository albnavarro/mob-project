// @ts-check

import { mq } from '../../utils/mediaManager.js';
import {
    getTranslateValues,
    offset,
    position,
} from '../../../mobCore/utils/index.js';
import HandleLerp from '../lerp/handleLerp.js';
import HandleSpring from '../spring/handleSpring.js';
import { clamp, getRoundedValue } from '../utils/animationUtils.js';
import { getRangeUnitMisure } from './getConstantFromRegex.js';
import {
    breakpointIsValid,
    breakpointTypeIsValid,
    checkStringRangeOnPropierties,
    domNodeIsValidAndReturnElOrWin,
    domNodeIsValidAndReturnNull,
    functionIsValidAndReturnDefault,
    parallaxAlignIsValid,
    directionIsValid,
    parallaxDynamicRangeIsValid,
    parallaxDynamicValueIsValid,
    parallaxEaseTypeIsValid,
    parallaxLerpConfigIsValid,
    parallaxOnSwitchIsValid,
    parallaxOpacityIsValid,
    parallaxPropiertiesIsValid,
    parallaxRangeIsValid,
    parallaxSpringConfigIsValid,
    parallaxTweenIsValid,
    parallaxTypeIsValid,
    valueIsBooleanAndReturnDefault,
    valueIsNumberAndReturnDefault,
    valueIsStringAndReturnDefault,
} from '../utils/tweenAction/tweenValidation.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxEmitter } from './parallaxEmitter.js';
import { parallaxMarker } from './parallaxMarker.js';
import { ParallaxPin } from './parallaxPin.js';
import { mobCore } from '../../../mobCore/index.js';
import {
    getEndPoint,
    getRetReverseValue,
    getStartPoint,
    getValueOnSwitch,
    detectViewPortInterception,
    processFixedLimit,
    getScrollFunction,
} from './parallaxUtils.js';
import { parallaxEaseTypeSpringWarining } from '../utils/warning.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ParallaxTween from './parallaxTween.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import HandleSequencer from '../sequencer/handleSequencer.js';

export default class ParallaxClass {
    /**
     * @type {boolean}
     */
    #isInzialized;

    /**
     * @type {boolean}
     */
    #willChangeIsActive;

    /**
     * @type {number}
     */
    #offset;

    /**
     * @type {number}
     */
    #screenPosition;

    /**
     * @type {number}
     */
    #endValue;

    /**
     * @type {number}
     */
    #height;

    /**
     * @type {number}
     */
    #width;

    /**
     * @type {number}
     */
    #scrollerScroll;

    /**
     * @type {number}
     */
    #scrollerHeight;

    /**
     * @type {number}
     */
    #windowInnerWidth;

    /**
     * @type {number}
     */
    #windowInnerHeight;

    /**
     * @type {number}
     */
    #gap;

    /**
     * @type {number}
     */
    #numericRange;

    /**
     * @type {Function}
     */
    #unsubscribeResize;

    /**
     * @type {Function}
     */
    #unsubscribeScroll;

    /**
     * @type {Function}
     */
    #unsubscribeScrollStart;

    /**
     * @type {Function}
     */
    #unsubscribeScrollEnd;

    /**
     * @type {Function}
     */
    #unsubscribeMarker;

    /**
     * @type {Element|undefined}
     */
    #startMarker;

    /**
     * @type {Element|undefined}
     */
    #endMarker;

    /**
     * @type {number|undefined}
     */
    #lastValue;

    /**
     * @type {number}
     */
    #prevFixedRawValue;

    /**
     * @type {boolean}
     */
    #fixedShouldRender;

    /**
     * @type {number|undefined}
     */
    #prevFixedClamp;

    /**
     * @type {boolean}
     */
    #firstTime;

    /**
     * @type {boolean}
     */
    #isInViewport;

    /**
     * @type {boolean}
     */
    #iSControlledFromOutside;

    /**
     * @type {boolean}
     */
    #force3D;

    /**
     * @type {ParallaxPin|undefined}
     */
    #pinInstance;

    /**
     * @type {string}
     */
    #unitMisure;

    /**
     * @type {number}
     */
    #startPoint;

    /**
     * @type {number}
     */
    #endPoint;

    /**
     * @type {Function}
     */
    #unsubscribeMotion;

    /**
     * @type {Function}
     */
    #unsubscribeOnComplete;

    /**
     * Fixed prop
     */

    /**
     * @description
     * @type {boolean}
     */
    #pin;

    /**
     * @description
     * @type {boolean}
     */
    #animatePin;

    /**
     * @description
     * @type {boolean}
     */
    #forceTranspond;

    /**
     * @description
     * @type {boolean}
     */
    #anticipatePinOnLoad;

    /**
     * @description
     * @type {string}
     */
    #start;

    /**
     * @description
     * @type {string}
     */
    #end;

    /**
     * @description
     * @type {boolean}
     */
    #fromTo;

    /**
     * @description
     * @type {boolean}
     */
    #invertSide;

    /**
     * @description
     * @type {string}
     */
    #marker;

    /**
     * @description
     * @type {import('./type.js').dynamicStartType}
     */
    #dynamicStart;

    /**
     * @description
     * @type {import('./type.js').dynamicEndType}
     */
    #dynamicEnd;

    /**
     * @description
     * @type {Function|undefined}
     */
    #dynamicRange;

    /**
     * @description
     * @type {boolean}
     */
    #animateAtStart;

    /**
     * @description
     * @type {Function}
     */
    #onEnter;

    /**
     * @description
     * @type {Function}
     */
    #onEnterBack;

    /**
     * @description
     * @type {Function}
     */
    #onLeave;

    /**
     * @description
     * @type {Function}
     */
    #onLeaveBack;

    /**
     * @description
     * @type {Function}
     */
    #onTickCallback;

    /**
     * @description
     * @type {string|number}
     */
    #align;

    /**
     * @description
     * @type {string|boolean}
     */
    #onSwitch;

    /**
     * @description
     * @type {boolean}
     */
    #reverse;

    /**
     * @description
     * @type {number}
     */
    #opacityStart;

    /**
     * @description
     * @type {number}
     */
    #opacityEnd;

    /**
     * @description
     * @type {boolean}
     */
    #limiterOff;

    /**
     * Common prop
     */

    /**
     * @description
     * @type {boolean|undefined}
     */
    #useWillChange;

    /**
     * @description
     * @type {HandleLerp & HandleSpring & ParallaxTween & HandleSequencer}
     */
    #tween;

    /**
     *
     */

    /**
     * @description
     * @type {HTMLElement|null}
     */
    #item;

    /**
     * @description
     * @type {HTMLElement|globalThis|null}
     */
    #scroller;

    /**
     * @description
     * @type {HTMLElement|globalThis|null}
     */
    #screen;

    /**
     * @description
     * @type {HTMLElement|null|undefined}
     */
    #trigger;

    /**
     * @description
     * @type {HTMLElement|null|undefined}
     */
    #applyTo;

    /**
     * @description
     * @type {string}
     */
    #direction;

    /**
     * @description
     * @type {boolean}
     */
    #disableForce3D;

    // With pin active no throttle is usable, pin need precision
    /**
     * @description
     * @type {boolean}
     */
    #useThrottle;

    /**
     * @description
     * @type {string}
     */
    #type;

    /**
     * @description
     * @type {number}
     */
    #perspective;

    /**
     * @description
     * @type {string}
     */
    #breakpoint;

    /**
     * @description
     * @type {string}
     */
    #queryType;

    /**
     * @type {string}
     */
    #propierties;

    /**
     * @description
     * Skip render and set a default 100px value for
     * trigger the events.
     *
     * @type {boolean}
     */
    #shouldTrackOnlyEvents;

    /**
     * @description
     * @type {string|number}
     */
    #range;

    /**
     * @description
     * Get properties, check if there is sequencer inside a Parallax,
     * In case return y propierties
     *
     * @type {boolean}
     */
    #ease;

    /**
     * @description
     * Get easeType properties, Check if a sequencer is used inside a scrollTrigger
     * In case return a lerp
     *
     * @type {string}
     */
    #easeType;

    /**
     * @description
     * Get easeType properties, Check if a sequencer is used inside a scrollTrigger
     * In case return a lerp
     *
     * @type {import('../spring/type.js').springChoiceConfig}
     */
    #springConfig;

    /**
     * @description
     * Get easeType properties, Check if a sequencer is used inside a scrollTrigger
     * In case return a lerp
     *
     * @type {number}
     */
    #lerpConfig;

    /**
     * @description
     * Add more precision to motion spring/lerp to trigger better force3D
     *
     * @type {any}
     */
    #motionParameters;

    /**
     * @description
     * Add more precision to motion spring/lerp to trigger better force3D
     *
     * @type {import('./type.js').ParallaxMotion}
     */
    #motion;

    /**
     * @param  { import('./type.js').parallaxCommonType & import('./type.js').parallaxType &  import('./type.js').scrollTriggerType} data
     *
     * @example
     *
     * ```javascript
     *  Parallax property schema:
     *
     *
     *  const myParallax = new ParallaxClass({
     *      type: 'parallax',
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
     *
     *  Scrolltrigger property schema:
     *
     *
     *  const myScrollTrigger = new ParallaxClass({
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
     *      range: [ String ],
     *      dynamicRange: [ Function ],
     *      fromTo: [ Boolean ],
     *      start: [ String ],
     *      dynamicStart: {
     *         position: [ String ],
     *         value: [ Function ]
     *      },
     *      end: [ String ],
     *      dynamicEnd: {
     *         position: [ String ],
     *         value: [ Function ]
     *      },
     *      ease: [ Boolean ],
     *      easeType: [ String ],
     *      lerpConfig: [ Number ],
     *      springConfig: [ String ],
     *      pin: [ Boolean ],
     *      animatePin: [ Boolean ],
     *      anticipatePinOnLoad: [ Boolean ],
     *      marker: [ String ],
     *      forceTranspond: [ Boolean ],
     *      animateAtStart: [ Boolean ],
     *      disableForce3D: [ Boolean ],
     *      onEnter: [ Function ],
     *      onEnterBack: [ Function ],
     *      onLeave: [ Function ],
     *      onLeaveBack: [ Function ],
     *      onTick: [ Function ],
     *      perspective: [ Number ],
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
     * myInstance.init()
     * myInstance.destroy()
     * myInstance.refresh()
     * myInstance.move()
     *
     * ```
     */

    constructor(data) {
        this.#isInzialized = false;
        this.#willChangeIsActive = false;
        this.#offset = 0;
        this.#screenPosition = 0;
        this.#endValue = 0;
        this.#height = 0;
        this.#width = 0;
        this.#scrollerScroll = 0;
        this.#scrollerHeight = 0;
        this.#windowInnerWidth = window.innerWidth;
        this.#windowInnerHeight = window.innerHeight;
        this.#gap = 150;
        this.#numericRange = 0;
        this.#unsubscribeResize = () => {};
        this.#unsubscribeScroll = () => {};
        this.#unsubscribeScrollStart = () => {};
        this.#unsubscribeScrollEnd = () => {};
        this.#unsubscribeMarker = () => {};
        this.#startMarker = undefined;
        this.#endMarker = undefined;
        this.#lastValue = undefined;
        this.#prevFixedRawValue = 0;
        this.#fixedShouldRender = false;
        this.#prevFixedClamp = undefined;
        this.#firstTime = true;
        this.#isInViewport = false;
        this.#iSControlledFromOutside = false;
        this.#force3D = false;
        this.#pinInstance = undefined;
        this.#unitMisure = '';
        this.#startPoint = 0;
        this.#endPoint = 0;
        this.#unsubscribeMotion = () => {};
        this.#unsubscribeOnComplete = () => {};

        /**
         * Fixed prop
         */

        this.#pin = valueIsBooleanAndReturnDefault(
            data?.pin,
            'Scrolltrigger pin propierties error:',
            false
        );

        this.#animatePin = valueIsBooleanAndReturnDefault(
            data?.animatePin,
            'Scrolltrigger animatePin propierties error:',
            false
        );

        this.#forceTranspond = valueIsBooleanAndReturnDefault(
            data?.forceTranspond,
            'Scrolltrigger forceTranspond propierties error:',
            false
        );

        this.#anticipatePinOnLoad = valueIsBooleanAndReturnDefault(
            data?.anticipatePinOnLoad,
            'Scrolltrigger anticipatePinOnLoad propierties error:',
            false
        );

        this.#start = valueIsStringAndReturnDefault(
            data?.start,
            'Scrolltrigger start propierties error:',
            'bottom 0px'
        );

        this.#end = valueIsStringAndReturnDefault(
            data?.end,
            'Scrolltrigger end propierties error:',
            'top'
        );

        this.#fromTo = valueIsBooleanAndReturnDefault(
            data?.fromTo,
            'Scrolltrigger fromTo propierties error:',
            false
        );

        this.#invertSide = valueIsBooleanAndReturnDefault(
            data?.invertSide,
            'Scrolltrigger invertSide propierties error:',
            false
        );

        this.#marker = valueIsStringAndReturnDefault(
            data?.marker,
            'Scrolltrigger marker propierties error:',
            // eslint-disable-next-line unicorn/no-useless-undefined
            undefined
        );

        this.#dynamicStart = data?.dynamicStart
            ? parallaxDynamicValueIsValid(data.dynamicStart, 'dynamicStart')
            : null;

        this.#dynamicEnd = data?.dynamicEnd
            ? parallaxDynamicValueIsValid(data.dynamicEnd, 'dynamicEnd')
            : null;

        this.#dynamicRange = parallaxDynamicRangeIsValid(data?.dynamicRange);

        this.#animateAtStart = valueIsBooleanAndReturnDefault(
            data?.animateAtStart,
            'Scrolltrigger animateAtStart propierties error:',
            false
        );

        this.#onEnter = functionIsValidAndReturnDefault(
            data?.onEnter,
            false,
            'Scrolltrigger onEnter propierties error'
        );

        this.#onEnterBack = functionIsValidAndReturnDefault(
            data?.onEnterBack,
            false,
            'Scrolltrigger onEnterBack propierties error'
        );

        this.#onLeave = functionIsValidAndReturnDefault(
            data?.onLeave,
            false,
            'Scrolltrigger onLeave propierties error'
        );

        this.#onLeaveBack = functionIsValidAndReturnDefault(
            data?.onLeaveBack,
            false,
            'Scrolltrigger onLeaveBack propierties error'
        );

        this.#onTickCallback = functionIsValidAndReturnDefault(
            data?.onTick,
            false,
            'Scrolltrigger onTickCallback propierties error'
        );

        this.#align = parallaxAlignIsValid(data?.align);
        this.#onSwitch = parallaxOnSwitchIsValid(data?.onSwitch);

        this.#reverse = valueIsBooleanAndReturnDefault(
            data?.reverse,
            'Parallax reverse propierties error:',
            false
        );

        this.#opacityStart = parallaxOpacityIsValid(
            data?.opacityStart,
            'Parallax opacityStart propierties error:',
            100
        );

        this.#opacityEnd = parallaxOpacityIsValid(
            data?.opacityEnd,
            'Parallax opacityEnd propierties error:',
            0
        );

        this.#limiterOff = valueIsBooleanAndReturnDefault(
            data?.limiterOff,
            'Parallax|Scrolltrigger limiterOff propierties error:',
            false
        );

        /**
         * Common prop
         */
        this.#useWillChange = data?.useWillChange;
        this.#tween = parallaxTweenIsValid(data?.tween);

        const tweenIsSequencer =
            this.#tween?.getType &&
            this.#tween.getType() === parallaxConstant.TWEEN_TIMELINE;

        const tweenIsParallaxTween =
            this.#tween?.getType &&
            this.#tween.getType() === parallaxConstant.TWEEN_TWEEN;

        this.#item = domNodeIsValidAndReturnElOrWin(data?.item, false);
        this.#scroller = domNodeIsValidAndReturnElOrWin(data?.scroller, true);
        this.#screen = domNodeIsValidAndReturnElOrWin(data?.screen, true);
        this.#trigger = domNodeIsValidAndReturnNull(data?.trigger);
        this.#applyTo = domNodeIsValidAndReturnNull(data?.applyTo);

        this.#direction = directionIsValid(
            data?.direction,
            'Parallax/Scrolltrigger'
        );

        this.#disableForce3D = valueIsBooleanAndReturnDefault(
            data?.disableForce3D,
            'Parallax|Scrolltrigger disableForce3D propierties error:',
            false
        );

        this.#useThrottle = valueIsBooleanAndReturnDefault(
            data?.useThrottle,
            'Parallax|Scrolltrigger useThrottle propierties error:',
            false
        );

        this.#type = parallaxTypeIsValid(data?.type);

        this.#perspective = valueIsNumberAndReturnDefault(
            data?.perspective,
            'Parallax|Scrolltrigger perspective propierties error:',
            0
        );

        this.#breakpoint = breakpointIsValid(
            data?.breakpoint,
            'breakpoint',
            'parallax/scrolltrigger'
        );

        this.#queryType = breakpointTypeIsValid(
            data?.queryType,
            'queryType',
            'parallax/scrolltrigger'
        );

        /**
         * @description
         * Get properties, check if there is sequencer inside a Parallax,
         * In case return y propierties
         *
         * In case of scrollTrigger if no propierties is specified skip render.
         * Use scrollTrigger only for check events.
         */
        const { propierties, shouldTrackOnlyEvents } =
            parallaxPropiertiesIsValid(
                data?.propierties,
                this.#type,
                tweenIsParallaxTween,
                tweenIsSequencer
            );

        this.#propierties = propierties;
        this.#shouldTrackOnlyEvents = shouldTrackOnlyEvents;
        this.#range = shouldTrackOnlyEvents
            ? '100px'
            : parallaxRangeIsValid(data?.range, this.#type);

        this.#ease = valueIsBooleanAndReturnDefault(
            data?.ease,
            'Parallax|Scrolltrigger ease propierties error:',
            false
        );

        /**
         * Check if ease is spring and tween is a sequencer.
         * Not allowed.
         */
        if (tweenIsSequencer && data?.easeType === parallaxConstant.EASE_SPRING)
            parallaxEaseTypeSpringWarining();

        this.#easeType = tweenIsSequencer
            ? parallaxConstant.EASE_LERP
            : parallaxEaseTypeIsValid(data?.easeType);

        this.#springConfig = parallaxSpringConfigIsValid(
            data?.springConfig,
            this.#type
        );

        this.#lerpConfig = parallaxLerpConfigIsValid(
            data?.lerpConfig,
            this.#type
        );

        this.#motionParameters =
            this.#easeType === parallaxConstant.EASE_SPRING
                ? {
                      configProps: {
                          precision: parallaxConstant.EASE_PRECISION,
                      },
                  }
                : { precision: parallaxConstant.EASE_PRECISION };

        this.#motion =
            this.#easeType === parallaxConstant.EASE_SPRING
                ? new HandleSpring()
                : new HandleLerp();
    }

    /**
     * @description
     * Initialize instance
     */
    init() {
        if (this.#isInzialized) {
            console.warn(
                'Parallax/scrollTrigger: The init() method cannot be launched more than once. If you are passing the instance to components like horizontalScroller or smoothScroller via the children property, they will initialize the instance.'
            );
            return;
        }

        this.#isInzialized = true;
        this.#setMotion();
        this.#calcScreenPosition();
        this.#calcOffset();
        this.#calcHeight();
        this.#calcWidth();
        this.#getScreenHeight();
        this.setPerspective();

        if (this.#propierties === parallaxConstant.PROP_TWEEN) {
            this.#range = this.#tween?.getDuration
                ? this.#tween.getDuration()
                : 0;
            this.#dynamicRange = () => this.#range;
            this.#tween?.inzializeStagger?.();
        }

        if (this.#type == parallaxConstant.TYPE_SCROLLTRIGGER) {
            this.#limiterOff = true;
            this.#calcRangeAndUnitMiusure();
            this.#calcFixedLimit();
        }

        /**
         * If scroller is !== window the instance is controlled by another component
         * Use move() methods to control children
         */
        if (this.#ease) {
            /**
             *  Force transform3D onscroll start
             */
            this.#unsubscribeScrollStart = mobCore.useScrollStart(() => {
                if (!this.#disableForce3D) this.#force3D = true;
            });

            /**
             * Avoid error with scroll module operation
             * Clean render at the end of the scroll
             */
            this.#unsubscribeScrollEnd = mobCore.useScrollEnd(() => {
                mobCore.useFrame(() => {
                    mobCore.useNextTick(() => {
                        this.#smoothParallaxJs();
                    });
                });
            });

            if (this.#scroller === globalThis) {
                this.#unsubscribeScroll = getScrollFunction({
                    pin: this.#pin,
                    ease: this.#ease,
                    useThrottle: this.#useThrottle,
                    callback: () => {
                        this.#smoothParallaxJs();
                    },
                });
            }

            /**
             * First render
             */
            this.#smoothParallaxJs();
        } else {
            if (this.#scroller === globalThis) {
                this.#unsubscribeScroll = getScrollFunction({
                    pin: this.#pin,
                    ease: this.#ease,
                    useThrottle: this.#useThrottle,
                    callback: () => {
                        this.#computeValue();
                        this.#noEasingRender();
                    },
                });
            }

            /**
             * First render
             */
            this.#computeValue();
            this.#noEasingRender();

            /**
             * Execute render on scrollEnd to remove 3Dtransform
             */
            this.#unsubscribeScrollEnd = mobCore.useScrollEnd(() => {
                /**
                 * Force draw no 3d on scroll end with no ease.
                 */
                this.#noEasingRender({ forceRender: true });
            });
        }

        /**
         * Initialize marker
         */
        if (this.#scroller !== globalThis && this.#marker) {
            this.#unsubscribeMarker = mobCore.useScroll(() => {
                // Refresh marker
                this.#calcFixedLimit();
            });
        }

        /**
         * Initialize refresh
         */
        this.#unsubscribeResize = mobCore.useResize(({ horizontalResize }) => {
            if (horizontalResize) this.refresh();
        });

        /**
         * Initialize pin
         */
        if (this.#pin) {
            this.#pinInstance = new ParallaxPin();

            if (mq[this.#queryType](this.#breakpoint)) {
                mobCore.useNextTick(() => {
                    this.#getScrollerOffset();
                    this.#pinInstance?.init(this.#getPinParams());
                    this.#pinInstance?.onScroll(this.#scrollerScroll);
                });
            }
        }
    }

    #getPinParams() {
        return {
            item: this.#item,
            marker: this.#marker,
            screen: this.#screen,
            animatePin: this.#animatePin,
            anticipatePinOnLoad: this.#anticipatePinOnLoad,
            forceTranspond: this.#forceTranspond,
            invertSide: this.#invertSide,
            direction: this.#direction,
            scrollerHeight: this.#scrollerHeight,
            getStart: () => this.#startPoint,
            getEnd: () => this.#endPoint,
        };
    }

    /**
     * @description
     *
     * @param {HTMLElement|globalThis} scroller
     */
    setScroller(scroller) {
        this.#scroller = domNodeIsValidAndReturnElOrWin(scroller, true);
    }

    /**
     * @description
     *
     * @param {HTMLElement|globalThis} screen
     */
    setScreen(screen) {
        this.#screen = domNodeIsValidAndReturnElOrWin(screen, true);
    }

    /**
     * @description
     *
     * @param {string} direction
     */
    setDirection(direction) {
        this.#direction = directionIsValid(direction, 'Parallax/Scrolltrigger');
    }

    /**
     * @description
     *
     * @param {import('../../utils/type.js').mqValues} breakpoint
     */
    setBreakPoint(breakpoint) {
        this.#breakpoint = breakpointIsValid(
            breakpoint,
            'breakpoint',
            'Parallax/Scrolltrigger'
        );
    }

    /**
     * @description
     *
     * @param {import('../../utils/type.js').mqAction} queryType
     */
    setQueryType(queryType) {
        this.#queryType = breakpointTypeIsValid(
            queryType,
            'queryType',
            'Parallax/Scrolltrigger'
        );
    }

    /**
     * @private
     */
    setPerspective() {
        if (this.#perspective && this.#item && this.#item.parentNode) {
            const style = {
                perspective: `${this.#perspective}px`,
                'transform-style': 'preserve-3d',
            };
            const parent = this.#item.parentNode;
            // @ts-ignore
            Object.assign(parent.style, style);
        }
    }

    /**
     *
     */
    #setMotion() {
        const initialValue =
            parallaxConstant.PROP_SCALE ||
            parallaxConstant.PROP_SCALE_X ||
            parallaxConstant.PROP_SCALE_Y ||
            parallaxConstant.PROP_OPACITY
                ? 1
                : 0;

        this.#motion.setData({ val: initialValue });
        this.#unsubscribeMotion = this.#motion.subscribe(({ val }) => {
            if (val === this.#lastValue) return;

            if (
                this.#propierties === parallaxConstant.PROP_TWEEN &&
                this.#tween?.draw
            ) {
                this.#tween.draw({
                    partial: val,
                    isLastDraw: false,
                    useFrame: false,
                });
                this.#lastValue = val;
                this.#firstTime = false;
            } else {
                this.#updateStyle(val);
            }

            mobCore.useNextTick(() => {
                if (this.#onTickCallback)
                    this.#onTickCallback({ value: val, parentIsMoving: true });
            });
        });

        this.#unsubscribeOnComplete = this.#motion.onComplete(({ val }) => {
            this.#force3D = false;

            if (
                this.#propierties === parallaxConstant.PROP_TWEEN &&
                this.#tween?.draw
            ) {
                this.#tween.draw({
                    partial: val,
                    isLastDraw: true,
                    useFrame: false,
                });
            } else {
                this.#updateStyle(val);
            }

            mobCore.useNextTick(() => {
                if (this.#onTickCallback)
                    this.#onTickCallback({ value: val, parentIsMoving: false });
            });
        });

        switch (this.#easeType) {
            case parallaxConstant.EASE_LERP: {
                if (this.#lerpConfig && 'updateVelocity' in this.#motion) {
                    this.#motion?.updateVelocity?.(this.#lerpConfig);
                }
                break;
            }

            case parallaxConstant.EASE_SPRING: {
                if (this.#springConfig && 'updateConfig' in this.#motion) {
                    this.#motion?.updateConfig?.(this.#springConfig);
                }
                break;
            }
        }
    }

    /**
     *
     */
    #calcRangeAndUnitMiusure() {
        if (this.#dynamicRange) {
            const range = this.#dynamicRange();
            this.#numericRange = Number.isNaN(range)
                ? 0
                : Number.parseFloat(range);
            this.#unitMisure = parallaxConstant.PX;
        } else {
            const str = String(this.#range);
            const firstChar = str.charAt(0);
            const isNegative = firstChar === '-' ? -1 : 1;

            /**
             * Check if px|vw|deg or other is associated with the right props
             * Ex: rotate have a value like '45deg'
             */
            const strParsed = checkStringRangeOnPropierties(
                str,
                this.#propierties
            );

            /**
             * Extract number forms string
             */
            this.#numericRange =
                // @ts-ignore
                Number.parseFloat(strParsed.replaceAll(/^\D+/g, '')) *
                isNegative;

            /**
             * Get px|vw|etc...
             */
            this.#unitMisure = getRangeUnitMisure(strParsed);
        }
    }

    /**
     *
     */
    #calcFixedLimit() {
        const screenUnit = this.#scrollerHeight / 100;

        // Check if there is a function that return a start value dynamically
        if (
            this.#dynamicStart &&
            this.#dynamicStart?.position &&
            this.#dynamicStart?.value?.()
        ) {
            const { position, value: fn } = this.#dynamicStart;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.#start = `${position} ${valueResult}px`;
            }
        }

        // Get position ( es: 'bottom'),
        // Get processed value ( based on px || vh || vw)
        // Get additional val ( +height -halfHeight etc ..)
        const {
            value: startPoint,
            additionalVal: additionalStartVal,
            position: startPosition,
        } = getStartPoint(screenUnit, this.#start, this.#direction);

        // Check if come from top or left
        this.#invertSide =
            startPosition === parallaxConstant.POSITION_TOP ||
            startPosition === parallaxConstant.POSITION_LEFT;

        // Add/subtract with height or half value
        this.#startPoint = processFixedLimit(
            startPoint,
            additionalStartVal,
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.#height
                : this.#width,
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.#width
                : this.#height
        );

        // Check if there is a function that return a end value dynamically
        if (
            this.#dynamicEnd &&
            this.#dynamicEnd?.position &&
            this.#dynamicEnd?.value?.()
        ) {
            const { position, value: fn } = this.#dynamicEnd;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.#end = `${position} ${valueResult}px`;
            }
        }

        // Get position ( es: 'bottom'),
        // Get processed value ( based on px || vh || vw)
        // Get additional val ( +height -halfHeight etc ..)
        const {
            value: endPoint,
            additionalVal: additionalEndVal,
            position: endPosition,
        } = getEndPoint(
            screenUnit,
            this.#end,
            this.#startPoint,
            this.#scrollerHeight,
            this.#invertSide,
            this.#direction
        );

        // Get positive or negative multiplier to add or subtract value basedto the position
        const multiplier = (() => {
            if (this.#invertSide) {
                return endPosition === parallaxConstant.POSITION_BOTTOM ||
                    endPosition === parallaxConstant.POSITION_RIGHT
                    ? -1
                    : 1;
            } else {
                return endPosition === parallaxConstant.POSITION_BOTTOM ||
                    endPosition === parallaxConstant.POSITION_RIGHT
                    ? 1
                    : -1;
            }
        })();

        // Add/subtract with height or half value
        this.#endPoint = processFixedLimit(
            endPoint,
            additionalEndVal,
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.#height * multiplier
                : this.#width * multiplier,
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.#width * multiplier
                : this.#height * multiplier
        );

        this.#setMarker();

        // From left to right or top to bottom
        // the botom or right side of item sollide with start point
        if (this.#invertSide) this.#startPoint -= this.#height;
    }

    /**
     *
     */
    #setMarker() {
        if (this.#marker) {
            // Add Marker
            const { startMarker, endMarker } = parallaxMarker({
                startMarker: this.#startMarker,
                endMarker: this.#endMarker,
                startPoint: this.#startPoint,
                endPoint: this.#endPoint,
                screen: this.#screen,
                direction: this.#direction,
                invertSide: this.#invertSide,
                label: this.#marker,
            });

            this.#startMarker = startMarker;
            this.#endMarker = endMarker;
        }
    }

    /**
     *
     */
    #calcOffset() {
        const el = this.#trigger ?? this.#item;

        if (!el) return;

        let x = 0;
        let y = 0;
        let z = 0;

        if (this.#trigger) {
            x = getTranslateValues(this.#trigger)?.x ?? 0;
            y = getTranslateValues(this.#trigger)?.y ?? 0;
            z = getTranslateValues(this.#trigger)?.z ?? 0;
        }

        /**
         * Reset transform for get right offset value if transform is applied itself
         * @ts-ignore all element is not window ( check the if statement ).
         */
        el.style.transform = '';

        if (this.#direction === parallaxConstant.DIRECTION_VERTICAL) {
            this.#offset =
                this.#scroller === globalThis
                    ? Math.trunc(offset(el).top)
                    : Math.trunc(offset(el).top) -
                      offset(/** @type{HTMLElement} */ (this.#scroller)).top;
        } else {
            this.#offset =
                this.#scroller === globalThis
                    ? Math.trunc(offset(el).left)
                    : Math.trunc(offset(el).left) -
                      offset(/** @type{HTMLElement} */ (this.#scroller)).left;
        }

        if (this.#screen && this.#screen !== globalThis) {
            this.#offset -=
                this.#direction === parallaxConstant.DIRECTION_VERTICAL
                    ? Math.trunc(
                          offset(/** @type{HTMLElement} */ (this.#screen)).top
                      )
                    : Math.trunc(
                          position(/** @type{HTMLElement} */ (this.#screen))
                              .left
                      );
        }

        if (this.#trigger && (x !== 0 || y !== 0 || z !== 0)) {
            this.#trigger.style.transform = `translate3D(${x}px, ${y}px, ${z}px)`;
        }
    }

    /**
     *
     */
    #calcScreenPosition() {
        if (this.#screen === globalThis || !this.#screen) return;

        /**
         * @ts-ignore all element is not window ( check the if statement ).
         */
        this.#screenPosition =
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? Math.trunc(
                      offset(/** @type{HTMLElement} */ (this.#screen)).top
                  )
                : Math.trunc(
                      position(/** @type{HTMLElement} */ (this.#screen)).left
                  );
    }

    /**
     *
     */
    #calcHeight() {
        const el = this.#trigger ?? this.#item;

        if (!el) return;

        this.#height =
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? Math.trunc(el.offsetHeight)
                : Math.trunc(el.offsetWidth);
    }

    /**
     *
     */
    #calcWidth() {
        const el = this.#trigger ?? this.#item;

        if (!el) return;

        this.#width =
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? Math.trunc(el.offsetWidth)
                : Math.trunc(el.offsetHeight);
    }

    /**
     *
     */
    #getScrollerOffset() {
        if (!this.#scroller) return;

        if (this.#scroller === globalThis) {
            this.#scrollerScroll =
                this.#direction === parallaxConstant.DIRECTION_VERTICAL
                    ? this.#scroller.scrollY
                    : this.#scroller.scrollX;
        } else {
            this.#scrollerScroll =
                this.#direction === parallaxConstant.DIRECTION_VERTICAL
                    ? -offset(/** @type{HTMLElement} */ (this.#scroller)).top
                    : -offset(/** @type{HTMLElement} */ (this.#scroller)).left;
        }
    }

    /**
     *
     */
    #getScreenHeight() {
        if (!this.#screen) return;

        this.#windowInnerWidth = window.innerWidth;
        this.#windowInnerHeight = window.innerHeight;

        /**
         * @ts-ignore all element is not window ( check the if statement ).
         */
        if (this.#screen === globalThis) {
            this.#scrollerHeight =
                this.#direction === parallaxConstant.DIRECTION_VERTICAL
                    ? window.innerHeight
                    : window.innerWidth;
        } else {
            this.#scrollerHeight =
                this.#direction === parallaxConstant.DIRECTION_VERTICAL
                    ? // @ts-ignore
                      Math.trunc(this.#screen.offsetHeight)
                    : // @ts-ignore
                      Math.trunc(this.#screen.offsetWidth);
        }
    }

    /**
     * @description
     * Recalculate positions and align all values
     */
    refresh() {
        if (this.#pin && this.#pinInstance) this.#pinInstance.destroy();

        this.#calcScreenPosition();
        this.#calcOffset();
        this.#calcHeight();
        this.#calcWidth();
        this.#getScreenHeight();

        if (this.#type == parallaxConstant.TYPE_SCROLLTRIGGER) {
            this.#calcFixedLimit();
            if (this.#dynamicRange) this.#calcRangeAndUnitMiusure();

            if (
                this.#pin &&
                this.#pinInstance &&
                mq[this.#queryType](this.#breakpoint)
            ) {
                this.#pinInstance?.init(this.#getPinParams());
            }
        }
        //
        // reset value to update animation after resize
        this.#lastValue = undefined;
        this.#firstTime = true;

        //
        if (mq[this.#queryType](this.#breakpoint)) {
            if (this.#ease) {
                this.#smoothParallaxJs();
            } else {
                this.#computeValue();

                // Disable 3d transform at first render after refresh.
                this.#noEasingRender({ forceRender: true });
            }
        } else {
            if (this.#ease) this.#motion?.stop?.();

            // Reset Style
            // For tween is necessary reset inside tween callback
            mobCore.useFrameIndex(() => {
                if (this.#applyTo) {
                    this.#resetTweenStyle(this.#applyTo);
                    Object.assign(this.#applyTo.style, this.#getResetStyle());
                } else {
                    this.#resetTweenStyle(this.#item);
                    if (this.#item)
                        Object.assign(this.#item.style, this.#getResetStyle());
                }
            }, 3);
        }
    }

    /**
     * @description
     * Method used to control the instance from the outside.
     * The methods accept two parameters:
     *
     * `value`: The scroll position of the parent.
     * If no value is provided, the instance will calculate it autonomously.
     *
     * `parentIsMoving`: Value that indicates if the component using the method is moving.
     * The value is used to manage the addition of the translate3D property.
     * The default value is false
     *
     *
     * @example
     * ```javascript
     *
     *
     * Control the instance from another scrollTrigger:
     *
     * const myScroller = mobbu.createScrollTrigger({
     *     ...
     *     onTick: ({ value, parentIsMoving }) => {
     *         myInstance.move({ value, parentIsMoving });
     *     },
     *     ...
     * });
     * ```
     *
     * @param {import('./type.js').parallaxMoveType} obj
     *
     */
    move({ value, parentIsMoving = false }) {
        if (!mq[this.#queryType](this.#breakpoint) || !value) return;
        this.#iSControlledFromOutside = true;

        const scrollVal = this.#getScrollValueOnMove(value);

        if (this.#ease) {
            this.#smoothParallaxJs(scrollVal);
        } else {
            this.#computeValue(scrollVal);
            const forceRender =
                this.#isInViewport || this.#firstTime || undefined;
            this.#noEasingRender({ forceRender, parentIsMoving });
        }
    }

    /**
     * @description
     * Trigger scrollStart event
     * Used by smoothScroll to activate 3D if child (this) have ease = true
     */
    triggerScrollStart() {
        if (!this.#ease) return;
        if (!this.#disableForce3D) this.#force3D = true;
    }

    /**
     * @description
     * Trigger scrollEnd event
     * Used by smoothScroll to deactivate 3D if child (this) have ease = false
     */
    triggerScrollEnd() {
        if (this.#ease) return;

        this.#noEasingRender({ forceRender: true });
    }

    /**
     * @param {number|undefined} value
     */
    #getScrollValueOnMove(value) {
        if (value === undefined) return;
        if (this.#screen !== globalThis) return value + this.#screenPosition;

        return value;
    }

    /**
     * @description
     * Stop lerp|spring tween.
     */
    stopMotion() {
        this.#motion?.stop?.();
    }

    /**
     * @param {number} [ scrollVal ]
     */
    #smoothParallaxJs(scrollVal) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        this.#computeValue(scrollVal);

        // Skip motion fixed type
        if (
            !this.#fixedShouldRender &&
            !this.#firstTime &&
            this.#type === parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        // Skip motion default type
        if (
            !this.#isInViewport &&
            !this.#firstTime &&
            this.#type === parallaxConstant.TYPE_PARALLAX
        )
            return;

        // First time render with no easing
        const action =
            this.#firstTime && !this.#animateAtStart ? 'set' : 'goTo';

        // Maybe a destroy method is callad during animation, so check if exist.
        if (!this.#motion) return;

        this.#motion
            [action]({ val: this.#endValue }, this.#motionParameters)
            .catch(() => {});
    }

    /**
     * @param {number} [ scrollVal ]
     */
    #computeValue(scrollVal) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        if (scrollVal) {
            this.#scrollerScroll = -scrollVal;
        } else {
            this.#getScrollerOffset();
        }

        this.#isInViewport = detectViewPortInterception({
            offset: this.#offset,
            height: this.#height,
            gap: this.#gap,
            wScrollTop: this.#scrollerScroll,
            wHeight: this.#scrollerHeight,
        });

        // Skip motion default with limiterOff not active
        if (
            !this.#isInViewport &&
            !this.#limiterOff &&
            this.#type === parallaxConstant.TYPE_PARALLAX
        )
            return;

        if (this.#pin && this.#pinInstance) {
            this.#pinInstance.onScroll(this.#scrollerScroll);
        }

        switch (this.#type) {
            case parallaxConstant.TYPE_SCROLLTRIGGER: {
                this.#endValue = getRoundedValue(this.#getFixedValue());
                break;
            }

            default: {
                switch (this.#propierties) {
                    case parallaxConstant.PROP_OPACITY: {
                        this.#endValue = getRoundedValue(
                            this.#getOpacityValue()
                        );
                        break;
                    }

                    default: {
                        this.#endValue = Number.isNaN(
                            // @ts-ignore
                            Number.parseInt(this.#align)
                        )
                            ? getRoundedValue(this.#getIsNaNValue() / 2)
                            : getRoundedValue(this.#getIsANumberValue() / 2);
                        break;
                    }
                }
            }
        }

        /**
         * Get reverse value
         */
        const reverseValue =
            this.#reverse && this.#type !== parallaxConstant.TYPE_SCROLLTRIGGER
                ? getRetReverseValue(this.#propierties, this.#endValue)
                : this.#endValue;

        /**
         * Get switch after 0 value for non scrolTrigger
         */
        this.#endValue =
            this.#type === parallaxConstant.TYPE_SCROLLTRIGGER
                ? reverseValue
                : this.#getSwitchAfterZeroValue(reverseValue);
    }

    /**
     *
     */
    #noEasingRender({ forceRender = false, parentIsMoving = false } = {}) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        mobCore.useFrame(() => {
            this.#cleanRender({ forceRender, parentIsMoving });
        });
    }

    /**
     *
     */
    #cleanRender({ forceRender = false, parentIsMoving = false } = {}) {
        /**
         * Skip unnecessary rendering ( no control from outside )
         */
        if (
            (this.#endValue === this.#lastValue && !forceRender) ||
            (!this.#isInViewport && !forceRender)
        )
            return;

        /**
         * Set force3D if is not control from outside.
         */
        if (!this.#disableForce3D && !this.#iSControlledFromOutside)
            this.#force3D = !forceRender;

        /**
         * Set force3D if is control from outside.
         */
        if (!this.#disableForce3D && this.#iSControlledFromOutside)
            this.#force3D = parentIsMoving && this.#isInViewport;

        /**
         * Draw
         */
        if (this.#propierties === parallaxConstant.PROP_TWEEN) {
            this.#tween.draw({
                partial: this.#endValue,
                isLastDraw: !this.#force3D,
                useFrame: false,
            });
            this.#lastValue = this.#endValue;
            this.#firstTime = false;
        } else {
            this.#updateStyle(this.#endValue);
        }

        /**
         * Children
         */
        mobCore.useNextTick(() => {
            if (this.#onTickCallback)
                this.#onTickCallback({
                    value: this.#endValue,
                    parentIsMoving: this.#force3D,
                });
        });
    }

    /**
     * @param {number} value
     */
    #updateStyle(value) {
        if (this.#applyTo) {
            Object.assign(this.#applyTo.style, this.#getStyle(value));
        } else if (this.#item) {
            Object.assign(this.#item.style, this.#getStyle(value));
        }

        this.#lastValue = value;
        this.#firstTime = false;
    }

    /**
     *
     */
    #getFixedValue() {
        const partials = this.#invertSide
            ? -(
                  this.#scrollerScroll +
                  this.#startPoint +
                  this.#endPoint -
                  (this.#offset + this.#endPoint)
              )
            : -(
                  this.#scrollerScroll +
                  this.#scrollerHeight -
                  this.#startPoint -
                  (this.#offset + this.#endPoint)
              );

        const maxVal = (this.#endPoint / 100) * this.#numericRange;
        const partialVal = (partials / 100) * this.#numericRange;

        const valePerDirections = (() => {
            if (this.#fromTo) {
                return this.#invertSide ? maxVal - partialVal : partialVal;
            } else {
                return this.#invertSide ? partialVal : maxVal - partialVal;
            }
        })();

        const clampValue =
            maxVal > 0
                ? -clamp(valePerDirections, 0, maxVal)
                : -clamp(valePerDirections, maxVal, 0);

        this.#fixedShouldRender = this.#prevFixedClamp !== clampValue;
        this.#prevFixedClamp = clampValue;
        if (!this.#fixedShouldRender && !this.#firstTime) return this.#endValue;

        const percentValue = (clampValue * 100) / this.#endPoint;

        // Fire callback if there is
        if (
            this.#onEnter ||
            this.#onEnterBack ||
            this.#onLeave ||
            this.#onLeaveBack
        ) {
            parallaxEmitter({
                prevValue: this.#prevFixedRawValue,
                value: valePerDirections,
                maxVal: maxVal,
                onEnter: this.#onEnter,
                onEnterBack: this.#onEnterBack,
                onLeave: this.#onLeave,
                onLeaveBack: this.#onLeaveBack,
            });
        }

        this.#prevFixedRawValue = valePerDirections;

        switch (this.#propierties) {
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_VERTICAL: {
                return this.#getHVval(percentValue);
            }

            case parallaxConstant.PROP_SCALE:
            case parallaxConstant.PROP_SCALE_X:
            case parallaxConstant.PROP_SCALE_Y:
            case parallaxConstant.PROP_OPACITY: {
                return 1 - percentValue;
            }

            default: {
                return -percentValue;
            }
        }
    }

    /**
     * @param {number} percent
     */
    #getHVval(percent) {
        switch (this.#unitMisure) {
            case parallaxConstant.VW: {
                return (this.#windowInnerWidth / 100) * -percent;
            }

            case parallaxConstant.VH: {
                return (this.#windowInnerHeight / 100) * -percent;
            }

            case parallaxConstant.WPERCENT: {
                return this.#direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.#width / 100) * -percent
                    : (this.#height / 100) * -percent;
            }

            case parallaxConstant.HPERCENT: {
                return this.#direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.#height / 100) * -percent
                    : (this.#width / 100) * -percent;
            }

            default: {
                return -percent;
            }
        }
    }

    /**
     *
     */
    #getOpacityValue() {
        const vhLimit = (this.#scrollerHeight / 100) * this.#opacityEnd;
        const vhStart =
            this.#scrollerHeight -
            (this.#scrollerHeight / 100) * this.#opacityStart;

        const value =
            this.#align == parallaxConstant.ALIGN_START
                ? -this.#scrollerScroll * -1
                : (this.#scrollerScroll + vhLimit - this.#offset) * -1;

        const valClamped =
            this.#align == parallaxConstant.ALIGN_START
                ? 1 - value / this.#offset
                : 1 - value / (this.#scrollerHeight - vhStart - vhLimit);

        return clamp(valClamped, 0, 1);
    }

    /**
     *
     */
    #getIsNaNValue() {
        const valuetoNumber = Number(this.#range);
        const rangeNumber = Number.isNaN(valuetoNumber) ? 0 : valuetoNumber;

        const documentHeight =
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;

        // Prefixed align
        switch (this.#align) {
            case parallaxConstant.ALIGN_START: {
                return this.#scrollerScroll / rangeNumber;
            }

            case parallaxConstant.ALIGN_TOP:
            case parallaxConstant.ALIGN_LEFT: {
                return (this.#scrollerScroll - this.#offset) / rangeNumber;
            }

            case parallaxConstant.ALIGN_CENTER: {
                return (
                    (this.#scrollerScroll +
                        (this.#scrollerHeight / 2 - this.#height / 2) -
                        this.#offset) /
                    rangeNumber
                );
            }

            case parallaxConstant.ALIGN_BOTTOM:
            case parallaxConstant.ALIGN_RIGHT: {
                return (
                    (this.#scrollerScroll +
                        (this.#scrollerHeight - this.#height) -
                        this.#offset) /
                    rangeNumber
                );
            }

            case parallaxConstant.ALIGN_END: {
                return (
                    -(
                        documentHeight -
                        (this.#scrollerScroll + this.#scrollerHeight)
                    ) / rangeNumber
                );
            }

            default: {
                return 0;
            }
        }
    }

    /**
     *
     * Here the value is a number.
     */
    #getIsANumberValue() {
        const align = Number(this.#align);
        const range = Number(this.#range);

        return (
            (this.#scrollerScroll +
                (this.#scrollerHeight / 100) * align -
                this.#offset) /
            range
        );
    }

    /**
     * @param {number} value
     */
    #getSwitchAfterZeroValue(value) {
        return getValueOnSwitch({
            switchPropierties: this.#onSwitch,
            isReverse: this.#reverse,
            value,
        });
    }

    /**
     * @param {number} value
     */
    #getStyle(value) {
        if (this.#shouldTrackOnlyEvents) return;

        const force3DStyle = this.#force3D ? 'translate3D(0px, 0px, 0px)' : '';

        /**
         * If frame drop ia lot (2/5) activate 'will-change: transform;'
         */
        this.#willChangeIsActive = this.#useWillChange
            ? mobCore.mustMakeSomething()
            : false;
        const shouldWill =
            this.#willChangeIsActive && this.#force3D ? 'transform' : '';

        /**
         * If frame drop a little (1/5) remove decimal.
         * Used by transform ( not scale ).
         */
        const valueParsed = mobCore.shouldMakeSomething()
            ? Math.round(value)
            : value;

        switch (this.#propierties) {
            case parallaxConstant.PROP_VERTICAL: {
                return {
                    // translate: `0 ${val}px`,
                    // transform: `${force3DStyle}`,
                    transform: `${force3DStyle} translateY(${valueParsed}px)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_HORIZONTAL: {
                return {
                    transform: `${force3DStyle} translateX(${valueParsed}px)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATE: {
                return {
                    transform: `${force3DStyle} rotate(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATEY: {
                return {
                    transform: `${force3DStyle} rotateY(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATEX: {
                return {
                    transform: `${force3DStyle} rotateX(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATEZ: {
                return {
                    transform: `${force3DStyle} rotateZ(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_OPACITY: {
                return { opacity: `${value}` };
            }

            case parallaxConstant.PROP_SCALE: {
                const scaleVal =
                    this.#type === parallaxConstant.TYPE_SCROLLTRIGGER
                        ? value
                        : 1 + value / 1000;
                return {
                    transform: `${force3DStyle} scale(${scaleVal})`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_SCALE_X: {
                const scaleVal =
                    this.#type === parallaxConstant.TYPE_SCROLLTRIGGER
                        ? value
                        : 1 + value / 1000;
                return {
                    transform: `${force3DStyle} scaleX(${scaleVal})`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_SCALE_Y: {
                const scaleVal =
                    this.#type === parallaxConstant.TYPE_SCROLLTRIGGER
                        ? value
                        : 1 + value / 1000;
                return {
                    transform: `${force3DStyle} scaleY(${scaleVal})`,
                    willChange: shouldWill,
                };
            }

            default: {
                return {
                    [this.#propierties.toLowerCase()]: `${value}px`,
                };
            }
        }
    }

    /**
     * @description
     * Reset sequencer/parallaxTween style
     *
     * @param {HTMLElement|null} item
     */
    #resetTweenStyle(item) {
        // @ts-ignore
        if (this.#tween) item.style = '';
    }

    /**
     * @description
     * Reset default style
     */
    #getResetStyle() {
        if (this.#shouldTrackOnlyEvents) return;

        switch (this.#propierties) {
            case parallaxConstant.PROP_VERTICAL:
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_ROTATE:
            case parallaxConstant.PROP_ROTATEY:
            case parallaxConstant.PROP_ROTATEX:
            case parallaxConstant.PROP_ROTATEZ:
            case parallaxConstant.PROP_SCALE: {
                return {
                    transform: ``,
                };
            }

            case parallaxConstant.PROP_OPACITY: {
                return { opacity: `` };
            }

            default: {
                return { [this.#propierties.toLowerCase()]: `` };
            }
        }
    }

    /**
     * @description
     * Destroy instance
     */
    destroy() {
        this.#motion?.stop?.();
        this.#unsubscribeScroll();
        this.#unsubscribeScrollStart();
        this.#unsubscribeScrollEnd();
        this.#unsubscribeResize();
        this.#unsubscribeMotion();
        this.#unsubscribeOnComplete();
        this.#unsubscribeMarker();
        this.#motion?.destroy?.();
        this.#dynamicRange = () => {};
        this.#onEnter = () => {};
        this.#onEnterBack = () => {};
        this.#onLeave = () => {};
        this.#onLeaveBack = () => {};
        this.#onTickCallback = () => {};
        if (this.#pin && this.#pinInstance) this.#pinInstance?.destroy?.();
        if (this.#startMarker) this.#startMarker?.remove?.();
        if (this.#endMarker) this.#endMarker?.remove?.();
        this.#startMarker = undefined;
        this.#endMarker = undefined;
        this.#pinInstance = undefined;
        this.#endValue = 0;

        // Remove style from element, if style prop exist.
        const el = this.#applyTo ?? this.#item;
        // @ts-ignore
        if (el && 'style' in el) el.style = '';

        /**
         * Remove HTMLELement reference.
         */
        this.#item = null;
        this.#scroller = null;
        this.#screen = null;
        this.#trigger = null;
        this.#applyTo = null;
    }
}
