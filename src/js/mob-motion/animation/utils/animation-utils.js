import { MobCore } from '../../../mob-core';

/**
 * Sanitize Number in case is in calculator enutation.
 *
 * @param {any} x
 * @returns {number}
 */
export const getRoundedValue = (x) => {
    /**
     * Se è già un numero, arrotonda direttamente
     */
    if (MobCore.checkType(Number, x))
        return Math.round(x * 10_000) / 10_000 || 0;

    /**
     * Fallback: Number gestisce nativamente stringhe numeriche e e-notation
     */
    return Math.round(Number(x) * 10_000) / 10_000 || 0;
};

/**
 * @param {number} num
 * @param {number} min
 * @param {number} max
 */
export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};

/**
 * @param {number} start
 * @param {number} end
 * @param {number} amt
 */
export const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end;
};

/**
 * Check if all keys of object is equal to another.
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {boolean}
 */
export const compareKeys = (a, b) => {
    const aKeys = Object.keys(a).toSorted((a, b) => a.localeCompare(b));
    const bKeys = Object.keys(b).toSorted((a, b) => a.localeCompare(b));

    return (
        aKeys.length === bKeys.length &&
        aKeys.every((element, index) => element === bKeys[index])
    );
};

/**
 * Subdivide array into chunks
 *
 * @param {any[]} arr
 * @param {number} chunkSize
 */
export const sliceIntoChunks = (arr, chunkSize) => {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
};

/**
 * Subdivide array into columns
 *
 * @param {any[]} arr
 * @param {number} n
 */
export const arrayColumn = (arr, n) => arr.map((x) => x[n]);
