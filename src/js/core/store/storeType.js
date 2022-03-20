export const storeType = {
    isString: (value) =>
        Object.prototype.toString.call(value) === '[object String]',
    isNumber: (value) =>
        Object.prototype.toString.call(value) === '[object Number]' &&
        isFinite(value),
    isObject: (value) =>
        Object.prototype.toString.call(value) === '[object Object]',
    isFunction: (value) =>
        Object.prototype.toString.call(value) === '[object Function]',
    isArray: (value) =>
        Object.prototype.toString.call(value) === '[object Array]',
    isBoolean: (value) =>
        Object.prototype.toString.call(value) === '[object Boolean]',
    isElement: (value) =>
        value instanceof Element || value instanceof HTMLDocument,
    isNodeList: (value) =>
        Object.prototype.isPrototypeOf.call(NodeList.prototype, value),
};

export const checkType = (type, value) => {
    switch (type) {
        case String:
            return storeType.isString(value);

        case Number:
            return storeType.isNumber(value);

        case Object:
            return storeType.isObject(value);

        case Function:
            return storeType.isFunction(value);

        case Array:
            return storeType.isArray(value);

        case Boolean:
            return storeType.isBoolean(value);

        case Element:
            return storeType.isElement(value);

        case NodeList:
            return storeType.isNodeList(value);

        default:
            return true;
    }
};

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
            ('validate' in functionResult || 'type' in functionResult)
        ) {
            return { ...p, ...{ [key]: functionResult.value } };
        } else {
            return { ...p, ...{ [key]: value } };
        }
    }, {});
};

/**
 * Get Validation function Object
 * If use a function with validation check if there is a function that return an object like;
 * key: () => ({
 *   value: 0,
 *   validate: (val) => ....,
 * }),
 * If there isn't a validate function add (val) => true ( always true )
 */
export const getValidateRecursive = (data) => {
    return Object.entries(data).reduce((p, c) => {
        const [key, value] = c;
        const functionResult = storeType.isFunction(value) ? value() : {};

        if (storeType.isObject(value)) {
            // Recursive function if find an Object
            return { ...p, ...{ [key]: getValidateRecursive(value) } };
        } else if (
            storeType.isFunction(value) &&
            storeType.isObject(functionResult) &&
            'value' in functionResult &&
            'validate' in functionResult
        ) {
            return { ...p, ...{ [key]: functionResult.validate } };
        } else {
            return { ...p, ...{ [key]: (val) => true } };
        }
    }, {});
};

export const getTypeRecursive = (data) => {
    return Object.entries(data).reduce((p, c) => {
        const [key, value] = c;
        const functionResult = storeType.isFunction(value) ? value() : {};

        if (storeType.isObject(value)) {
            // Recursive function if find an Object
            return { ...p, ...{ [key]: getTypeRecursive(value) } };
        } else if (
            storeType.isFunction(value) &&
            storeType.isObject(functionResult) &&
            'value' in functionResult &&
            'type' in functionResult
        ) {
            return { ...p, ...{ [key]: functionResult.type } };
        } else {
            return { ...p, ...{ [key]: 'any' } };
        }
    }, {});
};
