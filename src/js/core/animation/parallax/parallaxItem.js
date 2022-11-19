import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleFrameIndex } from '../../events/rafutils/handleFrameIndex.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { handleResize } from '../../events/resizeUtils/handleResize.js';
import { handleScroll } from '../../events/scrollUtils/handleScroll.js';
import { handleScrollImmediate } from '../../events/scrollUtils/handleScrollImmediate.js';
import { handleScrollThrottle } from '../../events/scrollUtils/handleScrollThrottle.js';
import { handleScrollStart } from '../../events/scrollUtils/handleScrollUtils.js';
import { mq } from '../../utils/mediaManager.js';
import {
    getTranslateValues,
    offset,
    position,
} from '../../utils/vanillaFunction.js';
import HandleLerp from '../lerp/handleLerp.js';
import HandleSpring from '../spring/handleSpring.js';
import { clamp, getRoundedValue } from '../utils/animationUtils.js';
import { getRangeUnitMisure } from '../utils/getConstantFromRegex.js';
import {
    breakpointIsValid,
    breakpointTypeIsValid,
    checkStringRangeOnPropierties,
    domNodeIsValidAndReturnElOrWin,
    domNodeIsValidAndReturnNull,
    functionIsValidAndReturnDefault,
    parallaxAlignIsValid,
    parallaxDirectionIsValid,
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
} from '../utils/tweenValidation.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxEmitter } from './parallaxEmitter.js';
import { parallaxMarker } from './parallaxMarker.js';
import { ParallaxPin } from './parallaxPin.js';
import { parallaxUtils } from './parallaxUtils.js';

/**
 * @typedef {Object} parallaxDefaultTypes
 * @prop {Object} [ tween = null ] - instance of ParallaxTween | HandleSequencer
 * @prop {(String|Element)} item - target element. The default value is a empty Element.
 * @prop {(String|Element)} [ scroller = window ] - The scrollable node in which the target is contained. The default is window.
 * @prop {(String|Element)} [ screen = window ] - A node that contains the scrollable element. The default is window.
 * @prop {(String|Element)} [ trigger = null ] - A reference node from which to take the measurements (position, width, height) instead of the target. The default value is null.
 * @prop {(String|Element)} [ applyTo  = null ] - A node to apply the transformations to instead of the target, applicable only with using native transformations ( x, y, scale, etcc... ). The default value is null.
 * @prop {Boolean} [ disableForce3D = false ] - Disable 3D transform added to enable GPU, only valid for native properties ( x, y , scale, etc...). The default value is false.
 * @prop {Boolean} [ useThrottle = false ] - Enable a Throttle function on the scroll, the option will not be enabled with the presence of an active pin to maintain accuracy. The default value is false.
 * @prop {('parallax'|'scrolltrigger')} [ type = 'parallax' ]  Main property that defines whether the instance will behave as a parallax or as a scrolltrigger. the default is 'parallax'.
 * @prop {(String|Number)} [ range = 0 ] Property that defines the calculation of the final value.
 * - Parallax: A number between `0.1` and `9.99`. The default value is `0`.
 * -
 * - Scrolltrigger: String of the following type:
 * - x|y: `+/-100px | +/-100vw | +/-100vh | +/-100w | +/-100h `. the default value is `0px`.
 * - rotate|rotateY|rotateX|rotateZ: `45deg` |  `-45deg`, The default value is 0.
 * - scale: `+/-0.5`, The scale property is increased by 0.5, th default value is 0.
 *-  customCssPropierites: ('margin', 'padding-left', etc ...) Each value will be converted to px, no unit misure is needed.
 * - opacity: There are no options, for opacity use `opacityStart` & `opacityEnd` properties.
 * - tween: There are no options the value will be controlled by the tween itself.
 * @prop {Number} [ perspective = 0 ] - Apply the css styles perspective: <value>; transform-style: preserve-3d; to the closest parent node. The default value is false
 * @prop {('xSmall'|'small'|'medium'|'tablet'|"desktop"|'large'|'xLarge' )} [ breackpoint = "desktop" ] - The reference breakpoint at which the instance will be active, you can specify whether it will be a "max" or a "min" using the queryType property. The default is "desktop".
 * @prop {('min'|'max')} [ queryType = "min" ] - Defines whether the defined breakpoint will be a max-with or a min-width. The default is 'min-width'.
 * @prop {Boolean} [ ease = false ] - Defines whether the animation will have ease. The default value is false.
 * @prop {('spring'|'lerp')} [ easeType = 'lerp'] - Defines the type of easing. The default is 'lerp'.
 * @prop {('default'|'gentle'|'wobbly'|'bounce'|'scroller')} [ springConfig = 'default' ] -
 * @prop {Number} [ lerpConfig = 0.06 ] - It defines the initial value of the lerp velocity. The default value is 0.06.
 * @prop {('y'|'x'|'rotate'|'rotateY'|'rotateX'|'rotateZ'|'opacity'|'scale'|'tween')} [ propierties = 'x'] - Defines the applied property, you can apply a custom css property ( ex: 'margin-left' ), if you choose 'tween' you will need to specify a HandleSequencer or ParallaxTween instance in the tween property. The default value is 'x'.
 * @prop {('vertical'|'horizontal')} [ direction = 'vertical' ] - Defines the scroll direction
 */

