import { mqAction, mqValues } from '../../utils/type';
import { springChoiceConfig } from '../spring/type';
import { easeTypes } from '../tween/type';
import { staggerObjectOptional } from '../utils/stagger/type';
import { valueToparseType } from '../utils/tweenAction/type';

export interface dynamicStartType {
    position: 'bottom' | 'top' | 'left' | 'right';
    value: () => number;
}

export interface dynamicEndType {
    position: 'bottom' | 'top' | 'left' | 'right';
    value: () => number;
}

export interface parallaxCommonType {
    type?: 'parallax' | 'scrolltrigger';

    /**
     * @description
     * Target element.
     */
    item?: string | HTMLElement;

    /**
     * @description
     */
    breakpoint?: mqValues;

    /**
     * @description
     */
    queryType?: mqAction;

    /**
     * @description
     * Instance of ParallaxTween | HandleSequencer
     */
    tween?: Object;

    /**
     * @description
     * The scrollable node in which the target is contained.
     * The default is window.
     */
    scroller?: string | HTMLElement | Window;

    /**
     * @description
     * A node that contains the scrollable element.
     * The default is window.
     */
    screen?: string | HTMLElement | Window;

    /**
     * @description
     * A reference node from which to take the measurements (position, width, height) instead of the target.
     */
    trigger?: string | HTMLElement;

    /**
     * @description
     * A node to apply the transformations to instead of the target.
     * Applicable only with using native transformations ( x, y, scale, etc... ).
     */
    applyTo?: string | HTMLElement;

    /**
     * @description
     * Disable 3D transform added to enable GPU.
     * Only valid for native properties ( x, y , scale, etc...).
     * The default value is false.
     */
    disableForce3D?: boolean;

    /**
     * @description
     * Enable a Throttle function on the scroll.
     * The option will not be enabled with the presence of an active pin to maintain accuracy.
     * The default value is false.
     */
    useThrottle?: boolean;

    /**
     * @description
     * Property that defines the calculation of the distance value.
     *
     * Parallax:
     * A number between `0.1` and `9.99`. The default value is `0`.
     *
     * Scrolltrigger: String of the following type:
     * - x|y: `+/-100px | +/-100vw | +/-100vh | +/-100w | +/-100h `. the default value is `0px`.
     * - rotate|rotateY|rotateX|rotateZ: `45deg` |  `-45deg`, The default value is 0.
     * - scale: `+/-0.5`, The scale property is increased by 0.5, th default value is 0.
     * - opacity: `+/-` number between 0 and 1.
     * - customCssPropierites: ('margin', 'padding-left', etc ...) Each value will be converted to px, no unit misure is needed.
     * - tween: There are no options the value will be controlled by the tween itself.
     */
    range?: string | number;

    /**
     * @description
     * Apply the css styles perspective: <value>; transform-style: preserve-3d; to the closest parent node.
     * The default value is false
     */
    perspective?: number;

    /**
     * @description
     * Defines whether the animation will have ease.
     * The default value is false.
     */
    ease?: boolean;

    /**
     * @description
     * Defines the type of easing.
     * The default is 'lerp'.
     */
    easeType?: 'spring' | 'lerp';

    /**
     * @description
     * It defines the initial value of the lerp velocity.
     * The default value is 0.06.
     */
    lerpConfig?: number;

    /**
     * @description
     */
    springConfig?: springChoiceConfig;

    /**
     * @description
     * Defines the applied property, you can apply a custom css property ( ex: 'margin-left' ).
     * if you choose 'tween' you will need to specify a HandleSequencer or ParallaxTween instance in the tween property.
     * The default value is 'x'.
     */
    propierties?:
        | 'y'
        | 'x'
        | 'rotate'
        | 'rotateY'
        | 'rotateX'
        | 'rotateZ'
        | 'opacity'
        | 'scale'
        | 'tween';

    /**
     * @description
     * Defines the scroll direction
     */
    direction?: 'vertical' | 'horizontal';

    /**
     * @description
     * Enable the css property will-change: transform; when the frame rate falls below 3/5 of the optimal value.
     * The property remains active for 1000 frames.
     * If after the previous value the fps value is back to normal the will-change property is disabled.
     * `Use with CAUTION only if necessary.`
     * It is valid only for native properties ( x, y , scale, etc...).
     * It is valid only if the disableForce3D property is set to false ( default value ).
     * The default value is `false`.
     */
    useWillChange?: boolean;

    /**
     * @description
     */
    invertSide?: boolean;
}

export interface parallaxType {
    /**
     * @description
     *  Defines when the calculation reaches the value 0 ( neutral position ).
     *  It is possible to use a preset value or a number from 0 to 100 which corresponds to a value calculated with respect to the viewport.
     *  The default is 'center'.
     *  - `start`: top of document.
     *  - `end`: end of document.
     *  - `center`: center of viewport.
     *  - `top/left`: top/left of viewport.
     *  - `bottom/right`: bottom/right of viewport.
     */
    align?:
        | 'start'
        | 'top'
        | 'right'
        | 'center'
        | 'bottom'
        | 'left'
        | 'end'
        | number;

