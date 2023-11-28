//@ts-check

import { mobCore } from '../../../mobCore';

/**
 * @param {any} x
 * @returns {Number}
 *
 * @description
 * Sanitize Number in case is in calculator enutation.
 */
export const getRoundedValue = (x) => {
    if (mobCore.checkType(Number, x)) {
        return Math.round(x * 10_000) / 10_000 || 0;
    } else {
        if (Math.abs(x) < 1) {
            const e = Number.parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + new Array(e).join('0') + x.toString().slice(2);
            }
        } else {
            let e = Number.parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join('0');
            }
        }

        return Number.parseFloat(Number.parseFloat(x).toFixed(4));
    }
};

/**
 * @param {Number} num
 * @param {Number} min
 * @param {Number} max
 */
export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};

/**
 * @param {Number} start
 * @param {Number} end
 * @param {Number} amt
 */
export const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end;
};

/**
 * @param {Object} a
 * @param {Object} b
 * @returns {Boolean}
 *
 * @description
 * Check if all keys of object is equal to another.
 *
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
 * @param {Array} arr
 * @param {Number} chunkSize
 *
 * @description
 * Subdivide array into chunks
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
 * @param {Array} arr
 * @param {Number} n
 *
 * @description
 * Subdivide array into columns
 */
export const arrayColumn = (arr, n) => arr.map((x) => x[n]);
