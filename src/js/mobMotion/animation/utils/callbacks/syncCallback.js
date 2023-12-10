// @ts-check

import { mobCore } from '../../../../mobCore';

/**
 * @param {Object} obj
 * @param {Number} obj.each
 * @param {Boolean} obj.useStagger
 * @param {Boolean} obj.isLastDraw
 * @param {import('../stagger/type').staggerDefaultIndex} obj.callBackObject
 * @param {Array.<import('./type').callbackObject>} obj.callback
 * @param {Array.<import('./type').callbackObject>} obj.callbackCache
 * @param {Array.<import('./type').callbackObject>} obj.callbackOnStop
 * @returns void
 *
 * @description
 * Fire callback while Running
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
        mobCore.useFrame(() => {
            callback.forEach(({ cb }) => cb(callBackObject));
        });

        mobCore.useFrame(() => {
            callbackCache.forEach(({ cb }) => {
                mobCore.useCache.fireObject({ id: cb, obj: callBackObject });
            });
        });
    } else {
        // Stagger
        callback.forEach(({ cb, frame }) => {
            mobCore.useFrameIndex(() => cb(callBackObject), frame);
        });

        callbackCache.forEach(({ cb, frame }) => {
            mobCore.useCache.update({ id: cb, callBackObject, frame });
        });
    }

    if (isLastDraw) {
        if (each === 0 || useStagger === false) {
            // No stagger, run immediately
            mobCore.useFrame(() => {
                callbackOnStop.forEach(({ cb }) => cb(callBackObject));
            });
        } else {
            // Stagger
            callbackOnStop.forEach(({ cb, frame }) => {
                mobCore.useFrameIndex(() => cb(callBackObject), frame + 1);
            });
        }
    }
};