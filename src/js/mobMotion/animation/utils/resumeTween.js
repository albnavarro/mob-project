// @ts-check

import { mobCore } from '../../../mobCore';

/**
 * @param {function} rafFunction
 * @param {function} resolveFunction
 */
export const resume = (rafFunction, resolveFunction) => {
    mobCore.useFrame(() => {
        mobCore.useNextTick(({ time, fps }) => {
            rafFunction(time, fps, resolveFunction);
        });
    });
};
