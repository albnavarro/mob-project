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
} from './parallaxUtils.js';

export default class ParallaxClass {
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
        /**
         * @private
         *
         * @type {boolean}
         */
        this.isInzialized = false;

        /**
         * @private
         *
         * @type {boolean}
         */
        this.firstScroll = false;

        /**
         * @private
         *
         * @type {boolean}
         */
        this.willChangeIsActive = false;

        /**
         * @private
         *
         * @type {number}
         */
        this.offset = 0;

        /**
         * @private
         *
         * @type {number}
         */
        this.screenPosition = 0;

        /**
         * @private
         *
         * @type {number}
         */
        this.endValue = 0;

        /**
         * @private
         *
         * @type {number}
         */
        this.height = 0;

        /**
         * @private
         *
         * @type {number}
         */
        this.width = 0;

        /**
         * @private
         *
         * @type {number}
         */
        this.scrollerScroll = 0;

        /**
         * @private
         *
         * @type {number}
         */
        this.scrollerHeight = 0;

        /**
         * @private
         *
         * @type {number}
         */
        this.windowInnerWidth = window.innerWidth;

        /**
         * @private
         *
         * @type {number}
         */
        this.windowInnerHeight = window.innerHeight;

        /**
         * @private
         *
         * @type {number}
         */
        this.gap = 150;

        /**
         * @private
         *
         * @type {number}
         */
        this.numericRange = 0;

        /**
         * @private
         * @type {function}
         */
        this.unsubscribeResize = () => {};

        /**
         * @private
         * @type {function}
         */
        this.unsubscribeScroll = () => {};

        /**
         * @private
         * @type {function}
         */
        this.unsubscribeScrollStart = () => {};

        /**
         * @private
         * @type {function}
         */
        this.unsubscribeScrollEnd = () => {};

        /**
         * @private
         * @type {function}
         */
        this.unsubscribeMarker = () => {};

        /**
         * @private
         * @type {Element|undefined}
         */
        this.startMarker = undefined;

        /**
         * @private
         * @type {Element|undefined}
         */
        this.endMarker = undefined;

        /**
         * @private
         * @type {number|undefined}
         */
        this.lastValue = undefined;

        /**
         * @private
         * @type {number}
         */
        this.prevFixedRawValue = 0;

        /**
         * @private
         * @type {boolean}
         */
        this.fixedShouldRender = false;

        /**
         * @private
         * @type {number|undefined}
         */
        this.prevFixedClamp = undefined;

        /**
         * @private
         * @type {boolean}
         */
        this.firstTime = true;

        /**
         * @private
         * @type {boolean}
         */
        this.isInViewport = false;

        /**
         * @private
         * @type {boolean}
         */
        this.iSControlledFromOutside = false;

        /**
         * @private
         * @type {boolean}
         */
        this.force3D = false;

        /**
         * @private
         * @type {object|undefined}
         */
        this.pinInstance = undefined;

        /**
         * @private
         * @type {string}
         */
        this.unitMisure = '';

        /**
         * @private
         * @type {number}
         */
        this.startPoint = 0;

        /**
         * @private
         * @type {number}
         */
        this.endPoint = 0;

        /**
         * @private
         * @type {function}
         */
        this.unsubscribeMotion = () => {};

        /**
         * @private
         * @type {function}
         */
        this.unsubscribeOnComplete = () => {};

        /**
         * Fixed prop
         */

        /**
         * @description
         * @type {boolean}
         */
        this.pin = valueIsBooleanAndReturnDefault(
            data?.pin,
            'Scrolltrigger pin propierties error:',
            false
        );

        /**
         * @description
         * @type {boolean}
         */
        this.animatePin = valueIsBooleanAndReturnDefault(
            data?.animatePin,
            'Scrolltrigger animatePin propierties error:',
            false
        );

        /**
         * @description
         * @type {boolean}
         */
        this.forceTranspond = valueIsBooleanAndReturnDefault(
            data?.forceTranspond,
            'Scrolltrigger forceTranspond propierties error:',
            false
        );

        /**
         * @description
         * @type {boolean}
         */
        this.anticipatePinOnLoad = valueIsBooleanAndReturnDefault(
            data?.anticipatePinOnLoad,
            'Scrolltrigger anticipatePinOnLoad propierties error:',
            false
        );

        /**
         * @description
         * @type {string}
         */
        this.start = valueIsStringAndReturnDefault(
            data?.start,
            'Scrolltrigger start propierties error:',
            'bottom 0px'
        );

        /**
         * @description
         * @type {string}
         */
        this.end = valueIsStringAndReturnDefault(
            data?.end,
            'Scrolltrigger end propierties error:',
            'top'
        );

        /**
         * @description
         * @type {boolean}
         */
        this.fromTo = valueIsBooleanAndReturnDefault(
            data?.fromTo,
            'Scrolltrigger fromTo propierties error:',
            false
        );

        /**
         * @description
         * @type {boolean}
         */
        this.invertSide = valueIsBooleanAndReturnDefault(
            data?.invertSide,
            'Scrolltrigger invertSide propierties error:',
            false
        );

        /**
         * @description
         * @type {string}
         */
        this.marker = valueIsStringAndReturnDefault(
            data?.marker,
            'Scrolltrigger marker propierties error:',
            null
        );

