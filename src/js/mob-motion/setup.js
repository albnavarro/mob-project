// @ts-check

import { MobCore } from '../mob-core/index.js';
import { springPresetConfig } from './animation/spring/spring-config.js';
import {
    defaultMqValueDefault,
    easeDefault,
    lerpConfigDefault,
    markerItemDefault,
    markerStartDefault,
    mqDefault,
    MQ_MIN,
    scrollerRangeDefault,
    scrollerTweenDurationDefault,
    sequencerDurationDefault,
    setupValidation,
    springConfigDefault,
    tweenDurationDefault,
    tweenRealtiveDefault,
} from './animation/utils/set-up/set-up-validation.js';
import { mergeDeep } from './utils/merge-deep.js';

/**
 * @type {import('./animation/utils/set-up/type.js').SetUpGetData}
 */
function getData() {
    return {
        deferredNextTick: MobCore.store.getProp('deferredNextTick'),
        throttle: MobCore.store.getProp('throttle'),
        usePassive: MobCore.store.getProp('usePassive'),
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
            defaultRange: scrollerRangeDefault,
            springConfig: springConfigDefault,
            lerpConfig: lerpConfigDefault,
        },
        parallaxTween: {
            duration: scrollerTweenDurationDefault,
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

export const handleSetUp = (() => {
    let data = getData();

    /**
     * - Here it is possible to modify the default values of the various modules of the library
     *
     * @example
     *     ```javascript
     *     Default value schema:
     *
     *     handleSetUp.set({
     *         deferredNextTick: false,
     *         throttle: 100,
     *         usePassive: true,
     *         mq: {
     *             xSmall: 320,
     *             small: 360,
     *             medium: 600,
     *             tablet: 768,
     *             desktop: 992,
     *             large: 1200,
     *             xLarge: 1400,
     *         },
     *         defaultMq: {
     *             value: 'desktop',
     *             type: 'min',
     *         },
     *         sequencer: {
     *             duration: 10,
     *             ease: 'easeLinear',
     *         },
     *         scrollTrigger: {
     *             springConfig: 'default',
     *             lerpConfig: 0.06,
     *             markerColor: {
     *                 startEnd: '#ff0000',
     *                 item: '#14df3b',
     *             },
     *         },
     *         parallax: {
     *             defaultRange: 8,
     *             springConfig: 'default',
     *             lerpConfig: 0.06,
     *         },
     *         parallaxTween: {
     *             duration: 10,
     *             ease: 'easeLinear',
     *         },
     *         tween: {
     *             duration: 1000,
     *             ease: 'easeLinear',
     *             relative: false,
     *         },
     *         spring: {
     *             relative: false,
     *             config: {
     *                 default: {
     *                     tension: 20,
     *                     mass: 1,
     *                     friction: 5,
     *                     velocity: 0,
     *                     precision: 0.01,
     *                 },
     *                 gentle: {
     *                     tension: 120,
     *                     mass: 1,
     *                     friction: 14,
     *                     velocity: 0,
     *                     precision: 0.01,
     *                 },
     *                 wobbly: {
     *                     tension: 180,
     *                     mass: 1,
     *                     friction: 12,
     *                     velocity: 0,
     *                     precision: 0.01,
     *                 },
     *                 bounce: {
     *                     tension: 200,
     *                     mass: 3,
     *                     friction: 5,
     *                     velocity: 0,
     *                     precision: 0.01,
     *                 },
     *                 scroller: {
     *                     tension: 10,
     *                     mass: 1,
     *                     friction: 5,
     *                     velocity: 0,
     *                     precision: 0.5,
     *                 },
     *             },
     *         },
     *         lerp: {
     *             relative: false,
     *             precision: 0.01,
     *             velocity: 0.06,
     *         },
     *     });
     *
     *
     *     ```;
     *
     * @type {import('./animation/utils/set-up/type.js').SetSetUp}
     */
    const set = (obj) => {
        data = setupValidation(mergeDeep(getData(), obj));

        /**
         * Update event default.
         */
        if ('usePassive' in obj)
            MobCore.store.set('usePassive', data.usePassive);

        if ('deferredNextTick' in obj)
            MobCore.store.set('deferredNextTick', data.deferredNextTick);

        if ('throttle' in obj) MobCore.store.set('throttle', data.throttle);
    };

    /**
     * Returns the value of a specific property
     *
     * @example
     *     ```javascript
     *     handleSetUp.get('parallax');
     *     ```;
     *
     * @type {import('./animation/utils/set-up/type.js').GetSetUp}
     */
    const get = (prop) => {
        if (!(prop in data)) {
            console.warn(`handleSetUp: ${prop} is not a setup propierties`);
        }

        return data[prop];
    };

    /**
     * Perform a console.log() of the default values
     *
     * @example
     *     ```javascript
     *     handleSetUp.print();
     *     ```;
     */
    const print = () => {
        /**
         * Writable props This prop can be changed by the user using set methods
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
