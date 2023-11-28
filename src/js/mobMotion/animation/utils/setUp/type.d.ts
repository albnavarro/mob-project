export interface setUpType {
    /**
     * @description
     * Use passive event on mouse/touch event.
     */
    usePassive?: boolean;

    /**
     * @description
     * Control the scroll phase when fps drop occurs.
     * The key represents the number of fps dropped, the value represents the interval of frames needed to fire a scroll function.
     * eg: if from a stable value of 60fps it drops to 30fps (there is a drop of 30 fps) the scroll function will be performed every 2 scroll and so on.
     * This mechanism is designed to make the browser work less whenever there are bottle caps that prevent it from working smoothly.
     * You can disable this layering by disabling the `useScaleFps` property.
     * Default: `fpsScalePercent: { 0: 1, 30: 2, 50: 3 }`.
     */
    fpsScalePercent?: { [key: string]: number };

    /**
     * @description
     * Enable or disable conditional module operation on scroll based on fps drop.
     * Default: `useScaleFps: true`.
     */
    useScaleFps?: boolean;

    /**
     * @description
     * If the property is set to true, all functions related to nextTick will be executed at the end of the request animation frame.
     * Default:  `deferredNextTick: true`.
     */
    deferredNextTick?: boolean;

    /**
     * @description
     * Throttle value in milliseconds.
     * Default: `throttle: 100`.
     */
    throttle?: number;

    /**
     * @description
     * Object representing key and value of the default breakpoints.
     * default keys: `xSmall, small, medium, tablet, desktop, large, xLarge`.
     * es: `desktop: 992`.
     */
    mq?: { [key: string]: number };

    /**
     * @description
     * Object representing the default values of the media queries used by parallax and scrollTrigger.
     */
    defaultMq?: {
        /**
         * @description
         * Parallax/scrollTrigger breakpoint default value, choice: `xSmall, small, medium, tablet, desktop, large, xLarge`
         * Default:  `{ value: 'desktop' }`
         */
        value?: import('../../../utils/type').mqValues;

        /**
         * @description
         * Parallax/scrollTrigger mediaQuery type default value, choice is `min , max`,
         * Default:  `{ type: 'min' }`
         */
        type?: import('../../../utils/type').mqAction;
    };

    sequencer?: {
        /**
         * Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed.
         * Default: `{ duration: 10 }`
         */
        duration?: number;

        /**
         * Default essing function used by the sequencer.
         * Default: `{ ease: easeLinear }`
         */
        ease?: import('../../tween/type').easeTypes;
    };

    scrollTrigger?: {
        /**
         * @description
         * Default value of lerp velocity,
         * Default: `{ lerpConfig: 0.06 }`
         */
        lerpConfig?: number;

        /**
         * @description
         * Spring config, choice: `default, gentle, wobbly, bounce, scroller`.
         * Default: `{ springConfig: 'default' }`
         */
        springConfig?: import('../../spring/type').springChoiceConfig;

        markerColor?: {
            /**
             * @description
             * Default color of start|end marker,
             * Default: `{ startEnd:  '#ff0000' }`.
             */
            startEnd?: string;

            /**
             * @description
             * Default color of item marker. This marker is only visible with the active pin.
             * Default: `{ item: '#14df3b' }`.
             */
            item?: string;
        };
    };

    parallax?: {
        /**
         * @description
         * Default value of the property that defines the calculation of the distance value,
         * Default: `{ defaultRange: 8 }`
         */
        defaultRange?: number;

        /**
         * @description
         * Default spring config, choice: `default, gentle, wobbly, bounce, scroller`,
         * Default: `{ springConfig: 'default' }`.
         */
        springConfig?: import('../../spring/type').springChoiceConfig;

        /**
         * @description
         * default value of lerp velocity,
         * Default: `{ lerpConfig: 0.06 }`.
         */
        lerpConfig?: number;
    };

    parallaxTween?: {
        /**
         * @description
         * Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed.
         * Default: `{ duration: 10 }`.
         */
        duration?: number;

        /**
         * @description
         * Default essing function used by the parallaxTween,
         * Default: `{ ease: 'easeLinear' }`.
         */
        ease?: import('../../tween/type').easeTypes;
    };

    tween?: {
        /**
         * @description
         * Default tween duration,
         * Default: `{ duration:  1000 }` ( value in milliseconds ).
         */
        duration?: number;

        /**
         * @description
         * Default essing function used by the tween,
         * Default: `{ ease: 'easeLinear' }`.
         */
        ease?: import('../../tween/type').easeTypes;

        /**
         * @description
         * Default value of relative properties.
         * Default:  `{ relative: false }`.
         */
        relative?: boolean;
    };

    spring?: {
        /**
         * @description
         * Default value of relative properties.
         * Default:  `{ relative: false }`.
         */
        relative?: boolean;

        /**
         * @description
         * Default spring config, choice: `default, gentle, wobbly, bounce, scroller`,
         * Default: `{ springConfig: 'default' }`.
         */
        config?: import('../../spring/type').springPresentConfigType;
    };

    lerp?: {
        /**
         * @description
         * Default value of relative properties.
         * Default:  `{ relative: false }`.
         */
        relative?: boolean;

        /**
         * @description
         * Default value of precision properties.
         * Default: `{ precision:  'false' }`.
         */
        precision?: number;

        /**
         * @description
         * Default value of velocity properties.
         * Default: `{ velocity: 'false' }`.
         */
        velocity?: number;
    };
}
