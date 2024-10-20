// @ts-check

/**
 * @param {Function} fn
 * @returns {void}
 */
export const useNextLoop = (fn) => {
    setTimeout(() => fn());
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
