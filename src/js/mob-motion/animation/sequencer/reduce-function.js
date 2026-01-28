export const propToSet = {
    fromValue: {
        get: 'toValue',
        set: 'fromValue',
    },
    toValue: {
        get: 'toValue',
        set: 'toValue',
    },
};

/**
 * @param {import('./type').SequencerRow[]} arr
 * @param {number} index
 * @param {string} prop
 * @param {import('./type').PropToFindPartial} propToFind
 * @returns {number | undefined}
 */
export const getFirstValidValueBack = (arr, index, prop, propToFind) => {
    return arr
        .slice(0, index)
        .reduceRight((previous, { values: valuesForward }) => {
            /**
             * Find active prop if exist
             *
             * @type {Record<string, any> | undefined}
             */
            const result = valuesForward.find(
                ({ prop: propToCompare, active }) => {
                    return active && propToCompare === prop;
                }
            );

            /**
             * Return only first valid value then skip the successive we return the value only when the accumulatore is
             * null, so the first time we fond a value
             */
            return result && !previous && previous !== 0
                ? result[propToSet[propToFind].get]
                : previous;

            // eslint-disable-next-line unicorn/no-useless-undefined
        }, undefined);
};

/**
 * @param {import('./type').SequencerRow[]} arr
 * @param {number} index
 * @param {string} prop
 * @param {number} partial
 * @returns {boolean}
 */
export const checkIsLastUsableProp = (arr, index, prop, partial) => {
    for (let i = index + 1; i < arr.length; i++) {
        const { start, values } = arr[i];

        for (const nextItem of values) {
            if (nextItem.prop === prop && nextItem.active && start <= partial) {
                return false;
            }
        }
    }

    return true;
};
