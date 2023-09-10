import { mq } from '../../utils/mediaManager.js';
import {
    getTranslateValues,
    offset,
    position,
} from '../../../mobCore/utils/index.js';
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
} from '../utils/tweenValidation.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxEmitter } from './parallaxEmitter.js';
import { parallaxMarker } from './parallaxMarker.js';
import { ParallaxPin } from './parallaxPin.js';
import { parallaxUtils } from './parallaxUtils.js';
import { mobCore } from '../../../mobCore/index.js';

/**
 * @typedef {object} parallaxDefaultTypes
 * @prop {object} [ tween = null ]
    Instance of ParallaxTween | HandleSequencer
 * @prop {(string|Element)} item
    Target element.
    The default value is a empty Element.
 * @prop {(string|Element)} [ scroller = window ]
    The scrollable node in which the target is contained.
    The default is window.
 * @prop {(string|Element)} [ screen = window ]
    A node that contains the scrollable element.
    The default is window.
 * @prop {(string|Element)} [ trigger = null ]
    A reference node from which to take the measurements (position, width, height) instead of the target.
    The default value is null.
 * @prop {(string|Element)} [ applyTo  = null ]
    A node to apply the transformations to instead of the target.
    Applicable only with using native transformations ( x, y, scale, etcc... ).
    The default value is null.
 * @prop {boolean} [ disableForce3D = false ]
    Disable 3D transform added to enable GPU.
    Only valid for native properties ( x, y , scale, etc...).
    The default value is false.
 * @prop {boolean} [ useThrottle = false ]
    Enable a Throttle function on the scroll.
    The option will not be enabled with the presence of an active pin to maintain accuracy.
    The default value is false.
 * @prop {('parallax'|'scrolltrigger')} type = 'parallax'
    Main property that defines whether the instance will behave as a parallax or as a scrolltrigger.
    The default is 'parallax'.
 * @prop {(string|number)} [ range = 0 ]
    Property that defines the calculation of the distance value.

    Parallax:
    A number between `0.1` and `9.99`. The default value is `0`.

    Scrolltrigger: String of the following type:
    - x|y: `+/-100px | +/-100vw | +/-100vh | +/-100w | +/-100h `. the default value is `0px`.
    - rotate|rotateY|rotateX|rotateZ: `45deg` |  `-45deg`, The default value is 0.
    - scale: `+/-0.5`, The scale property is increased by 0.5, th default value is 0.
    - opacity: `+/-` number between 0 and 1.
    - customCssPropierites: ('margin', 'padding-left', etc ...) Each value will be converted to px, no unit misure is needed.
    - tween: There are no options the value will be controlled by the tween itself.
 * @prop {number} [ perspective = 0 ]
    Apply the css styles perspective: <value>; transform-style: preserve-3d; to the closest parent node.
    The default value is false
 * @prop {boolean} [ ease = false ]
    Defines whether the animation will have ease.
    The default value is false.
 * @prop {('spring'|'lerp')} [ easeType = 'lerp']
    Defines the type of easing. The default is 'lerp'.
 * @prop {number} [ lerpConfig = 0.06 ]
    It defines the initial value of the lerp velocity.
    The default value is 0.06.
 * @prop {('y'|'x'|'rotate'|'rotateY'|'rotateX'|'rotateZ'|'opacity'|'scale'|'tween')} [ propierties = 'x']
    Defines the applied property, you can apply a custom css property ( ex: 'margin-left' ).
    if you choose 'tween' you will need to specify a HandleSequencer or ParallaxTween instance in the tween property.
    The default value is 'x'.
 * @prop {('vertical'|'horizontal')} [ direction = 'vertical' ] - Defines the scroll direction
 * @prop {Boolean} [useWillChange]
    Enable the css property will-change: transform; when the frame rate falls below 3/5 of the optimal value.
    The property remains active for 1000 frames.
    If after the previous value the fps value is back to normal the will-change property is disabled.
    `Use with CAUTION only if necessary.`
    It is valid only for native properties ( x, y , scale, etc...).
    It is valid only if the disableForce3D property is set to false ( default value ).
    The default value is `false`.
 */

