import { MobCore } from '../../../mob-core';

/**
 * @param {(time: number, fps: number) => void} rafFunction
 * @returns {void}
 */
export const resume = (rafFunction) => {
    MobCore.useFrame(() => {
        MobCore.useNextTick(({ time, fps }) => {
            rafFunction(time, fps);
        });
    });
};
