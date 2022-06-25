/**
 * Utils to centralize scroll listener, all subscriber use the same listener
 * First subscriber create a listener, when there are no more listeners the listern is removed
 *
 * NOTE:
 * Use it inside onMount function to be sure callback is added after first rendering in case of server side rendering
 * https://svelte.dev/tutorial/onmount
 *
 * @example:
 * onMount(() => {
 *   const unsubscribe = handleScroll(({scrollY, direction}) => console.log(scrollY,direction));
 *   return(() => unsubscribe())
 * }
 *
 */

import { handleFrame, handleNextTick } from '../rafutils/rafUtils.js';
import { throttle } from '../throttle.js';
import { handleScrollImmediate } from './handleScrollImmediate.js';
import { handleSetUp } from '../../setup.js';

export const handleScrollThrottle = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;
    let throttleFunctionReference = () => {};
    let unsubscribe = () => {};

    /**
     * handler - handler for mouse move
     *
     * @param  {event} e mouse move event
     * @return {void}   description
     */
    function handler(scrollData) {
        /**
         * if - if there is no subscritor remove handler
         */
        if (callback.length === 0) {
            unsubscribe();

            inizialized = false;
            return;
        }

        handleFrame.add(() => {
            handleNextTick.add(() => {
                callback.forEach(({ cb }) => {
                    cb(scrollData);
                });
            }, 0);
        });
    }

    /**
     * init - if istener is not inizializad remove it
     *
     * @return {void}
     */
    function init() {
        if (inizialized) return;
        inizialized = true;

        throttleFunctionReference = throttle(
            (scrollData) => handler(scrollData),
            handleSetUp.get('throttle')
        );
        unsubscribe = handleScrollImmediate(throttleFunctionReference);
    }

    /**
     * init - add call back to stack
     *
     * @return {function} unsubscribe function
     */
    const addCb = (cb) => {
        callback.push({ cb, id: id });
        const cbId = id;
        id++;

        if (typeof window !== 'undefined') {
            init();
        }

        return () => {
            callback = callback.filter((item) => item.id !== cbId);
        };
    };

    return addCb;
})();
