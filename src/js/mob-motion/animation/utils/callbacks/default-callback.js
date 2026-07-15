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
    callbackObject,
    useStagger,
}) => {
    /**
     * Fire callback without stagger.
     */
    if (stagger.each === 0 || !useStagger) {
        MobCore.useFrame(() => {
            for (const { cb } of callback) {
                cb(callbackObject);
            }
        });

        /**
         * Fire callback cache immediately.
         */
        MobCore.useFrame(() => {
            for (const { cb } of callbackCache) {
                MobCore.useCache.fireObject({ id: cb, obj: callbackObject });
            }
        });

        return;
    }

    /**
     * Fire callback with default stagger.
     */
    for (const { cb, frame } of callback) {
        MobCore.useFrameIndex(() => {
            cb(callbackObject);
        }, frame);
    }

    /**
     * Fire callback with cache stagger. Update handleCache store.
     */
    for (const { cb, frame } of callbackCache) {
        MobCore.useCache.update({ id: cb, callbackObject, frame });
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
    callbackObject,
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
                cb(callbackObject);
            }

            /**
             * Fire callback cache immediately.
             */
            for (const { cb } of callbackCache) {
                MobCore.useCache.fireObject({ id: cb, obj: callbackObject });
            }

            for (const { cb } of callbackOnComplete) {
                cb(callbackObject);
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
                    cb(callbackObject);
                    onComplete();
                }

                return;
            }

            if (index === fastestStagger.index) {
                cb(callbackObject);
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
                        obj: callbackObject,
                    });
                    onComplete();
                }

                return;
            }

            /**
             * Fire callback cache immediately.
             */
            if (index === fastestStagger.index) {
                MobCore.useCache.fireObject({ id: cb, obj: callbackObject });
                onComplete();
            }
        }, frame);
    }

    /**
     * Fire on complete callbacon complete callback
     */
    for (const { cb, frame } of callbackOnComplete) {
        MobCore.useFrameIndex(() => {
            cb(callbackObject);
        }, frame + 1);
    }
};
