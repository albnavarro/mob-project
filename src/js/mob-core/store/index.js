import { getUnivoqueId } from '../utils';
import {
    storeComputedEntryPoint,
    storeQuickSetEntrypoint,
    storeSetEntryPoint,
} from './store-set';
import { updateMainMap } from './store-map';
import { inizializeAllProps, inizializeValidation } from './initial-validation';
import { watchEntryPoint } from './watch';
import { inizializeInstance } from './inizialize-instance';
import { storeGetEntryPoint, storeGetPropEntryPoint } from './store-get';
import { storeEmitAsyncEntryPoint, storeEmitEntryPoint } from './store-emit';
import {
    storeDebugEntryPoint,
    storeDebugStoreEntryPoint,
    storeDebugValidateEntryPoint,
    storeGetValidationEntryPoint,
} from './store-debug';
import { STORE_SET, STORE_UPDATE } from './constant';
import { getProxiEntryPoint } from './proxi';
import { bindStoreEntryPoint } from './bind-store';
import { destroyStoreEntryPoint } from './destroy';
import { checkIfPropIsComputed } from './store-utils';
import { useNextLoop } from '../utils/next-tick';
import { extractkeyFromProp, extractKeysFromArray } from './current-key';

/**
 * @param {import('./type').MobStoreParams} data
 * @returns {import('./type').MobStoreReturnType<any>}
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
     * Validate all props Perform a set() on all props, and update state First time strict has no effect
     */
    inizializeAllProps(instanceId, initialState);

    /**
     * Methods
     */
    return {
        getId: () => instanceId,
        bindStore: (value) => {
            bindStoreEntryPoint({ value, instanceId });
        },
        get: () => {
            return storeGetEntryPoint(instanceId);
        },
        getProp: (prop) => {
            return storeGetPropEntryPoint({ instanceId, prop });
        },
        set: (
            /** @type{string|(() => any)} */ prop,
            /** @type {any} */ value,
            { emit = true } = {}
        ) => {
            const propParsed = extractkeyFromProp(prop);
            const isComputed = checkIfPropIsComputed({
                instanceId,
                prop: propParsed,
            });

            if (isComputed) return;

            storeSetEntryPoint({
                instanceId,
                prop: propParsed,
                value,
                fireCallback: emit ?? true,
                clone: false,
                action: STORE_SET,
            });
        },
        update: (
            /** @type{string|(() => any)} */ prop,
            /** @type {any} */ value,
            { emit = true, clone = false } = {}
        ) => {
            const propParsed = extractkeyFromProp(prop);
            const isComputed = checkIfPropIsComputed({
                instanceId,
                prop: propParsed,
            });

            if (isComputed) return;

            storeSetEntryPoint({
                instanceId,
                prop: propParsed,
                value,
                fireCallback: emit ?? true,
                clone,
                action: STORE_UPDATE,
            });
        },
        getProxi: () => {
            return getProxiEntryPoint({ instanceId });
        },
        quickSetProp: (prop, value) => {
            const isComputed = checkIfPropIsComputed({ instanceId, prop });
            if (isComputed) return;

            storeQuickSetEntrypoint({ instanceId, prop, value });
        },
        watch: (
            /** @type{string|(() => any)} */ prop,
            /** @type {(current: any, previous: any, validation: import('./type').MobStoreValidateState) => void} */ callback,
            { wait = false, immediate = false } = {}
        ) => {
            const propParsed = extractkeyFromProp(prop);

            const unwatch = watchEntryPoint({
                instanceId,
                prop: propParsed,
                callback,
                wait,
            });

            if (immediate) {
                useNextLoop(() => {
                    storeEmitEntryPoint({ instanceId, prop: propParsed });
                });
            }

            return unwatch;
        },
        computed: (
            /** @type{string|(() => any)} */ prop,
            /** @type{(arg0: Record<string, any>) => any} */ callback,
            /** @type{( string|(() => any))[]} */ keys = []
        ) => {
            const propParsed = extractkeyFromProp(prop);
            const keysParsed = extractKeysFromArray(keys);

            storeComputedEntryPoint({
                instanceId,
                prop: propParsed,
                keys: keysParsed,
                callback,
            });

            useNextLoop(() => {
                storeEmitEntryPoint({ instanceId, prop: propParsed });
            });
        },
        emit: (/** @type{string|(() => any)} */ prop) => {
            const propParsed = extractkeyFromProp(prop);

            storeEmitEntryPoint({ instanceId, prop: propParsed });
        },
        emitAsync: async (/** @type{string|(() => any)} */ prop) => {
            const propParsed = extractkeyFromProp(prop);

            return storeEmitAsyncEntryPoint({ instanceId, prop: propParsed });
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
            destroyStoreEntryPoint(instanceId);
        },
    };
};
