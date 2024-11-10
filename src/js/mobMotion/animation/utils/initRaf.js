// @ts-check

import { mobCore } from '../../../mobCore';

/**
 * @param {{ cb: () => boolean }[]} callbackPauseArray
 * @param {(time: number, fps: number, resolve: (arg0: any) => void) => void} rafFunction
 * @param {() => void} pauseFunction
 * @param {(function(any):void)} resolve
 * @returns {void}
 *
 * @description
 * Fire mean request animation frame function.
 * In case the is some function add form timeline fire pauseFUnction.
 */
export const initRaf = (
    callbackPauseArray,
    rafFunction,
    pauseFunction,
    resolve
) => {
    mobCore.useFrame(() => {
        mobCore.useNextTick(({ time, fps }) => {
            const prevent = callbackPauseArray
                .map(({ cb }) => cb())
                .includes(true);
            rafFunction(time, fps, resolve);
            if (prevent) pauseFunction();
        });
    });
};
