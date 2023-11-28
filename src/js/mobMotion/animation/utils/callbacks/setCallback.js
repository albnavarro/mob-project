// @ts-check

import { mobCore } from '../../../../mobCore';
import { callBackStore } from './callBackStore';

/**
 * @param {Function} currentCallback - callback to execute.
 * @param {Array.<import('./type').callbackObject>} arrayOfCallback
 * @returns {{arrayOfCallbackUpdated:Array.<import('./type').callbackObject>,unsubscribeCb: function(Array.<import('./type').callbackObject>):Array.<import('./type').callbackObject> }}
 *
 * @description
 * Add callback to Stack.
 *
 */
export const setCallBack = (currentCallback, arrayOfCallback) => {
    // Get new unbubscribeId.
    const { id } = callBackStore.get();

    // Update main callback array.
    // index and frame is settled on first run of tween
    // arrayOfCallback.push({ cb: currentCallback, id, index: -1, frame: -1 });
    const arrayOfCallbackUpdated = [
        ...arrayOfCallback,
        { cb: currentCallback, id, index: -1, frame: -1 },
    ];

    // Save current id for unsubscribe.
    const prevId = id;

    // Update Incremental id.
    callBackStore.quickSetProp('id', id + 1);

    // Delete item from arrayOfCallback, it is possible unsubscribe a single stagger.
    return {
        arrayOfCallbackUpdated,
        unsubscribeCb: (arrayOfCallback) =>
            arrayOfCallback.map(({ id, cb, index, frame }) => {
                // Set NOOP.
                if (id === prevId) cb = () => {};
                return { id, cb, index, frame };
            }),
    };
};

/**
 * @param {('Object'|'HTMLElement')} item
 * @param {function(Object.<string, number>):void} currentCallback
 * @param {Array.<import('./type').callbackObject>} arrayOfCallback
 * @param {Array.<function>} unsubscribeCacheArray - unsubscribe function of handleCache.
 *
 * @returns {{arrayOfCallbackUpdated:Array.<import('./type').callbackObject>, unsubscribeCache:Array.<function>, unsubscribeCb:function(Array.<{cb:number,id:number,index:Number,frame:Number}>):Array.<{cb:number,id:number,index:Number,frame:Number}> }}
 */
export const setCallBackCache = (
    item,
    currentCallback,
    arrayOfCallback,
    unsubscribeCacheArray
) => {
    // Get new unbubscribeId.
    const { id } = callBackStore.get();

    // add item and function related to handleCache.
    const { id: cacheId, unsubscribe } = mobCore.useCache.add(
        item,
        currentCallback
    );

    // Update main callback array.
    // index and frame is settled on first run of tween
    const arrayOfCallbackUpdated = [
        ...arrayOfCallback,
        { cb: cacheId, id, index: -1, frame: -1 },
    ];

    // Update unsubscribeCache store.
    unsubscribeCacheArray.push(unsubscribe);

    const prevId = id;

    // Update Incremental id.
    callBackStore.quickSetProp('id', id + 1);

    return {
        arrayOfCallbackUpdated,
        unsubscribeCache: unsubscribeCacheArray,
        unsubscribeCb: (arrayOfCallback) => {
            // runsubscribe item from handleCache.
            unsubscribe();

            // Disable single stagger without modify staggers order
            return arrayOfCallback.map(({ id, cb, index, frame }) => {
                if (id === prevId) cb = -1;
                return { id, cb, index, frame };
            });
        },
    };
};
