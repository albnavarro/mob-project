import { springPresetConfig } from './animation/spring/springConfig.js';
import { mergeDeep } from './utils/mergeDeep.js';
export const MQ_MIN = 'min';
export const MQ_MAX = 'max';

/**
 * @typedef {Object} handleSetUpSetType
 * @prop {Number} startFps -  The fallback FPS value before it is detected, the default value is 60.
 * @prop {Object.<string, number>} fpsScalePercent - Control the render phase when fps drop occurs. The key represents the number of fps dropped, the value represents the interval of frames needed to perform a new rendering, eg: if from a stable value of 60fps it drops to 44fps (there is a drop of 15 fps) the rendering will be performed every 2 frames and so on. This mechanism is designed to make the browser work less whenever there are bottle caps that prevent it from working smoothly. You can disable this layering by disabling the `useScaleFps` property.
 * @prop {Boolean} useScaleFps - Enable or disable conditional rendering based on fps drop, the default value is `true`.
 * @prop {Boolean}  deferredNextTick - If the property is set to true, all functions related to nextTick will be executed at the end of the request animation frame, the default value is `true`.
 * @prop {Number} throttle - Throttle value in milliseconds, default value is `100`.
 * @prop {import('./utils/mediaManager.js').breackPointTypeObjKeyValue} mq - Object representing key and value of the default breakpoints, deafult keys: `xSmall, small, medium, tablet, desktop, large, xLarge`  es: `desktop: 992`.
 * @prop {Object} defaultMq - Object representing the default values of the media queries used by parallax and scrollTrigger.
 * @prop {import('./utils/mediaManager.js').breackPointType} defaultMq.value - parallax/scrollTrigger breackpoint default value, choice: `xSmall, small, medium, tablet, desktop, large, xLarge`  the default value is `desktop`
 * @prop {import('./utils/mediaManager.js').mqChoiceType} defaultMq.type - parallax/scrollTrigger mediaQuery type default value, choice is `min , max`, the default value is `min`
 * @prop {Object} sequencer - sequencer default properties
 * @prop {Number} sequencer.duration - Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed. The default value is `10`
 * @prop {import('./animation/tween/tweenConfig.js').easeStringTypes} sequencer.ease - Default essing function used by the sequencer, the default value is `easeLinear`.
 * @prop {Object} scrollTrigger - scrollTrigger default properties
 * @prop {import('./animation/spring/springConfig.js').springConfigStringTypes} scrollTrigger.springConfig - Deafult spring config, choice: `default, gentle, wobbly, bounce, scroller`, default value is `default`.
 * @prop {Number} scrollTrigger.lerpConfig - default value of lerp velocity, the default is `0.06`.
 * @prop {Object} scrollTrigger.markerColor - default marker color.
 * @prop {String} scrollTrigger.markerColor.startEnd - Default color of start|end marker, the default value is `#ff0000`.
 * @prop {String} scrollTrigger.markerColor.item - Default color of item marker. This marker is only visible with the active pin. the default value is `#14df3b`.
 * @prop {Object} parallax - parallax default properties
 * @prop {Number} parallax.defaultRange - default value of the property that defines the calculation of the distance value, the default value is `8`
 * @prop {import('./animation/spring/springConfig.js').springConfigStringTypes} parallax.springConfig - Deafult spring config, choice: `default, gentle, wobbly, bounce, scroller`, default value is `default`.
 * @prop {Number} parallax.lerpConfig - default value of lerp velocity, the default is `0.06`.
 * @prop {Object} parallaxTween - parallaxTween default properties
 * @prop {Number} parallaxTween.duration - Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed. The default value is `10`.
 * @prop {import('./animation/tween/tweenConfig.js').easeStringTypes} parallaxTween.ease - Default essing function used by the parallaxTween, the default value is `easeLinear`.
 * @prop {Object} tween - tween default properties
 * @prop {Number} tween.duration - default tween duration, the default value is `1000` ( value in milliseconds ).
 * @prop {import('./animation/tween/tweenConfig.js').easeStringTypes} tween.ease - Default essing function used by the tween, the default value is `easeLinear`.
 * @prop {Boolean} tween.relative - default value of relative properties. the default value is `false`.
 * @prop {Object} spring - spring default properties
 * @prop {Boolean} spring.relative - default value of relative properties. the default value is `false`.
 * @prop {import('./animation/spring/springConfig.js').springConfigStringTypes} spring.config - All spring configuration. It is possible to modify or add new configurations.
 * @prop {Object} lerp - lerp default properties.
 * @prop {Boolean} lerp.relative - default value of relative properties. the default value is `false`.
 * @prop {Number} lerp.precision - default value of precision properties. the default value is `false`.
 * @prop {Number} lerp.velocity - default value of velocity properties. the default value is `false`.
 */

