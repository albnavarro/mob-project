// @ts-check

import { getRoundedValue } from '../utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    STAGGER_TYPE_START,
    STAGGER_TYPE_END,
    STAGGER_TYPE_CENTER,
    STAGGER_TYPE_EQUAL,
    STAGGER_DEFAULT_INDEX_OBJ,
} from '../utils/stagger/staggerCostant.js';
import {
    createStaggerEachWarning,
    createStaggerItemsTypeWarning,
    staggerIsOutOfRangeWarning,
} from '../utils/warning.js';
import {
    durationIsValid,
    staggerItemsIsValid,
    validateStaggerItems,
} from '../utils/tweenAction/tweenValidation.js';
import { getStaggerFromProps } from '../utils/stagger/staggerUtils.js';
import { mobCore } from '../../../mobCore/index.js';

/**
 * @param {object} obj
 * @param {number} obj.each
 * @param {number} obj.duration
 * @param {number} obj.numItem
 * @param {number} obj.index
 * @param {number} obj.eachByNumItem
 *
 * @returns {{start:number, end:number}}
 */
const getStaggerEqual = ({ each, duration, numItem, index, eachByNumItem }) => {
    if (each === 1) {
        const stepDuration = duration / numItem;
        const start = getRoundedValue(index * stepDuration);
        const end = getRoundedValue(start + stepDuration);
        return { start, end };
    }

    const unit = duration / numItem;
    const staggerDuration = unit * eachByNumItem;
    const remainSpace = duration - staggerDuration;

    // Avoid division with 0
    const validNumItem = numItem - 1 > 0 ? numItem - 1 : 1;
    const remainSpaceUnit = remainSpace / validNumItem;
    const staggerStart = remainSpaceUnit * index;

    return {
        start: getRoundedValue(staggerStart),
        end: getRoundedValue(staggerDuration + staggerStart),
    };
};

/**
 * @param {object} obj
 * @param {number} obj.duration
 * @param {number} obj.numItem
 * @param {number} obj.index
 * @param {number} obj.eachByNumItem
 * @param {string} obj.type
 *
 * @returns {{start:number, end:number}}
 */
const getStaggerSpecial = ({
    duration,
    numItem,
    index,
    eachByNumItem,
    type,
}) => {
    const unit = duration / numItem;
    const cleanStart = unit * index;
    const noopSpace = duration - (duration - cleanStart);
    const gap = (noopSpace / numItem) * eachByNumItem;

    if (type === STAGGER_TYPE_START) {
        return {
            start: 0,
            end: getRoundedValue(duration - (cleanStart - gap)),
        };
    }

    if (type === STAGGER_TYPE_CENTER) {
        const space = (cleanStart - gap) / 2;
        return {
            start: getRoundedValue(space),
            end: getRoundedValue(duration - space),
        };
    }

    if (type === STAGGER_TYPE_END) {
        return {
            start: getRoundedValue(cleanStart - gap),
            end: getRoundedValue(duration),
        };
    }

    /**
     * Fallback
     */
    return {
        start: 0,
        end: duration,
    };
};

/**
 * @param { import('./type.js').createSequencerType & import('../utils/stagger/type.js').staggerPropiertiesObject } data
 * @returns {import('./type.js').createStagger[]} Stagger array
 *
 * @example
 * ```javascript
 *
 *
 * const staggers = createStagger({
 *     items: Array.<Element|Object>,
 *     stagger: {
 *         stagger.type: [ String ],
 *         from: [ Number|String|{x:number,y:number} ],
 *         grid: {
 *             col: [ Number ],
 *             row: [ Number ],
 *             direction: [ String ]
 *         },
 *     },
 *     duration: [ Number ],
 * });
 *
 *
 * staggers.forEach(({ item, start, end, index }) => {
 *     const sequencer = mobbu
 *         .createSequencer({ ... })
 *         .goTo({ ... }, { start, end ...});
 *     sequencer.subscribe(({ ... }) => { ... });
 *     masterSequencer.add(sequencer);
 * });
 *
 * ```
 *
 * @description
 *
 * ```
 */
export const createStaggers = (data) => {
    const items = staggerItemsIsValid(data?.items);
    const stagger = getStaggerFromProps(data);
    const duration = durationIsValid(data?.duration);
    const eachProportion = 10;

    /**
     * In createStagger each must be > 0
     */
    let each = stagger?.each || 1;

    /*
     * Re-checking the array of items to be able to return a fallback
     */
    const fallBack = [...items].map((item, i) => {
        return {
            item,
            start: 0,
            end: duration,
            index: i,
        };
    });

    /**
     * Check of array length is > 0
     * Recheck the items array after inizializtion to return fallback
     */
    if (!validateStaggerItems(items)) {
        return fallBack;
    }

    /**
     * Secure check
     **/
    if (stagger.grid?.col > items.length) {
        staggerIsOutOfRangeWarning(items.length);
        each = 1;
    }

    /**
     * In classic mode each must be between 1 and eachProportion
     */
    if (
        mobCore.checkType(Number, each) &&
        (each > eachProportion || each < 1)
    ) {
        createStaggerEachWarning(eachProportion);
        each = 1;
    }

    /**
     * Create stagger Array
     */
    const { staggerArray } = setStagger({
        arr: [...items].map((item) => ({ item })),
        endArr: [],
        stagger: stagger,
        slowlestStagger: STAGGER_DEFAULT_INDEX_OBJ,
        fastestStagger: STAGGER_DEFAULT_INDEX_OBJ,
    });

    /**
     * Remove element with no dom item ,is possible with row and item fantasiose
     * In tween there is no problem beciuse use NOOP callback
     * Accept only dom element and object
     * */
    const staggerArrayFiltered = staggerArray.filter(
        ({ item }) =>
            mobCore.checkType(Element, item) || mobCore.checkType(Object, item)
    );

    if (staggerArrayFiltered.length === 0) {
        createStaggerItemsTypeWarning();
        return fallBack;
    }

    /*
     * Get the 'Chunk' number
     * 1 - Create an array with all the frame es: [1,1,2,2,2,3,3,3]
     * 2 - Remove the duplicate frame es; [1,2,3]
     * 3 - The length of resulted array is the number of 'chunck' es: 3
     */
    const frameArray = staggerArrayFiltered.map(({ frame }) => frame);
    const frameSet = [...new Set(frameArray)].sort((a, b) => a - b);
    const numItem = frameSet.length;

    /*
     * Final Array
     */
    const staggers = staggerArrayFiltered.map(({ item, frame }) => {
        const index = frameSet.indexOf(frame);
        const eachByNumItem = (each * numItem) / eachProportion;

        const { start, end } = (() => {
            if (stagger.type === STAGGER_TYPE_EQUAL) {
                return getStaggerEqual({
                    each,
                    duration,
                    numItem,
                    index,
                    eachByNumItem,
                });
            }

            if (
                stagger.type === STAGGER_TYPE_START ||
                stagger.type === STAGGER_TYPE_END ||
                stagger.type === STAGGER_TYPE_CENTER
            ) {
                return getStaggerSpecial({
                    duration,
                    numItem,
                    index,
                    eachByNumItem,
                    type: stagger.type,
                });
            }

            /**
             * Fallback
             */
            return {
                start: 0,
                end: duration,
            };
        })();

        return {
            item,
            start,
            end,
            index,
        };
    });

    return staggers;
};
