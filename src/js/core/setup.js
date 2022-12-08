import { springPresetConfig } from './animation/spring/springConfig.js';
import {
    defaultMqValueDefault,
    deferredNextTickDefault,
    easeDefault,
    fpsScalePercentDefault,
    lerpConfigDefault,
    markerItemDefault,
    markerStartDefault,
    mqDefault,
    MQ_MIN,
    parallaxRangeDefault,
    parallaxTweenDurationDefault,
    sequencerDurationDefault,
    setupValidation,
    springConfigDefault,
    startFpsDefault,
    throttleDefault,
    tweenDurationDefault,
    tweenRealtiveDefault,
    useScaleFpsDefault,
} from './animation/utils/setUpValidation.js';
import { mergeDeep } from './utils/mergeDeep.js';

/**
 * @typedef {('startFps'|'fpsScalePercent'|'useScaleFps'|'deferredNextTick'|'throttle'|'mq'|'defaultMq'|'sequencer'|'scrollTrigger'|'parallax'|'parallaxTween'|'tween'|'spring'|'lerp')} handleSetUpGetType
 */

export const handleSetUp = (() => {
    /**
     * @constant
     * @type {import('./animation/utils/setUpValidation.js').handleSetUpSetType}
     */
    let data = {
        startFps: startFpsDefault,
        fpsScalePercent: fpsScalePercentDefault,
        useScaleFps: useScaleFpsDefault,
        deferredNextTick: deferredNextTickDefault,
        throttle: throttleDefault,
        mq: mqDefault,
        defaultMq: {
            value: defaultMqValueDefault,
            type: MQ_MIN,
        },
        sequencer: {
            duration: sequencerDurationDefault,
            ease: easeDefault,
        },
        scrollTrigger: {
            springConfig: springConfigDefault,
            lerpConfig: lerpConfigDefault,
            markerColor: {
                startEnd: markerStartDefault,
                item: markerItemDefault,
            },
        },
        parallax: {
            defaultRange: parallaxRangeDefault,
            springConfig: springConfigDefault,
            lerpConfig: lerpConfigDefault,
        },
        parallaxTween: {
            duration: parallaxTweenDurationDefault,
            ease: easeDefault,
        },
        tween: {
            duration: tweenDurationDefault,
            ease: easeDefault,
            relative: tweenRealtiveDefault,
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
     * @param {import('./animation/utils/setUpValidation.js').handleSetUpSetType} obj
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
        data = setupValidation(mergeDeep(data, obj));
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