/**
 * @typedef {('startFps'|'fpsScalePercent'|'useScaleFps'|'deferredNextTick'|'throttle'|'mq'|'defaultMq'|'sequencer'|'scrollTrigger'|'parallax'|'parallaxTween'|'tween'|'spring'|'lerp')} handleSetUpGetType
 */

export const handleSetUp = (() => {
    let data = {
        startFps: 60,
        fpsScalePercent: { 0: 1, 15: 2, 30: 3, 45: 4 },
        useScaleFps: true,
        deferredNextTick: false,
        throttle: 100,
        mq: {
            xSmall: 320,
            small: 360,
            medium: 600,
            tablet: 768,
            desktop: 992,
            large: 1200,
            xLarge: 1400,
        },
        defaultMq: {
            value: 'desktop',
            type: MQ_MIN,
        },
        sequencer: {
            duration: 10,
            ease: 'easeLinear',
        },
        scrollTrigger: {
            springConfig: 'default',
            lerpConfig: 0.06,
            markerColor: {
                startEnd: '#ff0000',
                item: '#14df3b',
            },
        },
        parallax: {
            defaultRange: 8,
            springConfig: 'default',
            lerpConfig: 0.06,
        },
        parallaxTween: {
            duration: 10,
            ease: 'easeLinear',
        },
        tween: {
            duration: 1000,
            ease: 'easeLinear',
            relative: false,
        },
        spring: {
            relative: false,
            config: springPresetConfig,
        },
        lerp: {
            relative: false,
            precision: 0.01,
            velocity: 0.06,
        },
    };

    /**
     * @description
     * - Here it is possible to modify the default values of the various modules of the library
     *
     * @param {handleSetUpSetType} obj
     *
     *
     * @example
     * ```js
     * Default value schema:
     *
     * handleSetUp.set({
     *     startFps: 60,
     *     fpsScalePercent: {
     *         0: 1,
     *         15: 2,
     *         30: 3,
     *         45: 4,
     *     },
     *     useScaleFps: true,
     *     deferredNextTick: false,
     *     throttle: 100,
     *     mq: {
     *         xSmall: 320,
     *         small: 360,
     *         medium: 600,
     *         tablet: 768,
     *         desktop: 992,
     *         large: 1200,
     *         xLarge: 1400,
     *     },
     *     defaultMq: {
     *         value: 'desktop',
     *         type: 'min',
     *     },
     *     sequencer: {
     *         duration: 10,
     *         ease: 'easeLinear',
     *     },
     *     scrollTrigger: {
     *         springConfig: 'default',
     *         lerpConfig: 0.06,
     *         markerColor: {
     *             startEnd: '#ff0000',
     *             item: '#14df3b',
     *         },
     *     },
     *     parallax: {
     *         defaultRange: 8,
     *         springConfig: 'default',
     *         lerpConfig: 0.06,
     *     },
     *     parallaxTween: {
     *         duration: 10,
     *         ease: 'easeLinear',
     *     },
     *     tween: {
     *         duration: 1000,
     *         ease: 'easeLinear',
     *         relative: false,
     *     },
     *     spring: {
     *         relative: false,
     *         config: {
     *             default: {
     *                 tension: 20,
     *                 mass: 1,
     *                 friction: 5,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             gentle: {
     *                 tension: 120,
     *                 mass: 1,
     *                 friction: 14,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             wobbly: {
     *                 tension: 180,
     *                 mass: 1,
     *                 friction: 12,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             bounce: {
     *                 tension: 200,
     *                 mass: 3,
     *                 friction: 5,
     *                 velocity: 0,
     *                 precision: 0.01,
     *             },
     *             scroller: {
     *                 tension: 10,
     *                 mass: 1,
     *                 friction: 5,
     *                 velocity: 0,
     *                 precision: 0.5,
     *             },
     *         },
     *     },
     *     lerp: {
     *         relative: false,
     *         precision: 0.01,
     *         velocity: 0.06,
     *     },
     * });
     *
     *
     * ```
     */
    const set = (obj) => {
        data = mergeDeep(data, obj);
    };

    /**
     * @description
     * Returns the value of a specific property
     *
     * @param {handleSetUpGetType} prop
     * @returns {Object}
     *
     * @example
     * ```js
     * handleSetUp.get('parallax');
     * ```
     */
    const get = (prop) => {
        if (prop in data) {
            return data[prop];
        } else {
            console.warn(`handleSetUp: ${prop} is not a setup propierties`);
        }
    };

    /**
     * @description
     * Perform a console.log() of the default values
     *
     * @example
     * ```js
     * handleSetUp.print();
     * ```
     */
    const print = () => {
        /**
         * Writable props
         * This prop can be changed by the user using set methods
         */
        console.log(`Writable props:`);
        console.log(data);
    };

    return {
        set,
        get,
        print,
    };
})();
