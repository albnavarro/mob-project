// @ts-check

/**
 * @type{Object}
 */
export const propToSet = {
    fromValue: {
        get: 'toValue',
        set: 'fromValue',
    },
    toValue: {
        get: 'fromValue',
        set: 'toValue',
    },
};

/**
 * @param {import("./type").sequencerRow[]} arr
 * @param {number} index
 * @param {string} prop
 * @param {string} propToFind
 *
 * @returns {import("./type").sequencerRow[]|null}
 */
export const getFirstValidValueBack = (arr, index, prop, propToFind) => {
    return arr.slice(0, index).reduceRight((p, { values: valuesForward }) => {
        /**
         * Find active prop if exist
         */
        const result = valuesForward.find(({ prop: propToCompare, active }) => {
            return active && propToCompare === prop;
        });

        /**
         * Return only first valid value then skip the successive
         * we return the value only when the accumulatore is null, so the first time we fond a value
         */
        return result && p === null ? result[propToSet[propToFind].get] : p;
    }, null);
};

/**
 * @param {import("./type").sequencerRow[]} arr
 * @param {number} index
 * @param {string} prop
 * @param {number} partial
 *
 * @returns {boolean}
 */
export const checkIsLastUsableProp = (arr, index, prop, partial) => {
    return arr.slice(index + 1, arr.length).reduce((p, { start, values }) => {
        const nextActiveItem = values.find((nextItem) => {
            return nextItem.prop === prop && nextItem.active;
        });

        return nextActiveItem && start <= partial ? false : p;
    }, true);
};
