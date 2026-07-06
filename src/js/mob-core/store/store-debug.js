import { getStateFromMainMap } from './store-map';

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeGetValidationEntryPoint = ({ instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { validationStatusObject } = state;
    return validationStatusObject;
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeDebugStoreEntryPoint = ({ instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { store } = state;
    console.log(JSON.stringify(store, null, 2));
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeDebugValidateEntryPoint = ({ instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { validationStatusObject } = state;
    console.log(JSON.stringify(validationStatusObject, null, 2));
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeDebugEntryPoint = ({ instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    console.log(JSON.stringify(state, null, 2));
};
