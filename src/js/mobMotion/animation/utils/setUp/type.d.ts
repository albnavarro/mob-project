import { MqAction, MqValues } from '../../../utils/type';
import { SpringChoiceConfig, SpringPresentConfigType } from '../../spring/type';
import { EaseTypes } from '../../tween/type';

export interface SetUpType {
    /**
     * @description
     * Use passive event on mouse/touch event.
     */
    usePassive: boolean;

    /**
     * @description
     * If the property is set to true, all functions related to nextTick will be executed at the end of the request animation frame.
     * Default:  `deferredNextTick: true`.
     */
    deferredNextTick: boolean;

    /**
     * @description
     * Throttle value in milliseconds.
     * Default: `throttle: 100`.
     */
    throttle: number;

    /**
     * @description
     * Object representing key and value of the default breakpoints.
     * default keys: `xSmall, small, medium, tablet, desktop, large, xLarge`.
     * es: `desktop: 992`.
     */
    mq: Record<string, number>;

    /**
     * @description
     * Object representing the default values of the media queries used by parallax and scrollTrigger.
     */
    defaultMq: {
        /**
         * @description
         * Parallax/scrollTrigger breakpoint default value, choice: `xSmall, small, medium, tablet, desktop, large, xLarge`
         * Default:  `{ value: 'desktop' }`
         */
        value: MqValues;

        /**
         * @description
         * Parallax/scrollTrigger mediaQuery type default value, choice is `min , max`,
         * Default:  `{ type: 'min' }`
         */
        type: MqAction;
    };

    sequencer: {
        /**
         * Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed.
         * Default: `{ duration: 10 }`
         */
        duration: number;

        /**
         * Default essing function used by the sequencer.
         * Default: `{ ease: easeLinear }`
         */
        ease: EaseTypes;
    };

    scrollTrigger: {
        /**
         * @description
         * Default value of lerp velocity,
         * Default: `{ lerpConfig: 0.06 }`
         */
        lerpConfig: number;

        /**
         * @description
         * Spring config, choice: `default, gentle, wobbly, bounce, scroller`.
         * Default: `{ springConfig: 'default' }`
         */
        springConfig: SpringChoiceConfig;

        markerColor: {
            /**
             * @description
             * Default color of start|end marker,
             * Default: `{ startEnd:  '#ff0000' }`.
             */
            startEnd: string;

            /**
             * @description
             * Default color of item marker. This marker is only visible with the active pin.
             * Default: `{ item: '#14df3b' }`.
             */
            item: string;
        };
    };

    parallax: {
        /**
         * @description
         * Default value of the property that defines the calculation of the distance value,
         * Default: `{ defaultRange: 8 }`
         */
        defaultRange: number;

        /**
         * @description
         * Default spring config, choice: `default, gentle, wobbly, bounce, scroller`,
         * Default: `{ springConfig: 'default' }`.
         */
        springConfig: SpringChoiceConfig;

        /**
         * @description
         * default value of lerp velocity,
         * Default: `{ lerpConfig: 0.06 }`.
         */
        lerpConfig: number;
    };

    parallaxTween: {
        /**
         * @description
         * Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed.
         * Default: `{ duration: 10 }`.
         */
        duration: number;

        /**
         * @description
         * Default essing function used by the parallaxTween,
         * Default: `{ ease: 'easeLinear' }`.
         */
        ease: EaseTypes;
    };

    tween: {
        /**
         * @description
         * Default tween duration,
         * Default: `{ duration:  1000 }` ( value in milliseconds ).
         */
        duration: number;

        /**
         * @description
         * Default essing function used by the tween,
         * Default: `{ ease: 'easeLinear' }`.
         */
        ease: EaseTypes;

        /**
         * @description
         * Default value of relative properties.
         * Default:  `{ relative: false }`.
         */
        relative: boolean;
    };

    spring: {
        /**
         * @description
         * Default value of relative properties.
         * Default:  `{ relative: false }`.
         */
        relative: boolean;

        /**
         * @description
         * Default spring config, choice: `default, gentle, wobbly, bounce, scroller`,
         * Default: `{ springConfig: 'default' }`.
         */
        config: SpringPresentConfigType;
    };

    lerp: {
        /**
         * @description
         * Default value of relative properties.
         * Default:  `{ relative: false }`.
         */
        relative: boolean;

        /**
         * @description
         * Default value of precision properties.
         * Default: `{ precision:  0.01 }`.
         */
        precision: number;

        /**
         * @description
         * Default value of velocity properties.
         * Default: `{ velocity: 0.06 }`.
         */
        velocity: number;
    };
}

export type SetUpGetData = () => SetUpType;

export type GetSetUp = <T extends keyof SetUpType>(props: T) => SetUpType[T];

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export type SetSetUp = (obj: DeepPartial<SetUpType>) => void;
