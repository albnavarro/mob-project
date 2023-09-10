//@ts-check

import { mobCore } from '../../../mobCore';

/**
 * @param {Array} arr
 * @param {String} key
 * @returns {Object}
 *
 * @description
 * Get value of specific key from an array
 * [{ prop: valueByKey }, ...]
 */
export const getValueObj = (arr, key) => {
    return arr
        .map((item) => ({ [item.prop]: Number.parseFloat(item[key]) }))
        .reduce((p, c) => ({ ...p, ...c }), {});
};

/**
 * @param {Array} arr
 * @returns {Object}
 *
 * @description
 * Get toValue of specific key from an array ( function or number )
 */
export const getValueObjToNative = (arr) => {
    return arr
        .map((item) => {
            return item.toIsFn
                ? { [item.prop]: item.toFn }
                : { [item.prop]: Number.parseFloat(item.toValue) };
        })
        .reduce((p, c) => ({ ...p, ...c }), {});
};

/**
 * @param {Array} arr
 * @returns {Object}
 *
 * @description
 * Get fromValue of specific key from an array ( function or number )
 */
export const getValueObjFromNative = (arr) => {
    return arr
        .map((item) => {
            return item.fromIsFn
                ? { [item.prop]: item.fromFn }
                : { [item.prop]: Number.parseFloat(item.fromValue) };
        })
        .reduce((p, c) => ({ ...p, ...c }), {});
};

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
 * @param {Array} newData
 * @param {Array} data
 * @returns {Array}
 *
 * @description
 * Merge animation store of specific lerp/spring .. with new data from goTo etc..
 */
export const mergeArray = (newData, data) => {
    return data.map((item) => {
        const itemToMerge = newData.find((newItem) => {
            return newItem.prop === item.prop;
        });

        // If exist merge
        return itemToMerge ? { ...item, ...itemToMerge } : item;
    });
};

/**
 * @param {Array} newData
 * @param {Array} data
 * @returns {Array}
 *
 * @description
 * Merge animation store of specific tween .. with new data from goTo etc..
 */
export const mergeArrayTween = (newData, data) => {
    return data.map((item) => {
        const itemToMerge = newData.find((newItem) => {
            return newItem.prop === item.prop;
        });

        // If exist merge
        return itemToMerge
            ? { ...item, ...itemToMerge, shouldUpdate: true }
            : { ...item, shouldUpdate: false };
    });
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
