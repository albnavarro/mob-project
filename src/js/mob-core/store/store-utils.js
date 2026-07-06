import { STORE_VALUE_KEY } from './constant.js';
import { getLogStyle } from './log-style.js';
import { getStateFromMainMap } from './store-map.js';
import { checkType, storeType } from './store-type.js';
import {
    storeComputedPropUsedWarning,
    storeDepthWarning,
} from './store-warining.js';

/**
 * Get depth of Object
 *
 * @param {Object} object
 * @returns {number}
 */
export const maxDepth = (object) => {
    if (!storeType.isObject(object)) return 0;
    const values = Object.values(object);

    if (values.length === 0) return 1;

    return Math.max(...values.map((value) => maxDepth(value))) + 1;
};

/**
 * @param {any} data
 */
const isComplexState = (data) => {
    const isObject = storeType.isObject(data);
    return isObject && Object.hasOwn(data, STORE_VALUE_KEY);
};

/**
 * Get Main Store Object If use a function with validation check if there is a function that return an object: key: ()
 * => ({ value: 0, validate: (val) => ...., ... }),
 *
 * Returns initial props value.
 *
 * @param {import('./type.js').MobStoreParams} data
 * @param {boolean} shouldRecursive - Max 1 level of recurisivity.
 * @returns {Object<string, Object<string, any> | any>}
 */
export const getDataRecursive = (data, shouldRecursive = true) => {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
            const isComplex = isComplexState(value);

            /**
             * First level value is an object. Recursive step to parse each props of object.
             *
             * - This step set shouldRecursive to false.
             */
            if (!isComplex && storeType.isObject(value) && shouldRecursive) {
                return [key, getDataRecursive(value, false)];
            }

            /**
             * Alert too many nested obj without 'any'
             */
            if (!isComplex && storeType.isObject(value) && !shouldRecursive) {
                storeDepthWarning(3, getLogStyle());
            }

            /**
             * - Return value for specific KEY in complex state.
             */
            if (isComplex) {
                return [key, value[STORE_VALUE_KEY]];
            }

            /**
             * Simple value
             */
            return [key, value];
        })
    );
};

/**
 * Returns specific object by Prop ( validate, skipequel, etc.. )
 *
 * @param {import('./type.js').MobStoreParams} data
 * @param {string} prop
 * @param {any} fallback
 * @param {boolean} shouldRecursive - Max 1 level of recursivity
 * @returns {Object<string, Object<string, any> | any>}
 */
export const getPropRecursive = (
    data,
    prop,
    fallback,
    shouldRecursive = true
) => {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
            const isComplex = isComplexState(value);

            /**
             * First level value is an object. Recursive step to parse each props of object.
             *
             * - This step set shouldRecursive to false.
             */
            if (!isComplex && storeType.isObject(value) && shouldRecursive) {
                return [key, getPropRecursive(value, prop, fallback, false)];
            }

            /**
             * - Return value for specific KEY in complex state.
             */
            if (isComplex && Object.hasOwn(value, prop)) {
                const propParsed = storeType.isString(value[prop])
                    ? value[prop].toUpperCase()
                    : value[prop];

                return [key, propParsed];
            }

            /**
             * Simple value
             */
            return [key, fallback];
        })
    );
};

/**
 * @param {Object} obj
 * @param {import('./type.js').MobStoreParams} obj.data
 * @returns {Object<string, Object<string, any> | any>}
 */
export const inizializeStoreData = ({ data }) => {
    return getDataRecursive(data);
};

/**
 * @param {Object} obj
 * @param {import('./type.js').MobStoreParams} obj.data
 * @param {string} obj.prop
 * @param {any} obj.fallback
 * @returns {Object<string, Object<string, any> | any>}
 */
export const inizializeSpecificProp = ({ data, prop, fallback }) => {
    return getPropRecursive(data, prop, fallback);
};

/**
 * @param {Object} obj
 * @param {any} obj.value
 * @returns {any}
 */
export const cloneValueOrGet = ({ value }) => {
    if (checkType(Map, value)) {
        return new Map(value);
    }

    if (checkType(Set, value)) {
        return new Set(value);
    }

    if (checkType(Object, value)) {
        return { ...value };
    }

    if (checkType(Array, value)) {
        return [...value];
    }

    return value;
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {boolean}
 */
export const checkIfPropIsComputed = ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return false;

    const { callBackComputed } = state;

    const isComputed = [...callBackComputed].some(
        ({ prop: currentProp }) => prop === currentProp
    );

    if (isComputed) {
        storeComputedPropUsedWarning(prop, getLogStyle());
    }

    return isComputed;
};
