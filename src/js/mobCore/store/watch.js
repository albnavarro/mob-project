// @ts-check

import { getUnivoqueId } from '../utils';
import { getLogStyle } from './logStyle';
import { getStateFromMainMap, storeMap, updateMainMap } from './storeMap';
import { storeWatchWarning } from './storeWarining';

/**
 * @param {import("./type").storeWatchAction} param
 * @returns {import('./type').storeWatchReturnObject}
 */
export const storeWatchAction = ({ state, prop, callback, wait }) => {
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
export const unsubScribeWatch = ({ instanceId, unsubscribeId }) => {
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
export const watchMobStore = ({ instanceId, prop, callback, wait }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return () => {};

    const { state: newState, unsubscribeId } = storeWatchAction({
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
            const store = storeMap.get(id)?.store;
            return store && prop in store;
        }) ?? '';

    const unsubscribe = watchMobStore({
        instanceId: currentBindId,
        prop,
        callback,
        wait,
    });

    updateMainMap(instanceId, {
        ...state,
        unsubscribeBindInstance: [...unsubscribeBindInstance, unsubscribe],
    });

    return unsubscribe;
};
