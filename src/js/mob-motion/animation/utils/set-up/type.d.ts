import { MqAction, MqValues } from '../../../utils/type';
import { SpringChoiceConfig, SpringPresentConfigType } from '../../spring/type';
import { EaseTypes } from '../../tween/type';

export interface SetUpType {
    /**
     * Use passive event on mouse/touch event.
     */
    usePassive: boolean;

    /**
     * If the property is set to true, all functions related to nextTick will be executed at the end of the request
     * animation frame. Default: `deferredNextTick: true`.
     */
    deferredNextTick: boolean;

    /**
     * Throttle value in milliseconds. Default: `throttle: 100`.
     */
    throttle: number;

    /**
     * Object representing key and value of the default breakpoints. default keys: `xSmall, small, medium, tablet,
     * desktop, large, xLarge`. es: `desktop: 992`.
     */
    mq: Record<string, number>;

    /**
     * Object representing the default values of the media queries used by parallax and scrollTrigger.
     */
    defaultMq: {
        /**
         * Parallax/scrollTrigger breakpoint default value, choice: `xSmall, small, medium, tablet, desktop, large,
         * xLarge` Default: `{ value: 'desktop' }`
         */
        value: MqValues;

        /**
         * Parallax/scrollTrigger mediaQuery type default value, choice is `min , max`, Default: `{ type: 'min' }`
         */
        type: MqAction;
    };

    sequencer: {
        /**
         * Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of
         * processing the value as needed. Default: `{ duration: 10 }`
         */
        duration: number;

        /**
         * Default essing function used by the sequencer. Default: `{ ease: easeLinear }`
         */
        ease: EaseTypes;
    };

    scrollTrigger: {
        /**
         * Default value of lerp velocity, Default: `{ lerpConfig: 0.06 }`
         */
        lerpConfig: number;

        /**
         * Spring config, choice: `default, gentle, wobbly, bounce, scroller`. Default: `{ springConfig: 'default' }`
         */
        springConfig: SpringChoiceConfig;

        markerColor: {
            /**
             * Default color of start|end marker, Default: `{ startEnd: '#ff0000' }`.
             */
            startEnd: string;

            /**
             * Default color of item marker. This marker is only visible with the active pin. Default: `{ item:
             * '#14df3b' }`.
             */
            item: string;
        };
    };

    parallax: {
        /**
         * Default value of the property that defines the calculation of the distance value, Default: `{ defaultRange: 8
         * }`
         */
        defaultRange: number;

        /**
         * Default spring config, choice: `default, gentle, wobbly, bounce, scroller`, Default: `{ springConfig:
         * 'default' }`.
         */
        springConfig: SpringChoiceConfig;

        /**
         * Default value of lerp velocity, Default: `{ lerpConfig: 0.06 }`.
         */
        lerpConfig: number;
    };

    parallaxTween: {
        /**
         * Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of
         * processing the value as needed. Default: `{ duration: 10 }`.
         */
        duration: number;

        /**
         * Default essing function used by the parallaxTween, Default: `{ ease: 'easeLinear' }`.
         */
        ease: EaseTypes;
    };

    tween: {
        /**
         * Default tween duration, Default: `{ duration: 1000 }` ( value in milliseconds ).
         */
        duration: number;

        /**
         * Default essing function used by the tween, Default: `{ ease: 'easeLinear' }`.
         */
        ease: EaseTypes;

        /**
         * Default value of relative properties. Default: `{ relative: false }`.
         */
        relative: boolean;
    };

    spring: {
        /**
         * Default value of relative properties. Default: `{ relative: false }`.
         */
        relative: boolean;

        /**
         * Default spring config, choice: `default, gentle, wobbly, bounce, scroller`, Default: `{ springConfig:
         * 'default' }`.
         */
        config: SpringPresentConfigType;
    };

    lerp: {
        /**
         * Default value of relative properties. Default: `{ relative: false }`.
         */
        relative: boolean;

        /**
         * Default value of precision properties. Default: `{ precision: 0.01 }`.
         */
        precision: number;

        /**
         * Default value of velocity properties. Default: `{ velocity: 0.06 }`.
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
