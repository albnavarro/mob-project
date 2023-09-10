// @ts-check

/**
 * @param {Function} fn
 * @param {Number} [ time ]
 * @returns {Function}
 *
 * @description
 */
export const debounceFuncion = function debounce(fn, time = 200) {
    let timeout;

    return function () {
        const functionCall = () => Reflect.apply(fn, this, arguments);

        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};
