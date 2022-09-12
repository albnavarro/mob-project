import { getDefaultStagger } from './getDefaultStagger.js';
import { getRadialArray } from './getRadialStagger.js';
import {
    DIRECTION_RADIAL,
    DIRECTION_COL,
    DIRECTION_ROW,
    STAGGER_START,
    STAGGER_END,
    STAGGER_CENTER,
    STAGGER_EDGES,
    STAGGER_RANDOM,
} from './staggerCostant.js';
import { getEachByFps } from './staggerUtils.js';
import { checkType } from '../../../store/storeType.js';

const setStaggerErrorFallback = () => {
    return {
        cbStagger: [],
        cbCompleteStagger: [],
        fastestStagger: {},
        slowlestStagger: {},
    };
};

export const setStagger = ({
    arr,
    endArr,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    /*
     * Wait complete check type
     */
    if (!checkType(Boolean, stagger?.waitComplete)) {
        console.warn(
            'Stagger error: waitComplete propierties must be a Boolean'
        );
        return setStaggerErrorFallback();
    }

    /*
     * Direction check type
     * If grid is settled validate direction
     * in simple mode grid can be omitted and this check jumped
     */
    const directionList = [DIRECTION_RADIAL, DIRECTION_ROW, DIRECTION_COL];
    if (stagger?.grid && !directionList.includes(stagger?.grid?.direction)) {
        console.warn(
            `Stagger error: direction must be a string radial,col,row`
        );
        return setStaggerErrorFallback();
    }

    const result = (() => {
        // Check if direction is an object like {x: n, y: n}
        if (stagger?.grid?.direction === DIRECTION_RADIAL) {
            /**
             * Check if from is a valid parameters
             * Option chaing doasn't work beacouse we have a valid 0 value
             * **/
            if (
                !checkType(Number, stagger?.from?.x) ||
                !checkType(Number, stagger?.from?.y)
            ) {
                console.warn(
                    `Stagger error: in radial direction 'from' propierties must be a object {x:Number,y:Number}`
                );
                return setStaggerErrorFallback();
            }

            /**
             * Check if col and row is a valid parameters
             * **/
            if (stagger?.grid?.col <= 0 || stagger?.grid?.row <= 0) {
                console.warn(
                    `Stagger error: in radial direction 'col' or 'row' is not setted, or is minor than 1, must be a number grater than 0`
                );
                return setStaggerErrorFallback();
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
            const { cleanArray: cleanCb } = getRadialArray(arr, stagger);

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
                if (endArr.length > 0) {
                    const { cleanArray } = getRadialArray(endArr, stagger);
                    return cleanArray.flat();
                } else {
                    return [];
                }
            })();

            const cbStagger = cleanCb.flat();
            const endcbStagger = cleanEndCb.flat();

            // Update onComplete cb with right stagger
            cbStagger.forEach((item, i) => {
                // If there an OnCompelte callack
                if (endcbStagger.length > 0) {
                    endcbStagger[i].index = item.index;
                    endcbStagger[i].frame = item.frame;
                }
            });

            return {
                cbStagger,
                cbCompleteStagger: endcbStagger,
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
                (!checkType(String, stagger?.from) &&
                    !checkType(Number, stagger?.from)) ||
                (checkType(String, stagger?.from) &&
                    !fromList.includes(stagger?.from))
            ) {
                console.warn(
                    `Stagger error: in col/row direction 'from' propierties must be a string start/end/center/edges or a number`
                );
                return setStaggerErrorFallback();
            }
            /**
             * DEFAULT STAGGER
             * grid: { col: n, row: n, direction: 'row' },
             * **/
            return getDefaultStagger({
                arr,
                endArr,
                stagger,
                slowlestStagger,
                fastestStagger,
            });
        }
    })();

    const cbStagger = result.cbStagger;
    const cbCompleteStagger = result.cbCompleteStagger;
    fastestStagger = result.fastestStagger;
    slowlestStagger = result.slowlestStagger;

    return {
        cbStagger,
        cbCompleteStagger,
        fastestStagger,
        slowlestStagger,
    };
};
