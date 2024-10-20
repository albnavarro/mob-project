// @ts-check

import { getUnivoqueId } from '../utils';
import {
    storeComputedEntryPoint,
    storeQuickSetEntrypoint,
    storeSetEntryPoint,
} from './storeSet';
import { removeStateFromMainMap, updateMainMap } from './storeMap';
import { inizializeAllProps, inizializeValidation } from './initialValidation';
import { watchEntryPoint } from './watch';
import { inizializeInstance } from './inizializeInstance';
import { storeGetEntryPoint, storeGetPropEntryPoint } from './storeGet';
import { storeEmitAsyncEntryPoint, storeEmitEntryPoint } from './storeEmit';
import {
    storeDebugEntryPoint,
    storeDebugStoreEntryPoint,
    storeDebugValidateEntryPoint,
    storeGetValidationEntryPoint,
} from './storeDebug';

/**
 * @param {import('./type').mobStoreBaseData} data
 * @returns {import('./type').storePublicMethods}
 */
export const mobStore = (data = {}) => {
    /**
     * Get new uniquie id for new store.
     */
    const instanceId = getUnivoqueId();

    /**
     * Initialize
     */
    const initialState = inizializeInstance(data);

    /**
     * Create validation object
     */
    const stateUpdated = inizializeValidation(initialState);
    updateMainMap(instanceId, stateUpdated);

    /**
     * Validate all props
     * Perform a set() on all props, and update state
     * First time strict has no effect
     */
    inizializeAllProps(instanceId, initialState);

    /**
     * Methods
     */
    return {
        get: () => {
            return storeGetEntryPoint(instanceId);
        },
        getProp: (prop) => {
            return storeGetPropEntryPoint({ instanceId, prop });
        },
        set: (prop, value, fireCallback = true, clone = false) => {
            storeSetEntryPoint({
                instanceId,
                prop,
                value,
                fireCallback,
                clone,
            });
        },
        quickSetProp: (prop, value) => {
            storeQuickSetEntrypoint({ instanceId, prop, value });
        },
        watch: (prop, callback) => {
            return watchEntryPoint({ instanceId, prop, callback });
        },
        computed: (prop, keys, callback) => {
            storeComputedEntryPoint({
                instanceId,
                prop,
                keys,
                callback,
            });
        },
        emit: (prop) => {
            storeEmitEntryPoint({ instanceId, prop });
        },
        emitAsync: async (prop) => {
            return storeEmitAsyncEntryPoint({ instanceId, prop });
        },
        getValidation: () => {
            return storeGetValidationEntryPoint({ instanceId });
        },
        debug: () => {
            storeDebugEntryPoint({ instanceId });
        },
        debugStore: () => {
            storeDebugStoreEntryPoint({ instanceId });
        },
        debugValidate: () => {
            storeDebugValidateEntryPoint({ instanceId });
        },
        destroy: () => {
            removeStateFromMainMap(instanceId);
        },
    };
};
