/**
 * Test function.
 *
 * - Useful to test store with immutable data.
 *
 * @param {any} obj
 * @param {WeakMap<object, any>} [hash=new WeakMap()] Default is `new WeakMap()`
 * @returns {any}
 */
export const deepClone = (obj, hash = new WeakMap()) => {
    /**
     * Primitives
     */
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    /**
     * DOM elements
     */
    if (typeof Element !== 'undefined' && obj instanceof Element) {
        return obj;
    }

    /**
     * Circular reference
     */
    if (hash.has(obj)) {
        return hash.get(obj);
    }

    /**
     * Date
     */
    if (obj instanceof Date) {
        return new Date(obj);
    }

    /**
     * RegExp
     */
    if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags);
    }

    /**
     * Array
     */
    if (Array.isArray(obj)) {
        /** @type {any[]} */
        const clonedArray = [];
        hash.set(obj, clonedArray);
        for (const [index, item] of obj.entries()) {
            clonedArray[index] = deepClone(item, hash);
        }

        return clonedArray;
    }

    /**
     * Function
     */
    if (typeof obj === 'function') {
        return obj;
    }

    /**
     * Map
     */
    if (obj instanceof Map) {
        const clonedMap = new Map();
        hash.set(obj, clonedMap);
        for (const [key, value] of obj.entries()) {
            clonedMap.set(deepClone(key, hash), deepClone(value, hash));
        }

        return clonedMap;
    }

    /**
     * Set
     */
    if (obj instanceof Set) {
        const clonedSet = new Set();
        hash.set(obj, clonedSet);
        for (const value of obj) {
            clonedSet.add(deepClone(value, hash));
        }

        return clonedSet;
    }

    /**
     * Object
     */
    const clonedObj = Object.create(Object.getPrototypeOf(obj));
    hash.set(obj, clonedObj);

    /**
     * Normal propierties
     */
    for (const key of Object.getOwnPropertyNames(obj)) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor) {
            // Se è un data descriptor (ha value), clona il value
            if ('value' in descriptor) {
                Object.defineProperty(clonedObj, key, {
                    ...descriptor,
                    value: deepClone(descriptor.value, hash),
                });
            } else {
                // Se è un accessor descriptor (ha get/set), copia così com'è
                Object.defineProperty(clonedObj, key, descriptor);
            }
        }
    }

    /**
     * Symbols
     */
    for (const symbol of Object.getOwnPropertySymbols(obj)) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, symbol);
        if (descriptor) {
            if ('value' in descriptor) {
                Object.defineProperty(clonedObj, symbol, {
                    ...descriptor,
                    value: deepClone(descriptor.value, hash),
                });
            } else {
                Object.defineProperty(clonedObj, symbol, descriptor);
            }
        }
    }

    return clonedObj;
};
