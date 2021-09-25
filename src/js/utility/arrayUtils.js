/**
 * arrayComparator - check if all element in target is included in arr
 *
 * @param  {<array>} arr
 * @param  {<array>} target
 * @return {Boolean}
 */
export function arrayComparator(arr, target) {
    return target.every(item => arr.includes(item));
}
