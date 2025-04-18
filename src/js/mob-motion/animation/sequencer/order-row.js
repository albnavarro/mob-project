/**
 * Sorts the array by the lowest start value
 *
 * @template {any[]} T
 * @param {T} arr
 * @param {any} prop
 * @returns {T} Arr
 */
export const orderByProp = (arr, prop) => {
    return arr.sort((a, b) => {
        return a?.[prop] - b?.[prop];
    });
};
