import { getUnivoqueId } from '../utils';
import { getLogStyle } from './log-style';
import { getStateFromMainMap, updateMainMap } from './store-map';
import { storeWatchWarning } from './store-warining';

/**
 * @param {import('./type').MobStoreWatchAction} param
 * @returns {import('./type').MobStoreWatchReturnObject}
 */
const subscribeWatch = ({ state, prop, callback, wait }) => {
    const { store, callBackWatcher } = state;
    const logStyle = getLogStyle();

    if (!store)
        return {
            state: undefined,
            unsubscribeId: '',
        };

    if (!(prop in store)) {
        storeWatchWarning(prop, logStyle);

        return {
            state: undefined,
            unsubscribeId: '',
        };
    }

    const id = getUnivoqueId();
    callBackWatcher.set(id, { fn: callback, prop, wait });

    return {
        state: { ...state, callBackWatcher },
        unsubscribeId: id,
    };
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.unsubscribeId
 */
const unsubScribeWatch = ({ instanceId, unsubscribeId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { callBackWatcher } = state;
    if (!callBackWatcher) return;

    callBackWatcher.delete(unsubscribeId);
    updateMainMap(instanceId, { ...state, callBackWatcher });
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @param {boolean} param.wait
 * @param {(current: any, previous: any, validate: boolean | { [key: string]: boolean }) => void} param.callback
 * @returns {() => any}
 */
const watchMobStore = ({ instanceId, prop, callback, wait }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return () => {};

    const { state: newState, unsubscribeId } = subscribeWatch({
        state,
        prop,
        callback,
        wait,
    });

    if (!newState) return () => {};
    updateMainMap(instanceId, newState);

    return () => {
        unsubScribeWatch({ instanceId, unsubscribeId });
    };
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @param {(current: any, previous: any, validate: boolean | { [key: string]: boolean }) => void} param.callback
 * @param {boolean} param.wait
 * @returns {() => any}
 */
export const watchEntryPoint = ({ instanceId, prop, callback, wait }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return () => {};

    const { bindInstance, unsubscribeBindInstance } = state;

    if (!bindInstance || bindInstance.length === 0) {
        return watchMobStore({ instanceId, prop, callback, wait });
    }

    const currentBindId =
        [instanceId, ...bindInstance].find((id) => {
            const store = getStateFromMainMap(id)?.store;
            return store && prop in store;
        }) ?? '';

    const innerUnsubscribe = watchMobStore({
        instanceId: currentBindId,
        prop,
        callback,
        wait,
    });

    /**
     * WatchMobStore get/update store,
     *
     * - If prop is in current instanceId watchMobStore update state.
     * - So reload fresh state.
     */
    const stateAfterWatchInit = getStateFromMainMap(instanceId);
    if (!stateAfterWatchInit) return () => {};

    updateMainMap(instanceId, {
        ...stateAfterWatchInit,
        unsubscribeBindInstance: [...unsubscribeBindInstance, innerUnsubscribe],
    });

    return () => {
        innerUnsubscribe();

        const stateAfterUnsubscribe = getStateFromMainMap(instanceId);
        if (!stateAfterUnsubscribe) return;

        updateMainMap(instanceId, {
            ...stateAfterUnsubscribe,
            unsubscribeBindInstance: unsubscribeBindInstance.filter(
                (unsubscribe) => unsubscribe !== innerUnsubscribe
            ),
        });
    };
};