/**
 * @typedef {object} parallaxSpecificTypes
 * @prop {('start'|'top'|'right'|'center'|'bottom'|'left'|'end'|Number)} [ align = 'center' ]
     Defines when the calculation reaches the value 0 ( neutral position ).
     It is possible to use a preset value or a number from 0 to 100 which corresponds to a value calculated with respect to the viewport.
     The default is 'center'.
    - `start`: top of document.
    - `end`: end of document.
    - `center`: center of viewport.
    - `top/left`: top/left of viewport.
    - `bottom/right`: bottom/right of viewport.
 * @prop {('in-stop'|'in-back'|'out-stop'|'out-back')} [ onSwitch = false ]
    Defines the behavior of the parallax once it reaches point 0 ( neutral position )
    It can continue, stop or go back.
    The default value is null, in this case the calculation from positive will become negative.
 * @prop {boolean} [ reverse = false ]
    Reverse the animation.
    The default value is false.
 * @prop {number} [ opacityStart = 100]
    Defines the start value of the opacity animation with respect to the viewport.
    100 corresponds to 100vh.
    The default value is 100.
 * @prop {number} [ opacityEnd = 0 ]
    Defines the end value of the opacity animation with respect to the viewport.
    100 corresponds to 100vh.
    The default value is 0
 * @prop {boolean} [ limiterOff = false ] - Parallax remains active as long as the element remains behind the viewport (with a safety margin of 150px), using this option bypasses this check. The default value is false.
 */

/**
 * @typedef {object} scrolltriggerSpecificTypes
 * @prop {boolean} [ pin = false ]
    Activate the pin.
    The pin will be applied to the defined element of the item property.
    The default value is false.
 * @prop {boolean} [ animatePin = false ]
    A spring animation will be applied to the pinned element on state change.
 * @prop {boolean} [ forceTranspond = false ]
    The element will always be appended to the document body.
    The default value is false.
 * @prop {boolean} [ anticipatePinOnLoad = false ]
    The pin is always activated a little earlier based on the last scroll made.
    With this property, when loading the page and without having performed any scrolling,
    the element can be pinned even if slightly earlier than the preset position.
    The default value is false.
 * @prop {string} [ start = '0px']
    Defines the start position of the animation, the value is a string made up of 3 optional values:

    1: `bottom|top|left|right`:
    Indicates the side of the viewport that will be referenced.

    2: `+/-<value>vh|vw|px`:
    add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,

    3: `+/-height|halfHeight|width|halfWidth`:
    You can add the height/width value or half of one of them to the final value.
    Useful for centering the element.

    The values 2 & 3 will always be added from the chosen position towards the center of the screen,
    whether the position corresponds to top|bottom left|right

    Expamples: `bottom +50vh -halfHeight` the value corresponding to the element position centered in the viewport.
    All the values is case insensitive

 * @prop {string} [ end = '0px']
 - Defines the end position of the animation, the value is a string made up of 3 optional values:

    1: `bottom|top|left|right`:
    Indicates the side of the viewport that will be referenced.

    2: `+/-<value>vh|vw|px`:
    add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,

    3: `+/-height|halfHeight|width|halfWidth`:
    You can add the height/width value or half of one of them to the final value.
    Useful for centering the element.

    The values 2 & 3 will always be added from the chosen position towards the center of the screen,
    whether the position corresponds to top|bottom left|right

    Expamples: `bottom +50vh -halfHeight` the value corresponding to the element position centered in the viewport.
    All the values is case insensitive
 * @prop {boolean} [ fromTo = false ]
    Reverse the animation.
    The default is false.
 * @prop {string} [ marker = false ]
    Display start|end values with a solid line.
    In case you activate the pin property the top|bottom|right|left border of the pin warapper
    will have a highlight border applied.
    The value is a text string that will be added to the fixed line.
    The default value is false.
 * @prop {object} [ dynamicStart = null ]
    The start position calculated with the help of a function.
    the resulting value of the function will be calculated starting from the specified position towards the center of the viewport.
    if the property is used it will take precedence over start.
 * @prop {('bottom'|'top'|'left'|'right')} dynamicStart.position
    Start position
 * @prop {function():number} dynamicStart.value
    Function that return a Number
 * @prop {object} [ dynamicEnd = null ]
    The end position calculated with the help of a function.
    The resulting value of the function will be calculated starting from the specified position towards the center of the viewport.
    If the property is used it will take precedence over end.
 * @prop {('bottom'|'top'|'left'|'right')} dynamicEnd.position
    End position
 * @prop {function():number} dynamicEnd.value
    Function that return a Number
 * @prop {function():number} [ dynamicRange  = null]
    The transformation value calculated through the use of a function.
    The result of the function will be used in px.
    If used, it will take priority over the range method.
    if the property is a tween it will have no effect.
 * @prop {boolean} [ animateAtStart = false ]
    The element will animate with easing (if used) on loading the page or animation.
    The default value is false.
 * @prop {function():void} [ onEnter = null ] -
 * @prop {function():void} [ onEnterBack = null ] -
 * @prop {function():void} [ onLeave = null ] -
 * @prop {function():void} [ onLeaveBack = null ]-
 * @prop {function(Number):void} [ onTick = null ]
    Function that is launched at each tick.
    The function will have the current value as input parameter.
 */

