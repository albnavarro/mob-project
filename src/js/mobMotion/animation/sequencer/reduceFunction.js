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

export const getFirstValidValueBack = (arr, i, prop, propToFind) => {
    return arr.slice(0, i).reduceRight((p, { values: valuesForward }) => {
        // Find active prop if exist
        const result = valuesForward.find(({ prop: propToCompare, active }) => {
            return active && propToCompare === prop;
        });

        // Return only first valid value then skip the successive
        // we return the value only when the accumulatore is null, so the first time we fond a value
        return result && p === null ? result[propToSet[propToFind].get] : p;
    }, null);
};

export const checkIsLastUsableProp = (arr, i, prop, partial) => {
    return arr.slice(i + 1, arr.length).reduce((p, { start, values }) => {
        const nextActiveItem = values.find((nextItem) => {
            return nextItem.prop === prop && nextItem.active;
        });
        return nextActiveItem && start <= partial ? false : p;
    }, true);
};