        /**
         * @description
         * @type {import('./type.js').dynamicStartType}
         */
        this.dynamicStart = data?.dynamicStart
            ? parallaxDynamicValueIsValid(data.dynamicStart, 'dynamicStart')
            : null;

        /**
         * @description
         * @type {import('./type.js').dynamicEndType}
         */
        this.dynamicEnd = data?.dynamicEnd
            ? parallaxDynamicValueIsValid(data.dynamicEnd, 'dynamicEnd')
            : null;

        /**
         * @description
         * @type {function}
         */
        this.dynamicRange = parallaxDynamicRangeIsValid(data?.dynamicRange);

        /**
         * @description
         * @type {boolean}
         */
        this.animateAtStart = valueIsBooleanAndReturnDefault(
            data?.animateAtStart,
            'Scrolltrigger animateAtStart propierties error:',
            false
        );

        /**
         * @description
         * @type {function}
         */
        this.onEnter = functionIsValidAndReturnDefault(
            data?.onEnter,
            false,
            'Scrolltrigger onEnter propierties error'
        );

        /**
         * @description
         * @type {function}
         */
        this.onEnterBack = functionIsValidAndReturnDefault(
            data?.onEnterBack,
            false,
            'Scrolltrigger onEnterBack propierties error'
        );

        /**
         * @description
         * @type {function}
         */
        this.onLeave = functionIsValidAndReturnDefault(
            data?.onLeave,
            false,
            'Scrolltrigger onLeave propierties error'
        );

        /**
         * @description
         * @type {function}
         */
        this.onLeaveBack = functionIsValidAndReturnDefault(
            data?.onLeaveBack,
            false,
            'Scrolltrigger onLeaveBack propierties error'
        );

        /**
         * @description
         * @type {function}
         */
        this.onTickCallback = functionIsValidAndReturnDefault(
            data?.onTick,
            false,
            'Scrolltrigger onTickCallback propierties error'
        );

        /**
         * @description
         * @type {string|number}
         */
        this.align = parallaxAlignIsValid(data?.align);

        /**
         * @description
         * @type {string}
         */
        this.onSwitch = parallaxOnSwitchIsValid(data?.onSwitch);

        /**
         * @description
         * @type {boolean}
         */
        this.reverse = valueIsBooleanAndReturnDefault(
            data?.reverse,
            'Parallax reverse propierties error:',
            false
        );

        /**
         * @description
         * @type {number}
         */
        this.opacityStart = parallaxOpacityIsValid(
            data?.opacityStart,
            'Parallax opacityStart propierties error:',
            100
        );

        /**
         * @description
         * @type {number}
         */
        this.opacityEnd = parallaxOpacityIsValid(
            data?.opacityEnd,
            'Parallax opacityEnd propierties error:',
            0
        );

        /**
         * @description
         * @type {boolean}
         */
        this.limiterOff = valueIsBooleanAndReturnDefault(
            data?.limiterOff,
            'Parallax|Scrolltrigger limiterOff propierties error:',
            false
        );

        /**
         * Common prop
         */

        /**
         * @description
         * @type {boolean|undefined}
         */
        this.useWillChange = data?.useWillChange;

        /**
         * @description
         * @type {object}
         */
        this.tween = parallaxTweenIsValid(data?.tween);

        /**
         * @description
         * @type {boolean}
         */
        const tweenIsSequencer =
            this.tween?.getType &&
            this.tween.getType() === parallaxConstant.TWEEN_TIMELINE;

        /**
         * @description
         * @type {boolean}
         */
        const tweenIsParallaxTween =
            this.tween?.getType &&
            this.tween.getType() === parallaxConstant.TWEEN_TWEEN;
        /**
         *
         */

        /**
         * @description
         * @type {HTMLElement|null}
         */
        this.item = domNodeIsValidAndReturnElOrWin(data?.item, false);

        /**
         * @description
         * @type {HTMLElement|Window|null}
         */
        this.scroller = domNodeIsValidAndReturnElOrWin(data?.scroller, true);

        /**
         * @description
         * @type {HTMLElement|Window|null}
         */
        this.screen = domNodeIsValidAndReturnElOrWin(data?.screen, true);

        /**
         * @description
         * @type {HTMLElement|null|null}
         */
        this.trigger = domNodeIsValidAndReturnNull(data?.trigger);

        /**
         * @description
         * @type {HTMLElement|null}
         */
        this.applyTo = domNodeIsValidAndReturnNull(data?.applyTo);

        /**
         * @description
         * @type {string}
         */
        this.direction = directionIsValid(
            data?.direction,
            'Parallax/Scrolltrigger'
        );

        /**
         * @description
         * @type {boolean}
         */
        this.disableForce3D = valueIsBooleanAndReturnDefault(
            data?.disableForce3D,
            'Parallax|Scrolltrigger disableForce3D propierties error:',
            false
        );

        // With pin active no throttle is usable, pin need precision
        /**
         * @description
         * @type {boolean}
         */
        this.useThrottle = valueIsBooleanAndReturnDefault(
            data?.useThrottle,
            'Parallax|Scrolltrigger useThrottle propierties error:',
            false
        );

        /**
         * @description
         * @type {string}
         */
        this.type = parallaxTypeIsValid(data?.type);

        /**
         * @description
         * @type {string|number}
         */
        this.range = parallaxRangeIsValid(data?.range, this.type);

