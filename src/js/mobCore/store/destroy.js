import { getStateFromMainMap, removeStateFromMainMap } from './storeMap';

/**
 * @param {string} instanceId
 * @returns { void }
 */
export const destroyStoreEntryPoint = (instanceId) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    state.callBackWatcher.clear();
    state.callBackComputed.clear();
    state.computedPropsQueque.clear();
    state.store = {};
    state.proxiObject = null;

    const { unsubscribeBindInstance } = state;

    unsubscribeBindInstance.forEach((unsubscribe) => {
        unsubscribe?.();
    });

    removeStateFromMainMap(instanceId);
};