/**
 * @typedef  { parallaxDefaultTypes & import('../../utils/mediaManager.js').breackPointTypeObj & import('../../utils/mediaManager.js').mqTypeObject & import('../spring/springConfig.js').springConfigParallaxTypes & parallaxSpecificTypes & scrolltriggerSpecificTypes } parallaxConstructor
 */

export default class ParallaxClass {
    /**
     * @param  { parallaxConstructor } data
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
     *      breackpoint: [ String ],
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

    constructor(data = {}) {
        /**
         * @private
         */
        this.isInzialized = false;

        /**
         * @private
         */
        this.firstScroll = false;

        /**
         * @private
         */
        this.willChangeIsActive = false;

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
        this.unsubscribeScrollEnd = () => {};

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
        this.iSControlledFromOutside = false;

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

        this.useWillChange = data?.useWillChange;

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

        this.direction = directionIsValid(
            data?.direction,
            'Parallax/Scrolltrigger'
        );

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

        this.breackpoint = breakpointIsValid(
            data?.breackpoint,
            'breakpoint',
            'parallax/scrolltrigger'
        );

        this.queryType = breakpointTypeIsValid(
            data?.queryType,
            'queryType',
            'parallax/scrolltrigger'
        );

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

        // If use pin we have to get fresh value on scroll
        // Otherwise we can optimize and fire scoll callback after requerst animationFrame
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
         * If scroller is !== window the istance is controlled by another component
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
             * Execture render on scrollEnd to remove 3Dtransform
             */
            this.unsubscribeScrollEnd = mobCore.useScrollEnd(() => {
                /**
                 * Force draw no 3d on scroll end with no ease.
                 */
                this.noEasingRender({ forceRender: true });
            });
        }

        /**
         * Inizialize marker
         */
        if (this.scroller !== window) {
            this.unsubscribeMarker = mobCore.useScroll(() => {
                // Refresh marker
                if (this.marker) this.calcFixedLimit();
            });
        }

        /**
         * Inizialize refresh
         */
        this.unsubscribeResize = mobCore.useResize(({ horizontalResize }) => {
            if (horizontalResize) this.refresh();
        });

        /**
         * Inizialize pin
         */
        if (this.pin) {
            this.pinInstance = new ParallaxPin();

            if (mq[this.queryType](this.breackpoint)) {
                mobCore.useNextTick(() => {
                    this.getScrollerOffset();
                    this.pinInstance.init({ instance: this });
                    this.pinInstance.onScroll(this.scrollerScroll);
                });
            }
        }
    }

    /**
     *
     */
    setScroller(scroller) {
        this.scroller = domNodeIsValidAndReturnElOrWin(scroller, true);
    }

    /**
     *
     */
    setScreen(screen) {
        this.screen = domNodeIsValidAndReturnElOrWin(screen, true);
    }

    /**
     *
     */
    setDirection(direction) {
        this.direction = directionIsValid(direction, 'Parallax/Scrolltrigger');
    }

    /**
     *
     */
    setBreakPoint(breackpoint) {
        this.breackpoint = breakpointIsValid(
            breackpoint,
            'breakpoint',
            'Parallax/Scrolltrigger'
        );
    }

    /**
     *
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
                if (
                    this.lerpConfig &&
                    !Number.isNaN(Number.parseFloat(this.lerpConfig))
                ) {
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
             * Extract number froms tring
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
                this.scroller === window
                    ? Number.parseInt(offset(el).top)
                    : Number.parseInt(offset(el).top) -
                      offset(this.scroller).top;
        } else {
            this.offset =
                this.scroller === window
                    ? Number.parseInt(offset(el).left)
                    : Number.parseInt(offset(el).left) -
                      offset(this.scroller).left;
        }

        if (this.screen !== window) {
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? (this.offset -= Number.parseInt(offset(this.screen).top))
                : (this.offset -= Number.parseInt(position(this.screen).left));
        }

        if (this.trigger && (x !== 0 || y !== 0 || z !== 0)) {
            this.trigger.style.tranform = `translate3D(${x}px, ${y}px, ${z}px)`;
        }
    }

    /**
     * @private
     */
    calcScreenPosition() {
        if (this.screen === window) return;

        this.screenPosition =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? Number.parseInt(offset(this.screen).top)
                : Number.parseInt(position(this.screen).left);
    }

    /**
     * @private
     */
    calcHeight() {
        const el = this.trigger === null ? this.item : this.trigger;
        this.height =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? Number.parseInt(el.offsetHeight)
                : Number.parseInt(el.offsetWidth);
    }

    /**
     * @private
     */
    calcWidth() {
        const el = this.trigger === null ? this.item : this.trigger;
        this.width =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? Number.parseInt(el.offsetWidth)
                : Number.parseInt(el.offsetHeight);
    }

    /**
     * @private
     */
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

    /**
     * @private
     */
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
                    ? Number.parseInt(this.screen.offsetHeight)
                    : Number.parseInt(this.screen.offsetWidth);
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
        this.dynamicRange = null;
        this.onEnter = () => {};
        this.onEnterBack = () => {};
        this.onLeave = () => {};
        this.onLeaveBack = () => {};
        this.onTickCallback = () => {};
        if (this.pin && this.pinInstance) this.pinInstance?.destroy?.();
        if (this.startMarker) this.startMarker?.remove?.();
        if (this.endMarker) this.endMarker?.remove?.();
        this.motion = null;
        this.startMarker = null;
        this.endMarker = null;
        this.pinInstance = null;
        this.endValue = 0;

        // Remove style from element, if style prop exist.
        const el = this.applyTo ?? this.item;
        if ('style' in el) el.style = '';
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
                mq[this.queryType](this.breackpoint)
            ) {
                this.pinInstance.init({ instance: this });
            }
        }
        //
        // reset value to update animation after resize
        this.lastValue = null;
        this.firstTime = true;
        this.firstScroll = false;
        //
        if (mq[this.queryType](this.breackpoint)) {
            if (this.ease) {
                this.smoothParallaxJs();
            } else {
                this.computeValue();

                // Disable 3d transfrom at first render after refresh.
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
                    Object.assign(this.item.style, this.getResetStyle());
                }
            }, 3);
        }
    }

    /**
     * @typedef {Object} parallaxMoveType
     * @prop {Number} value
     * @prop {Boolean} parentIsMoving
     */

    /**
     * @param {parallaxMoveType}
     *
     *
     * @description
     * Method used to control the instance from the outside.
    The methods acceps two parameters:

    `value`: The scroll position of the parent.
    If no value is provided, the instance will calculate it autonomously.

    `parentIsMoving`: Value that indicates if the component using the method is moving.
    The value is used to manage the addition of the translate3D property.
    The default value is false
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
     */
    move({ value = null, parentIsMoving = false } = {}) {
        if (!mq[this.queryType](this.breackpoint) || value === null) return;
        this.iSControlledFromOutside = true;

        const scrollVal = this.getScrollValueOnMove(value);

        if (this.ease) {
            this.smoothParallaxJs({ scrollVal });
        } else {
            this.computeValue({ scrollVal });
            const forceRender = this.isInViewport || this.firstTime || null;
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
     */
    getScrollValueOnMove(value) {
        if (value === null) return null;
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
     */
    smoothParallaxJs({ scrollVal = null } = {}) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.computeValue({ scrollVal });

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

        // Maybe a destroy method is callad during animation, so check if exist.
        if (!this.motion) return;

        this.motion[action](
            { val: this.endValue },
            this.motionParameters
        ).catch(() => {});
    }

    /**
     * @private
     */
    computeValue({ scrollVal = null } = {}) {
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
            this.type === parallaxConstant.TYPE_SCROLLTRIGGER
                ? this.GC.reverseVal
                : this.getSwitchAfterZeroValue(this.GC.reverseVal);
    }

    /**
     * @private
     */
    noEasingRender({ forceRender = false, parentIsMoving = false } = {}) {
        if (!mq[this.queryType](this.breackpoint)) return;

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
     */
    updateStyle(val) {
        if (this.applyTo) {
            Object.assign(this.applyTo.style, this.getStyle(val));
        } else {
            Object.assign(this.item.style, this.getStyle(val));
        }

        this.lastValue = val;
        this.firstTime = false;
    }

    /**
     * @private
     */
    getFixedValue() {
        this.GC.partials = this.invertSide
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

        this.GC.maxVal = (this.endPoint / 100) * this.numericRange;
        this.GC.partialVal = (this.GC.partials / 100) * this.numericRange;

        this.GC.valPerDirection = (() => {
            if (this.fromTo) {
                return this.invertSide
                    ? this.GC.maxVal - this.GC.partialVal
                    : this.GC.partialVal;
            } else {
                return this.invertSide
                    ? this.GC.partialVal
                    : this.GC.maxVal - this.GC.partialVal;
            }
        })();

        this.GC.clamp =
            this.GC.maxVal > 0
                ? -clamp(this.GC.valPerDirection, 0, this.GC.maxVal)
                : -clamp(this.GC.valPerDirection, this.GC.maxVal, 0);

        this.fixedShouldRender = this.prevFixedClamp !== this.GC.clamp;
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
            case parallaxConstant.PROP_VERTICAL: {
                return this.getHVval();
            }

            case parallaxConstant.PROP_SCALE:
            case parallaxConstant.PROP_OPACITY: {
                return 1 - this.GC.percent;
            }

            default: {
                return -this.GC.percent;
            }
        }
    }

    /**
     * @private
     */
    getHVval() {
        switch (this.unitMisure) {
            case parallaxConstant.VW: {
                return (this.windowInnerWidth / 100) * -this.GC.percent;
            }

            case parallaxConstant.VH: {
                return (this.windowInnerHeight / 100) * -this.GC.percent;
            }

            case parallaxConstant.WPERCENT: {
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.width / 100) * -this.GC.percent
                    : (this.height / 100) * -this.GC.percent;
            }

            case parallaxConstant.HPERCENT: {
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.height / 100) * -this.GC.percent
                    : (this.width / 100) * -this.GC.percent;
            }

            default: {
                return -this.GC.percent;
            }
        }
    }

    /**
     * @private
     */
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

    /**
     * @private
     */
    getIsNaNValue() {
        this.GC.documentHeight =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;

        // Prefixed align
        switch (this.align) {
            case parallaxConstant.ALIGN_START: {
                return this.scrollerScroll / this.range;
            }

            case parallaxConstant.ALIGN_TOP:
            case parallaxConstant.ALIGN_LEFT: {
                return (this.scrollerScroll - this.offset) / this.range;
            }

            case parallaxConstant.ALIGN_CENTER: {
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight / 2 - this.height / 2) -
                        this.offset) /
                    this.range
                );
            }

            case parallaxConstant.ALIGN_BOTTOM:
            case parallaxConstant.ALIGN_RIGHT: {
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight - this.height) -
                        this.offset) /
                    this.range
                );
            }

            case parallaxConstant.ALIGN_END: {
                return (
                    -(
                        this.GC.documentHeight -
                        (this.scrollerScroll + this.scrollerHeight)
                    ) / this.range
                );
            }
        }
    }

    /**
     * @private
     */
    getIsANumberValue() {
        this.GC.align = Number.parseFloat(this.align);
        this.GC.offset = this.offset;
        this.GC.range = this.range;

        return (
            (this.scrollerScroll +
                (this.scrollerHeight / 100) * this.GC.align -
                this.GC.offset) /
            this.GC.range
        );
    }

    /**
     * @private
     */
    getSwitchAfterZeroValue(value) {
        return parallaxUtils.getValueOnSwitch({
            switchPropierties: this.onSwitch,
            isReverse: this.reverse,
            value,
        });
    }

    /**
     * @private
     */
    getStyle(val) {
        this.GC.force3DStyle = this.force3D ? 'translate3D(0px, 0px, 0px)' : '';

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
            ? Math.round(val)
            : val;

        switch (this.propierties) {
            case parallaxConstant.PROP_VERTICAL: {
                return {
                    // translate: `0 ${val}px`,
                    // transform: `${this.GC.force3DStyle}`,
                    transform: `${this.GC.force3DStyle} translateY(${valueParsed}px)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_HORIZONTAL: {
                return {
                    transform: `${this.GC.force3DStyle} translateX(${valueParsed}px)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATE: {
                return {
                    transform: `${this.GC.force3DStyle} rotate(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATEY: {
                return {
                    transform: `${this.GC.force3DStyle} rotateY(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATEX: {
                return {
                    transform: `${this.GC.force3DStyle} rotateX(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_ROTATEZ: {
                return {
                    transform: `${this.GC.force3DStyle} rotateZ(${valueParsed}deg)`,
                    willChange: shouldWill,
                };
            }

            case parallaxConstant.PROP_OPACITY: {
                return { opacity: `${val}` };
            }

            case parallaxConstant.PROP_SCALE: {
                this.GC.scaleVal =
                    this.type === parallaxConstant.TYPE_SCROLLTRIGGER
                        ? val
                        : 1 + val / 1000;
                return {
                    transform: `${this.GC.force3DStyle} scale(${this.GC.scaleVal})`,
                    willChange: shouldWill,
                };
            }

            default: {
                return {
                    [this.propierties.toLowerCase()]: `${val}px`,
                };
            }
        }
    }

    /**
     * @private
     * Reset sequencer/parallaxTween style
     */
    resetTweenStyle(item) {
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
}
