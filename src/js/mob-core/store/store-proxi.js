// store-proxi.js (modificato)

import {
    PROXI_ALL,
    PROXI_BOUNDED,
    PROXI_KEY_IN_MAP,
    PROXI_SELF,
    STORE_SET,
} from './constant';
import { setCurrentDependencies } from './current-key';
import { getLogStyle } from './log-style';
import { storeMap, updateMainMap } from './store-map';
import { storeSetEntryPoint } from './store-set';
import { checkType } from './store-type';
import { checkIfPropIsComputed } from './store-utils';
import {
    storeComputedPropUsedWarning,
    storePropInProxiWarning,
    storeProxiReadOnlyWarning,
} from './store-warining';

/**
 * Controlla se il valore è un oggetto che dovrebbe essere congelato (non primitivi, non Map/Set che devono rimanere
 * modificabili)
 *
 * @param {any} value
 * @returns {boolean}
 */
const shouldFreeze = (value) => {
    /**
     * Non congelare null/undefined
     */
    if (value == null) return false;

    /**
     * Non congelare primitivi
     */
    if (!checkType(Object, value)) return false;

    /**
     * NON congelare Map e Set - l'utente deve poterli usare con .set/.get e poi chiamare emit manualmente
     */
    if (checkType(Map, value)) return false;
    if (checkType(Set, value)) return false;

    /**
     * Non congelare funzioni
     */
    if (checkType(Function, value)) return false;

    /**
     * Congela Array e Object normali
     */
    return true;
};

/**
 * Crea un proxy dinamico con protezione anti-mutazione nested.
 *
 * - Get: legge da self e binded stores, restituisce valori congelati
 * - Set: scrive SOLO su self store
 *
 * @param {string} instanceId
 * @param {'PROXI_ALL' | 'PROXI_SELF' | 'PROXI_BOUNDED'} strategy
 * @returns {Record<string, any>}
 */
const createDynamicProxy = (instanceId, strategy) => {
    const logStyle = getLogStyle();

    return new Proxy(
        {},
        {
            set(_, /** @type {string} */ prop, value) {
                const mainState = storeMap.get(instanceId);
                if (!mainState) return false;

                /**
                 * Set operation is applied only in `self` store.
                 */
                if (!Object.hasOwn(mainState.store, prop)) {
                    storePropInProxiWarning(prop, logStyle);
                    return false;
                }

                const isComputed = checkIfPropIsComputed({ instanceId, prop });
                const isReadOnly = mainState.proxiReadOnlyProp.has(prop);

                if (isReadOnly) storeProxiReadOnlyWarning(prop, logStyle);
                if (isComputed) storeComputedPropUsedWarning(prop, logStyle);

                if (isComputed || isReadOnly) return false;

                storeSetEntryPoint({
                    instanceId,
                    prop,
                    value,
                    fireCallback: true,
                    clone: false,
                    action: STORE_SET,
                });

                return true;
            },

            get(_, /** @type {string} */ prop) {
                if (!storeMap.has(instanceId)) return;

                const state = storeMap.get(instanceId);
                if (!state) return;

                let value;

                /**
                 * Cerca prima in self, poi nei binded
                 */
                if (strategy === PROXI_ALL) {
                    if (Object.hasOwn(state.store, prop)) {
                        value = state.store[prop];
                        setCurrentDependencies(prop);
                    }

                    if (!Object.hasOwn(state.store, prop)) {
                        for (const bindId of state.bindInstance) {
                            const bindState = storeMap.get(bindId);

                            if (
                                bindState &&
                                Object.hasOwn(bindState.store, prop)
                            ) {
                                value = bindState.store[prop];
                                setCurrentDependencies(prop);
                                break;
                            }
                        }
                    }
                }

                /**
                 * Only self store
                 */
                if (
                    strategy === PROXI_SELF &&
                    Object.hasOwn(state.store, prop)
                ) {
                    value = state.store[prop];
                    setCurrentDependencies(prop);
                }

                /**
                 * Only bounded store
                 */
                if (
                    strategy === PROXI_BOUNDED &&
                    !Object.hasOwn(state.store, prop)
                ) {
                    for (const bindId of state.bindInstance) {
                        const bindState = storeMap.get(bindId);

                        if (bindState && Object.hasOwn(bindState.store, prop)) {
                            value = bindState.store[prop];
                            setCurrentDependencies(prop);
                            break;
                        }
                    }
                }

                if (value === undefined) return;

                /**
                 * QUesto controllo serve a spinge l'uso della riassegnazione.
                 *
                 * Se è un Object o Array. restituisci una versione congelata.
                 *
                 * Map e Set rimangono modificabili (l'utente deve usare emit).
                 *
                 * NOTA:
                 *
                 * Non usiamo Object.freeze() direttamente sul valore originale per non rompere lo store interno.
                 * Creiamo una shallow copy e la congeliamo.
                 *
                 * Es:
                 *
                 * - Proxi.myObj.prop = 2;
                 * - `proxi.myObj`, qui il getter del proxi viene invocato resituendo un aversione congelata
                 * - `.prop = 2`, qui viene invocato il setter ma il valore é congelato.
                 */
                if (shouldFreeze(value)) {
                    /**
                     * Shallow copy + freeze per bloccare mutazioni nested
                     *
                     * Ma permettere comunque la lettura delle proprietà
                     */
                    if (Array.isArray(value)) return Object.freeze([...value]);
                    return Object.freeze({ ...value });
                }

                return value;
            },

            has(_, /** @type {string} */ prop) {
                if (!storeMap.has(instanceId)) return false;

                const state = storeMap.get(instanceId);
                if (!state) return false;

                /**
                 * All stores
                 */
                if (strategy === PROXI_ALL) {
                    /**
                     * HAS: cerca prima in self, poi nei binded
                     */
                    if (Object.hasOwn(state.store, prop)) return true;

                    for (const bindId of state.bindInstance) {
                        const bindState = storeMap.get(bindId);
                        if (bindState && Object.hasOwn(bindState.store, prop))
                            return true;
                    }
                }

                /**
                 * Self stores
                 */
                if (strategy === PROXI_SELF && Object.hasOwn(state.store, prop))
                    return true;

                /**
                 * Bounded stores
                 */
                if (strategy === PROXI_BOUNDED) {
                    for (const bindId of state.bindInstance) {
                        const bindState = storeMap.get(bindId);
                        if (bindState && Object.hasOwn(bindState.store, prop))
                            return true;
                    }
                }

                return false;
            },
        }
    );
};

/**
 * @param {object} params
 * @param {string} params.instanceId
 * @param {'PROXI_ALL' | 'PROXI_SELF' | 'PROXI_BOUNDED'} params.strategy
 * @returns {Record<string, any>}
 */
export const getProxiEntryPoint = ({ instanceId, strategy = PROXI_ALL }) => {
    const state = storeMap.get(instanceId);
    if (!state) return {};

    /**
     * Return proxy if exist, otherwise create new one.
     */
    if (strategy === PROXI_ALL && state.proxiObject) {
        return state.proxiObject;
    }

    if (strategy === PROXI_SELF && state.selfProxiObject) {
        return state.selfProxiObject;
    }

    if (strategy === PROXI_BOUNDED && state.boundedProxiObject) {
        return state.boundedProxiObject;
    }

    const proxiObject = createDynamicProxy(instanceId, strategy);

    updateMainMap(instanceId, {
        ...state,
        [PROXI_KEY_IN_MAP[strategy]]: proxiObject,
    });

    return proxiObject;
};
