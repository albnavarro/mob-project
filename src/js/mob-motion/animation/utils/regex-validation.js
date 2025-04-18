// @ts-check

/**
 * @param {string} text
 * @returns String
 */
const escapeRegExp = (text) => {
    // @ts-ignore
    return text
        ? text.replaceAll(/[\s#$()*+,.?[\\\]^{|}-]/g, String.raw`\$&`)
        : '';
};

/**
 * @param {string} pattern
 * @returns Boolean
 */
export const checkIfIsOnlyNumberPositiveNegative = (pattern) => {
    return /^[+-]?\d+(\.\d+)?$/.test(pattern);
};

/**
 * @param {string} pattern
 * @returns Boolean
 */
export const checkIfIsOnlyNumber = (pattern) => {
    return /^\d+\.\d+$|^\d+$/.test(pattern);
};

/**
 * Compare two string exact match case insensitive
 *
 * @param {string} string
 * @param {string} pattern
 * @returns Number
 */
export const exactMatchInsensitive = (string, pattern) => {
    const regex = new RegExp(`^${escapeRegExp(pattern)}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 * Compare two string exact match case insensitive with number at string start
 *
 * @param {string} string
 * @param {string} pattern
 * @returns Number
 */
export const exactMatchInsesitiveNumberProp = (string, pattern) => {
    const regex = new RegExp(`[0-9]${pattern}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 * @param {string[]} arr
 * @param {string} string
 * @returns Boolean
 */
export const exactMatchInsesitiveNumberPropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`[0-9]${unitMisure}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};

/**
 * @param {string[]} arr
 * @param {string} string
 * @returns Boolean
 */
export const exactMatchInsesitivePropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`^${escapeRegExp(unitMisure)}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};
