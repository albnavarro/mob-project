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
            for (const { cb } of callback) {
                cb(callBackObject);
            }
        });

        /**
         * Fire callback cache immediately.
         */
        MobCore.useFrame(() => {
            for (const { cb } of callbackCache) {
                MobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            }
        });

        return;
    }

    /**
     * Fire callback with default stagger.
     */
    for (const { cb, frame } of callback) {
        MobCore.useFrameIndex(() => {
            cb(callBackObject);
        }, frame);
    }

    /**
     * Fire callback with cache stagger. Update handleCache store.
     */
    for (const { cb, frame } of callbackCache) {
        MobCore.useCache.update({ id: cb, callBackObject, frame });
    }
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
            for (const { cb } of callback) {
                cb(callBackObject);
            }

            /**
             * Fire callback cache immediately.
             */
            for (const { cb } of callbackCache) {
                MobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            }

            for (const { cb } of callbackOnComplete) {
                cb(callBackObject);
            }
        });

        return;
    }

    /**
     * Fire callback with default stagger.
     */
    for (const [index, { cb, frame }] of callback.entries()) {
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
    }

    /**
     * Fire callback with cache stagger.
     */
    for (const [index, { cb, frame }] of callbackCache.entries()) {
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
    }

    /**
     * Fire on complete callbacon complete callback
     */
    for (const { cb, frame } of callbackOnComplete) {
        MobCore.useFrameIndex(() => {
            cb(callBackObject);
        }, frame + 1);
    }
};
