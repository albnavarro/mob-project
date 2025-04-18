// @ts-check

import { getLogStyle } from './log-style';
import { getStateFromMainMap, storeMap } from './store-map';
import { storeGetPropWarning } from './store-warining';

/**
 * @param {string} instanceId
 * @returns {{ [key: string]: any | { [key: string]: any } }}
 */
const storeGet = (instanceId) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return {};

    const { store } = state;
    return store ?? {};
};

/**
 * @param {string} instanceId
 * @returns {{ [key: string]: any | { [key: string]: any } }}
 */
export const storeGetEntryPoint = (instanceId) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return {};

    const { bindInstance } = state;

    if (!bindInstance || bindInstance.length === 0) {
        return storeGet(instanceId);
    }

    return [...bindInstance, instanceId]
        .map((id) => storeGet(id))
        .reduce((previous, current) => ({ ...previous, ...current }), {});
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {any}
 */
export const storeGetProp = ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const store = state?.store;

    if (store && prop in store) {
        return store[prop];
    } else {
        storeGetPropWarning(prop, getLogStyle());
        return;
    }
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {any}
 */
export const storeGetPropEntryPoint = ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { bindInstance } = state;

    if (!bindInstance || bindInstance.length === 0) {
        return storeGetProp({ instanceId, prop });
    }

    const currentBindId =
        [instanceId, ...bindInstance].find((id) => {
            const store = storeMap.get(id)?.store;
            return store && prop in store;
        }) ?? '';

    return storeGetProp({ instanceId: currentBindId, prop });
};
