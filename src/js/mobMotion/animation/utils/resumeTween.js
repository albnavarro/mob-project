// @ts-check

import { mobCore } from '../../../mobCore';

/**
 * @param {(time: number, fps: number,resolveFunction: (arg0: any) => void) => void} rafFunction
 * @param {(arg0: any) => void} resolveFunction
 */
export const resume = (rafFunction, resolveFunction) => {
    mobCore.useFrame(() => {
        mobCore.useNextTick(({ time, fps }) => {
            rafFunction(time, fps, resolveFunction);
        });
    });
};
