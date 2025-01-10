// @ts-check

/** @type{Set<() => any>} */
const setTimeOutQueque = new Set();

/**
 * @param {() => void} fn
 * @returns {void}
 */
export const useNextLoop = (fn) => {
    setTimeOutQueque.add(fn);

    if (setTimeOutQueque.size === 1) {
        setTimeout(() => {
            setTimeOutQueque.forEach((fn) => {
                fn();
            });

            setTimeOutQueque.clear();
        });
    }
};

// https://macarthur.me/posts/navigating-the-event-loop

/**
 * alternative 1
 * Safari not support at moment.
 * requestIdleCallback(() => {
 *     fn();
 * });
 */

/**
 * alternative 2:
 *
 * const channel = new MessageChannel();
 * channel.port1.onmessage = fn;
 * channel.port2.postMessage('');
 */
