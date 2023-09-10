// @ts-check

/**
 *@type {Function}
 */
export const NOOP = () => {};

/**
 * @param {...function():promise} functions
 * @returns {function(any):Promise}
 *
 * @description
 * Pipe chain of function that return a promise.
 *
 * @example
 *
 *``` javascript
 * pipe(
 *     myFunction1,
 *     myFunction2,
 *     myFunction3,
 * )(initalValue).then((result) => {
 *     ....
 * });
 * ```
 */
export const pipe =
    (...functions) =>
    (input) =>
        functions.reduce(
            (chain, func) => chain.then(func),
            Promise.resolve(input)
        );
