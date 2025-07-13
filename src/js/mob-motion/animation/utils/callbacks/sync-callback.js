import { MobCore } from '../../../../mob-core';

/**
 * Fire callback while Running
 *
 * @type {import('./type').SyncCallback}
 */
export const syncCallback = ({
    each,
    useStagger,
    isLastDraw,
    callBackObject,
    callback,
    callbackCache,
    callbackOnStop,
}) => {
    if (each === 0 || useStagger === false) {
        MobCore.useFrame(() => {
            callback.forEach(({ cb }) => cb(callBackObject));
        });

        MobCore.useFrame(() => {
            callbackCache.forEach(({ cb }) => {
                MobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            });
        });
    } else {
        // Stagger
        callback.forEach(({ cb, frame }) => {
            MobCore.useFrameIndex(() => cb(callBackObject), frame);
        });

        callbackCache.forEach(({ cb, frame }) => {
            MobCore.useCache.update({ id: cb, callBackObject, frame });
        });
    }

    if (isLastDraw) {
        if (each === 0 || useStagger === false) {
            // No stagger, run immediately
            MobCore.useFrame(() => {
                callbackOnStop.forEach(({ cb }) => cb(callBackObject));
            });
        } else {
            // Stagger
            callbackOnStop.forEach(({ cb, frame }) => {
                MobCore.useFrameIndex(() => cb(callBackObject), frame + 1);
            });
        }
    }
};
