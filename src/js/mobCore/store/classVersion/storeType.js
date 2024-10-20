// @ts-check

/**
 * @type {string}
 */
export const TYPE_IS_ANY = 'ANY';

/**
 * @type {string}
 */
export const UNTYPED = 'UNTYPED';

/**
 * @type {string}
 */
const STRING = 'STRING';

/**
 * @type {string}
 */
const NUMBER = 'NUMBER';

/**
 * @type {string}
 */
const OBJECT = 'OBJECT';

/**
 * @type {string}
 */
const FUNCTION = 'FUNCTION';

/**
 * @type {string}
 */
export const ARRAY = 'ARRAY';

/**
 * @type {string}
 */
const BOOLEAN = 'BOOLEAN';

/**
 * @type {string}
 */
const ELEMENT = 'ELEMENT';

/**
 * @type {string}
 */
const HTMLELEMENT = 'HTMLELEMENT';

/**
 * @type {string}
 */
const NODELIST = 'NODELIST';

/**
 * @type {string}
 */
export const SET = 'SET';

/**
 * @type {string}
 */
export const MAP = 'MAP';

export const storeType = {
    isString: (/** @type{any} */ value) =>
        Object.prototype.toString.call(value) === '[object String]',
    isNumber: (/** @type{any} */ value) =>
        Object.prototype.toString.call(value) === '[object Number]' &&
        Number.isFinite(value),
    isObject: (/** @type{any} */ value) =>
        Object.prototype.toString.call(value) === '[object Object]',
    isFunction: (/** @type{any} */ value) =>
        Object.prototype.toString.call(value) === '[object Function]',
    isArray: (/** @type{any} */ value) =>
        Object.prototype.toString.call(value) === '[object Array]',
    isBoolean: (/** @type{any} */ value) =>
        Object.prototype.toString.call(value) === '[object Boolean]',
    isElement: (/** @type{any} */ value) =>
        value instanceof Element || value instanceof Document,
    isHTMLElement: (/** @type{any} */ value) => value instanceof HTMLElement,
    isSet: (/** @type{any} */ value) => value instanceof Set,
    isMap: (/** @type{any} */ value) => value instanceof Map,
    isNodeList: (/** @type{any} */ value) =>
        Object.prototype.isPrototypeOf.call(NodeList.prototype, value),
};

/**
 * @param {any} type
 * @returns {string}
 */
export const getTypeName = (type) => {
    switch (type) {
        case String:
        case STRING: {
            return 'String';
        }

        case Number:
        case NUMBER: {
            return 'Number';
        }

        case Object:
        case OBJECT: {
            return 'Object';
        }

        case Function:
        case FUNCTION: {
            return 'Function';
        }

        case Array:
        case ARRAY: {
            return 'Array';
        }

        case Boolean:
        case BOOLEAN: {
            return 'Boolean';
        }

        case Element:
        case ELEMENT: {
            return 'Element';
        }

        case HTMLElement:
        case HTMLELEMENT: {
            return 'HTMLElement';
        }

        case NodeList:
        case NODELIST: {
            return 'NodeList';
        }

        case Set:
        case SET: {
            return 'Set';
        }

        case Map:
        case MAP: {
            return 'Map';
        }

        case TYPE_IS_ANY: {
            return TYPE_IS_ANY;
        }

        default: {
            return UNTYPED;
        }
    }
};

/**
 * @param {any} type
 * @param {any} value
 * @returns {boolean}
 */
export const checkType = (type, value) => {
    switch (type) {
        case String:
        case STRING: {
            return storeType.isString(value);
        }

        case Number:
        case NUMBER: {
            return storeType.isNumber(value);
        }

        case Object:
        case OBJECT: {
            return storeType.isObject(value);
        }

        case Function:
        case FUNCTION: {
            return storeType.isFunction(value);
        }

        case Array:
        case ARRAY: {
            return storeType.isArray(value);
        }

        case Boolean:
        case BOOLEAN: {
            return storeType.isBoolean(value);
        }

        case Element:
        case ELEMENT: {
            return storeType.isElement(value);
        }

        case HTMLElement:
        case HTMLELEMENT: {
            return storeType.isHTMLElement(value);
        }

        case NodeList:
        case NODELIST: {
            return storeType.isNodeList(value);
        }

        case Set:
        case SET: {
            return storeType.isSet(value);
        }

        case Map:
        case MAP: {
            return storeType.isMap(value);
        }

        case TYPE_IS_ANY: {
            return true;
        }

        default: {
            return true;
        }
    }
};
