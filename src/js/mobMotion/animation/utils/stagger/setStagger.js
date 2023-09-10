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
import { staggerColRowWarning } from '../warning.js';
import { mobCore } from '../../../../mobCore/index.js';

export const setStagger = ({
    arr,
    endArr,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    const result = (() => {
        if (stagger?.grid?.direction === DIRECTION_RADIAL) {
            /**
             * Check if from is an Object
             **/
            if (!mobCore.checkType(Object, stagger?.from)) {
                stagger.from = {};
            }

            /**
             * Check x value if is not setted use 0 as default
             */
            if (!mobCore.checkType(Number, stagger?.from?.x)) {
                stagger.from = { ...stagger.from, x: 0 };
            }

            /**
             * Check y value if is not setted use 0 as default
             */
            if (!mobCore.checkType(Number, stagger?.from?.y)) {
                stagger.from = { ...stagger.from, y: 0 };
            }

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
             * If not set default start value
             * **/
            const fromList = [
                STAGGER_START,
                STAGGER_END,
                STAGGER_CENTER,
                STAGGER_EDGES,
                STAGGER_RANDOM,
            ];

            if (
                (!mobCore.checkType(String, stagger?.from) &&
                    !mobCore.checkType(Number, stagger?.from)) ||
                (mobCore.checkType(String, stagger?.from) &&
                    !fromList.includes(stagger?.from))
            ) {
                staggerColRowWarning();
                stagger.from = STAGGER_START;
            }

            /**
             * DEFAULT STAGGER
             **/
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