/**
 * @typedef {Object} parallaxSpecificTypes
 * @prop {('start'|'top'|'right'|'center'|'bottom'|'left'|'end'|Number)} [ align = 'center' ] - Defines when the calculation reaches the value 0, it is possible to use a preset value or a number from 0 to 100 which corresponds to a value calculated with respect to the viewport. The default is 'center'.
 * - `center`: top of document - the same in all direction
 * - `end`: end of document - the same in all direction
 * - `top`: top of viewport - vertical direction
 * - `center`: center of viewport - the same in all direction
 * - `bottom`: bottom of viewport - vertical direction
 * - `left`: left side of viewport - horizontal direction
 * - `right`: right side of viewport - horizontal direction
 * @prop {('in-stop'|'in-back'|'out-stop'|'out-back')} [ onSwitch = false ] - Defines the behavior of the parallax once it reaches point 0. It can continue, stop or go back. The default value is false, in this case the calculation from positive will become negative.
 * @prop {Boolean} [ reverse = false ] - Reverse the animation
 * @prop {Number} [ opacityStart = 100] - Defines the start value of the opacity animation with respect to the viewport, 100 corresponds to 100vh. The default value is 100.
 * @prop {Number} [ opacityEnd = 0 ] - Defines the end value of the opacity animation with respect to the viewport, 100 corresponds to 100vh. The default value is 0
 * @prop {Boolean} [ limiterOff = false ] - Parallax remains active as long as the element remains behind the viewport (with a safety margin of 150px), using this option bypasses this check. The default value is false.
 */

/**
 * @typedef {Object} scrolltriggerSpecificTypes
 * @prop {Boolean} [ pin = false ] - Activate the pin, the pin will be applied to the defined element of the item property. The default value is false.
 * @prop {Boolean} [ animatePin = false ] - A spring animation will be applied to the pinned element which will animate the moment in which the element will move into position: fixed.
 * @prop {Boolean} [ forceTranspond = false ] - The element at the time of being pinned will be removed from the original position hanging from the document body even if not necessary. The default value is false.
 * @prop {Boolean} [ anticipatePinOnLoad = false ] - The pin is always activated a little earlier based on the last scroll made. With this property, when loading the page and without having performed any scrolling, the element can be pinned even if slightly earlier than the preset position. The default value is false.
 * @prop {String} [ start = '0px']
 * - Defines the start position of the animation, the value is a string made up of 3 values:
 * - 1 => `bottom|top|left|right`: Indicates the side of the viewport that will be referenced. If the value is 'bottom|right' the animation will be understood as if the element enters the scene from the bottom|right and its reference will be its top|left side.
 * - 2 => `+/-<value>vh|vw|px`: add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,
 * - 3 => `+/-height|halfHeight|width|halfWidth`: You can add the height/width value or half of one of them to the final value, which is useful for centering the element.
 * - The values 2 & 3 will always be added from the chosen position towards the center of the screen, whether the position corresponds to top|bottom etc... Expamples: `bottom +50vh -halfHeight` the value corresponding to the element position centered in the viewport. All the values is case insensitive
 * @prop {String} [ end = '0px']
 * - Defines the end position of the animation, the value is a string made up of 3 values:
 * - 1 => `bottom|top|left|right`: Indicates the side of the viewport that will be referenced. If the value is 'bottom|right' the animation will be understood as if the element enters the scene from the bottom|right and its reference will be its top|left side.
 * - 2 => `+/-<value>vh|vw|px`: add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,
 * - 3 => `+/-height|halfHeight|width|halfWidth`: You can add the height/width value or half of one of them to the final value, which is useful for centering the element.
 * - The values 2 & 3 will always be added from the chosen position towards the center of the screen, whether the position corresponds to top|bottom etc... Expamples: `top +50vh -halfHeight` the value corresponding to the element position centered in the viewport if element start from bottom. All the values is case insensitive
 * @prop {Boolean} [ fromTo = false ] - Reverse the animation. The default is false.
 * @prop {String} [ marker = false ] - Display start|end values with a solid line, in case you activate the pin property the top|bottom|right|left border of the pin warapper will have a highlight border applied. The value is a text string that will be added to the fixed line. The default value is false.
 * @prop {Object} [ dynamicStart = null ] - The start position calculated with the help of a function, the resulting value of the function will be calculated starting from the specified position towards the center of the viewport, if the property is used it will take precedence over start.
 * @prop {('bottom'|'top'|'left'|'right')} dynamicStart.postion - Start position
 * @prop {Function} dynamicStart.value - Function that return a Number
 * @prop {Object} [ dynamicEnd = null ] - The end position calculated with the help of a function, the resulting value of the function will be calculated starting from the specified position towards the center of the viewport, if the property is used it will take precedence over end.
 * @prop {('bottom'|'top'|'left'|'right')} dynamicEnd.postion - End position
 * @prop {Function} dynamicEnd.value - Function that return a Number
 * @prop {Function} [ dynamicRange  = null] - The transformation value calculated through the use of a function, the result of the function will be used in px. If used, it will take priority over the range method.
 * @prop {Boolean} [ animateAtStart = false ] - The element will animate with easing (if used) on loading the page or animation. The default value is false.
 * @prop {Function} [ onEnter = null ] -
 * @prop {Function} [ onEnterBack = null ] -
 * @prop {Function} [ onLeave = null ] -
 * @prop {Function} [ onLeaveBack = null ]-
 * @prop {Function} [ onTick = null ] - Function that is launched at each tick, the function will have the current value as input parameter.
 */

