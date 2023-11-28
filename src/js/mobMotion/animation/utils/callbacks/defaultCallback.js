// @ts-check

import { mobCore } from '../../../../mobCore/index.js';

/**
 * @param {Object} obj
 * @param {import('../stagger/type.js').staggerObject} obj.stagger
 * @param {Array.<import('./type.js').callbackObject>} obj.callback
 * @param {Array.<import('./type.js').callbackObject>} obj.callbackCache
 * @param {import('../stagger/type.js').staggerDefaultIndex} obj.callBackObject
 * @param {Boolean} obj.useStagger
 *
 * @description
 * Fire callback while Running
 */
export const defaultCallback = ({
    stagger,
    callback,
    callbackCache,
    callBackObject,
    useStagger,
}) => {
    /**
     * Fire callback without stagger.
     */
    if (stagger.each === 0 || !useStagger) {
        mobCore.useFrame(() => {
            callback.forEach(({ cb }) => {
                cb(callBackObject);
            });
        });

        /**
         * Fire callback cache immediately.
         */
        mobCore.useFrame(() => {
            callbackCache.forEach(({ cb }) => {
                mobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            });
        });

        return;
    }

    /**
     * Fire callback with default stagger.
     */
    callback.forEach(({ cb, frame }) => {
        mobCore.useFrameIndex(() => {
            cb(callBackObject);
        }, frame);
    });

    /**
     * Fire callback with cache stagger.
     * Update handleCache store.
     */
    callbackCache.forEach(({ cb, frame }) => {
        mobCore.useCache.update({ id: cb, callBackObject, frame });
    });
};

/**
 * @param {Object} obj
 * @param {Function} obj.onComplete
 * @param {import('../stagger/type.js').staggerObject} obj.stagger
 * @param {Array.<import('./type.js').callbackObject>} obj.callback
 * @param {Array.<import('./type.js').callbackObject>} obj.callbackCache
 * @param {Array.<import('./type.js').callbackObject>} obj.callbackOnComplete
 * @param {import('../stagger/type.js').staggerDefaultIndex} obj.callBackObject
 * @param {import('../stagger/type.js').staggerDefaultIndex} obj.slowlestStagger
 * @param {import('../stagger/type.js').staggerDefaultIndex} obj.fastestStagger
 * @param {Boolean} obj.useStagger
 *
 * @description
 *Callback on complete
 */
export const defaultCallbackOnComplete = ({
    onComplete,
    callback,
    callbackCache,
    callbackOnComplete,
    callBackObject,
    stagger,
    slowlestStagger,
    fastestStagger,
    useStagger,
}) => {
    /**
     * Fire callback without stagger.
     */
    if (stagger.each === 0 || !useStagger) {
        onComplete();

        mobCore.useNextFrame(() => {
            // Fire callback with exact end value
            callback.forEach(({ cb }) => {
                cb(callBackObject);
            });

            /**
             * Fire callback cache immediately.
             */
            callbackCache.forEach(({ cb }) => {
                mobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            });

            callbackOnComplete.forEach(({ cb }) => {
                cb(callBackObject);
            });
        });

        return;
    }

    /**
     * Fire callback with default stagger.
     */
    callback.forEach(({ cb, frame }, /** @type {number} */ index) => {
        mobCore.useFrameIndex(() => {
            if (stagger.waitComplete) {
                if (index === slowlestStagger.index) {
                    cb(callBackObject);
                    onComplete();
                }
                return;
            }

            if (index === fastestStagger.index) {
                cb(callBackObject);
                onComplete();
            }
        }, frame);
    });

    /**
     * Fire callback with cache stagger.
     */
    callbackCache.forEach(({ cb, frame }, /** @type {number} */ index) => {
        mobCore.useFrameIndex(() => {
            if (stagger.waitComplete) {
                if (index === slowlestStagger.index) {
                    mobCore.useCache.fireObject({
                        id: cb,
                        obj: callBackObject,
                    });
                    onComplete();
                }
                return;
            }

            /**
             * Fire callback cache immediately.
             */
            if (index === fastestStagger.index) {
                mobCore.useCache.fireObject({ id: cb, obj: callBackObject });
                onComplete();
            }
        }, frame);
    });

    /**
     * Fire on complete callbacon complete callback
     */
    callbackOnComplete.forEach(({ cb, frame }) => {
        mobCore.useFrameIndex(() => {
            cb(callBackObject);
        }, frame + 1);
    });
};