        /**
         * @description
         * @type {number}
         */
        this.perspective = valueIsNumberAndReturnDefault(
            data?.perspective,
            'Parallax|Scrolltrigger perspective propierties error:',
            0
        );

        /**
         * @description
         * @type {string}
         */
        this.breakpoint = breakpointIsValid(
            data?.breakpoint,
            'breakpoint',
            'parallax/scrolltrigger'
        );

        /**
         * @description
         * @type {string}
         */
        this.queryType = breakpointTypeIsValid(
            data?.queryType,
            'queryType',
            'parallax/scrolltrigger'
        );

        /**
         * @description
         * Get properties, check if there is sequencer inside a Parallax,
         * In case return y propierties
         *
         * @type {string}
         */
        this.propierties = parallaxPropiertiesIsValid(
            data?.propierties,
            this.type,
            tweenIsParallaxTween,
            tweenIsSequencer
        );

        /**
         * @description
         * Get properties, check if there is sequencer inside a Parallax,
         * In case return y propierties
         *
         * @type {boolean}
         */
        this.ease = valueIsBooleanAndReturnDefault(
            data?.ease,
            'Parallax|Scrolltrigger ease propierties error:',
            false
        );

        /**
         * @description
         * Get easeType properties, Check if a sequencer is used inside a scrollTrigger
         * In case return a lerp
         *
         * @type {string}
         */
        this.easeType = parallaxEaseTypeIsValid(
            data?.easeType,
            tweenIsSequencer,
            this.type === parallaxConstant.TYPE_SCROLLTRIGGER
        );

        /**
         * @description
         * Get easeType properties, Check if a sequencer is used inside a scrollTrigger
         * In case return a lerp
         *
         * @type {string}
         */
        this.springConfig = parallaxSpringConfigIsValid(
            data?.springConfig,
            this.type
        );

        /**
         * @description
         * Get easeType properties, Check if a sequencer is used inside a scrollTrigger
         * In case return a lerp
         *
         * @type {number}
         */
        this.lerpConfig = parallaxLerpConfigIsValid(
            data?.lerpConfig,
            this.type
        );

        /**
         * @description
         * Add more precision to motion spring/lerp to trigger better force3D
         *
         * @type {any}
         */
        this.motionParameters =
            this.easeType === parallaxConstant.EASE_SPRING
                ? { configProp: { precision: parallaxConstant.EASE_PRECISION } }
                : { precision: parallaxConstant.EASE_PRECISION };