export default class ParallaxItemClass {
    /**
     * @param { parallaxDefaultTypes & parallaxSpecificTypes & scrolltriggerSpecificTypes }  data
     *
     * @example
     *
     * @description
     */

    constructor(data = {}) {
        /**
         * @private
         */
        this.offset = 0;

        /**
         * @private
         */
        this.screenPosition = 0;

        /**
         * @private
         */
        this.endValue = 0;

        /**
         * @private
         */
        this.height = 0;

        /**
         * @private
         */
        this.width = 0;

        /**
         * @private
         */
        this.scrollerScroll = 0;

        /**
         * @private
         */
        this.scrollerHeight = 0;

        /**
         * @private
         */
        this.windowInnerWidth = window.innerWidth;

        /**
         * @private
         */
        this.windowInnerHeight = window.innerHeight;

        /**
         * @private
         */
        this.gap = 150;

        /**
         * @private
         */
        this.numericRange = 0;

        /**
         * @private
         */
        this.unsubscribeResize = () => {};

        /**
         * @private
         */
        this.unsubscribeScroll = () => {};

        /**
         * @private
         */
        this.unsubscribeScrollStart = () => {};

        /**
         * @private
         */
        this.unsubscribeMarker = () => {};

        /**
         * @private
         */
        this.startMarker = null;

        /**
         * @private
         */
        this.endMarker = null;

        /**
         * @private
         */
        this.lastValue = null;

        /**
         * @private
         */
        this.prevFixedRawValue = 0;

        /**
         * @private
         */
        this.fixedShouldRender = null;

        /**
         * @private
         */
        this.prevFixedClamp = null;

        /**
         * @private
         */
        this.firstTime = true;

        /**
         * @private
         */
        this.isInViewport = false;

        /**
         * @private
         */
        this.force3D = false;

        /**
         * @private
         */
        this.pinInstance = null;

        /**
         * @private
         */
        this.unitMisure = '';

        /**
         * @private
         */
        this.startPoint = 0;

        /**
         * @private
         */
        this.endPoint = 0;

        /**
         * @private
         */
        this.unsubscribeMotion = () => {};

        /**
         * @private
         */
        this.unsubscribeOnComplete = () => {};

        /**
         * Fixed prop
         */

        /*
         * Pin prop
         */
        this.pin = valueIsBooleanAndReturnDefault(
            data?.pin,
            'Scrolltrigger pin propierties error:',
            false
        );
        this.animatePin = valueIsBooleanAndReturnDefault(
            data?.animatePin,
            'Scrolltrigger animatePin propierties error:',
            false
        );

        this.forceTranspond = valueIsBooleanAndReturnDefault(
            data?.forceTranspond,
            'Scrolltrigger forceTranspond propierties error:',
            false
        );

        this.anticipatePinOnLoad = valueIsBooleanAndReturnDefault(
            data?.anticipatePinOnLoad,
            'Scrolltrigger anticipatePinOnLoad propierties error:',
            false
        );

        this.start = valueIsStringAndReturnDefault(
            data?.start,
            'Scrolltrigger start propierties error:',
            'bottom 0px'
        );

        this.end = valueIsStringAndReturnDefault(
            data?.end,
            'Scrolltrigger end propierties error:',
            'top'
        );

        this.fromTo = valueIsBooleanAndReturnDefault(
            data?.fromTo,
            'Scrolltrigger fromTo propierties error:',
            false
        );

        this.invertSide = valueIsBooleanAndReturnDefault(
            data?.invertSide,
            'Scrolltrigger invertSide propierties error:',
            false
        );

        this.marker = valueIsStringAndReturnDefault(
            data?.marker,
            'Scrolltrigger marker propierties error:',
            null
        );

        this.dynamicStart = data?.dynamicStart
            ? parallaxDynamicValueIsValid(data.dynamicStart, 'dynamicStart')
            : null;

        this.dynamicEnd = data?.dynamicEnd
            ? parallaxDynamicValueIsValid(data.dynamicEnd, 'dynamicEnd')
            : null;

        this.dynamicRange = parallaxDynamicRangeIsValid(data?.dynamicRange);

        this.animateAtStart = valueIsBooleanAndReturnDefault(
            data?.animateAtStart,
            'Scrolltrigger animateAtStart propierties error:',
            false
        );

        this.onEnter = functionIsValidAndReturnDefault(
            data?.onEnter,
            false,
            'Scrolltrigger onEnter propierties error'
        );

        this.onEnterBack = functionIsValidAndReturnDefault(
            data?.onEnterBack,
            false,
            'Scrolltrigger onEnterBack propierties error'
        );

        this.onLeave = functionIsValidAndReturnDefault(
            data?.onLeave,
            false,
            'Scrolltrigger onLeave propierties error'
        );

        this.onLeaveBack = functionIsValidAndReturnDefault(
            data?.onLeaveBack,
            false,
            'Scrolltrigger onLeaveBack propierties error'
        );

        this.onTickCallback = functionIsValidAndReturnDefault(
            data?.onTick,
            false,
            'Scrolltrigger onTickCallback propierties error'
        );

        /**
         * Parallax  prop
         * */
        this.align = parallaxAlignIsValid(data?.align);

        this.onSwitch = parallaxOnSwitchIsValid(data?.onSwitch);

        this.reverse = valueIsBooleanAndReturnDefault(
            data?.reverse,
            'Parallax reverse propierties error:',
            false
        );

        this.opacityStart = parallaxOpacityIsValid(
            data?.opacityStart,
            'Parallax opacityStart propierties error:',
            100
        );

        this.opacityEnd = parallaxOpacityIsValid(
            data?.opacityEnd,
            'Parallax opacityEnd propierties error:',
            0
        );

        this.limiterOff = valueIsBooleanAndReturnDefault(
            data?.limiterOff,
            'Parallax|Scrolltrigger limiterOff propierties error:',
            false
        );

        /**
         * Common prop
         */
        this.tween = parallaxTweenIsValid(data?.tween);

        const tweenIsSequencer =
            this.tween?.getType &&
            this.tween.getType() === parallaxConstant.TWEEN_TIMELINE;

        const tweenIsParallaxTween =
            this.tween?.getType &&
            this.tween.getType() === parallaxConstant.TWEEN_TWEEN;
        /**
         *
         */

        this.item = domNodeIsValidAndReturnElOrWin(data?.item, false);

        this.scroller = domNodeIsValidAndReturnElOrWin(data?.scroller, true);

        this.screen = domNodeIsValidAndReturnElOrWin(data?.screen, true);

        this.trigger = domNodeIsValidAndReturnNull(data?.trigger);

        this.applyTo = domNodeIsValidAndReturnNull(data?.applyTo);

        this.direction = parallaxDirectionIsValid(data?.direction);

        this.disableForce3D = valueIsBooleanAndReturnDefault(
            data?.disableForce3D,
            'Parallax|Scrolltrigger disableForce3D propierties error:',
            false
        );

        // With pin active no throttle is usable, pin need precision
        this.useThrottle = valueIsBooleanAndReturnDefault(
            data?.useThrottle,
            'Parallax|Scrolltrigger useThrottle propierties error:',
            false
        );

        this.type = parallaxTypeIsValid(data?.type);

        this.range = parallaxRangeIsValid(data?.range, this.type);

        this.perspective = valueIsNumberAndReturnDefault(
            data?.perspective,
            'Parallax|Scrolltrigger perspective propierties error:',
            0
        );

        this.breackpoint = breakpointIsValid(data?.breackpoint, 'breakpoint');

        this.queryType = breakpointTypeIsValid(data?.queryType, 'queryType');

        /**
         * Get properties, check if there is sequencer inside a Parallax,
         * In case return y propierties
         */
        this.propierties = parallaxPropiertiesIsValid(
            data?.propierties,
            this.type,
            tweenIsParallaxTween,
            tweenIsSequencer
        );

        this.ease = valueIsBooleanAndReturnDefault(
            data?.ease,
            'Parallax|Scrolltrigger ease propierties error:',
            false
        );

        /**
         * Get easeType properties, Check if a sequencer is used inside a scrollTrigger
         * In case retutn a lerp
         *
         */
        this.easeType = parallaxEaseTypeIsValid(
            data?.easeType,
            tweenIsSequencer,
            this.type === parallaxConstant.TYPE_SCROLLTRIGGER
        );

        this.springConfig = parallaxSpringConfigIsValid(
            data?.springConfig,
            this.type
        );

        this.lerpConfig = parallaxLerpConfigIsValid(
            data?.lerpConfig,
            this.type
        );

        // Add more precision to motion spring/lerp to trigger better force3D
        this.motionParameters =
            this.easeType === parallaxConstant.EASE_SPRING
                ? { configProp: { precision: parallaxConstant.EASE_PRECISION } }
                : { precision: parallaxConstant.EASE_PRECISION };

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

        /*
        Obj utils to avoid new GC allocation during animation
        Try to reduce the GC timing
        Support caluculation in each frame
        */
        this.GC = {
            // getFixedValue
            partials: null,
            maxVal: null,
            partialVal: null,
            valPerDirection: null,
            clamp: null,
            percent: null,
            // getOpacityValue
            vhLimit: null,
            vhStart: null,
            val: null,
            valClamped: null,
            // getIsNaNValue
            documentHeight: null,
            // getIsANumberValue
            align: null,
            offset: null,
            range: null,
            // getStyle
            reverseVal: null,
            typeVal: null,
            force3DStyle: null,
            scaleVal: null,
        };
    }

