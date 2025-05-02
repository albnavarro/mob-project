import { MqAction, MqValues } from '../../utils/type';
import MobMasterSequencer from '../sequencer/mob-master-sequencer';
import MobSequencer from '../sequencer/mob-sequencer';
import { SpringChoiceConfig } from '../spring/type';
import { EaseTypes } from '../tween/type';
import { StaggerObject } from '../utils/stagger/type';
import MobScrollerTween from './mob-scroller-tween';

export interface DynamicStart {
    position: 'bottom' | 'top' | 'left' | 'right';
    value: () => number;
}

export interface DynamicEnd {
    position: 'bottom' | 'top' | 'left' | 'right';
    value: () => number;
}

export interface MobScrollerCommon {
    type?: 'parallax' | 'scrolltrigger';

    /**
     * Target element.
     */
    item?: string | HTMLElement;

    breakpoint?: MqValues;

    queryType?: MqAction;

    /**
     * Instance of MobMasterSequencer | MobScrollerTween | MobSequncer
     */
    tween?: MobMasterSequencer | MobSequencer | MobScrollerTween;

    /**
     * The scrollable node in which the target is contained. The default is window.
     */
    scroller?: string | HTMLElement | globalThis;

    /**
     * A node that contains the scrollable element. The default is window.
     */
    screen?: string | HTMLElement | globalThis;

    /**
     * A reference node from which to take the measurements (position, width, height) instead of the target.
     */
    trigger?: string | HTMLElement;

    /**
     * A node to apply the transformations to instead of the target. Applicable only with using native transformations (
     * x, y, scale, etc... ).
     */
    applyTo?: string | HTMLElement;

    /**
     * Disable 3D transform added to enable GPU. Only valid for native properties ( x, y , scale, etc...). The default
     * value is false.
     */
    disableForce3D?: boolean;

    /**
     * Enable a Throttle function on the scroll. The option will not be enabled with the presence of an active pin to
     * maintain accuracy. The default value is false.
     */
    useThrottle?: boolean;

    /**
     * Property that defines the calculation of the distance value.
     *
     * Parallax: A number between `0.1` and `9.99`. The default value is `0`.
     *
     * Scrolltrigger: String of the following type:
     *
     * - X|y: `+/-100px | +/-100vw | +/-100vh | +/-100w | +/-100h `. the default value is `0px`.
     * - Rotate|rotateY|rotateX|rotateZ: `45deg` | `-45deg`, The default value is 0.
     * - Scale: `+/-0.5`, The scale property is increased by 0.5, th default value is 0.
     * - Opacity: `+/-` number between 0 and 1.
     * - CustomCssPropierites: ('margin', 'padding-left', etc ...) Each value will be converted to px, no unit misure is
     *   needed.
     * - Tween: There are no options the value will be controlled by the tween itself.
     */
    range?: string | number;

    /**
     * Apply the css styles perspective: <value>; transform-style: preserve-3d; to the closest parent node. The default
     * value is false
     */
    perspective?: number;

    /**
     * Defines whether the animation will have ease. The default value is false.
     */
    ease?: boolean;

    /**
     * Defines the type of easing. The default is 'lerp'.
     */
    easeType?: 'spring' | 'lerp';

    /**
     * It defines the initial value of the lerp velocity. The default value is 0.06.
     */
    lerpConfig?: number;

    springConfig?: SpringChoiceConfig;

    /**
     * Reverse the animation. The default value is false.
     */
    reverse?: boolean;

    /**
     * Defines the applied property, you can apply a custom css property ( ex: 'margin-left' ). if you choose 'tween'
     * you will need to specify a MobSequncer or MobScrollerTween instance in the tween property. The default value is
     * 'x'.
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
        | 'scaleX'
        | 'scaleY'
        | 'tween';

    /**
     * Defines the scroll direction
     */
    direction?: 'vertical' | 'horizontal';

    /**
     * Enable the css property will-change: transform; when the frame rate falls below 3/5 of the optimal value. The
     * property remains active for 1000 frames. If after the previous value the fps value is back to normal the
     * will-change property is disabled. `Use with CAUTION only if necessary.` It is valid only for native properties (
     * x, y , scale, etc...). It is valid only if the disableForce3D property is set to false ( default value ). The
     * default value is `false`.
     */
    useWillChange?: boolean;
}

export interface Parallax {
    /**
     * Defines when the calculation reaches the value 0 ( neutral position ). It is possible to use a preset value or a
     * number from 0 to 100 which corresponds to a value calculated with respect to the viewport. The default is
     * 'center'.
     *
     * - `start`: top of document.
     * - `end`: end of document.
     * - `center`: center of viewport.
     * - `top/left`: top/left of viewport.
     * - `bottom/right`: bottom/right of viewport.
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
     * Defines the behavior of the parallax once it reaches point 0 ( neutral position ) It can continue, stop or go
     * back. The default value is null, in this case the calculation from positive will become negative.
     */
    onSwitch?: 'in-stop' | 'in-back' | 'out-stop' | 'out-back';

    /**
     * Defines the start value of the opacity animation with respect to the viewport. 100 corresponds to 100vh. The
     * default value is 100.
     */
    opacityStart?: number;

    /**
     * Defines the end value of the opacity animation with respect to the viewport. 100 corresponds to 100vh. The
     * default value is 0
     */
    opacityEnd?: number;

    /**
     * Parallax remains active as long as the element remains behind the viewport (with a safety margin of 150px), using
     * this option bypasses this check. The default value is false.
     */
    limiterOff?: boolean;
}

