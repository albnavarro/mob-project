// @ts-check

import { MobCore } from '../../../mob-core';

/**
 * @param {(time: number, fps: number, resolveFunction: (arg0: any) => void) => void} rafFunction
 * @param {(arg0: any) => void} resolveFunction
 */
export const resume = (rafFunction, resolveFunction) => {
    MobCore.useFrame(() => {
        MobCore.useNextTick(({ time, fps }) => {
            rafFunction(time, fps, resolveFunction);
        });
    });
};
