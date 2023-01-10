import { storeType } from './storeType.js';

// Get depth of Object
export const maxDepth = (object) => {
    if (!storeType.isObject(object)) return 0;
    const values = Object.values(object);

    return (
        (values.length && Math.max(...values.map((value) => maxDepth(value)))) +
        1
    );
};

/**
* Get Main Store Object
* If use a function with validation check if there is a function that return an object like;
* key: () => ({
*   value: 0,
*   validate: (val) => ....,
}),
*/
export const getDataRecursive = (data) => {
    return Object.entries(data).reduce((p, c) => {
        const [key, value] = c;
        const functionResult = storeType.isFunction(value) ? value() : {};

        if (storeType.isObject(value)) {
            // Recursive function if find an Object
            return { ...p, ...{ [key]: getDataRecursive(value) } };
        } else if (
            storeType.isFunction(value) &&
            storeType.isObject(functionResult) &&
            'value' in functionResult &&
            ('validate' in functionResult ||
                'type' in functionResult ||
                'skipEqual' in functionResult)
        ) {
            return { ...p, ...{ [key]: functionResult.value } };
        } else {
            return { ...p, ...{ [key]: value } };
        }
    }, {});
};

export const getPropRecursive = (data, prop, fallback) => {
    return Object.entries(data).reduce((p, c) => {
        const [key, value] = c;
        const functionResult = storeType.isFunction(value) ? value() : {};

        if (storeType.isObject(value)) {
            // Recursive function if find an Object
            return {
                ...p,
                ...{ [key]: getPropRecursive(value, prop, fallback) },
            };
        } else if (
            storeType.isFunction(value) &&
            storeType.isObject(functionResult) &&
            'value' in functionResult &&
            prop in functionResult
        ) {
            return { ...p, ...{ [key]: functionResult[prop] } };
        } else {
            return { ...p, ...{ [key]: fallback } };
        }
    }, {});
};
