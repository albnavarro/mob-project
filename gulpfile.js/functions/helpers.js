/**
 * check if nested prop exist in obj
 */
const propValidate = (p, o) =>
    p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

/**
 * sortbyDate - sort array by datye
 *
 * @param  {Array} arr Array of obj with date propierties
 * @return {Array}  ordered Array by date
 */
function sortbyDate(arr) {
    return arr.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
}

/**
 * chunk - create chunked array
 *
 * @param  {Array} array source Array
 * @param  {number} size  chunk size
 * @return {Array}  Chunked array
 */
function chunk(array, size) {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
}

/**
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
function mergeDeep(target, source, isMergingArrays = true) {
    target = ((obj) => {
        let cloneObj;
        try {
            cloneObj = JSON.parse(JSON.stringify(obj));
        } catch (err) {
            // If the stringify fails due to circular reference, the merge defaults
            //   to a less-safe assignment that may still mutate elements in the target.
            // You can change this part to throw an error for a truly safe deep merge.
            cloneObj = Object.assign({}, obj);
        }
        return cloneObj;
    })(target);

    const isObject = (obj) => obj && typeof obj === 'object';

    if (!isObject(target) || !isObject(source)) return source;

    Object.keys(source).forEach((key) => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(targetValue) && Array.isArray(sourceValue))
            if (isMergingArrays) {
                target[key] = targetValue.map((x, i) =>
                    sourceValue.length <= i
                        ? x
                        : mergeDeep(x, sourceValue[i], isMergingArrays)
                );
                if (sourceValue.length > targetValue.length)
                    target[key] = target[key].concat(
                        sourceValue.slice(targetValue.length)
                    );
            } else {
                target[key] = targetValue.concat(sourceValue);
            }
        else if (isObject(targetValue) && isObject(sourceValue))
            target[key] = mergeDeep(
                Object.assign({}, targetValue),
                sourceValue,
                isMergingArrays
            );
        else target[key] = sourceValue;
    });

    return target;
}

/**
 * isEmptyObject - description
 *
 * @param  {Object} obj
 * @return {Boolean}
 */
function isEmptyObject(obj) {
    return JSON.stringify(obj) === '{}';
}

exports.propValidate = propValidate;
exports.sortbyDate = sortbyDate;
exports.chunk = chunk;
exports.mergeDeep = mergeDeep;
exports.isEmptyObject = isEmptyObject;
