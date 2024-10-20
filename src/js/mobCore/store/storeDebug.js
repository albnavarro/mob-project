import { getStateFromMainMap } from './storeMap';

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeGetValidationEntryPoint = ({ instanceId }) => {
    const { validationStatusObject } = getStateFromMainMap(instanceId);
    return validationStatusObject;
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeDebugStoreEntryPoint = ({ instanceId }) => {
    const { store } = getStateFromMainMap(instanceId);
    console.log(store);
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 */
export const storeDebugValidateEntryPoint = ({ instanceId }) => {
    const { validationStatusObject } = getStateFromMainMap(instanceId);
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
