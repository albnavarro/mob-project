import { springPresetConfig } from './animation/spring/springConfig.js';
import { mergeDeep } from './utils/mergeDeep.js';
export const MQ_MIN = 'min';
export const MQ_MAX = 'max';

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
            defaultSpringConfig: 'default',
            defaultLerpConfig: 0.06,
            markerColor: {
                startEnd: '#ff0000',
                item: '#14df3b',
            },
        },
        parallax: {
            defaultRange: 8,
            defaultSpringConfig: 'default',
            defaultLerpConfig: 0.06,
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

    const set = (obj) => {
        data = mergeDeep(data, obj);
    };

    const get = (prop) => {
        if (prop in data) {
            return data[prop];
        } else {
            console.warn(`handleSetUp: ${prop} is not a setup propierties`);
        }
    };

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
