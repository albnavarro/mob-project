import { getStateFromMainMap } from './storeMap';

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
    console.log(store);
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeDebugValidateEntryPoint = ({ instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { validationStatusObject } = state;
    console.log(validationStatusObject);
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeDebugEntryPoint = ({ instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    console.log(state);
};
