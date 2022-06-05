import { compareKeys } from './animation/utils/animationUtils.js';

export const handleSetUp = (() => {
    let data = {
        fpsLoopCycle: 60,
        fpsThreshold: 15,
        deferredNextTick: true,
    };

    const set = (obj) => {
        const dataIsValid = compareKeys(data, obj);

        if (dataIsValid) {
            data = { ...data, ...obj };
        } else {
            console.warn(
                `handleSetUp: ${JSON.stringify(data)} and to ${JSON.stringify(
                    obj
                )} is not equal`
            );
        }
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