export interface ScrollTrigger {
    /**
     * Activate the pin. The pin will be applied to the defined element of the item property. The default value is
     * false.
     */
    pin?: boolean;

    /**
     * A spring animation will be applied to the pinned element on state change.
     */
    animatePin?: boolean;

    /**
     * The element will always be appended to the document body. The default value is false.
     */
    forceTranspond?: boolean;

    /**
     * The pin is always activated a little earlier based on the last scroll made. With this property, when loading the
     * page and without having performed any scrolling, the element can be pinned even if slightly earlier than the
     * preset position. The default value is false.
     */
    anticipatePinOnLoad?: boolean;

    /**
     * Defines the start position of the animation, the value is a string made up of 3 optional values:
     *
     * 1: `bottom|top|left|right`: Indicates the side of the viewport that will be referenced.
     *
     * 2: `+/-<value>vh|vw|px`: add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,
     *
     * 3: `+/-height|halfHeight|width|halfWidth`: You can add the height/width value or half of one of them to the final
     * value. Useful for centering the element.
     *
     * The values 2 & 3 will always be added from the chosen position towards the center of the screen, whether the
     * position corresponds to top|bottom left|right
     *
     * Expamples: `bottom +50vh -halfHeight` the value corresponding to the element position centered in the viewport.
     * All the values is case insensitive
     */
    start?: string;

    /**
     * Defines the end position of the animation, the value is a string made up of 3 optional values:
     *
     * 1: `bottom|top|left|right`: Indicates the side of the viewport that will be referenced.
     *
     * 2: `+/-<value>vh|vw|px`: add a value in vh|vw|px, vh in vertical direction, vw in horizontal direction,
     *
     * 3: `+/-height|halfHeight|width|halfWidth`: You can add the height/width value or half of one of them to the final
     * value. Useful for centering the element.
     *
     * The values 2 & 3 will always be added from the chosen position towards the center of the screen, whether the
     * position corresponds to top|bottom left|right
     *
     * Expamples: `bottom +50vh -halfHeight` the value corresponding to the element position centered in the viewport.
     * All the values is case insensitive
     */
    end?: string;

    /**
     * Display start|end values with a solid line. In case you activate the pin property the top|bottom|right|left
     * border of the pin warapper will have a highlight border applied. The value is a text string that will be added to
     * the fixed line. The default value is false.
     */
    marker?: string;

    /**
     * The start position calculated with the help of a function. the resulting value of the function will be calculated
     * starting from the specified position towards the center of the viewport. if the property is used it will take
     * precedence over start.
     */
    dynamicStart?: DynamicStart;

    /**
     * The end position calculated with the help of a function. The resulting value of the function will be calculated
     * starting from the specified position towards the center of the viewport. If the property is used it will take
     * precedence over end.
     */
    dynamicEnd?: DynamicEnd;

    /**
     * The transformation value calculated through the use of a function. The result of the function will be used in px.
     * If used, it will take priority over the range method. if the property is a tween it will have no effect.
     */
    dynamicRange?: () => number;

    /**
     * The element will animate with easing (if used) on loading the page or animation. The default value is false.
     */
    animateAtStart?: boolean;

    onEnter?: () => void;

    onEnterBack?: () => void;

    onLeave?: () => void;

    onLeaveBack?: () => void;

    /**
     * Function that is launched at each tick. The function will have the current value as input parameter.
     */
    onTick?: (arg0: MobScrollerMove) => void;
}

export interface MobScrollerMove {
    value: number | undefined;
    parentIsMoving: boolean;
}

export interface MobScrollerTween {
    from: Record<string, number>;
    to: Record<string, number>;
    stagger?: Partial<StaggerObject>;
    ease?: EaseTypes;
    duration?: number;
}

export interface MobScrollerTweenValue {
    currentValue: number | (() => number);
    prop: string;
    settled: boolean;
    fromFn: () => number;
    fromIsFn?: boolean;
    toFn: () => number;
    toIsFn?: boolean;
    toValProcessed: number;
    toValue: number;
    fromValue: number;
}

export type MobScrollerTweenSetData = (
    arg0: Record<string, number>
) => MobScrollerTween;

export type MobScrollerTweenGoTo = (
    arg0: Record<string, number | (() => number)>
) => MobScrollerTween;

export type MobScrollerTweenSubscribe = (arg0: (any) => void) => () => void;
export type MobScrollerTweenOnStop = (arg0: (any) => void) => () => void;

export type MobScrollerTweenSubscribeCache = (
    item: object | HTMLElement,
    cb: (arg0: Record<string, number>) => void
) => () => void;

export type MobScrollerTweenGetDuration = () => number;
export type MobScrollerTweenGet = () => string;

export interface MobScrollerMotion {
    stop: () => void;
    setData: (arg0: any) => void;
    goTo: (arg0: any, ar1: any) => Promise<any>;
    set: (arg0: any, ar1: any) => Promise<any>;
    updateVelocity?: (number) => void;
    updateConfig?: (arg0: springPropsOptional) => void;
    subscribe: (cb: (arg0: any) => void) => () => void;
    subscribeCache: any;
    onComplete: (cb: (arg0: any) => void) => () => void;
    destroy: () => void;
}

export interface PinParams {
    item: HTMLElement | null | undefined;
    marker: string | undefined;
    screen: (Window & globalThis) | HTMLElement;
    animatePin: boolean;
    anticipatePinOnLoad: boolean;
    forceTranspond: boolean;
    invertSide: boolean;
    direction: string;
    scrollerHeight: number;
    getStart: () => number;
    getEnd: () => number;
}
