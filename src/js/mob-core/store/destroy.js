import { removeSelfIdToBindInstanceBy } from './bind-store';
import { removeIdFromWaitMap } from './fire-queque';
import { removeStateFromMainMap, storeMap } from './store-map';

/**
 * @param {string} instanceId
 * @returns {void}
 */
export const destroyStoreEntryPoint = (instanceId) => {
    /**
     * Here use original map not a copies.
     */
    const state = storeMap.get(instanceId);
    if (!state) return;

    /**
     * Warning: This store is referencied by another store, destroy the store may generate unespected behaviour.
     */
    if (state.bindInstanceBy.length > 0)
        console.warn(
            `${instanceId} store will be destroyed but is used by another store.`
        );

    state.callBackComputed.clear();
    state.computedPropsQueque.clear();
    state.watcherByProp.clear();
    state.watcherMetadata.clear();
    state.store = {};
    state.proxiObject = null;

    const { unsubscribeBindInstance, bindInstance } = state;

    /**
     * Unsubscribe binded watcher
     */
    [...unsubscribeBindInstance].toReversed().forEach((unsubscribe) => {
        unsubscribe?.();
    });

    state.unsubscribeBindInstance.length = 0;

    /**
     * Remove itself from bindInstanceBy of binded store.
     */
    bindInstance.forEach((id) => {
        removeSelfIdToBindInstanceBy({ selfId: instanceId, bindId: id });
    });

    /**
     * Clean global wait map.
     */
    removeIdFromWaitMap(instanceId);
    removeStateFromMainMap(instanceId);
};
