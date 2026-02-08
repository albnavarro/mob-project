import { runCallbackQueqe, runCallbackQueqeAsync } from './fire-queque';
import { getLogStyle } from './log-style';
import { getStateFromMainMap, storeMap } from './store-map';
import { addToComputedWaitLsit } from './store-set';
import { storeEmitWarning } from './store-warining';

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {void}
 */
const storeEmit = ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;
    const { store, watcherByProp, validationStatusObject, bindInstanceBy } =
        state;

    if (!store) return;

    if (prop in store) {
        runCallbackQueqe({
            watcherByProp,
            prop,
            newValue: store[prop],
            oldValue: store[prop],
            validationValue: validationStatusObject[prop],
            instanceId,
        });

        /**
         * AddToComputedWaitLsit get and update map.
         */
        addToComputedWaitLsit({ instanceId, prop });
        bindInstanceBy.forEach((id) => {
            addToComputedWaitLsit({ instanceId: id, prop });
        });
    } else {
        storeEmitWarning(prop, getLogStyle());
    }
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {void}
 */
export const storeEmitEntryPoint = ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { bindInstance } = state;

    /**
     * Emit prop from itSelf and exit
     */
    if (!bindInstance || bindInstance.length === 0) {
        storeEmit({ instanceId, prop });
        return;
    }

    /**
     * Emit prop from binded store
     */
    const currentBindId =
        [instanceId, ...bindInstance].find((id) => {
            const store = storeMap.get(id)?.store;
            return store && prop in store;
        }) ?? '';

    /**
     * StoreEmit get and update map.
     */
    storeEmit({ instanceId: currentBindId, prop });
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {Promise<{ success: boolean }>}
 */
const storeEmitAsync = async ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return new Promise((resolve) => resolve({ success: false }));

    const { store, watcherByProp, validationStatusObject, bindInstanceBy } =
        state;

    if (!store) return new Promise((resolve) => resolve({ success: false }));

    if (prop in store) {
        await runCallbackQueqeAsync({
            watcherByProp,
            prop,
            newValue: store[prop],
            oldValue: store[prop],
            validationValue: validationStatusObject[prop],
        });

        addToComputedWaitLsit({ instanceId, prop });
        bindInstanceBy.forEach((id) => {
            addToComputedWaitLsit({ instanceId: id, prop });
        });

        return { success: true };
    } else {
        storeEmitWarning(prop, getLogStyle());
        return { success: false };
    }
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {Promise<any>}
 */
export const storeEmitAsyncEntryPoint = async ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return new Promise((resolve) => resolve(''));

    const { bindInstance } = state;

    if (!bindInstance || bindInstance.length === 0) {
        return storeEmitAsync({ instanceId, prop });
    }

    const currentBindId =
        [instanceId, ...bindInstance].find((id) => {
            const store = storeMap.get(id)?.store;
            return store && prop in store;
        }) ?? '';

    return storeEmitAsync({
        instanceId: currentBindId,
        prop,
    });
};
