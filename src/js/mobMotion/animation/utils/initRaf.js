// @ts-check

import { mobCore } from '../../../mobCore';

/**
 * @param {Array.<{cb:function,id:number,index:Number,frame:Number}>} callbackPauseArray
 * @param {Function} rafFunction
 * @param {Function} pauseFunction
 * @param {(function(any):void)} resolve
 * @returns {void}
 *
 * @description
 * Fire mian request animation frame function.
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
