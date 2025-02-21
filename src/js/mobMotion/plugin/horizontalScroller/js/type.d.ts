import { MouseEventParsed } from '../../../../mobCore/events/mouseUtils/type';
import ParallaxClass from '../../../animation/parallax/parallax';
import { mqAction, mqValues } from '../../../utils/type';

export type horizontalScrollerOnTick = (arg0: {
    value: number;
    parentIsMoving: boolean;
    percent: number;
}) => void;

export interface HorizontalScroller {
    /**
     * Enable drag, default: false.
     */
    useDrag?: boolean;

    /**
     * Modify threshold value for click action.
     * Default value is `30`.
     */
    threshold?: number;

    /**
     * Defines whether the animation will have ease.
     * The default value is `false`.
     */
    ease?: boolean;

    /**
     * The element will animate with easing (if used) on loading the page or animation.
     * The default value is `false`.
     */
    animateAtStart?: boolean;

    /**
     * @description
     * Defines the type of easing. The default is `lerp`.
     */
    easeType?: 'lerp' | 'spring';

    /**
     * Enable a Throttle function on the scroll.
     * The option will not be enabled with the presence of an active pin to maintain accuracy.
     * The default value is `false`.
     */
    useThrottle?: boolean;

    /**
     * Property valid only with `useSticky = false`.
     * The element will always be appended to the document body.
     * The default value is false.
     */
    forceTranspond?: boolean;

    onEnter?: () => void;
    onEnterBack?: () => void;
    onLeave?: () => void;
    onLeaveBack?: () => void;
    afterRefresh?: () => void;
    afterInit?: () => void;
    afterDestroy?: () => void;
    onTick?: horizontalScrollerOnTick;

    /**
     * Enable the css property will-change: transform; when the frame rate falls below 3/5 of the optimal value.
     * The property remains active for 4 sedonds.
     * If after the previous value the fps value is back to normal the will-change property is disabled.
     * `Use with CAUTION only if necessary.`
     * The default value is `false`.
     */
    useWillChange?: boolean;

    /**
     * Property valid only with `useSticky = false`.
     * A spring animation will be applied to the pinned element on state change.
     */
    animatePin?: boolean;

    /**
     * Use native `position: sticky` to pin the scroller or use scrolleTrigger pin.
     * Default value is `false`.
     */
    useSticky?: boolean;

    /**
     * Generate scoped css.
     * Default value is `true`.
     */
    addCss?: boolean;

    /**
     * If the addCss property is active, it is possible to define a default height for the columns.
     * The value must be a number between 0 and 100.
     * The unit of measure used in vh
     * The default value is `100`.
     */
    columnHeight?: number;

    /**
     * If the addCss property is active, it is possible to define a default width for the columns.
     * The value must be a number between 0 and 100.
     * The unit of measure used in `vh`
     * The default value is null ( no value will be applied ).
     */
    columnWidth?: number;

    /**
     * If the addCss property is active, it is possible to define the vertical alignment of the columns.
     * The default value is `start`.
     */
    columnAlign?: 'start' | 'center' | 'end';

    /**
     * Root element.
     * Accept only a unique class in the form of a string (dot included)
     * It is necessary to provide a string in order to create the necessary css.
     */
    root: HTMLElement | string;

    /**
     * Container element.
     * Accept only a unique class in the form of a string (dot included)
     * It is necessary to provide a string in order to create the necessary css.
     */
    container: string;

    /**
     * Row element.
     * Accept only a unique class in the form of a string (dot included)
     * It is necessary to provide a string in order to create the necessary css.
     */
    row: string;

    /**
     * Column element.
     * Accept only a unique class in the form of a string (dot included)
     * It is necessary to provide a string in order to create the necessary css.
     */
    column: string;

    /**
     * Trigger element.
     * Accept only a unique class in the form of a string (dot included)
     * It is necessary to provide a string in order to create the necessary css.
     */
    trigger: string;

    /**
     * The name of the class that will be used to create vertical shadow elements.
     * In this case the dot is optional.
     */
    shadowClass?: string;

    /**
     */
    reverse?: boolean;

    /**
     * An array of instances of the ParallaxClass class used within the scroller.
     * Es:
     * const parallax = mobbu.createParallax({ ... })
     * const scrolltrigger = mobbu.createScrollTrigger({ ... })
     * ...
     * children: [parallax, scrolltrigger],
     * ...
     * The instances contained in the array will be:
     * Drive.
     * Updated.
     * Destroyed.
     * The `scroller`,`direction`,`branckPoint`,`queryType` properties
     * will be automatically aligned.
     */
    children?: ParallaxClass[];

    /**
     * @description
     * Defines whether the defined breakpoint will be a max-with or a min-width. The default is 'min-width'.
     */
    queryType?: mqAction;

    /**
     * @description
     */
    breakpoint?: mqValues;
}

export type onMouseEvent = (arg0: Partial<MouseEventParsed>) => void;
