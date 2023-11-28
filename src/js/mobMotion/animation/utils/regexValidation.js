// @ts-check

/**
 * @param {string} text
 * @returns string
 */
const escapeRegExp = (text) => {
    // @ts-ignore
    return text ? text.replaceAll(/[\s#$()*+,.?[\\\]^{|}-]/g, '\\$&') : '';
};

/**
 * @param {string} pattern
 * @returns boolean
 */
export const checkIfIsOnlyNumberPositiveNegative = (pattern) => {
    return /^[+-]?\d+(\.\d+)?$/.test(pattern);
};

/**
 * @param {string} pattern
 * @returns boolean
 */
export const checkIfIsOnlyNumber = (pattern) => {
    return /^\d+\.\d+$|^\d+$/.test(pattern);
};

/**
 * @description
 * Compare two string exact match case insensitive
 *
 * @param {string} string
 * @param {string} pattern
 * @returns number
 */
export const exactMatchInsensitive = (string, pattern) => {
    const regex = new RegExp(`^${escapeRegExp(pattern)}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 * @description
 * Compare two string exact match case insensitive with number at string start
 *
 * @param {string} string
 * @param {string} pattern
 * @returns number
 */
export const exactMatchInsesitiveNumberProp = (string, pattern) => {
    const regex = new RegExp(`[0-9]${pattern}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 * @description
 *
 * @param {array} arr
 * @param {string} string
 * @returns boolean
 */
export const exactMatchInsesitiveNumberPropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`[0-9]${unitMisure}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};

/**
 * @description
 *
 * @param {array} arr
 * @param {string} string
 * @returns boolean
 */
export const exactMatchInsesitivePropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`^${escapeRegExp(unitMisure)}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};
