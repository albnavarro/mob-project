import { springPresetConfig } from './animation/spring/springConfig.js';
import { mergeDeep } from './utils/mergeDeep.js';

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
        sequencer: {
            duration: 10,
            ease: 'easeLinear',
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
