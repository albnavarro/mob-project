// @ts-check

/**
 *@type {() => void}
 */
export const NOOP = () => {};

/**
 * @param {...() => Promise<any>} functions
 * @returns {Awaited<any>}
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
    (/** @type {any} */ input) =>
        functions.reduce(
            (chain, func) => chain.then(func),
            Promise.resolve(input)
        );
