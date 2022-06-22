import { getTime } from '../utils/time.js';

export const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;

    return function () {
        const context = this;
        const args = arguments;

        if (!lastRan) {
            func.apply(context, args);
            lastRan = getTime();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function () {
                if (getTime() - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = getTime();
                }
            }, limit - (getTime() - lastRan));
        }
    };
};
