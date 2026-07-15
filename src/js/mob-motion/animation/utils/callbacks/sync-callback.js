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
    callbackObject,
    callback,
    callbackCache,
    callbackOnStop,
}) => {
    if (each === 0 || useStagger === false) {
        MobCore.useFrame(() => {
            for (const { cb } of callback) cb(callbackObject);
        });

        MobCore.useFrame(() => {
            for (const { cb } of callbackCache) {
                MobCore.useCache.fireObject({ id: cb, obj: callbackObject });
            }
        });
    } else {
        // Stagger
        for (const { cb, frame } of callback) {
            MobCore.useFrameIndex(() => cb(callbackObject), frame);
        }

        for (const { cb, frame } of callbackCache) {
            MobCore.useCache.update({ id: cb, callbackObject, frame });
        }
    }

    if (isLastDraw) {
        if (each === 0 || useStagger === false) {
            // No stagger, run immediately
            MobCore.useFrame(() => {
                for (const { cb } of callbackOnStop) cb(callbackObject);
            });
        } else {
            // Stagger
            for (const { cb, frame } of callbackOnStop) {
                MobCore.useFrameIndex(() => cb(callbackObject), frame + 1);
            }
        }
    }
};
