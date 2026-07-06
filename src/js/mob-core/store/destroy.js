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
    state.selfProxiObject = null;
    state.boundedProxiObject = null;

    const { unsubscribeBindInstance, bindInstance } = state;

    /**
     * Unsubscribe binded watcher
     */
    for (const unsubscribe of [...unsubscribeBindInstance].toReversed()) {
        unsubscribe?.();
    }

    state.unsubscribeBindInstance.length = 0;

    /**
     * Remove itself from bindInstanceBy of binded store.
     */
    for (const id of bindInstance) {
        removeSelfIdToBindInstanceBy({ selfId: instanceId, bindId: id });
    }

    /**
     * Clean global wait map.
     */
    removeIdFromWaitMap(instanceId);
    removeStateFromMainMap(instanceId);
};
