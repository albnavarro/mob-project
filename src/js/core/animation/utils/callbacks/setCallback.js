import { callBackStore } from './callBackStore';
import { handleCache } from '../../../events/rafutils/handleCache.js';

/**
 * @callback subscribeCallbackType
 * @param {Object.<string, number>} props
 */

export const setCallBack = (cb, arr) => {
    const { id } = callBackStore.get();
    arr.push({ cb, id });
    const prevId = id;
    callBackStore.set('id', id + 1);

    // Disable single stagger without modify staggers order
    return (arr) =>
        arr.map(({ id, cb, index, frame }) => {
            if (id === prevId) cb = () => {};
            return { id, cb, index, frame };
        });
};

export const setCallBackCache = (item, fn, cbArray, unsubscribeCache) => {
    const { id } = callBackStore.get();
    const { id: cacheId, unsubscribe } = handleCache.add(item, fn);
    cbArray.push({ cb: cacheId, id });
    unsubscribeCache.push(unsubscribe);

    const prevId = id;
    callBackStore.set('id', id + 1);

    return {
        unsubscribeCache,
        unsubscribeCb: (arr) => {
            unsubscribe();
            // Disable single stagger without modify staggers order
            return arr.map(({ id, cb, index, frame }) => {
                if (id === prevId) cb = () => {};
                return { id, cb, index, frame };
            });
        },
    };
};
