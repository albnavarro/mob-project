// @ts-check

/**
 * @param {Function} fn
 * @param {number} [ time ]
 * @returns {Function}
 *
 * @description
 */
export const debounceFuncion = function debounce(fn, time = 200) {
    /** @type{number} */
    let timeout;

    return function () {
        // @ts-ignore
        const functionCall = () => Reflect.apply(fn, this, arguments);

        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};
