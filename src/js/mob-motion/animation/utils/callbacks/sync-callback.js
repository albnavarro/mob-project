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
            for (const { cb } of callback) cb(callBackObject);
        });

        MobCore.useFrame(() => {
            for (const { cb } of callbackCache) {
                MobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            }
        });
    } else {
        // Stagger
        for (const { cb, frame } of callback) {
            MobCore.useFrameIndex(() => cb(callBackObject), frame);
        }

        for (const { cb, frame } of callbackCache) {
            MobCore.useCache.update({ id: cb, callBackObject, frame });
        }
    }

    if (isLastDraw) {
        if (each === 0 || useStagger === false) {
            // No stagger, run immediately
            MobCore.useFrame(() => {
                for (const { cb } of callbackOnStop) cb(callBackObject);
            });
        } else {
            // Stagger
            for (const { cb, frame } of callbackOnStop) {
                MobCore.useFrameIndex(() => cb(callBackObject), frame + 1);
            }
        }
    }
};