    init() {
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
            if (this.tween?.inzializeStagger) this.tween.inzializeStagger();
        }

        if (this.type == parallaxConstant.TYPE_SCROLLTRIGGER) {
            this.limiterOff = true;
            this.calcRangeAndUnitMiusure();
            this.calcFixedLimit();
        }

        // If use pin we have to get fresh value on scroll
        // Otherwise we can optimize and fire scoll callback after requerst animationFrame
        const getScrollfucuntion = (cb) => {
            if (this.pin) {
                this.unsubscribeScroll = handleScrollImmediate(cb);
                return handleScrollImmediate;
            } else {
                (() => {
                    if (this.ease && this.useThrottle) {
                        this.unsubscribeScroll = handleScrollThrottle(cb);
                        return handleScrollThrottle;
                    } else {
                        this.unsubscribeScroll = handleScroll(cb);
                        return handleScroll;
                    }
                })();
            }
        };

        if (this.ease) {
            // Force transform3D onscroll start
            this.unsubscribeScrollStart = handleScrollStart(() => {
                if (!this.disableForce3D) this.force3D = true;
            });

            if (this.scroller === window) {
                getScrollfucuntion(() => {
                    this.smoothParallaxJs();
                });
            }

            this.smoothParallaxJs();
        } else {
            if (this.scroller === window) {
                getScrollfucuntion(() => {
                    this.computeValue();
                    this.noEasingRender();
                });
            }
            this.computeValue();
            this.noEasingRender();
        }

