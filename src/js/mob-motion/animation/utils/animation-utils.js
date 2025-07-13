import { MobCore } from '../../../mob-core';

/**
 * Sanitize Number in case is in calculator enutation.
 *
 * @param {any} x
 * @returns {number}
 */
export const getRoundedValue = (x) => {
    if (MobCore.checkType(Number, x)) {
        return Math.round(x * 10_000) / 10_000 || 0;
    }

    if (Math.abs(x) < 1) {
        const e = Number.parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x =
                '0.' +
                Array.from({ length: e }).join('0') +
                x.toString().slice(2);
        }
    } else {
        let e = Number.parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += Array.from({ length: e + 1 }).join('0');
        }
    }

    return Number.parseFloat(Number.parseFloat(x).toFixed(4));
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
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

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
