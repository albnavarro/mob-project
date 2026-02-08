// store-proxi.js (modificato)

import { STORE_SET } from './constant';
import { setCurrentDependencies } from './current-key';
import { getLogStyle } from './log-style';
import { storeMap, updateMainMap } from './store-map';
import { storeSetEntryPoint } from './store-set';
import { checkType } from './store-type';
import { checkIfPropIsComputed } from './store-utils';
import { storeProxiReadOnlyWarning } from './store-warining';

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
 * @returns {Record<string, any>}
 */
const createDynamicProxy = (instanceId) => {
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
                if (!(prop in mainState.store)) return false;

                const isComputed = checkIfPropIsComputed({ instanceId, prop });
                const isReadOnly = mainState.proxiReadOnlyProp.has(prop);

                if (isReadOnly) storeProxiReadOnlyWarning(prop, logStyle);
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
                if (prop in state.store) {
                    value = state.store[prop];
                    setCurrentDependencies(prop);
                }

                if (!(prop in state.store)) {
                    for (const bindId of state.bindInstance) {
                        const bindState = storeMap.get(bindId);

                        if (bindState && prop in bindState.store) {
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
                 * HAS: cerca prima in self, poi nei binded
                 */
                if (prop in state.store) return true;

                for (const bindId of state.bindInstance) {
                    const bindState = storeMap.get(bindId);
                    if (bindState && prop in bindState.store) return true;
                }

                return false;
            },
        }
    );
};

/**
 * @param {object} params
 * @param {string} params.instanceId
 * @returns {Record<string, any>}
 */
export const getProxiEntryPoint = ({ instanceId }) => {
    const state = storeMap.get(instanceId);
    if (!state) return {};

    if (state.proxiObject) {
        return state.proxiObject;
    }

    const proxiObject = createDynamicProxy(instanceId);

    updateMainMap(instanceId, {
        ...state,
        proxiObject,
    });

    return proxiObject;
};
