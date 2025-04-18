// @ts-check

import { getTypeName } from './store-type';

/**
 * @param {number} data
 * @param {string} style
 * @returns {void}
 */
export const storeDepthWarning = (data, style) => {
    console.warn(
        `%c MobStore supports an object with a depth of up to 2 levels, set 'Any' type to use obj as value, the input object has ${data} level`,
        style
    );
};

/**
 * @param {String[]} keys
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeComputedWarning = (keys, prop, style) => {
    console.warn(
        `%c one of this key ${keys} defined in computed method of prop to monitor '${prop}' prop not exist`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeSetWarning = (prop, style) => {
    console.warn(
        `%c MobStore, trying to execute set() method: store.${prop} not exist`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} val
 * @param {string} style
 * @returns {void}
 */
export const storeSetPropValWarning = (prop, val, style) => {
    console.warn(
        `%c trying to execute setProp method on '${prop}' propierties: setProp methods doesn't allow objects as value, ${JSON.stringify(
            val
        )} is an Object, use 'Any' type for custom object`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeSetPropPropWarning = (prop, style) => {
    console.warn(
        `%c trying to execute setProp method on '${prop}' propierties: '${JSON.stringify(
            prop
        )}' is an objects`,
        style
    );
};

/**
 * @param {string} prop
 * @param {any} val
 * @param {any} type
 * @param {string} style
 * @returns {void}
 */
export const storeSetPropTypeWarning = (prop, val, type, style) => {
    console.warn(
        `%c trying to execute setProp method on '${prop}' propierties: ${val} is not a ${getTypeName(
            type
        )}`,
        style
    );
};

/**
 * @param {string} prop
 * @param {any} val
 * @param {string} style
 * @returns {void}
 */
export const storeSetObjectValWarning = (prop, val, style) => {
    console.warn(
        `%c trying to execute setObj method on '${prop}' propierties: setObj methods allow only objects as value, ${val} is not an Object`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeSetObjectPropWarning = (prop, style) => {
    console.warn(
        `%c trying to execute setObj data method on '${prop}' propierties: store propierties '${prop}' is not an object`,
        style
    );
};

/**
 * @param {String[]} key
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeSetObjKeysWarning = (key, prop, style) => {
    console.warn(
        `%c trying to execute setObj data method: one of these keys '${key}' not exist in store.${prop}`,
        style
    );
};

/**
 * @param {string} prop
 * @param {any} val
 * @param {string} style
 * @returns {void}
 */
export const storeSetObjDepthWarning = (prop, val, style) => {
    console.warn(
        `%c trying to execute setObj data method on '${prop}' propierties: '${JSON.stringify(
            val
        )}' have a depth > 1, nested obj is not allowed`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} subProp
 * @param {any} subVal
 * @param {string} type
 * @param {string} style
 * @returns {void}
 */
export const storeSetObjTypeWarning = (prop, subProp, subVal, type, style) => {
    console.warn(
        `%c trying to execute setObj data method on ${prop}.${subProp} propierties: ${subVal} is not a ${getTypeName(
            type
        )}`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeGetPropWarning = (prop, style) => {
    console.warn(
        `%c trying to execute get data method: store.${prop} not exist`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeEmitWarning = (prop, style) => {
    console.warn(
        `%c trying to execute set data method: store.${prop} not exist`,
        style
    );
};

/**
 * @param {string[]} keys
 * @param {string} style
 * @returns {void}
 */
export const storeComputedKeyUsedWarning = (keys, style) => {
    console.warn(
        `%c one of the keys [${keys}] is already used as a computed target, or there is a circular dependencies`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storeWatchWarning = (prop, style) => {
    console.warn(
        `%c MobStore error: the property ${prop} to watch doesn't exist in store`,
        style
    );
};

/**
 * @param {string} style
 * @param {string} CUSTOM_OBJECT
 * @returns {void}
 */
export const storeObjectIsNotAnyWarning = (style, CUSTOM_OBJECT) => {
    console.warn(
        `%c Validation Object error: validation function return undefined or have you used Object instead '${CUSTOM_OBJECT}' ?`,
        style
    );
};

/**
 * @param {string} prop
 * @param {string} style
 * @returns {void}
 */
export const storePropInProxiWarning = (prop, style) => {
    console.warn(
        `%c MobStore error: the property ${prop} does not exist in proxi`,
        style
    );
};
