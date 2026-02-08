import { getUnivoqueId } from '../utils';
import { getLogStyle } from './log-style';
import { getStateFromMainMap, updateMainMap } from './store-map';
import { storeWatchWarning } from './store-warining';

/**
 * @param {import('./type').MobStoreWatchAction} param
 * @returns {import('./type').MobStoreWatchReturnObject}
 */
const subscribeWatch = ({ state, prop, callback, wait }) => {
    const { store, watcherByProp, watcherMetadata } = state;
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

    /**
     * Check if watcherByProp has current prop, if not create.
     */
    if (!watcherByProp.has(prop)) watcherByProp.set(prop, new Map());

    /**
     * Add data ( callback && wait value ) to current callbacks quque by prop.
     */
    watcherByProp.get(prop)?.set(id, { fn: callback, wait });

    /**
     * Add reference id ( unsubscribeId ) -> prop for fast unsubscribe.
     *
     * - Get prop from id
     * - Clean from watcherByProp record inside prop subMap.
     */
    watcherMetadata.set(id, prop);

    return {
        state: { ...state, watcherByProp, watcherMetadata },
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

    const { watcherByProp, watcherMetadata } = state;
    if (!watcherByProp || !watcherMetadata) return;

    /**
     * Get reference prop by unsubscribeId
     */
    const prop = watcherMetadata.get(unsubscribeId);

    if (prop) {
        /**
         * - Delete record from watcherByProp.
         * - Remove record from watcherMetadata.
         */
        watcherByProp.get(prop)?.delete(unsubscribeId);
        watcherMetadata.delete(unsubscribeId);

        /**
         * - In case there is no more prop active remove main record from watcherByProp.
         */
        if (watcherByProp.get(prop)?.size === 0) {
            watcherByProp.delete(prop);
        }

        updateMainMap(instanceId, { ...state, watcherByProp, watcherMetadata });
    }
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
            unsubscribeBindInstance:
                stateAfterUnsubscribe.unsubscribeBindInstance.filter(
                    (unsubscribe) => unsubscribe !== innerUnsubscribe
                ),
        });
    };
};
