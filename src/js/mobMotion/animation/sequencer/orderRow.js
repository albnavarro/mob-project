/**
 * @template {any[]}T
 * @param {T} arr
 * @param {any} prop
 * @returns {T} arr
 *
 * @description
 * Sorts the array by the lowest start value
 */
export const orderByProp = (arr, prop) => {
    return arr.sort((a, b) => {
        return a?.[prop] - b?.[prop];
    });
};
