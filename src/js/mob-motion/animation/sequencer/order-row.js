/**
 * Sorts the array by the lowest start value
 *
 * @template {Partial<Record<string, any>>} T
 * @param {T[]} arr
 * @param {any} prop
 * @returns {T[]} Arr
 */
export const orderByProp = (arr, prop) => {
    return arr.toSorted((a, b) => {
        return a?.[prop] - b?.[prop];
    });
};
