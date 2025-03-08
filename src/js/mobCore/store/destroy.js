import { removeSelfIdToBindInstanceBy } from './bindStore';
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

    const { unsubscribeBindInstance, bindInstance } = state;

    /**
     * Unsubscribe binded watcher
     */
    unsubscribeBindInstance.forEach((unsubscribe) => {
        unsubscribe?.();
    });

    /**
     * Remove itself from bindInstanceBy of binded store.
     */
    bindInstance.forEach((id) => {
        removeSelfIdToBindInstanceBy({ selfId: instanceId, bindId: id });
    });

    removeStateFromMainMap(instanceId);
};
