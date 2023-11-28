// @ts-check

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

/**
 * @param {object} obj
 * @param {Array} obj.arr
 * @param {Array} obj.endArr
 * @param {import('./type.js').staggerObject} obj.stagger
 * @param {import('./type.js').staggerDefaultIndex} obj.slowlestStagger
 * @param {import('./type.js').staggerDefaultIndex} obj.fastestStagger
 *
 * @returns {{staggerArray:Array,staggerArrayOnComplete:Array, fastestStagger:import('./type.js').staggerDefaultIndex, slowlestStagger:import('./type.js').staggerDefaultIndex}}
 */
const getRadial = ({
    arr,
    stagger,
    slowlestStagger,
    fastestStagger,
    endArr,
}) => {
    /**
     * Check if from is an Object
     **/
    if (!mobCore.checkType(Object, stagger?.from)) {
        // @ts-ignore
        stagger.from = {};
    }

    /**
     * Check x value if is not set use 0 as default
     */
    // @ts-ignore
    if (!mobCore.checkType(Number, stagger?.from?.x)) {
        // @ts-ignore
        stagger.from = { ...stagger.from, x: 0 };
    }

    /**
     * Check y value if is not set use 0 as default
     */
    // @ts-ignore
    if (!mobCore.checkType(Number, stagger?.from?.y)) {
        // @ts-ignore
        stagger.from = { ...stagger.from, y: 0 };
    }

    const { cleanArray: cleanCb } = getRadialArray(arr, stagger);

    // Get stagger index the minumn and the fastest and the slowest
    let counter = 0;
    cleanCb.forEach(
        (
            /** @type{Array<import('./type.js').setStagger>} */ chunk,
            /** @type{number} */ i
        ) => {
            chunk.forEach((item) => {
                /*
                 * Get stagger each by fps
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
        }
    );

    // Get on Complete Callback
    /**
     * @type {Array<Array<import('./type.js').setStagger>>}
     */
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
    staggerArray.forEach(
        (
            /** @type{import('./type.js').setStagger} */ item,
            /** @type{number} */ i
        ) => {
            // If there an OnCompelte callback
            if (endstaggerArray.length > 0) {
                endstaggerArray[i].index = item.index;
                endstaggerArray[i].frame = item.frame;
            }
        }
    );

    return {
        staggerArray,
        staggerArrayOnComplete: endstaggerArray,
        fastestStagger,
        slowlestStagger,
    };
};

/**
 * @param {object} obj
 * @param {Array} obj.arr
 * @param {Array} obj.endArr
 * @param {import('./type.js').staggerObject} obj.stagger
 * @param {import('./type.js').staggerDefaultIndex} obj.slowlestStagger
 * @param {import('./type.js').staggerDefaultIndex} obj.fastestStagger
 *
 * @returns {{staggerArray:Array,staggerArrayOnComplete:Array, fastestStagger:import('./type.js').staggerDefaultIndex, slowlestStagger:import('./type.js').staggerDefaultIndex}}
 */
const getDefault = ({
    arr,
    endArr,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
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
            // @ts-ignore
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
};

/**
 * @param {object} obj
 * @param {Array} obj.arr
 * @param {Array} obj.endArr
 * @param {import('./type.js').staggerObject} obj.stagger
 * @param {import('./type.js').staggerDefaultIndex} obj.slowlestStagger
 * @param {import('./type.js').staggerDefaultIndex} obj.fastestStagger
 *
 * @returns {{staggerArray:Array,staggerArrayOnComplete:Array, fastestStagger:import('./type.js').staggerDefaultIndex, slowlestStagger:import('./type.js').staggerDefaultIndex}}
 */
export const setStagger = ({
    arr,
    endArr,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    const result =
        stagger?.grid?.direction === DIRECTION_RADIAL
            ? getRadial({
                  arr,
                  endArr,
                  stagger,
                  slowlestStagger,
                  fastestStagger,
              })
            : getDefault({
                  arr,
                  endArr,
                  stagger,
                  slowlestStagger,
                  fastestStagger,
              });

    const staggerArray = result.staggerArray;
    const staggerArrayOnComplete = result.staggerArrayOnComplete;
    const fastestStaggerUpdated = result.fastestStagger;
    const slowlestStaggerUpdated = result.slowlestStagger;

    return {
        staggerArray,
        staggerArrayOnComplete,
        fastestStagger: fastestStaggerUpdated,
        slowlestStagger: slowlestStaggerUpdated,
    };
};
