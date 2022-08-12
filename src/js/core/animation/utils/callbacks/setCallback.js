import { callBackStore } from './callBackStore';
import { handleCache } from '../../../events/rafutils/handleCache.js';

export const setCallBack = (cb, cbArray) => {
    const { id } = callBackStore.get();
    cbArray.push({ cb, id });
    const prevId = id;
    callBackStore.set('id', id + 1);

    return () => cbArray.filter((item) => item.id !== prevId);
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
        unsubscribeCb: () => {
            unsubscribe();
            return (cbArray = cbArray.filter((item) => item.id !== prevId));
        },
    };
};
