/**
 * @private
 *
 * @param {import('./type.js').sequencerRow[]} arr
 * @param {string} prop
 * @returns {import('./type.js').sequencerRow[]} arr
 *
 * @description
 * Sorts the array by the lowest start value
 */
export const orderByProp = (arr, prop) => {
    return arr.sort((a, b) => {
        return a?.[prop] - b?.[prop];
    });
};
