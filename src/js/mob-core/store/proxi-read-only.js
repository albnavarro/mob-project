import { getStateFromMainMap, updateMainMap } from './store-map';

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string[]} param.values
 * @returns {void}
 */
export const setProxiPropReadOnlyEntryPoint = ({ instanceId, values }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { proxiReadOnlyProp } = state;

    values.forEach((value) => {
        proxiReadOnlyProp.add(value);
    });

    updateMainMap(instanceId, state);
};