        if (this.scroller !== window) {
            this.unsubscribeMarker = handleScroll(() => {
                // Refresh marker
                if (this.marker) this.calcFixedLimit();
            });
        }

        this.unsubscribeResize = handleResize(({ horizontalResize }) => {
            if (horizontalResize) this.refresh();
        });

        if (this.pin) {
            this.pinInstance = new ParallaxPin();

            if (mq[this.queryType](this.breackpoint)) {
                handleNextTick.add(() => {
                    this.getScrollerOffset();
                    this.pinInstance.init({ instance: this });
                    this.pinInstance.onScroll(this.scrollerScroll);
                });
            }
        }
    }

    setPerspective() {
        if (this.perspective && this.item && this.item.parentNode) {
            const style = {
                perspective: `${this.perspective}px`,
                'transform-style': 'preserve-3d',
            };
            const parent = this.item.parentNode;
            Object.assign(parent.style, style);
        }
    }

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

            handleNextTick.add(() => {
                if (this.onTickCallback) this.onTickCallback(val);
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
        });

        switch (this.easeType) {
            case parallaxConstant.EASE_LERP:
                if (
                    this.lerpConfig &&
                    !Number.isNaN(parseFloat(this.lerpConfig))
                ) {
                    this.motion.updateVelocity(this.lerpConfig);
                }
                break;
            case parallaxConstant.EASE_SPRING:
                if (this.springConfig) {
                    this.motion.updateConfig(this.springConfig);
                }
                break;
        }
    }

    calcRangeAndUnitMiusure() {
        if (this.dynamicRange) {
            const range = this.dynamicRange();
            this.numericRange = Number.isNaN(range) ? 0 : parseFloat(range);
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
             * Extract number froms tring
             */
            this.numericRange =
                parseFloat(strParsed.replace(/^\D+/g, '')) * isNegative;

            /**
             * Get px|vw|etc...
             */
            this.unitMisure = getRangeUnitMisure(strParsed);
        }
    }

    calcFixedLimit() {
        const screenUnit = this.scrollerHeight / 100;

        // Check if there is a function that return a start value dinamically
        if (
            this.dynamicStart &&
            this.dynamicStart?.position &&
            this.dynamicStart?.value
        ) {
            const { position, value: fn } = this.dynamicStart;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.start = `${position} ${valueResult}px`;
            }
        }

        // Get postion ( es: 'bottom'),
        // Get processed value ( based on px || vh || vw)
        // Get addtional val ( +height -halfHeight etc ..)
        const {
            value: startPoint,
            additionalVal: additionalStartVal,
            position: startPosition,
        } = parallaxUtils.getStartPoint(screenUnit, this.start, this.direction);

        // Chek if come from top or left
        this.invertSide =
            startPosition === parallaxConstant.POSITION_TOP ||
            startPosition === parallaxConstant.POSITION_LEFT;

        // Add/substract with height or half value
        this.startPoint = parallaxUtils.processFixedLimit(
            startPoint,
            additionalStartVal,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.height
                : this.width,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.width
                : this.height
        );

        // Check if there is a function that return a end value dinamically
        if (
            this.dynamicEnd &&
            this.dynamicEnd?.position &&
            this.dynamicEnd?.value
        ) {
            const { position, value: fn } = this.dynamicEnd;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.end = `${position} ${valueResult}px`;
            }
        }

        // Get postion ( es: 'bottom'),
        // Get processed value ( based on px || vh || vw)
        // Get addtional val ( +height -halfHeight etc ..)
        const {
            value: endPoint,
            additionalVal: additionalEndVal,
            position: endPosition,
        } = parallaxUtils.getEndPoint(
            screenUnit,
            this.end,
            this.startPoint,
            this.scrollerHeight,
            this.invertSide,
            this.direction
        );

        // Get positive or negative multiplier to add or substract value basedto the position
        const multiplier = (() => {
            if (!this.invertSide) {
                return endPosition === parallaxConstant.POSITION_BOTTOM ||
                    endPosition === parallaxConstant.POSITION_RIGHT
                    ? 1
                    : -1;
            } else {
                return endPosition === parallaxConstant.POSITION_BOTTOM ||
                    endPosition === parallaxConstant.POSITION_RIGHT
                    ? -1
                    : 1;
            }
        })();

        // Add/substract with height or half value
        this.endPoint = parallaxUtils.processFixedLimit(
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

    calcOffset() {
        const el = this.trigger === null ? this.item : this.trigger;

        let x = 0;
        let y = 0;
        let z = 0;

        if (this.trigger) {
            x = getTranslateValues(this.trigger).x;
            y = getTranslateValues(this.trigger).y;
            z = getTranslateValues(this.trigger).z;
        }

        // Reset transofrm for get right offset value if transform is applyed itself
        el.style.transform = '';

        if (this.direction === parallaxConstant.DIRECTION_VERTICAL) {
            this.offset =
                this.scroller !== window
                    ? parseInt(offset(el).top) - offset(this.scroller).top
                    : parseInt(offset(el).top);
        } else {
            this.offset =
                this.scroller !== window
                    ? parseInt(offset(el).left) - offset(this.scroller).left
                    : parseInt(offset(el).left);
        }

        if (this.screen !== window) {
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? (this.offset -= parseInt(offset(this.screen).top))
                : (this.offset -= parseInt(position(this.screen).left));
        }

        if (this.trigger && (x !== 0 || y !== 0 || z !== 0)) {
            this.trigger.style.tranform = `translate3D(${x}px, ${y}px, ${z}px)`;
        }
    }

    calcScreenPosition() {
        if (this.screen === window) return;

        this.screenPosition =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(offset(this.screen).top)
                : parseInt(position(this.screen).left);
    }

    calcHeight() {
        const el = this.trigger === null ? this.item : this.trigger;
        this.height =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(el.offsetHeight)
                : parseInt(el.offsetWidth);
    }

    calcWidth() {
        const el = this.trigger === null ? this.item : this.trigger;
        this.width =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(el.offsetWidth)
                : parseInt(el.offsetHeight);
    }

    getScrollerOffset() {
        if (this.scroller === window) {
            this.scrollerScroll =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? this.scroller.pageYOffset
                    : this.scroller.pageXOffset;
        } else {
            this.scrollerScroll =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? -offset(this.scroller).top
                    : -offset(this.scroller).left;
        }
    }

    getScreenHeight() {
        this.windowInnerWidth = window.innerWidth;
        this.windowInnerHeight = window.innerHeight;

        if (this.screen === window) {
            this.scrollerHeight =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? window.innerHeight
                    : window.innerWidth;
        } else {
            this.scrollerHeight =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? parseInt(this.screen.offsetHeight)
                    : parseInt(this.screen.offsetWidth);
        }
    }

    destroy() {
        if ('stop' in this.motion) {
            this.motion.stop();
        }
        this.unsubscribeScroll();
        this.unsubscribeScrollStart();
        this.unsubscribeResize();
        this.unsubscribeMotion();
        this.unsubscribeOnComplete();
        this.unsubscribeMarker();
        this.motion.destroy();
        this.dynamicRange = null;
        this.onEnter = () => {};
        this.onEnterBack = () => {};
        this.onLeave = () => {};
        this.onLeaveBack = () => {};
        this.onTickCallback = () => {};
        if (this.pin && this.pinInstance) this.pinInstance.destroy();
        if (this.startMarker) this.startMarker.remove();
        if (this.endMarker) this.endMarker.remove();
        this.motion = null;
        this.startMarker = null;
        this.endMarker = null;
        this.pinInstance = null;
        this.endValue = 0;
    }

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

            if (this.pin && this.pinInstance) {
                if (mq[this.queryType](this.breackpoint)) {
                    this.pinInstance.init({ instance: this });
                }
            }
        }

        // reset value to update animation after resize
        this.lastValue = null;
        this.firstTime = true;

        if (!mq[this.queryType](this.breackpoint)) {
            if (this.ease) this.motion.stop();

            // Reset Style
            // For tween is necessary reset inside tween callback
            handleFrameIndex.add(() => {
                if (this.applyTo) {
                    this.resetTweenStyle(this.applyTo);
                    Object.assign(this.applyTo.style, this.getResetStyle());
                } else {
                    this.resetTweenStyle(this.item);
                    Object.assign(this.item.style, this.getResetStyle());
                }
            }, 3);
        } else {
            this.move();
        }
    }

    move(scrollVal = null) {
        if (!mq[this.queryType](this.breackpoint)) return;

        // Bypass translate3D() if there is no easing
        if (!this.ease) this.force3D = false;

        scrollVal =
            scrollVal !== null && this.screen !== window
                ? scrollVal + this.screenPosition
                : null;

        if (this.ease) {
            this.smoothParallaxJs(scrollVal);
        } else {
            this.computeValue(scrollVal);
            this.noEasingRender();
        }
    }

    smoothParallaxJs(scrollVal = null) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.computeValue(scrollVal);

        // Skip motion fixed type
        if (
            !this.fixedShouldRender &&
            !this.firstTime &&
            this.type === parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        // Skip motion deafault type
        if (
            !this.isInViewport &&
            !this.firstTime &&
            !this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        // First time render with no easing
        const action = this.firstTime & !this.animateAtStart ? 'set' : 'goTo';

        this.motion[action](
            { val: this.endValue },
            this.motionParameters
        ).catch(() => {});
    }

    computeValue(scrollVal = null) {
        if (!mq[this.queryType](this.breackpoint)) return;

        if (scrollVal === null) {
            this.getScrollerOffset();
        } else {
            this.scrollerScroll = -scrollVal;
        }

        this.isInViewport = parallaxUtils.isInViewport({
            offset: this.offset,
            height: this.height,
            gap: this.gap,
            wScrollTop: this.scrollerScroll,
            wHeight: this.scrollerHeight,
        });

        // Skip motion deafult with limiterOff not active
        if (
            !this.isInViewport &&
            !this.limiterOff &&
            !this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        if (this.pin && this.pinInstance) {
            this.pinInstance.onScroll(this.scrollerScroll);
        }

        switch (this.type) {
            case parallaxConstant.TYPE_SCROLLTRIGGER:
                this.endValue = getRoundedValue(this.getFixedValue());
                break;

            default:
                switch (this.propierties) {
                    case parallaxConstant.PROP_OPACITY:
                        this.endValue = getRoundedValue(this.getOpacityValue());
                        break;

                    default:
                        if (Number.isNaN(parseInt(this.align))) {
                            this.endValue = getRoundedValue(
                                this.getIsNaNValue() / 2
                            );
                        } else {
                            this.endValue = getRoundedValue(
                                this.getIsANumberValue() / 2
                            );
                        }
                        break;
                }
        }

        /**
         * Get reverse value
         */
        this.GC.reverseVal =
            this.reverse && this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
                ? parallaxUtils.getRetReverseValue(
                      this.propierties,
                      this.endValue
                  )
                : this.endValue;

        /**
         * Get switch after 0 value for non scrolTrigger
         */
        this.endValue =
            this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
                ? this.getSwitchAfterZeroValue(this.GC.reverseVal)
                : this.GC.reverseVal;
    }

    noEasingRender() {
        if (!mq[this.queryType](this.breackpoint)) return;

        handleFrame.add(() => {
            this.cleanRender();
        });
    }

    checkIfLastDraw() {
        return this.endValue === this.lastValue;
    }

    cleanRender() {
        // if (this.endValue === this.lastValue) return;

        if (this.propierties === parallaxConstant.PROP_TWEEN) {
            this.tween.draw({
                partial: this.endValue,
                isLastDraw: this.checkIfLastDraw(),
                // isLastDraw: true,
                useFrame: false,
            });
            this.lastValue = this.endValue;
            this.firstTime = false;
        } else {
            if (this.checkIfLastDraw()) return;
            this.updateStyle(this.endValue);
        }

        if (this.checkIfLastDraw()) return;
        handleNextTick.add(() => {
            if (this.onTickCallback) this.onTickCallback(this.endValue);
        });
    }

    updateStyle(val) {
        if (this.applyTo) {
            Object.assign(this.applyTo.style, this.getStyle(val));
        } else {
            Object.assign(this.item.style, this.getStyle(val));
        }

        this.lastValue = val;
        this.firstTime = false;
    }

    getFixedValue() {
        this.GC.partials = !this.invertSide
            ? -(
                  this.scrollerScroll +
                  this.scrollerHeight -
                  this.startPoint -
                  (this.offset + this.endPoint)
              )
            : -(
                  this.scrollerScroll +
                  this.startPoint +
                  this.endPoint -
                  (this.offset + this.endPoint)
              );

        this.GC.maxVal = (this.endPoint / 100) * this.numericRange;
        this.GC.partialVal = (this.GC.partials / 100) * this.numericRange;

        this.GC.valPerDirection = (() => {
            if (this.fromTo) {
                return !this.invertSide
                    ? this.GC.partialVal
                    : this.GC.maxVal - this.GC.partialVal;
            } else {
                return !this.invertSide
                    ? this.GC.maxVal - this.GC.partialVal
                    : this.GC.partialVal;
            }
        })();

        this.GC.clamp =
            this.GC.maxVal > 0
                ? -clamp(this.GC.valPerDirection, 0, this.GC.maxVal)
                : -clamp(this.GC.valPerDirection, this.GC.maxVal, 0);

        this.fixedShouldRender =
            this.prevFixedClamp === this.GC.clamp ? false : true;
        this.prevFixedClamp = this.GC.clamp;
        if (!this.fixedShouldRender && !this.firstTime) return this.endValue;

        this.GC.percent = (this.GC.clamp * 100) / this.endPoint;

        // Fire callback if there is
        if (
            this.onEnter ||
            this.onEnterBack ||
            this.onLeave ||
            this.onLeaveBack
        ) {
            parallaxEmitter({
                prevValue: this.prevFixedRawValue,
                value: this.GC.valPerDirection,
                maxVal: this.GC.maxVal,
                onEnter: this.onEnter,
                onEnterBack: this.onEnterBack,
                onLeave: this.onLeave,
                onLeaveBack: this.onLeaveBack,
            });
        }

        this.prevFixedRawValue = this.GC.valPerDirection;

        switch (this.propierties) {
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_VERTICAL:
                return this.getHVval();

            case parallaxConstant.PROP_SCALE:
            case parallaxConstant.PROP_OPACITY:
                return 1 - this.GC.percent;

            default:
                return -this.GC.percent;
        }
    }

    getHVval() {
        switch (this.unitMisure) {
            case parallaxConstant.VW:
                return (this.windowInnerWidth / 100) * -this.GC.percent;

            case parallaxConstant.VH:
                return (this.windowInnerHeight / 100) * -this.GC.percent;

            case parallaxConstant.WPERCENT:
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.width / 100) * -this.GC.percent
                    : (this.height / 100) * -this.GC.percent;

            case parallaxConstant.HPERCENT:
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.height / 100) * -this.GC.percent
                    : (this.width / 100) * -this.GC.percent;

            case parallaxConstant.PX:
            case parallaxConstant.DEGREE:
            case parallaxConstant.PROP_TWEEN:
            default:
                return -this.GC.percent;
        }
    }

    getOpacityValue() {
        this.GC.vhLimit = (this.scrollerHeight / 100) * this.opacityEnd;
        this.GC.vhStart =
            this.scrollerHeight -
            (this.scrollerHeight / 100) * this.opacityStart;

        this.GC.val =
            this.align == parallaxConstant.ALIGN_START
                ? -this.scrollerScroll * -1
                : (this.scrollerScroll + this.GC.vhLimit - this.offset) * -1;

        this.GC.valClamped =
            this.align == parallaxConstant.ALIGN_START
                ? 1 - this.GC.val / this.offset
                : 1 -
                  this.GC.val /
                      (this.scrollerHeight - this.GC.vhStart - this.GC.vhLimit);

        return clamp(this.GC.valClamped, 0, 1);
    }

    getIsNaNValue() {
        this.GC.documentHeight =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;

        // Prefixed align
        switch (this.align) {
            case parallaxConstant.ALIGN_START:
                return this.scrollerScroll / this.range;

            case parallaxConstant.ALIGN_TOP:
            case parallaxConstant.ALIGN_LEFT:
                return (this.scrollerScroll - this.offset) / this.range;

            case parallaxConstant.ALIGN_CENTER:
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight / 2 - this.height / 2) -
                        this.offset) /
                    this.range
                );

            case parallaxConstant.ALIGN_BOTTOM:
            case parallaxConstant.ALIGN_RIGHT:
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight - this.height) -
                        this.offset) /
                    this.range
                );

            case parallaxConstant.ALIGN_END:
                return (
                    -(
                        this.GC.documentHeight -
                        (this.scrollerScroll + this.scrollerHeight)
                    ) / this.range
                );
        }
    }

    getIsANumberValue() {
        this.GC.align = parseFloat(this.align);
        this.GC.offset = this.offset;
        this.GC.range = this.range;

        return (
            (this.scrollerScroll +
                (this.scrollerHeight / 100) * this.GC.align -
                this.GC.offset) /
            this.GC.range
        );
    }

    getSwitchAfterZeroValue(value) {
        return parallaxUtils.getValueOnSwitch({
            switchPropierties: this.onSwitch,
            isReverse: this.reverse,
            value,
        });
    }

    getStyle(val) {
        this.GC.force3DStyle = this.force3D ? 'translate3D(0px, 0px, 0px)' : '';

        switch (this.propierties) {
            case parallaxConstant.PROP_VERTICAL:
                return {
                    // translate: `0 ${val}px`,
                    // transform: `${this.GC.force3DStyle}`,
                    transform: `${this.GC.force3DStyle} translateY(${val}px)`,
                };

            case parallaxConstant.PROP_HORIZONTAL:
                return {
                    transform: `${this.GC.force3DStyle} translateX(${val}px)`,
                };

            case parallaxConstant.PROP_ROTATE:
                return {
                    transform: `${this.GC.force3DStyle} rotate(${val}deg)`,
                };

            case parallaxConstant.PROP_ROTATEY:
                return {
                    transform: `${this.GC.force3DStyle} rotateY(${val}deg)`,
                };

            case parallaxConstant.PROP_ROTATEX:
                return {
                    transform: `${this.GC.force3DStyle} rotateX(${val}deg)`,
                };

            case parallaxConstant.PROP_ROTATEZ:
                return {
                    transform: `${this.GC.force3DStyle} rotateZ(${val}deg)`,
                };

            case parallaxConstant.PROP_OPACITY:
                return { opacity: `${val}` };

            case parallaxConstant.PROP_SCALE:
                this.GC.scaleVal =
                    this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
                        ? 1 + val / 1000
                        : val;
                return {
                    transform: `${this.GC.force3DStyle} scale(${this.GC.scaleVal})`,
                };

            default:
                return {
                    [this.propierties.toLowerCase()]: `${val}px`,
                };
        }
    }

    /**
     * Reset sequencer/parallaxTween style
     */
    resetTweenStyle(item) {
        if (this.tween) item.style = '';
    }

    /**
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
            case parallaxConstant.PROP_SCALE:
                return {
                    transform: ``,
                };

            case parallaxConstant.PROP_OPACITY:
                return { opacity: `` };

            default:
                return { [this.propierties.toLowerCase()]: `` };
        }
    }
}
