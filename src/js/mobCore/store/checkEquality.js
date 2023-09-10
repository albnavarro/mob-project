// @ts-check

import { ARRAY, MAP, SET, TYPE_IS_ANY } from './storeType';

/**
 * @param {Map} m1
 * @param {Map} m2
 * @returns {Boolean}
 */
const mapsAreEqual = (m1, m2) =>
    m1.size === m2.size &&
    [...m1.keys()].every((key) => m1.get(key) === m2.get(key));

/**
 * @param {Set} a
 * @param {Set} b
 * @returns {Boolean}
 */
const setsAreEqual = (a, b) =>
    a.size === b.size && [...a].every((value) => b.has(value));

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {Boolean}
 *
 * @description
 * A function to compare if two arrays have the same elements regardless of their order
 */
const arrayAreEquals = (a, b) => {
    if (a.length !== b.length) return false;
    const elements = new Set([...a, ...b]);
    for (const x of elements) {
        const count1 = a.filter((e) => e === x).length;
        const count2 = b.filter((e) => e === x).length;
        if (count1 !== count2) return false;
    }
    return true;
};

/**
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Boolean}
 *
 * @description
 */
const objectAreEqual = (obj1, obj2, checkDataOrder = false) => {
    const checkDataOrderParanoic = false;
    if (obj1 === null || obj2 === null) {
        return obj1 === obj2;
    }
    let _obj1 = obj1;
    let _obj2 = obj2;
    if (!checkDataOrder) {
        if (Array.isArray(obj1)) {
            _obj1 = [...obj1].sort();
        }
        if (Array.isArray(obj2)) {
            _obj2 = [...obj2].sort();
        }
    }
    if (typeof _obj1 !== 'object' || typeof _obj2 !== 'object') {
        return _obj1 === _obj2;
    }

    const obj1Props = Object.getOwnPropertyNames(_obj1);
    const obj2Props = Object.getOwnPropertyNames(_obj2);
    if (obj1Props.length !== obj2Props.length) {
        return false;
    }

    if (checkDataOrderParanoic && checkDataOrder) {
        // whill result in {a:1, b:2} !== {b:2, a:1}
        // its not normal, but if you want this behavior, set checkDataOrderParanoic = true
        const propOrder = obj1Props.toString() === obj2Props.toString();
        if (!propOrder) {
            return false;
        }
    }

    for (const prop of obj1Props) {
        const val1 = _obj1[prop];
        const val2 = _obj2[prop];

        if (typeof val1 === 'object' && typeof val2 === 'object') {
            if (objectAreEqual(val1, val2, checkDataOrder)) {
                continue;
            } else {
                return false;
            }
        }
        if (val1 !== val2) {
            return false;
        }
    }
    return true;
};

/**
 * @param {any} type
 * @param {any} oldValue
 * @param {any} newValue
 * @returns {Boolean}
 *
 * @description
 */
export const checkEquality = (type, oldValue, newValue) => {
    switch (type) {
        case TYPE_IS_ANY: {
            return objectAreEqual(oldValue, newValue);
        }

        case ARRAY:
        case Array: {
            return arrayAreEquals(oldValue, newValue);
        }

        case SET:
        case Set: {
            return setsAreEqual(oldValue, newValue);
        }

        case MAP:
        case Map: {
            return mapsAreEqual(oldValue, newValue);
        }

        default: {
            return oldValue === newValue;
        }
    }
};
