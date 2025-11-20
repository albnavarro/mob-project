/**
 * Get value of specific key from an array [{ prop: valueByKey }, ...]
 *
 * @param {Record<string, any>[]} arr
 * @param {string} key
 * @returns {Record<string, number>}
 */
export const getValueObj = (arr, key) => {
    return Object.fromEntries(
        arr.map((item) => {
            const value = item[key];
            return [
                item['prop'],
                typeof value === 'number' ? value : Number.parseFloat(value),
            ];
        })
    );
};

/**
 * Get toValue of specific key from an array ( function or number )
 *
 * - TODO: usare Object.fromEntries
 *
 * @param {Record<'toIsFn' | 'toFn' | 'prop' | 'toValue', any>[]} arr
 * @returns {Record<string, number | (() => number)>}
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
 * Get fromValue of specific key from an array ( function or number )
 *
 * - TODO: usare Object.fromEntries
 *
 * @param {Record<'fromIsFn' | 'fromFn' | 'prop' | 'fromValue', any>[]} arr
 * @returns {Record<string, number | (() => number)>}
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