        /**
         * @description
         * Add more precision to motion spring/lerp to trigger better force3D
         *
         * @type {object}
         */
        this.motion = (() => {
            if (tweenIsSequencer) {
                this.easeType = parallaxConstant.EASE_LERP;
                // Force lerp motion parameters if tween is a sequencer
                this.motionParameters = {
                    precision: parallaxConstant.EASE_PRECISION,
                };
            }

            return this.easeType === parallaxConstant.EASE_SPRING
                ? new HandleSpring()
                : new HandleLerp();
        })();
    }

    /**
     * @description
     * Initialize instance
     */
    init() {
        if (this.isInzialized) {
            console.warn(
                'Parallax/scrollTrigger: The init() method cannot be launched more than once. If you are passing the instance to components like horizontalScroller or smoothScroller via the children property, they will initialize the instance.'
            );
            return;
        }

        this.isInzialized = true;
        this.setMotion();
        this.calcScreenPosition();
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();
        this.setPerspective();

        if (this.propierties === parallaxConstant.PROP_TWEEN) {
            this.range = this?.tween?.getDuration
                ? this.tween.getDuration()
                : 0;
            this.dynamicRange = () => this.range;
            this.tween?.inzializeStagger?.();
        }

        if (this.type == parallaxConstant.TYPE_SCROLLTRIGGER) {
            this.limiterOff = true;
            this.calcRangeAndUnitMiusure();
            this.calcFixedLimit();
        }

        /**
         * @description
         * If use pin we have to get fresh value on scroll
         * Otherwise we can optimize and fire scroll callback after requerst animationFrame
         *
         * @param {function():void} cb
         */
        const getScrollfucuntion = (cb) => {
            if (this.pin) {
                this.unsubscribeScroll = mobCore.useScrollImmediate(cb);
                return mobCore.useScrollImmediate;
            } else {
                (() => {
                    if (this.ease && this.useThrottle) {
                        this.unsubscribeScroll = mobCore.useScrollThrottle(cb);
                        return mobCore.useScrollThrottle;
                    } else {
                        this.unsubscribeScroll = mobCore.useScroll(cb);
                        return mobCore.useScroll;
                    }
                })();
            }
        };

        /**
         * If scroller is !== window the instance is controlled by another component
         * Use move() methods to control children
         */
        if (this.ease) {
            /**
             *  Force transform3D onscroll start
             */
            this.unsubscribeScrollStart = mobCore.useScrollStart(() => {
                this.firstScroll = true;
                if (!this.disableForce3D) this.force3D = true;
            });

            /**
             * Avoid error with scroll module operation
             * Clean render at the end of the scroll
             */
            this.unsubscribeScrollEnd = mobCore.useScrollEnd(() => {
                mobCore.useFrame(() => {
                    mobCore.useNextTick(() => {
                        this.smoothParallaxJs();
                    });
                });
            });

            if (this.scroller === window) {
                getScrollfucuntion(() => {
                    /**
                     * Unde handleFrame module operation to skip scroll
                     * when performance drop down.
                     * FIrst render is always done
                     */
                    if (!mobCore.getShouldRender() && !this.firstScroll) {
                        return;
                    }

                    this.firstScroll = false;
                    this.smoothParallaxJs();
                });
            }

            /**
             * First render
             */
            this.smoothParallaxJs();
        } else {
            if (this.scroller === window) {
                getScrollfucuntion(() => {
                    this.computeValue();
                    this.noEasingRender();
                });
            }

            /**
             * First render
             */
            this.computeValue();
            this.noEasingRender();

            /**
             * Execute render on scrollEnd to remove 3Dtransform
             */
            this.unsubscribeScrollEnd = mobCore.useScrollEnd(() => {
                /**
                 * Force draw no 3d on scroll end with no ease.
                 */
                this.noEasingRender({ forceRender: true });
            });
        }

        /**
         * Initialize marker
         */
        if (this.scroller !== window && this.marker) {
            this.unsubscribeMarker = mobCore.useScroll(() => {
                // Refresh marker
                this.calcFixedLimit();
            });
        }

        /**
         * Initialize refresh
         */
        this.unsubscribeResize = mobCore.useResize(({ horizontalResize }) => {
            if (horizontalResize) this.refresh();
        });

        /**
         * Initialize pin
         */
        if (this.pin) {
            this.pinInstance = new ParallaxPin();

            if (mq[this.queryType](this.breakpoint)) {
                mobCore.useNextTick(() => {
                    this.getScrollerOffset();
                    this.pinInstance?.init({ instance: this });
                    this.pinInstance?.onScroll(this.scrollerScroll);
                });
            }
        }
    }

    /**
     * @description
     *
     * @param {HTMLElement|Window} scroller
     */
    setScroller(scroller) {
        this.scroller = domNodeIsValidAndReturnElOrWin(scroller, true);
    }

    /**
     * @description
     *
     * @param {HTMLElement|Window} screen
     */
    setScreen(screen) {
        this.screen = domNodeIsValidAndReturnElOrWin(screen, true);
    }

    /**
     * @description
     *
     * @param {string} direction
     */
    setDirection(direction) {
        this.direction = directionIsValid(direction, 'Parallax/Scrolltrigger');
    }

    /**
     * @description
     *
     * @param {string} breakpoint
     */
    setBreakPoint(breakpoint) {
        this.breakpoint = breakpointIsValid(
            breakpoint,
            'breakpoint',
            'Parallax/Scrolltrigger'
        );
    }

    /**
     * @description
     *
     * @param {string} queryType
     */
    setQueryType(queryType) {
        this.queryType = breakpointTypeIsValid(
            queryType,
            'queryType',
            'Parallax/Scrolltrigger'
        );
    }

    /**
     * @private
     */
    setPerspective() {
        if (this.perspective && this.item && this.item.parentNode) {
            const style = {
                perspective: `${this.perspective}px`,
                'transform-style': 'preserve-3d',
            };
            const parent = this.item.parentNode;
            // @ts-ignore
            Object.assign(parent.style, style);
        }
    }

    /**
     * @private
     */
    setMotion() {
        const initialValue =
            parallaxConstant.PROP_SCALE || parallaxConstant.PROP_OPACITY
                ? 1
                : 0;

        this.motion.setData({ val: initialValue });
        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            if (val === this.lastValue) return;

            if (
                this.propierties === parallaxConstant.PROP_TWEEN &&
                this.tween?.draw
            ) {
                this.tween.draw({
                    partial: val,
                    isLastDraw: false,
                    useFrame: false,
                });
                this.lastValue = val;
                this.firstTime = false;
            } else {
                this.updateStyle(val);
            }

            mobCore.useNextTick(() => {
                if (this.onTickCallback)
                    this.onTickCallback({ value: val, parentIsMoving: true });
            });
        });

        this.unsubscribeOnComplete = this.motion.onComplete(({ val }) => {
            this.force3D = false;

            if (
                this.propierties === parallaxConstant.PROP_TWEEN &&
                this.tween?.draw
            ) {
                this.tween.draw({
                    partial: val,
                    isLastDraw: true,
                    useFrame: false,
                });
            } else {
                this.updateStyle(val);
            }

            mobCore.useNextTick(() => {
                if (this.onTickCallback)
                    this.onTickCallback({ value: val, parentIsMoving: false });
            });
        });

        switch (this.easeType) {
            case parallaxConstant.EASE_LERP: {
                if (this.lerpConfig) {
                    this.motion.updateVelocity(this.lerpConfig);
                }
                break;
            }
            case parallaxConstant.EASE_SPRING: {
                if (this.springConfig) {
                    this.motion.updateConfig(this.springConfig);
                }
                break;
            }
        }
    }

    /**
     * @private
     */
    calcRangeAndUnitMiusure() {
        if (this.dynamicRange) {
            const range = this.dynamicRange();
            this.numericRange = Number.isNaN(range)
                ? 0
                : Number.parseFloat(range);
            this.unitMisure = parallaxConstant.PX;
        } else {
            const str = String(this.range);
            const firstChar = str.charAt(0);
            const isNegative = firstChar === '-' ? -1 : 1;

            /**
             * Check if px|vw|deg or other is associated with the right props
             * Ex: rotate have a value like '45deg'
             */
            const strParsed = checkStringRangeOnPropierties(
                str,
                this.propierties
            );

            /**
             * Extract number forms string
             */
            this.numericRange =
                Number.parseFloat(strParsed.replaceAll(/^\D+/g, '')) *
                isNegative;

            /**
             * Get px|vw|etc...
             */
            this.unitMisure = getRangeUnitMisure(strParsed);
        }
    }

    /**
     * @private
     */
    calcFixedLimit() {
        const screenUnit = this.scrollerHeight / 100;

        // Check if there is a function that return a start value dynamically
        if (
            this.dynamicStart &&
            this.dynamicStart?.position &&
            this.dynamicStart?.value?.()
        ) {
            const { position, value: fn } = this.dynamicStart;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.start = `${position} ${valueResult}px`;
            }
        }

        // Get position ( es: 'bottom'),
        // Get processed value ( based on px || vh || vw)
        // Get additional val ( +height -halfHeight etc ..)
        const {
            value: startPoint,
            additionalVal: additionalStartVal,
            position: startPosition,
        } = getStartPoint(screenUnit, this.start, this.direction);

        // Check if come from top or left
        this.invertSide =
            startPosition === parallaxConstant.POSITION_TOP ||
            startPosition === parallaxConstant.POSITION_LEFT;

        // Add/subtract with height or half value
        this.startPoint = processFixedLimit(
            startPoint,
            additionalStartVal,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.height
                : this.width,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.width
                : this.height
        );

        // Check if there is a function that return a end value dynamically
        if (
            this.dynamicEnd &&
            this.dynamicEnd?.position &&
            this.dynamicEnd?.value?.()
        ) {
            const { position, value: fn } = this.dynamicEnd;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.end = `${position} ${valueResult}px`;
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
            this.end,
            this.startPoint,
            this.scrollerHeight,
            this.invertSide,
            this.direction
        );

        // Get positive or negative multiplier to add or subtract value basedto the position
        const multiplier = (() => {
            if (this.invertSide) {
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
        this.endPoint = processFixedLimit(
            endPoint,
            additionalEndVal,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.height * multiplier
                : this.width * multiplier,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.width * multiplier
                : this.height * multiplier
        );

        this.setMarker();

        // From left to right or top to bottom
        // the botom or right side of item sollide with start point
        if (this.invertSide) this.startPoint -= this.height;
    }

    /**
     * @private
     */
    setMarker() {
        if (this.marker) {
            // Add Marker
            const { startMarker, endMarker } = parallaxMarker({
                startMarker: this.startMarker,
                endMarker: this.endMarker,
                startPoint: this.startPoint,
                endPoint: this.endPoint,
                screen: this.screen,
                direction: this.direction,
                invertSide: this.invertSide,
                label: this.marker,
            });

            this.startMarker = startMarker;
            this.endMarker = endMarker;
        }
    }

    /**
     * @private
     */
    calcOffset() {
        const el = this.trigger === null ? this.item : this.trigger;

        if (!el) return;

        let x = 0;
        let y = 0;
        let z = 0;

        if (this.trigger) {
            x = getTranslateValues(this.trigger).x;
            y = getTranslateValues(this.trigger).y;
            z = getTranslateValues(this.trigger).z;
        }

        /**
         * Reset transform for get right offset value if transform is applied itself
         * @ts-ignore all element is not window ( check the if statement ).
         */
        el.style.transform = '';

        if (this.direction === parallaxConstant.DIRECTION_VERTICAL) {
            this.offset =
                this.scroller === window
                    ? Math.trunc(offset(el).top)
                    : // @ts-ignore
                      Math.trunc(offset(el).top) - offset(this.scroller).top;
        } else {
            this.offset =
                this.scroller === window
                    ? Math.trunc(offset(el).left)
                    : // @ts-ignore
                      Math.trunc(offset(el).left) - offset(this.scroller).left;
        }

        if (this.screen !== window) {
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? // @ts-ignore
                  (this.offset -= Math.trunc(offset(this.screen).top))
                : // @ts-ignore
                  (this.offset -= Math.trunc(position(this.screen).left));
        }

        if (this.trigger && (x !== 0 || y !== 0 || z !== 0)) {
            this.trigger.style.transform = `translate3D(${x}px, ${y}px, ${z}px)`;
        }
    }

    /**
     * @private
     */
    calcScreenPosition() {
        if (this.screen === window) return;

        /**
         * @ts-ignore all element is not window ( check the if statement ).
         */
        this.screenPosition =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? // @ts-ignore
                  Number.parseInt(offset(this.screen).top)
                : // @ts-ignore
                  Number.parseInt(position(this.screen).left);
    }

    /**
     * @private
     */
    calcHeight() {
        const el = this.trigger === null ? this.item : this.trigger;
        if (!el) return;

        this.height =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? Math.trunc(el.offsetHeight)
                : Math.trunc(el.offsetWidth);
    }

    /**
     * @private
     */
    calcWidth() {
        const el = this.trigger === null ? this.item : this.trigger;
        if (!el) return;

        this.width =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? Math.trunc(el.offsetWidth)
                : Math.trunc(el.offsetHeight);
    }

    /**
     * @private
     */
    getScrollerOffset() {
        /**
         * @ts-ignore all element is not window ( check the if statement ).
         */

        if (this.scroller === window) {
            this.scrollerScroll =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? this.scroller.scrollY
                    : this.scroller.scrollX;
        } else {
            this.scrollerScroll =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? // @ts-ignore
                      -offset(this.scroller).top
                    : // @ts-ignore
                      -offset(this.scroller).left;
        }
    }

    /**
     * @private
     */
    getScreenHeight() {
        this.windowInnerWidth = window.innerWidth;
        this.windowInnerHeight = window.innerHeight;

        /**
         * @ts-ignore all element is not window ( check the if statement ).
         */
        if (this.screen === window) {
            this.scrollerHeight =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? window.innerHeight
                    : window.innerWidth;
        } else {
            this.scrollerHeight =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? // @ts-ignore
                      Math.trunc(this.screen.offsetHeight)
                    : // @ts-ignore
                      Math.trunc(this.screen.offsetWidth);
        }
    }

    /**
     * @description
     * Recalculate positions and align all values
     */
    refresh() {
        if (this.pin && this.pinInstance) this.pinInstance.destroy();

        this.calcScreenPosition();
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();

        if (this.type == parallaxConstant.TYPE_SCROLLTRIGGER) {
            this.calcFixedLimit();
            if (this.dynamicRange) this.calcRangeAndUnitMiusure();

            if (
                this.pin &&
                this.pinInstance &&
                mq[this.queryType](this.breakpoint)
            ) {
                this.pinInstance.init({ instance: this });
            }
        }
        //
        // reset value to update animation after resize
        this.lastValue = undefined;
        this.firstTime = true;
        this.firstScroll = false;
        //
        if (mq[this.queryType](this.breakpoint)) {
            if (this.ease) {
                this.smoothParallaxJs();
            } else {
                this.computeValue();

                // Disable 3d transform at first render after refresh.
                this.noEasingRender({ forceRender: true });
            }
        } else {
            if (this.ease) this.motion?.stop?.();

            // Reset Style
            // For tween is necessary reset inside tween callback
            mobCore.useFrameIndex(() => {
                if (this.applyTo) {
                    this.resetTweenStyle(this.applyTo);
                    Object.assign(this.applyTo.style, this.getResetStyle());
                } else {
                    this.resetTweenStyle(this.item);
                    if (this.item)
                        Object.assign(this.item.style, this.getResetStyle());
                }
            }, 3);
        }
    }

    /**
     * @description
     * Method used to control the instance from the outside.
     * The methods acceps two parameters:
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
        if (!mq[this.queryType](this.breakpoint) || !value) return;
        this.iSControlledFromOutside = true;

        const scrollVal = this.getScrollValueOnMove(value);

        if (this.ease) {
            this.smoothParallaxJs(scrollVal);
        } else {
            this.computeValue(scrollVal);
            const forceRender =
                this.isInViewport || this.firstTime || undefined;
            this.noEasingRender({ forceRender, parentIsMoving });
        }
    }

    /**
     * @description
     * Trigger scrollStart event
     * Used by smoothScroll to activate 3D if child (this) have ease = true
     */
    triggerScrollStart() {
        if (!this.ease) return;

        this.firstScroll = true;
        if (!this.disableForce3D) this.force3D = true;
    }

    /**
     * @description
     * Trigger scrollEnd event
     * Used by smoothScroll to deactivate 3D if child (this) have ease = false
     */
    triggerScrollEnd() {
        if (this.ease) return;

        this.noEasingRender({ forceRender: true });
    }

    /**
     * @private
     *
     * @param {number|undefined} value
     */
    getScrollValueOnMove(value) {
        if (value === undefined) return;
        if (this.screen !== window) return value + this.screenPosition;

        return value;
    }

    /**
     * @description
     * Stop lerp|spring tween.
     */
    stopMotion() {
        this.motion?.stop?.();
    }

    /**
     * @private
     *
     * @param {number} [ scrollVal ]
     */
    smoothParallaxJs(scrollVal) {
        if (!mq[this.queryType](this.breakpoint)) return;

        this.computeValue(scrollVal);

        // Skip motion fixed type
        if (
            !this.fixedShouldRender &&
            !this.firstTime &&
            this.type === parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        // Skip motion default type
        if (
            !this.isInViewport &&
            !this.firstTime &&
            this.type === parallaxConstant.TYPE_PARALLAX
        )
            return;

        // First time render with no easing
        const action = this.firstTime && !this.animateAtStart ? 'set' : 'goTo';

        // Maybe a destroy method is callad during animation, so check if exist.
        if (!this.motion) return;

        this.motion[action](
            { val: this.endValue },
            this.motionParameters
        ).catch(() => {});
    }

    /**
     * @private
     *
     * @param {number} [ scrollVal ]
     */
    computeValue(scrollVal) {
        if (!mq[this.queryType](this.breakpoint)) return;

        if (scrollVal) {
            this.scrollerScroll = -scrollVal;
        } else {
            this.getScrollerOffset();
        }

        this.isInViewport = detectViewPortInterception({
            offset: this.offset,
            height: this.height,
            gap: this.gap,
            wScrollTop: this.scrollerScroll,
            wHeight: this.scrollerHeight,
        });

        // Skip motion default with limiterOff not active
        if (
            !this.isInViewport &&
            !this.limiterOff &&
            this.type === parallaxConstant.TYPE_PARALLAX
        )
            return;

        if (this.pin && this.pinInstance) {
            this.pinInstance.onScroll(this.scrollerScroll);
        }

        switch (this.type) {
            case parallaxConstant.TYPE_SCROLLTRIGGER: {
                this.endValue = getRoundedValue(this.getFixedValue());
                break;
            }

            default: {
                switch (this.propierties) {
                    case parallaxConstant.PROP_OPACITY: {
                        this.endValue = getRoundedValue(this.getOpacityValue());
                        break;
                    }

                    default: {
                        this.endValue = Number.isNaN(
                            // @ts-ignore
                            Number.parseInt(this.align)
                        )
                            ? getRoundedValue(this.getIsNaNValue() / 2)
                            : getRoundedValue(this.getIsANumberValue() / 2);
                        break;
                    }
                }
            }
        }

        /**
         * Get reverse value
         */
        const reverseValue =
            this.reverse && this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
                ? getRetReverseValue(this.propierties, this.endValue)
                : this.endValue;

        /**
         * Get switch after 0 value for non scrolTrigger
         */
        this.endValue =
            this.type === parallaxConstant.TYPE_SCROLLTRIGGER
                ? reverseValue
                : this.getSwitchAfterZeroValue(reverseValue);
    }

    /**
     * @private
     */
    noEasingRender({ forceRender = false, parentIsMoving = false } = {}) {
        if (!mq[this.queryType](this.breakpoint)) return;

        mobCore.useFrame(() => {
            this.cleanRender({ forceRender, parentIsMoving });
        });
    }

    /**
     * @private
     */
    cleanRender({ forceRender = false, parentIsMoving = false } = {}) {
        /**
         * Skip unnecessary rendering ( no control from outside )
         */
        if (
            (this.endValue === this.lastValue && !forceRender) ||
            (!this.isInViewport && !forceRender)
        )
            return;

        /**
         * Set force3D if is not control from outside.
         */
        if (!this.disableForce3D && !this.iSControlledFromOutside)
            this.force3D = !forceRender;

        /**
         * Set force3D if is control from outside.
         */
        if (!this.disableForce3D && this.iSControlledFromOutside)
            this.force3D = parentIsMoving && this.isInViewport;

        /**
         * Draw
         */
        if (this.propierties === parallaxConstant.PROP_TWEEN) {
            this.tween.draw({
                partial: this.endValue,
                isLastDraw: !this.force3D,
                useFrame: false,
            });
            this.lastValue = this.endValue;
            this.firstTime = false;
        } else {
            this.updateStyle(this.endValue);
        }

        /**
         * Children
         */
        mobCore.useNextTick(() => {
            if (this.onTickCallback)
                this.onTickCallback({
                    value: this.endValue,
                    parentIsMoving: this.force3D,
                });
        });
    }

    /**
     * @private
     *
     * @param {number} value
     */
    updateStyle(value) {
        if (this.applyTo) {
            Object.assign(this.applyTo.style, this.getStyle(value));
        } else if (this.item) {
            Object.assign(this.item.style, this.getStyle(value));
        }

        this.lastValue = value;
        this.firstTime = false;
    }

    /**
     * @private
     */
    getFixedValue() {
        const partials = this.invertSide
            ? -(
                  this.scrollerScroll +
                  this.startPoint +
                  this.endPoint -
                  (this.offset + this.endPoint)
              )
            : -(
                  this.scrollerScroll +
                  this.scrollerHeight -
                  this.startPoint -
                  (this.offset + this.endPoint)
              );

        const maxVal = (this.endPoint / 100) * this.numericRange;
        const partialVal = (partials / 100) * this.numericRange;

        const valePerDirections = (() => {
            if (this.fromTo) {
                return this.invertSide ? maxVal - partialVal : partialVal;
            } else {
                return this.invertSide ? partialVal : maxVal - partialVal;
            }
        })();

        const clampValue =
            maxVal > 0
                ? -clamp(valePerDirections, 0, maxVal)
                : -clamp(valePerDirections, maxVal, 0);

        this.fixedShouldRender = this.prevFixedClamp !== clampValue;
        this.prevFixedClamp = clampValue;
        if (!this.fixedShouldRender && !this.firstTime) return this.endValue;

        const percentValue = (clampValue * 100) / this.endPoint;

        // Fire callback if there is
        if (
            this.onEnter ||
            this.onEnterBack ||
            this.onLeave ||
            this.onLeaveBack
        ) {
            parallaxEmitter({
                prevValue: this.prevFixedRawValue,
                value: valePerDirections,
                maxVal: maxVal,
                onEnter: this.onEnter,
                onEnterBack: this.onEnterBack,
                onLeave: this.onLeave,
                onLeaveBack: this.onLeaveBack,
            });
        }

        this.prevFixedRawValue = valePerDirections;

        switch (this.propierties) {
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_VERTICAL: {
                return this.getHVval(percentValue);
            }

            case parallaxConstant.PROP_SCALE:
            case parallaxConstant.PROP_OPACITY: {
                return 1 - percentValue;
            }

            default: {
                return -percentValue;
            }
        }
    }

    /**
     * @private
     *
     * @param {number} percent
     */
    getHVval(percent) {
        switch (this.unitMisure) {
            case parallaxConstant.VW: {
                return (this.windowInnerWidth / 100) * -percent;
            }

            case parallaxConstant.VH: {
                return (this.windowInnerHeight / 100) * -percent;
            }

            case parallaxConstant.WPERCENT: {
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.width / 100) * -percent
                    : (this.height / 100) * -percent;
            }

            case parallaxConstant.HPERCENT: {
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.height / 100) * -percent
                    : (this.width / 100) * -percent;
            }

            default: {
                return -percent;
            }
        }
    }

    /**
     * @private
     */
    getOpacityValue() {
        const vhLimit = (this.scrollerHeight / 100) * this.opacityEnd;
        const vhStart =
            this.scrollerHeight -
            (this.scrollerHeight / 100) * this.opacityStart;

        const value =
            this.align == parallaxConstant.ALIGN_START
                ? -this.scrollerScroll * -1
                : (this.scrollerScroll + vhLimit - this.offset) * -1;

        const valClamped =
            this.align == parallaxConstant.ALIGN_START
                ? 1 - value / this.offset
                : 1 - value / (this.scrollerHeight - vhStart - vhLimit);

        return clamp(valClamped, 0, 1);
    }

    /**
     * @private
     */
    getIsNaNValue() {
        const rangeNumber = Number(this.range) ?? 0;

        const documentHeight =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;

        // Prefixed align
        switch (this.align) {
            case parallaxConstant.ALIGN_START: {
                return this.scrollerScroll / rangeNumber;
            }

            case parallaxConstant.ALIGN_TOP:
            case parallaxConstant.ALIGN_LEFT: {
                return (this.scrollerScroll - this.offset) / rangeNumber;
            }

            case parallaxConstant.ALIGN_CENTER: {
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight / 2 - this.height / 2) -
                        this.offset) /
                    rangeNumber
                );
            }

            case parallaxConstant.ALIGN_BOTTOM:
            case parallaxConstant.ALIGN_RIGHT: {
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight - this.height) -
                        this.offset) /
                    rangeNumber
                );
            }

            case parallaxConstant.ALIGN_END: {
                return (
                    -(
                        documentHeight -
                        (this.scrollerScroll + this.scrollerHeight)
                    ) / rangeNumber
                );
            }

            default: {
                return 0;
            }
        }
    }

    /**
     * @private
     * Here the value is a number.
     */
    getIsANumberValue() {
        const align = Number(this.align);
        const range = Number(this.range);

        return (
            (this.scrollerScroll +
                (this.scrollerHeight / 100) * align -
                this.offset) /
            range
        );
    }

    /**
     * @private
     *
     * @param {number} value
     */
    getSwitchAfterZeroValue(value) {
        return getValueOnSwitch({
            switchPropierties: this.onSwitch,
            isReverse: this.reverse,
            value,
        });
    }

    /**
     * @private
     *
     * @param {number} value
     */
    getStyle(value) {
        const force3DStyle = this.force3D ? 'translate3D(0px, 0px, 0px)' : '';

        /**
         * If frame drop ia lot (2/5) activate 'will-change: transform;'
         */
        this.willChangeIsActive = this.useWillChange
            ? mobCore.mustMakeSomething()
            : false;
        const shouldWill =
            this.willChangeIsActive && this.force3D ? 'transform' : '';

        /**
         * If frame drop a little (1/5) remove decimal.
         * Used by transform ( not scale ).
         */
        const valueParsed = mobCore.shouldMakeSomething()
            ? Math.round(value)
            : value;

        switch (this.propierties) {
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
                    this.type === parallaxConstant.TYPE_SCROLLTRIGGER
                        ? value
                        : 1 + value / 1000;
                return {
                    transform: `${force3DStyle} scale(${scaleVal})`,
                    willChange: shouldWill,
                };
            }

            default: {
                return {
                    [this.propierties.toLowerCase()]: `${value}px`,
                };
            }
        }
    }

    /**
     * @private
     * Reset sequencer/parallaxTween style
     *
     * @param {HTMLElement|null} item
     */
    resetTweenStyle(item) {
        // @ts-ignore
        if (this.tween) item.style = '';
    }

    /**
     * @private
     * Reset default style
     */
    getResetStyle() {
        switch (this.propierties) {
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
                return { [this.propierties.toLowerCase()]: `` };
            }
        }
    }

    /**
     * @description
     * Destroy instance
     */
    destroy() {
        this.motion?.stop?.();
        this.unsubscribeScroll();
        this.unsubscribeScrollStart();
        this.unsubscribeScrollEnd();
        this.unsubscribeResize();
        this.unsubscribeMotion();
        this.unsubscribeOnComplete();
        this.unsubscribeMarker();
        this.motion?.destroy?.();
        this.dynamicRange = () => {};
        this.onEnter = () => {};
        this.onEnterBack = () => {};
        this.onLeave = () => {};
        this.onLeaveBack = () => {};
        this.onTickCallback = () => {};
        if (this.pin && this.pinInstance) this.pinInstance?.destroy?.();
        if (this.startMarker) this.startMarker?.remove?.();
        if (this.endMarker) this.endMarker?.remove?.();
        this.motion = null;
        this.startMarker = undefined;
        this.endMarker = undefined;
        this.pinInstance = null;
        this.endValue = 0;

        // Remove style from element, if style prop exist.
        const el = this.applyTo ?? this.item;
        // @ts-ignore
        if (el && 'style' in el) el.style = '';

        /**
         * Remove HTMLELement reference.
         */
        this.item = null;
        this.scroller = null;
        this.screen = null;
        this.trigger = null;
        this.applyTo = null;
    }
}
