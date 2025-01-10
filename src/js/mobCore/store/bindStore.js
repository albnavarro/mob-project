import { getStateFromMainMap, updateMainMap } from './storeMap';
import { checkType } from './storeType';

/**
 * @param {object} params
 * @param {import("./type").bindStoreValueType} params.value
 * @param {string} params.instanceId
 * @returns { void }
 */
export const bindStoreEntryPoint = ({ value, instanceId }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { bindInstance } = state;
    if (!bindInstance) return;

    const ids = checkType(Array, value)
        ? // @ts-ignore
          value.map((/** @type {getIdI: () => string} */ store) =>
              store.getId()
          )
        : // @ts-ignore
          [value.getId()];

    const bindInstanceUpdated = [...bindInstance, ...ids];

    updateMainMap(instanceId, {
        ...state,
        bindInstance: bindInstanceUpdated,
    });
};
