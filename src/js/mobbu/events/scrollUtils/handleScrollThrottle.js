import { handleFrame } from '../rafutils/handleFrame.js';
import { handleNextTick } from '../rafutils/handleNextTick.js';
import { throttle } from '../throttle.js';
import { handleScrollImmediate } from './handleScrollImmediate.js';
import { handleSetUp } from '../../setup.js';

/**
 * @description
 * Performs a scroll callback using a throttle function
 */
export const handleScrollThrottle = (() => {
    let inizialized = false;
    let callback = [];
    let id = 0;
    let throttleFunctionReference = () => {};
    let unsubscribe = () => {};

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
     * @description
     * Performs a scroll callback using a throttle function
     *
     * @param {function(import('./handleScrollImmediate.js').handleScrollType):void } cb - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     * ```js
     * const unsubscribe = handleScrollThrottle(({ direction, scrollY }) => {
     *     // code
     * });
     *
     * unsubscribe()
     *
     * Define throttle value from default:
     * handleSetUp.set({ throttle: 100 });
     *
     * ```
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
