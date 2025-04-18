/* eslint-disable unicorn/no-this-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */

import { getTime } from './raf-utils/time';

/**
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
export const throttle = (func, limit) => {
    /** @type {any} */
    let lastFunc;

    /** @type {any} */
    let lastRan;

    return function () {
        // @ts-ignore
        const context = this;
        const args = arguments;

        if (lastRan) {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(
                function () {
                    if (getTime() - lastRan >= limit) {
                        func.apply(context, args);
                        lastRan = getTime();
                    }
                },
                limit - (getTime() - lastRan)
            );
        } else {
            func.apply(context, args);
            lastRan = getTime();
        }
    };
};
