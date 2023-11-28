// @ts-check

import { mobCore } from '../mobCore/index.js';
import { springPresetConfig } from './animation/spring/springConfig.js';
import {
    defaultMqValueDefault,
    easeDefault,
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
    tweenDurationDefault,
    tweenRealtiveDefault,
} from './animation/utils/setUp/setUpValidation.js';
import { mergeDeep } from './utils/mergeDeep.js';

/**
 * @returns {import('./animation/utils/setUp/type.js').setUpType}
 */
function getData() {
    return {
        fpsScalePercent: mobCore.store.getProp('fpsScalePercent'),
        useScaleFps: mobCore.store.getProp('useScaleFps'),
        deferredNextTick: mobCore.store.getProp('deferredNextTick'),
        throttle: mobCore.store.getProp('throttle'),
        usePassive: mobCore.store.getProp('usePassive'),
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
}

/**
 * @typedef {('fpsScalePercent'|'useScaleFps'|'deferredNextTick'|'throttle'|'usePassive'|'mq'|'defaultMq'|'sequencer'|'scrollTrigger'|'parallax'|'parallaxTween'|'tween'|'spring'|'lerp')} handleSetUpGetType
 */

export const handleSetUp = (() => {
    let data = getData();

    /**
     * @description
     * - Here it is possible to modify the default values of the various modules of the library
     *
     * @param {import('./animation/utils/setUp/type.js').setUpType} obj
     *
     *
     * @example
     * ```javascript
     * Default value schema:
     *
     * handleSetUp.set({
     *     fpsScalePercent: {
     *         0: 1,
     *         15: 2,
     *         30: 3,
     *         45: 4,
     *     },
     *     useScaleFps: true,
     *     deferredNextTick: false,
     *     throttle: 100,
     *     usePassive: true,
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
        data = setupValidation(mergeDeep(getData(), obj));

        /**
         * Update event default.
         */
        if ('usePassive' in obj)
            mobCore.store.set('usePassive', data.usePassive);

        if ('fpsScalePercent' in obj)
            mobCore.store.set('fpsScalePercent', data.fpsScalePercent);

        if ('useScaleFps' in obj)
            mobCore.store.set('useScaleFps', data.useScaleFps);

        if ('deferredNextTick' in obj)
            mobCore.store.set('deferredNextTick', data.deferredNextTick);

        if ('throttle' in obj) mobCore.store.set('throttle', data.throttle);
    };

    /**
     * @description
     * Returns the value of a specific property
     *
     * @param {handleSetUpGetType} prop
     * @returns {Object}
     *
     * @example
     * ```javascript
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
     * ```javascript
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
