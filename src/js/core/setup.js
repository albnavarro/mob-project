import { mergeDeep } from './utils/mergeDeep.js';

export const handleSetUp = (() => {
    let data = {
        fpsThreshold: 15,
        deferredNextTick: true,
        mq: {
            xSmall: 320,
            small: 360,
            medium: 600,
            tablet: 768,
            desktop: 992,
            large: 1200,
            xLarge: 1400,
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

    return {
        set,
        get,
    };
})();
