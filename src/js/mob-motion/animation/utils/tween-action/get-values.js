//@ts-check

/**
 * Get value of specific key from an array [{ prop: valueByKey }, ...]
 *
 * @param {Record<string, any>[]} arr
 * @param {string} key
 * @returns {Record<string, number>}
 */
export const getValueObj = (arr, key) => {
    return arr
        .map((item) => ({ [item['prop']]: Number.parseFloat(item[key]) }))
        .reduce((p, c) => ({ ...p, ...c }), {});
};

/**
 * Get toValue of specific key from an array ( function or number )
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
