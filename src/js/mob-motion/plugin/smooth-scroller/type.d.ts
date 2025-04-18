import { MouseEventParsed } from '../../../mob-core/events/mouse-utils/type';
import { MqAction, MqValues } from '../../utils/type';

export type OnTick = (arg0: {
    value: number;
    percent: number;
    parentIsMoving: boolean;
}) => void;

export type OnUpdate = (arg0: {
    value: number;
    percent: number;
    parentIsMoving: boolean;
}) => void;

export type OnSwipe = (arg0: {
    direction: number;
    move: (value: number) => void;
}) => void;

export interface MobSmoothScroller {
    /**
     * Defines the scroll direction
     */
    direction?: 'vertical' | 'horizontal';

    /**
     * Defines the type of easing. The default is `lerp`.
     */
    easeType?: 'lerp' | 'spring';

    /**
     * The node that will have to scroll
     */
    scroller: string | HTMLElement;

    /**
     * The scroller container. The default value is `document.documentElement`.
     */
    screen?: string | HTMLElement;

    /**
     * Use event ( scroll,wheel,etc.. ) on scroller or on document. If the events are used on the scroller they will
     * have the passive property set to true (better performance). Otherwise, based on the general value of the passive
     * property, the listener attached to the document will use the `preventDefault()` function. This will prevent the
     * page from scrolling in turn when scrolling over the component. To set the global passive property use:
     * `core.setDefault({ usePassive: true|false })`;
     */
    scopedEvent?: boolean;

    /**
     * Wheel in both X and Y axis Use for scroll horizontally with trackpad. If useHorizontalScroll is used useSwipe
     * will be disabled.
     */
    useHorizontalScroll?: boolean;

    /**
     * Enable horizontal swipe. If useSwipe is used useHorizontalScroll will be disabled. each sipe event onSwipe
     * callback is fired.
     */
    useSwipe?: boolean;

    /**
     * Reverse swipe direction.
     */
    revertSwipeDirection?: boolean;

    /**
     * You can adjust the speed of the wheel event. The default value is `60`.
     */
    speed?: number;

    /**
     * It is possible to enable and disable the drag functionality. The default value is `false`.
     */
    drag?: boolean;

    /**
     * Function that is launched at each tick. The function will have an Object as input parameter. `value`: scroll
     * value `percent`: scroll value in percent `parentIsMoving`: A boolean value indicating whether the scroller has
     * stopped ( last tick )
     */
    onTick?: OnTick;

    /**
     * Function that is launched at each update value ( non easing value ). The function will have an Object as input
     * parameter. `value`: scroll value `percent`: scroll value in percent
     */
    onUpdate?: OnUpdate;

    /**
     * Function that is launched at each swipe event. The function will have an Object as input parameter. `direction`:
     * swipe direction, 1 || -1 `move`: callback that move scroller by a percent value,
     */
    onSwipe?: OnSwipe;

    /**
     * Function that is launched after refresh
     */
    afterRefresh?: (arg0: { shouldScroll: boolean }) => void;

    /**
     * Function that is launched after init
     */
    afterInit?: (arg0: { shouldScroll: boolean }) => void;

    /**
     * An array of instances of the ParallaxClass class used within the scroller. Es: const parallax =
     * mobbu.createParallax({ ... }) const scrolltrigger = mobbu.createScrollTrigger({ ... }) ... children: [parallax,
     * scrolltrigger], ... The instances contained in the array will be: Drive. Updated. Destroyed. The
     * `scroller`,`screen`, `direction`,`branckPoint`,`queryType` properties will be automatically aligned.
     */
    children?: ParallaxClass[];

    /**
     * Defines whether the defined breakpoint will be a max-with or a min-width. The default is 'min-width'.
     */
    queryType?: MqAction;

    breakpoint?: MqValues;
}

export type MobSmoothScrollerOnMouseEvent = (
    arg0: Partial<MouseEventParsed>
) => void;
