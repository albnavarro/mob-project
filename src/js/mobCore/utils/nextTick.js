// @ts-check

/**
 * @param {function} fn
 * @returns {void}
 */
export const useNextLoop = (fn) => {
    setTimeout(() => fn());
};
