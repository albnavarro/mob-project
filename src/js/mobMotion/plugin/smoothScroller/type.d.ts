import { MouseEventParsed } from '../../../mobCore/events/mouseUtils/type';
import { mqAction, mqValues } from '../../utils/type';

type onTick = (arg0: {
    value: number;
    percent: number;
    parentIsMoving: boolean;
}) => void;

type onUpdate = (arg0: {
    value: number;
    percent: number;
    parentIsMoving: boolean;
}) => void;

export interface SmoothScroller {
    /**
     * @description
     * Defines the scroll direction
     */
    direction?: 'vertical' | 'horizontal';

    /**
     * @description
     * Defines the type of easing. The default is `lerp`.
     */
    easeType?: 'lerp' | 'spring';

    /**
     * @description
     * The node that will have to scroll
     */
    scroller: string | HTMLElement;

    /**
     * @description
     * The scroller container.
     * The default value is `document.documentElement`.
     */
    screen?: string | HTMLElement;

    /**
     * @description
     * Use event ( scroll,wheel,etc.. ) on scroller or on document.
     * If the events are used on the scroller they will have the passive property set to true (better performance).
     * Otherwise, based on the general value of the passive property, the listener attached to the document will use the `preventDefault()` function.
     * This will prevent the page from scrolling in turn when scrolling over the component.
     * To set the global passive property use:
     * `core.setDefault({ usePassive: true|false })`;
     */
    scopedEvent?: boolean;

    /**
     * @description
     * You can adjust the speed of the wheel event.
     * The default value is `60`.
     */
    speed?: number;

    /**
     * @description
     * It is possible to enable and disable the drag functionality.
     * The default value is `false`.
     */
    drag?: boolean;

    /**
     * @description
     * Function that is launched at each tick.
     * The function will have an Object as input parameter.
     * `value`: scroll value
     * `percent`: scroll value in percent
     * `parentIsMoving`: A boolean value indicating whether the scroller has stopped ( last tick )
     */
    onTick?: onTick;

    /**
     * @description
     * Function that is launched at each update value ( non easing value ).
     * The function will have an Object as input parameter.
     * `value`: scroll value
     * `percent`: scroll value in percent
     */
    onUpdate?: onUpdate;

    /**
     * @description
     * Function that is launched after refresh
     */
    afterRefresh?: () => void;

    /**
     * @description
     * Function that is launched after init
     */
    afterInit?: () => void;

    /**
     * @description
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
     * The `scroller`,`screen`, `direction`,`branckPoint`,`queryType` properties
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
