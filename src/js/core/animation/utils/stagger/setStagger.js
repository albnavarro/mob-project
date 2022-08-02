import { getDefaultStagger } from './getDefaultStagger.js';
import { getRadialArray } from './getRadialStagger.js';
import {
    DIRECTION_RADIAL,
    STAGGER_START,
    STAGGER_END,
    STAGGER_CENTER,
    STAGGER_EDGES,
    STAGGER_RANDOM,
} from './staggerCostant.js';
import { getEachByFps } from './staggerUtils.js';
import { checkType } from '../../../store/storeType.js';

export const setStagger = ({
    cb,
    endCb,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    const result = (() => {
        // Check if direction is an object like {x: n, y: n}
        if (stagger.grid.direction === DIRECTION_RADIAL) {
            /**
             * Check if from is a valid parameters
             * **/
            if (
                !checkType(Object, stagger.from) ||
                !stagger?.from?.x ||
                !stagger?.from?.y
            ) {
                console.warn(
                    `Stagger error: in radial direction 'from' propierties must be a object {x:val,y:val}`
                );
                return {
                    cbNow: [],
                    cbCompleteNow: [],
                    fastestStagger: {},
                    slowlestStagger: {},
                };
            }

            /**
             * Check if col and row is a valid parameters
             * **/
            if (stagger?.grid?.col <= 0 || stagger?.grid?.row <= 0) {
                console.warn(
                    `Stagger error: in radial direction 'col' or 'row' is not setted`
                );
                return {
                    cbNow: [],
                    cbCompleteNow: [],
                    fastestStagger: {},
                    slowlestStagger: {},
                };
            }

            /**
             * GRID STAGGER
             * stagger: {
             *    each: 15,
             *    from: { x: 6, y: 2 },
             *    grid: { col: 9, row: 9, direction: 'radial' },
             *    waitComplete: false,
             *  },
             * **/
            const { cleanArray: cleanCb } = getRadialArray(cb, stagger);

            // Get stagger index the minumn and the fastest and the slowest
            let counter = 0;
            cleanCb.forEach((chunk, i) => {
                chunk.forEach((item) => {
                    /*
                    Get stagger each by fps
                    */
                    const eachByFps = getEachByFps(stagger.each);
                    const frame = i * eachByFps;
                    item.index = counter;
                    item.frame = frame;

                    if (frame >= slowlestStagger.frame)
                        slowlestStagger = {
                            index: counter,
                            frame,
                        };

                    if (frame <= fastestStagger.frame)
                        fastestStagger = {
                            index: counter,
                            frame,
                        };

                    counter++;
                });
            });

            // Get on Complete Callback
            const cleanEndCb = (() => {
                if (endCb.length > 0) {
                    const { cleanArray } = getRadialArray(endCb, stagger);
                    return cleanArray.flat();
                } else {
                    return [];
                }
            })();

            const cbNow = cleanCb.flat();
            const endCbNow = cleanEndCb.flat();

            // Update onComplete cb with right stagger
            cbNow.forEach((item, i) => {
                // If there an OnCompelte callack
                if (endCbNow.length > 0) {
                    endCbNow[i].index = item.index;
                    endCbNow[i].frame = item.frame;
                }
            });

            return {
                cbNow,
                cbCompleteNow: endCbNow,
                fastestStagger,
                slowlestStagger,
            };
        } else {
            /**
             * Check if from is a valid parameters
             * **/
            const fromList = [
                STAGGER_START,
                STAGGER_END,
                STAGGER_CENTER,
                STAGGER_EDGES,
                STAGGER_RANDOM,
            ];

            if (
                (!checkType(String, stagger.from) &&
                    !checkType(Number, stagger.from)) ||
                (checkType(String, stagger.from) &&
                    !fromList.includes(stagger.from))
            ) {
                console.warn(
                    `Stagger error: in col/row direction 'from' propierties must be a string start/end/center/edges or a number`
                );
                return {
                    cbNow: [],
                    cbCompleteNow: [],
                    fastestStagger: {},
                    slowlestStagger: {},
                };
            }
            /**
             * DEFAULT STAGGER
             * grid: { col: n, row: n, direction: 'row' },
             * **/
            return getDefaultStagger({
                cb,
                endCb,
                stagger,
                slowlestStagger,
                fastestStagger,
            });
        }
    })();

    const cbNow = result.cbNow;
    const cbCompleteNow = result.cbCompleteNow;
    fastestStagger = result.fastestStagger;
    slowlestStagger = result.slowlestStagger;

    return {
        cbNow,
        cbCompleteNow,
        fastestStagger,
        slowlestStagger,
    };
};
