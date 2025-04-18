// @ts-check

import { getDefaultStagger } from './get-default-stagger.js';
import { getRadialArray } from './get-radial-stagger.js';
import {
    DIRECTION_RADIAL,
    STAGGER_START,
    STAGGER_END,
    STAGGER_CENTER,
    STAGGER_EDGES,
    STAGGER_RANDOM,
} from './stagger-costant.js';
import { getEachByFps } from './stagger-utils.js';
import { staggerColRowWarning } from '../warning.js';
import { MobCore } from '../../../../mob-core/index.js';

/**
 * @type {import('./type.js').SetStagger}
 */
const getRadial = ({
    arrayDefault,
    arrayOnStop,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    /**
     * Check if from is an Object
     */
    if (!MobCore.checkType(Object, stagger?.from)) {
        // @ts-ignore
        stagger.from = {};
    }

    /**
     * Check x value if is not set use 0 as default
     */
    // @ts-ignore
    if (!MobCore.checkType(Number, stagger?.from?.x)) {
        // @ts-ignore
        stagger.from = { ...stagger.from, x: 0 };
    }

    /**
     * Check y value if is not set use 0 as default
     */
    // @ts-ignore
    if (!MobCore.checkType(Number, stagger?.from?.y)) {
        // @ts-ignore
        stagger.from = { ...stagger.from, y: 0 };
    }

    const { cleanArray: cleanCb } = getRadialArray(arrayDefault, stagger);

    // Get stagger index the minumn and the fastest and the slowest
    let counter = 0;
    cleanCb.forEach((chunk, i) => {
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
    });

    // Get on Complete Callback
    const cleanEndCb = (() => {
        if (arrayOnStop.length > 0) {
            const { cleanArray } = getRadialArray(arrayOnStop, stagger);
            return cleanArray.flat();
        } else {
            return [];
        }
    })();

    const staggerArray = cleanCb.flat();
    const endstaggerArray = cleanEndCb.flat();

    // Update onComplete cb with right stagger
    staggerArray.forEach((item, i) => {
        // If there an OnCompelte callback
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
};

/**
 * @type {import('./type.js').SetStagger}
 */
const getDefault = ({
    arrayDefault,
    arrayOnStop,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    /**
     * Check if from is a valid parameters If not set default start value *
     */
    const fromList = [
        STAGGER_START,
        STAGGER_END,
        STAGGER_CENTER,
        STAGGER_EDGES,
        STAGGER_RANDOM,
    ];

    if (
        (!MobCore.checkType(String, stagger?.from) &&
            !MobCore.checkType(Number, stagger?.from)) ||
        (MobCore.checkType(String, stagger?.from) &&
            // @ts-ignore
            !fromList.includes(stagger?.from))
    ) {
        staggerColRowWarning();
        stagger.from = STAGGER_START;
    }

    /**
     * DEFAULT STAGGER
     */
    return getDefaultStagger({
        arrayDefault,
        arrayOnStop,
        stagger,
        slowlestStagger,
        fastestStagger,
    });
};

/**
 * @type {import('./type.js').SetStagger}
 */
export const setStagger = ({
    arrayDefault,
    arrayOnStop,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    const result =
        stagger?.grid?.direction === DIRECTION_RADIAL
            ? getRadial({
                  arrayDefault,
                  arrayOnStop,
                  stagger,
                  slowlestStagger,
                  fastestStagger,
              })
            : getDefault({
                  arrayDefault,
                  arrayOnStop,
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
