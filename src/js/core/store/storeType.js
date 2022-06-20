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

export const getTypeName = (type) => {
    switch (type) {
        case String:
            return 'String';

        case Number:
            return 'Number';

        case Object:
            return 'Object';

        case Function:
            return 'Function';

        case Array:
            return 'Array';

        case Boolean:
            return 'Boolean';

        case Element:
            return 'Element';

        case NodeList:
            return 'NodeList';

        default:
            return 'Any';
    }
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
