import { getTypeName } from './storeType';

export const storeDepthWarning = (data, style) => {
    console.warn(
        `%c SimpleStore supports an object with a depth of up to 2 levels, the input object has ${data} level`,
        style
    );
};

export const storeComputedWarning = (keys, prop, style) => {
    console.warn(
        `%c one of this key ${keys} defined in computed method of prop to monitor '${prop}' prop not exist`,
        style
    );
};

export const storeSetWarning = (prop, style) => {
    console.warn(
        `%c SimpleStore, trying to execute set() method: store.${prop} not exist`,
        style
    );
};

export const storeSetPropValWarning = (prop, val, style) => {
    console.warn(
        `%c trying to execute setProp method on '${prop}' propierties: setProp methods doasn't allow objects as value, ${JSON.stringify(
            val
        )} is an Object`,
        style
    );
};

export const storeSetPropPropWarning = (prop, style) => {
    console.warn(
        `%c trying to execute setProp method on '${prop}' propierties: '${JSON.stringify(
            prop
        )}' is an objects`,
        style
    );
};

export const storeSetPropTypeWarning = (prop, val, type, style) => {
    console.warn(
        `%c trying to execute setProp method on '${prop}' propierties: ${val} is not a ${getTypeName(
            type
        )}`,
        style
    );
};

export const storeSetObjectValWarning = (prop, val, style) => {
    console.warn(
        `%c trying to execute setObj method on '${prop}' propierties: setObj methods allow only objects as value, ${val} is not an Object`,
        style
    );
};

export const storeSetObjectPropWarning = (prop, style) => {
    console.warn(
        `%c trying to execute setObj data method on '${prop}' propierties: store propierties '${prop}' is not an object`,
        style
    );
};

export const storeSetObjKeysWarning = (key, prop, style) => {
    console.warn(
        `%c trying to execute setObj data method: one of these keys '${key}' not exist in store.${prop}`,
        style
    );
};

export const storeSetObjDepthWarning = (prop, val, style) => {
    console.warn(
        `%c trying to execute setObj data method on '${prop}' propierties: '${JSON.stringify(
            val
        )}' have a depth > 1, nested obj is not allowed`,
        style
    );
};

export const storeSetObjTypeWarning = (prop, subProp, subVal, type, style) => {
    console.warn(
        `%c trying to execute setObj data method on ${prop}.${subProp} propierties: ${subVal} is not a ${getTypeName(
            type
        )}`,
        style
    );
};

export const storeGetPropWarning = (prop, style) => {
    console.warn(
        `%c trying to execute get data method: store.${prop} not exist`,
        style
    );
};

export const storeEmitWarning = (prop, style) => {
    console.warn(
        `%c trying to execute set data method: store.${prop} not exist`,
        style
    );
};

export const storeComputedKeyUsedWarning = (keys, style) => {
    console.warn(
        `%c one of the keys [${keys}] is already used as a computed target, or one of the keys coincides with the prop to be changed.`,
        style
    );
};

export const storeWatchWarning = (prop, style) => {
    console.warn(
        `%c SimpleStore error: the property ${prop} to watch doasn't exist in store`,
        style
    );
};
