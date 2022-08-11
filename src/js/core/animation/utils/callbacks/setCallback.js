import { callBackStore } from './callBackStore';
import { handleCache } from '../../../events/rafutils/handleCache.js';

export const setCallBack = ({ cb, cbArray, context }) => {
    const { id } = callBackStore.get();
    context[cbArray].push({ cb, id });
    const prevId = id;
    callBackStore.set('id', id + 1);

    return {
        unsubscribeCb: () => {
            context[cbArray] = context[cbArray].filter(
                (item) => item.id !== prevId
            );
        },
    };
};

export const setCallBackCache = ({
    item,
    fn,
    cbArray,
    cbUnsubScribe,
    context,
}) => {
    const { id } = callBackStore.get();
    const { id: cacheId, unsubscribe } = handleCache.add(item, fn);
    context[cbArray].push({ cb: cacheId, id });
    context[cbUnsubScribe].push(unsubscribe);

    const prevId = id;
    callBackStore.set('id', id + 1);

    return {
        unsubscribeCb: () => {
            unsubscribe();
            context[cbArray] = context[cbArray].filter(
                (item) => item.id !== prevId
            );
        },
    };
};
