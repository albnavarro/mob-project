import { getUnivoqueId } from '../utils';
import {
    storeComputedEntryPoint,
    storeQuickSetEntrypoint,
    storeSetEntryPoint,
} from './store-set';
import { updateMainMap } from './store-map';
import { inizializeAllProps, inizializeValidation } from './initial-validation';
import { watchEntryPoint } from './store-watch';
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
import { getProxiEntryPoint } from './store-proxi';
import { bindStoreEntryPoint } from './bind-store';
import { destroyStoreEntryPoint } from './destroy';
import { checkIfPropIsComputed } from './store-utils';
import { useNextLoop } from '../utils/next-tick';
import { extractkeyFromProp, extractKeysFromArray } from './current-key';
import { setProxiPropReadOnlyEntryPoint } from './proxi-read-only';

/**
 * This module implements a reactive store.
 *
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
            /**
             * Note:
             *
             * - In a normal flow store the bind another Store ( this store ) must be destroyed before binded store.
             * - This store use component and potentially other methods that referee to binded store
             * - So this stor emust be removed before binded store.
             */
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
            { emit = true, usePropAsString = false } = {}
        ) => {
            /**
             * MobJs for check prop use the same function.
             *
             * - Prop in this case is always a string
             */
            const propParsed = usePropAsString
                ? /** @type {string} */ (prop)
                : extractkeyFromProp(prop);

            /**
             * StoreSetEntryPoint is called by compured, proxi etc..
             *
             * - So isComputed check is isolated outSide entryPoint
             */
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
            { emit = true, clone = false, usePropAsString = false } = {}
        ) => {
            /**
             * MobJs for check prop use the same function.
             *
             * - Prop in this case is always a string
             */
            const propParsed = usePropAsString
                ? /** @type {string} */ (prop)
                : extractkeyFromProp(prop);

            /**
             * StoreSetEntryPoint is called by compured, proxi etc..
             *
             * - So isComputed check is isolated outSide entryPoint
             */
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
        /**
         * Restituisce un Proxy reattivo sullo store.
         *
         * - IMPORTANTE: Se usi `bindStore()`, chiámalo PRIMA di `getProxi()`.
         * - Il proxy viene creato e cachato alla prima chiamata;
         * - Binding successivi non saranno riflessi nell'istanza proxy esistente.
         */
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
            /** @type{( string|(() => any))[]} */ keys = [],
            { usePropAsString = false } = {}
        ) => {
            /**
             * MobJs for check prop use the same function.
             *
             * - Prop in this case is always a string
             */
            const propParsed = usePropAsString
                ? /** @type {string} */ (prop)
                : extractkeyFromProp(prop);

            const keysParsed = extractKeysFromArray(keys);

            /**
             * - Insiee entryPoint check is compured is duplicated.
             */
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
        setProxiReadOnlyProp: (values) => {
            setProxiPropReadOnlyEntryPoint({ instanceId, values });
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
