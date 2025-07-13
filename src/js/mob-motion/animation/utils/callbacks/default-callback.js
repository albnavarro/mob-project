import { MobCore } from '../../../../mob-core/index.js';

/**
 * Fire callback while Running
 *
 * @type {import('./type.js').DefaultCallback}
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
        MobCore.useFrame(() => {
            callback.forEach(({ cb }) => {
                cb(callBackObject);
            });
        });

        /**
         * Fire callback cache immediately.
         */
        MobCore.useFrame(() => {
            callbackCache.forEach(({ cb }) => {
                MobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            });
        });

        return;
    }

    /**
     * Fire callback with default stagger.
     */
    callback.forEach(({ cb, frame }) => {
        MobCore.useFrameIndex(() => {
            cb(callBackObject);
        }, frame);
    });

    /**
     * Fire callback with cache stagger. Update handleCache store.
     */
    callbackCache.forEach(({ cb, frame }) => {
        MobCore.useCache.update({ id: cb, callBackObject, frame });
    });
};

/**
 * Callback on complete
 *
 * @type {import('./type.js').DefaultCallbackOnComplete}
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

        MobCore.useNextFrame(() => {
            // Fire callback with exact end value
            callback.forEach(({ cb }) => {
                cb(callBackObject);
            });

            /**
             * Fire callback cache immediately.
             */
            callbackCache.forEach(({ cb }) => {
                MobCore.useCache.fireObject({ id: cb, obj: callBackObject });
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
    callback.forEach(({ cb, frame }, index) => {
        MobCore.useFrameIndex(() => {
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
    callbackCache.forEach(({ cb, frame }, index) => {
        MobCore.useFrameIndex(() => {
            if (stagger.waitComplete) {
                if (index === slowlestStagger.index) {
                    MobCore.useCache.fireObject({
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
                MobCore.useCache.fireObject({ id: cb, obj: callBackObject });
                onComplete();
            }
        }, frame);
    });

    /**
     * Fire on complete callbacon complete callback
     */
    callbackOnComplete.forEach(({ cb, frame }) => {
        MobCore.useFrameIndex(() => {
            cb(callBackObject);
        }, frame + 1);
    });
};