    /**
     * @description
     * Defines the behavior of the parallax once it reaches point 0 ( neutral position )
     * It can continue, stop or go back.
     * The default value is null, in this case the calculation from positive will become negative.
     */
    onSwitch?: 'in-stop' | 'in-back' | 'out-stop' | 'out-back';

    /**
     * @description
     * Reverse the animation.
     * The default value is false.
     */
    reverse?: boolean;

    /**
     * @description
     * Defines the start value of the opacity animation with respect to the viewport.
     * 100 corresponds to 100vh.
     * The default value is 100.
     */
    opacityStart?: number;

    /**
     * @description
     * Defines the end value of the opacity animation with respect to the viewport.
     * 100 corresponds to 100vh.
     * The default value is 0
     */
    opacityEnd?: number;

    /**
     * @description
     * Parallax remains active as long as the element remains behind the viewport (with a safety margin of 150px), using this option bypasses this check. The default value is false.
     */
    limiterOff?: boolean;
}

export interface scrollTriggerType {
    /**
     * @description
     * Activate the pin.
     * The pin will be applied to the defined element of the item property.
     * The default value is false.
     */
    pin?: boolean;

    /**
     * @description
     * A spring animation will be applied to the pinned element on state change.
     */
    animatePin?: boolean;

    /**
     * @description
     * The element will always be appended to the document body.
     * The default value is false.
     */
    forceTranspond?: boolean;

    /**
     * @description
     * The pin is always activated a little earlier based on the last scroll made.
     * With this property, when loading the page and without having performed any scrolling,
     * the element can be pinned even if slightly earlier than the preset position.
     * The default value is false.
     */
    anticipatePinOnLoad?: boolean;

    /**
     * @description
     * Defines the start position of the animation, the value is a string made up of 3 optional values:
     *
     * 1: `bottom|top|left|right`:
     * Indicates the side of the viewport that will be referenced.
     *
     * 2: `+/-<value>vh|vw|px`:
     * add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,
     *
     * 3: `+/-height|halfHeight|width|halfWidth`:
     * You can add the height/width value or half of one of them to the final value.
     * Useful for centering the element.
     *
     * The values 2 & 3 will always be added from the chosen position towards the center of the screen,
     * whether the position corresponds to top|bottom left|right
     *
     * Expamples: `bottom +50vh -halfHeight` the value corresponding to the element position centered in the viewport.
     * All the values is case insensitive
     */
    start?: string;

    /**
     * @description
     * Defines the end position of the animation, the value is a string made up of 3 optional values:
     *
     * 1: `bottom|top|left|right`:
     * Indicates the side of the viewport that will be referenced.
     *
     * 2: `+/-<value>vh|vw|px`:
     * add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,
     *
     * 3: `+/-height|halfHeight|width|halfWidth`:
     * You can add the height/width value or half of one of them to the final value.
     * Useful for centering the element.
     *
     * The values 2 & 3 will always be added from the chosen position towards the center of the screen,
     * whether the position corresponds to top|bottom left|right
     *
     * Expamples: `bottom +50vh -halfHeight` the value corresponding to the element position centered in the viewport.
     * All the values is case insensitive
     */
    end?: string;

    /**
     * @description
     * Reverse the animation.
     * The default is false.
     */
    fromTo?: boolean;

    /**
     * @description
     * Display start|end values with a solid line.
     * In case you activate the pin property the top|bottom|right|left border of the pin warapper
     * will have a highlight border applied.
     * The value is a text string that will be added to the fixed line.
     * The default value is false.
     */
    marker?: string;

    /**
     * @description
     * The start position calculated with the help of a function.
     * the resulting value of the function will be calculated starting from the specified position towards the center of the viewport.
     * if the property is used it will take precedence over start.
     */
    dynamicStart?: dynamicStartType;

    /**
     * @description
     * The end position calculated with the help of a function.
     * The resulting value of the function will be calculated starting from the specified position towards the center of the viewport.
     * If the property is used it will take precedence over end.
     */
    dynamicEnd?: dynamicEndType;

    /**
     * @description
     * The transformation value calculated through the use of a function.
     * The result of the function will be used in px.
     * If used, it will take priority over the range method.
     * if the property is a tween it will have no effect.
     */
    dynamicRange?: () => number;

    /**
     * @description
     * The element will animate with easing (if used) on loading the page or animation.
     * The default value is false.
     */
    animateAtStart?: boolean;

    /**
     * @description
     */
    onEnter?: () => void;

    /**
     * @description
     */
    onEnterBack?: () => void;

    /**
     * @description
     */
    onLeave?: () => void;

    /**
     * @description
     */
    onLeaveBack?: () => void;

    /**
     * @description
     * Function that is launched at each tick.
     * The function will have the current value as input parameter.
     */
    onTick?: () => void;
}

export interface parallaxMoveType {
    value: number | undefined;
    parentIsMoving: boolean;
}

export interface parallaxTweenType {
    from: valueToparseType;
    to: valueToparseType;
    stagger?: staggerObjectOptional;
    ease?: easeTypes;
    duration?: number;
}

export interface parallaxTweenValue {
    currentValue: number | function;
    prop: string;
    settled: boolean;
    fromFn?: number | function;
    fromIsFn?: number | function;
    toFn?: number | function;
    toIsFn?: boolean;
    toValProcessed: number | func;
    toValue: number | function;
    fromValue: number | function;
}
