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
import {
    staggerColRowWarning,
    staggerEachWarning,
    staggerGridDirectionWarning,
    staggerRadialColRowWarning,
    staggerRadialDirectionWarning,
    staggerWaitCompleteWarning,
} from '../warning.js';

const setStaggerErrorFallback = () => {
    return {
        staggerArray: [],
        staggerArrayOnComplete: [],
        fastestStagger: {},
        slowlestStagger: {},
    };
};

/**
 * @typedef {Object} staggerTypes
 * @prop {Object} [ stagger ] Stagger object
 * @prop {('equal'|'start'|'end'|'center')} [ stagger.type ] Stagger type for createStagger
 * @prop {number} [ stagger.each ] Interval between each stagger, the unit of measure is based on the single frame
 * @prop {boolean} [ stagger.waitComplete ] Determines if the promise will be resolved by the fastest or slowest stagger, if the value is true the promise will be resolved by the slowest stagger
 * @prop {('start'|'end'|'center'|'edges'|'random'|{x:number,y:number}|number)} [ stagger.from ] Determines the starting position of the stagger sequence, it can be an element of your choice (index: number), a string or an array {x, y} in case a grid is used
 * @prop {object} [ stagger.grid ] Grid object
 * @prop {Number} [ stagger.grid.col ] If a grid is used, it determines the number of columns of the grid used
 * @prop {Number} [ stagger.grid.row ] If a grid is used, it determines the number of columns of the grid used
 * @prop {('row'|'col'|'radial')} [ stagger.grid.direction ] If a grid is used, it determines the flow of the sequence, by columns, rows or radial
 **/
export const setStagger = ({
    arr,
    endArr,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    /**
     * Each must be a number
     */
    if (!checkType(Number, stagger?.each)) {
        staggerEachWarning();
        return setStaggerErrorFallback();
    }

    /*
     * Wait complete check type
     */
    if (!checkType(Boolean, stagger?.waitComplete)) {
        staggerWaitCompleteWarning();
        return setStaggerErrorFallback();
    }

    /*
     * Direction check type
     * If grid is settled validate direction
     * in simple mode grid can be omitted and this check jumped
     */
    const directionList = [DIRECTION_RADIAL, DIRECTION_ROW, DIRECTION_COL];
    if (stagger?.grid && !directionList.includes(stagger?.grid?.direction)) {
        staggerGridDirectionWarning();
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
                staggerRadialDirectionWarning();
                return setStaggerErrorFallback();
            }

            /**
             * Check if col and row is a valid parameters
             * **/
            if (stagger?.grid?.col <= 0 || stagger?.grid?.row <= 0) {
                staggerRadialColRowWarning();
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

            const staggerArray = cleanCb.flat();
            const endstaggerArray = cleanEndCb.flat();

            // Update onComplete cb with right stagger
            staggerArray.forEach((item, i) => {
                // If there an OnCompelte callack
                if (endstaggerArray.length > 0) {
                    endstaggerArray[i].index = item.index;
                    endstaggerArray[i].frame = item.frame;
                }
            });

            return {
                staggerArray,
                staggerArrayOnComplete: endstaggerArray,
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
                staggerColRowWarning();
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

    const staggerArray = result.staggerArray;
    const staggerArrayOnComplete = result.staggerArrayOnComplete;
    fastestStagger = result.fastestStagger;
    slowlestStagger = result.slowlestStagger;

    return {
        staggerArray,
        staggerArrayOnComplete,
        fastestStagger,
        slowlestStagger,
    };
};
