// @ts-check

import { MobCore } from '../../../mob-core';

/**
 * Fire mean request animation frame function. In case the is some function add form timeline fire pauseFUnction.
 *
 * @param {{ cb: () => boolean }[]} callbackPauseArray
 * @param {(time: number, fps: number) => void} rafFunction
 * @param {() => void} pauseFunction
 * @returns {void}
 */
export const initRaf = (callbackPauseArray, rafFunction, pauseFunction) => {
    MobCore.useFrame(() => {
        MobCore.useNextTick(({ time, fps }) => {
            const prevent = callbackPauseArray
                .map(({ cb }) => cb())
                .includes(true);

            rafFunction(time, fps);
            if (prevent) pauseFunction();
        });
    });
};
