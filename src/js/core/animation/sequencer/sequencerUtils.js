import { getRoundedValue } from '../utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    STAGGER_DEFAULT_OBJ,
    STAGGER_TYPE_START,
    STAGGER_TYPE_END,
    STAGGER_TYPE_CENTER,
    STAGGER_TYPE_EQUAL,
} from '../utils/stagger/staggerCostant.js';
import { handleSetUp } from '../../setup.js';
import { checkType } from '../../store/storeType.js';
import {
    createStaggerEachWarning,
    createStaggerItemsTypeWarning,
    createStaggerTypeWarning,
    staggerIsOutOfRangeWarning,
} from '../utils/warning.js';
import {
    createStaggerItemsIsValid,
    createStaggerTypeIsValid,
} from '../utils/tweenValidation.js';

/**
 * @typedef {Object} createSequencerTypes
 * @prop {[Element,Object]} items Generally an array of HTMLelements but it is possible to use an array of objects as well @prop {number} [ duration=10] Defines the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed. The default value is 10
 **/

/**
 * @param { createSequencerTypes & import('../utils/stagger/staggerCostant.js').staggerTypes } data
 * @returns {Array<{ start: Number, end: Number,index: Number, item: (HTMLElement|Object) }>} labels array
 *
 * @example
 * ```js
 *
 *
 * const staggers = createStagger({
 *     items: [ Array ],
 *     stagger: {
 *         type: [ String ],
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
export const createStaggers = ({
    items = [],
    stagger = {},
    duration = handleSetUp.get('sequencer').duration,
}) => {
    const eachProportion = 10;
    const staggerNow = { ...STAGGER_DEFAULT_OBJ, ...stagger };
    const type = staggerNow.type;

    /**
     * In createStagger each must be > 0
     */
    let each = staggerNow?.each || 1;

    /*
     * Fallback is something goes wron
     */
    const fallBack = [...items].map((item, i) => {
        return {
            item,
            start: 0,
            end: duration,
            index: i,
        };
    });

    if (!createStaggerItemsIsValid(items)) {
        return fallBack;
    }

    /**
     * Secure check
     **/
    if (staggerNow.grid?.col > items.length) {
        staggerIsOutOfRangeWarning(items.length);
        each = 1;
    }

    /**
     * Check type prop
     */
    if (!createStaggerTypeIsValid(type)) {
        createStaggerTypeWarning();
        return fallBack;
    }

    /**
     * In classic mode each must be between 1 and eachProportion
     */
    if (checkType(Number, each) && (each > eachProportion || each < 1)) {
        createStaggerEachWarning(eachProportion);
        each = 1;
    }

    /**
     * Create stagger Array
     */
    const { staggerArray } = setStagger({
        arr: [...items].map((item) => ({ item })),
        endArr: [],
        stagger: staggerNow,
        slowlestStagger: {},
        fastestStagger: {},
    });

    /**
     * Remove element with no dom item ,is possible with row and item fantasiose
     * In tween there is no problem beciuse use NOOP callback
     * Accpt only dom element and object
     * */
    const staggerArrayFiltered = staggerArray.filter(
        ({ item }) => checkType(Element, item) || checkType(Object, item)
    );

    if (staggerArrayFiltered.length === 0) {
        createStaggerItemsTypeWarning();
        return fallBack;
    }

    /*
     * Get the 'Chunk' number
     * 1 - Create an arry with all the frame es: [1,1,2,2,2,3,3,3]
     * 2 - Remove the duplicate frame es; [1,2,3]
     * 3 - The lenght of resulted array is the number of 'chunck' es: 3
     */
    const frameArray = staggerArrayFiltered.map(({ frame }) => frame);
    const frameSet = [...new Set(frameArray)].sort((a, b) => a - b);
    const numItem = frameSet.length;

    /*
     * Final Array
     */
    const staggers = staggerArrayFiltered.map(({ item, frame }) => {
        const index = frameSet.findIndex((item) => item === frame);
        const eachByNumItem = (each * numItem) / eachProportion;

        const { start, end } = (() => {
            if (type === STAGGER_TYPE_EQUAL) {
                if (each === 1) {
                    const stepDuration = duration / numItem;
                    const start = getRoundedValue(index * stepDuration);
                    const end = getRoundedValue(start + stepDuration);
                    return { start, end };
                } else {
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
                }
            }

            if (
                type === STAGGER_TYPE_START ||
                type === STAGGER_TYPE_END ||
                type === STAGGER_TYPE_CENTER
            ) {
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
            }
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
