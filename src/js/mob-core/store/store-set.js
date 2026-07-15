import { useNextLoop } from '../utils/next-tick';
import { checkEquality } from './check-equality';
import { STORE_SET, STORE_UPDATE } from './constant';
import {
    getCurrentDependencies,
    initializeCurrentDependencies,
} from './current-key';
import { runCallbackQueqe } from './fire-queque';
import { getLogStyle } from './log-style';
import { getStateFromMainMap, updateMainMap } from './store-map';
import { checkType, storeType, TYPE_IS_ANY } from './store-type';
import {
    checkIfPropIsComputed,
    cloneValueOrGet,
    maxDepth,
} from './store-utils';
import {
    storeComputedKeyUsedWarning,
    storeObjectIsNotAnyWarning,
    storeSetObjDepthWarning,
    storeSetObjectPropWarning,
    storeSetObjectValWarning,
    storeSetObjKeysWarning,
    storeSetObjTypeWarning,
    storeSetPropPropWarning,
    storeSetPropTypeWarning,
    storeSetPropValWarning,
    storeSetWarning,
    storeValidationFailInCreation,
} from './store-warining';

/**
 * ## SET
 */

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @param {any} param.val
 * @param {boolean} param.fireCallback
 * @param {boolean} param.useStrict
 * @param {boolean} [param.initalizeStep]
 * @returns {void}
 */
const setProp = ({
    instanceId,
    prop,
    val,
    fireCallback = true,
    useStrict = true,
    initalizeStep = false,
}) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const {
        type,
        fnTransformation,
        store,
        fnValidate,
        strict,
        validationStatusObject,
        skipEqual,
        watcherByProp,
        bindInstanceBy,
    } = state;
    const logStyle = getLogStyle();

    const isCustomObject = type[prop] === TYPE_IS_ANY;

    /**
     * Check if val is an Object
     */
    if (storeType.isObject(val) && !isCustomObject) {
        storeSetPropValWarning(prop, val, logStyle);
        return;
    }

    /**
     * Check if prop is an Object
     */
    if (storeType.isObject(store[prop]) && !isCustomObject) {
        storeSetPropPropWarning(prop, logStyle);
        return;
    }

    /**
     * Get old value
     */
    const oldVal = store[prop];

    /**
     * Transform value
     *
     * - Skip initialization step
     */
    const valueTransformed = initalizeStep
        ? val
        : /** @type{{[key:string]: ((current: any, previous: any) => any)}} */ (
              fnTransformation[prop]?.(val, oldVal) ?? val
          );

    /**
     * Validation
     */
    const isValidType = checkType(type[prop], valueTransformed);
    if (!isValidType) {
        storeSetPropTypeWarning(prop, valueTransformed, type[prop], logStyle);
        return;
    }

    /**
     * Get validate status
     */
    const isValidated = /** @type {Object<string, function>} */ (fnValidate)[
        prop
    ]?.(valueTransformed, oldVal);

    /**
     * In creation step advise that validation is failed.
     */
    if (!isValidated && initalizeStep) {
        storeValidationFailInCreation(prop, logStyle);
    }

    /**
     * In strict mode return is prop is not valid
     */
    if (strict[prop] === true && !isValidated && useStrict) return;

    /**
     * Update validation array.
     */
    validationStatusObject[prop] = isValidated;

    /**
     * Check if last value is equal new value. if true and skipEqual is true for this prop return.
     */
    const isEqual =
        skipEqual[prop] === true
            ? checkEquality(type[prop], oldVal, valueTransformed)
            : false;

    if (isEqual && !initalizeStep) return;

    /**
     * Finally set new value
     */
    store[prop] = valueTransformed;

    /**
     * Update map before fire addToComputedWaitLsit
     */
    updateMainMap(instanceId, { ...state, store, validationStatusObject });

    /**
     * Fire callback
     */
    if (fireCallback && !initalizeStep) {
        runCallbackQueqe({
            watcherByProp,
            prop,
            newValue: valueTransformed,
            oldValue: oldVal,
            validationValue: validationStatusObject[prop],
            instanceId,
        });

        /**
         * AddToComputedWaitLsit get and update map.
         */
        addToComputedWaitLsit({ instanceId, prop });
        for (const id of bindInstanceBy) {
            addToComputedWaitLsit({ instanceId: id, prop });
        }
    }
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @param {any} param.val
 * @param {boolean} param.fireCallback
 * @param {boolean} param.useStrict
 * @param {boolean} [param.initalizeStep]
 * @returns {void}
 */
const setObj = ({
    instanceId,
    prop,
    val,
    fireCallback = true,
    useStrict = true,
    initalizeStep = false,
}) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const {
        store,
        type,
        strict,
        fnTransformation,
        fnValidate,
        validationStatusObject,
        skipEqual,
        watcherByProp,
        bindInstanceBy,
    } = state;
    const logStyle = getLogStyle();

    /**
     * Check if val is not an Object
     */
    if (!storeType.isObject(val)) {
        storeSetObjectValWarning(prop, val, logStyle);
        return;
    }

    /**
     * Check if prop is not an Object
     */
    if (!storeType.isObject(store[prop])) {
        storeSetObjectPropWarning(prop, logStyle);
        return;
    }

    /**
     * Check if prop has val keys
     */
    const valKeys = Object.keys(val);
    const propKeys = Object.keys(store[prop]);
    const hasKeys = valKeys.every((item) => propKeys.includes(item));
    if (!hasKeys) {
        storeSetObjKeysWarning(valKeys, prop, logStyle);
        return;
    }

    /**
     * Transform value
     */
    const valueTransformed = initalizeStep
        ? val
        : Object.fromEntries(
              Object.entries(val).map((item) => {
                  const [subProp, subVal] = item;
                  const subValOld = store[prop][subProp];

                  /**
                   * Trasforma il valore solo se il dato è effettivamente cambiato.
                   *
                   * - Confrontiamo il nuovo valore con il vecchio valore trasformato
                   * - Se coincidono non abbiamo bisogno di traformarlo
                   * - Questo permetti di modificare una sola propietá senza triggere un nuovo transform in una propietá
                   *   non mutata.
                   */
                  if (checkEquality(type[prop][subProp], subVal, subValOld))
                      return [subProp, subVal];

                  return [
                      subProp,
                      fnTransformation[prop][subProp]?.(subVal, subValOld) ??
                          subVal,
                  ];
              })
          );

    /**
     * Check type of each propierties
     */
    const isValidType = Object.entries(valueTransformed)
        .map((item) => {
            const [subProp, subVal] = item;
            const typeResponse = checkType(type[prop][subProp], subVal);

            if (!typeResponse) {
                storeSetObjTypeWarning(
                    prop,
                    subProp,
                    subVal,
                    type[prop][subProp],
                    logStyle
                );
            }

            return typeResponse;
        })
        .every((item) => item === true);

    if (!isValidType) {
        return;
    }

    /**
     * Filter all props that pass the strict check.
     */
    const strictObjectResult = Object.entries(valueTransformed)
        .map((item) => {
            const [subProp, subVal] = item;
            const subValOld = store[prop][subProp];

            return strict[prop][subProp] === true && useStrict
                ? {
                      strictCheck: fnValidate[prop][subProp]?.(
                          subVal,
                          subValOld
                      ),
                      item,
                  }
                : { strictCheck: true, item };
        })
        .filter(({ strictCheck }) => strictCheck === true);

    /**
     * If all Object prop fail strict check return
     */
    const allStrictFail = strictObjectResult.length === 0;
    if (allStrictFail) return;

    /**
     * Get new Object with only validate and strick passed
     */
    const newValParsedByStrict = Object.fromEntries(
        strictObjectResult
            .map(({ item }) => item)
            .map(([key, val]) => [key, val])
    );

    /**
     * Validate value (value passed to setObj is a Object to merge with original) and store the result in
     * validationStatusObject arr id there is no validation return true, otherwise get boolean value from fnValidate
     * obj
     *
     * - La validazione viene effettuata sempre a prescindere che il dato sia effettivamante cambiato
     * - QUesto garantisce piu sicurezza.
     * - Object ( controlled ) non e sepcifco per le performance.
     * - Per le performance conviene utilizzare una propietá normale.
     */
    for (const item of Object.entries(newValParsedByStrict)) {
        const [subProp, subVal] = item;
        const subValOld = store[prop][subProp];

        /**
         * If in first level we have an object without the 'Any' type specified is interpreted like nested object, so
         * fail the fnValidate function if we set a different key with set methods. Because the new key doesn't exist in
         * original object, so log a warning. The only way to use obj is specify 'Any' key to not broke the globe object
         * logic.
         */
        const validateResult = fnValidate[prop][subProp]?.(subVal, subValOld);

        /**
         * In creation step advise if some props is not valid
         */
        if (!validateResult && initalizeStep) {
            storeValidationFailInCreation(prop, logStyle);
        }

        if (validateResult === undefined) {
            storeObjectIsNotAnyWarning(logStyle, TYPE_IS_ANY);
        }

        validationStatusObject[prop][subProp] = validateResult;
    }

    /**
     * Update value and fire callback associated
     */
    const oldObjectValues = store[prop];
    const newObjectValues = {
        ...store[prop],
        ...newValParsedByStrict,
    };

    /**
     * Check if all modified prop have skipEqual = true;
     */
    const shouldSkipEqual = Object.keys(newValParsedByStrict).every(
        (subProp) => skipEqual[prop][subProp] === true
    );

    let allPropsDethIsValid = true;

    /**
     * - Depth check, skip seObject if depth is not respected and objecy is not ANY
     * - Check depth BEFORE .every() to properly block execution
     */
    for (const [key, value] of Object.entries(newValParsedByStrict)) {
        const isCustomObject = type[prop][key] === TYPE_IS_ANY;
        const dataDepth = maxDepth(value);

        if (dataDepth > 1 && !isCustomObject) {
            storeSetObjDepthWarning(prop, valueTransformed, logStyle);

            /**
             * First time value is checked ( initialize ) set validation to false if datadeph is wrong
             */
            validationStatusObject[prop][key] = false;

            /**
             * Skip setObject
             */
            allPropsDethIsValid = false;
        }
    }

    /**
     * Persist validation status and exit if depth check failed
     */
    if (!allPropsDethIsValid) {
        updateMainMap(instanceId, { ...state, validationStatusObject });
        return;
    }

    /**
     * Check if all old props value is equal new props value.
     */
    const prevValueIsEqualNew = shouldSkipEqual
        ? Object.entries(newObjectValues).every(([key, value]) => {
              return checkEquality(
                  type[prop][key],
                  oldObjectValues[key],
                  value
              );
          })
        : false;

    /**
     * If shouldSkipEqual = true and previous object is equal new object return. If at least one modified property of
     * the object has skipEqual set to false then the entire object is considered mutated even if all values are equal
     */
    if (prevValueIsEqualNew && !initalizeStep) return;

    /**
     * Finally update Object.
     */
    store[prop] = newObjectValues;

    /**
     * Update map before fire addToComputedWaitLsit
     */
    updateMainMap(instanceId, { ...state, store, validationStatusObject });

    if (fireCallback && !initalizeStep) {
        runCallbackQueqe({
            watcherByProp,
            prop,
            newValue: store[prop],
            oldValue: oldObjectValues,
            validationValue: validationStatusObject[prop],
            instanceId,
        });

        /**
         * AddToComputedWaitLsit get and update map.
         */
        addToComputedWaitLsit({ instanceId, prop });
        for (const id of bindInstanceBy) {
            addToComputedWaitLsit({ instanceId: id, prop });
        }
    }
};

/**
 * Here we decided if is normal prop or object prop.
 *
 * @param {import('./type').storeSetAction} params
 * @returns {void}
 */
export const storeSetEntryPoint = ({
    instanceId,
    prop,
    value,
    fireCallback = true,
    clone = false,
    useStrict = true,
    action,
    initalizeStep = false,
}) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { store, type } = state;
    if (!store) return;

    const logStyle = getLogStyle();

    /**
     * Check if prop exist in store
     */
    if (!Object.hasOwn(store, prop)) {
        storeSetWarning(prop, logStyle);
        return;
    }

    /**
     * Id value is Map or Se or Objectt create a new old value. This is mutable promitives, if it passed by reference
     * mutate the original.
     */
    const previousValue = clone
        ? cloneValueOrGet({ value: store[prop] })
        : store[prop];

    /**
     * Check if newValue is a param or function. Id prop type is a function or last value is a function skip.
     */
    const valueParsed = action === STORE_UPDATE ? value(previousValue) : value;

    /**
     * Check if is an Object to stringyFy ( default is max depth === 2 )
     */
    const isCustomObject = type[prop] === TYPE_IS_ANY;

    /**
     * State is an Object
     */
    if (storeType.isObject(previousValue) && !isCustomObject) {
        setObj({
            instanceId,
            prop,
            val: valueParsed,
            fireCallback,
            useStrict,
            initalizeStep,
        });

        return;
    }

    /**
     * State is a normal prop.
     */
    setProp({
        instanceId,
        prop,
        val: valueParsed,
        fireCallback,
        useStrict,
        initalizeStep,
    });
};

/**
 * Set value without type/validattion/etc.. check.
 *
 * @param {import('./type').MobStoreQuickSetEntryPoint} param
 * @returns {void}
 */
export const storeQuickSetEntrypoint = ({ instanceId, prop, value }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { store, watcherByProp } = state;

    if (!Object.hasOwn(store, prop)) return;

    /**
     * Update value and fire callback associated
     */
    const oldVal = store[prop];

    /**
     * Finally set new value
     */
    store[prop] = value;

    updateMainMap(instanceId, { ...state, store });

    runCallbackQueqe({
        watcherByProp,
        prop,
        newValue: value,
        oldValue: oldVal,
        validationValue: true,
        instanceId,
    });
};

/**
 * Merge all state from current instance and bind store.
 */

/**
 * @param {object} params
 * @param {Record<string, any>} params.store
 * @param {string[]} params.bindInstance
 * @returns {Record<string, any>}
 */
const mergeStoreFromBindInstance = ({ store, bindInstance }) => {
    return bindInstance.reduce((previous, current) => {
        const currentState = getStateFromMainMap(current);
        if (!currentState) return previous;
        const { store: currentStore } = currentState;

        return { ...previous, ...currentStore };
    }, store);
};

/**
 * Main function to fire computed. Check for all computed in instance.
 *
 * @param {string} instanceId
 */
const fireComputed = (instanceId) => {
    /**
     * Get fresh data.
     */
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { computedPropsQueque, callbackComputed, store, bindInstance } =
        state;

    /**
     * Filter computed callback that has some prop changed as dependencies.
     */
    const computedFiltered = [...(callbackComputed ?? [])].filter(
        ({ keys }) => {
            return [...computedPropsQueque].find((current) => {
                return keys.includes(current);
            });
        }
    );

    /**
     * Merge current store with bindInstance.
     */
    const storeMerged = mergeStoreFromBindInstance({ store, bindInstance });

    /**
     * Loop and fire computed with changed value
     */
    const computedValues = computedFiltered.map(({ prop, keys, fn }) => {
        /**
         * Get dependencies current state;
         */
        const valuesToObject = Object.fromEntries(
            keys.map((item) => [item, storeMerged[item]])
        );

        return {
            prop,
            value: fn(valuesToObject),
        };
    });

    /**
     * Reset running mode.
     */
    updateMainMap(instanceId, {
        ...state,
        computedPropsQueque: new Set(),
        computedRunning: false,
    });

    /**
     * Update computed value after computedRunning is ended.
     */
    for (const { prop, value } of computedValues) {
        storeSetEntryPoint({
            instanceId,
            prop,
            value,
            action: STORE_SET,
        });
    }
};

/**
 * When a prop is updated (set or emit), add prop to computed waiting list.
 *
 * - At the end of current event loop fire computed.
 * - ComputedPropsQueque save all props for computed check.
 * - At this time we don't know if prop is a dependency.
 * - ComputedRunning is reset in fireComputed function.
 * - The same function is used both for current instance and binded instance.
 *
 * Note: addToComputedWaitList performs an additional map update even when called from setProp/setObj which have already
 * updated the state.
 *
 * This redundancy is intentional and acceptable:
 *
 * 1. The cost is negligible (shallow copy of ~15 properties)
 * 2. Maintains the autonomy of addToComputedWaitList for other entry points (emit)
 * 3. Avoids complications in passing pre-loaded state
 *
 * Atomicity is guaranteed by the single-threaded nature of JavaScript.
 *
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {void}
 */
export const addToComputedWaitLsit = ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { callbackComputed, computedPropsQueque, computedRunning } = state;

    if (!callbackComputed || callbackComputed.size === 0) return;

    /**
     * Update computedPropsQueque.
     */
    computedPropsQueque.add(prop);
    updateMainMap(instanceId, {
        ...state,
        computedPropsQueque,
    });

    if (!computedRunning) {
        const state = getStateFromMainMap(instanceId);
        if (!state) return;

        updateMainMap(instanceId, { ...state, computedRunning: true });
        useNextLoop(() => fireComputed(instanceId));
    }
};

/**
 * Check for circular dependencies using DFS.
 *
 * - Creiamo un grafo completo delle dipendenze per assicurarci che tutte li chiavi ( dipendenze ) non riportino a
 *   targetProp.
 *
 * @example
 *     storeTest.computed(
 *     () => proxi.a,
 *     () => proxi.c + 1      // prop: 'a', keys: ['c']
 *     );
 *
 *     storeTest.computed(
 *     () => proxi.b,
 *     () => proxi.a + 1      // prop: 'b', keys: ['a']
 *     );
 *
 *     storeTest.computed(
 *     () => proxi.c,
 *     () => proxi.b + 1      // prop: 'c', keys: ['b']
 *     );
 *
 *     Dipendenze:
 *     a dipende da c
 *     b dipende da a
 *     c dipende da b
 *
 *     Verifica ciclo su c:
 *
 *     1. targetProp: c | targetKeys: [b]
 *     Quale computed calcola b? -> il computed con prop b (keys: [a])
 *
 *     2. targetProp: c | targetKeys: [a]
 *     Quale computed calcola a? -> il computed con prop a (keys: [c])
 *
 *     3. targetProp: c | targetKeys: [c]
 *     targetKeys include targetProp! -> dipendenza circolare
 *
 * @param {string} targetProp - La prop corrente da analizzare.
 * @param {string[]} targetKeys - Le chiavi correnti da analizzare.
 * @param {Set<{ prop: string; fn: (arg0: Record<string, any>) => void; keys: string[] }>} callbackComputed
 * @param {Set<string>} [visited] - Prop giá visitata.
 * @returns {boolean}
 */
const hasCircularDependencies = (
    targetProp,
    targetKeys,
    callbackComputed,
    visited = new Set()
) => {
    /**
     * Se una delle dipendenze è il target stesso, abbiamo una dipendenza circolare.
     *
     * - Le dipendenze possono attraversare piu computed.
     */
    if (targetKeys.includes(targetProp)) return true;

    for (const key of targetKeys) {
        /**
         * Se una prop è già stata esplorata in questo percorso, la saltiamo.
         *
         * - Evita loop infiniti nel grafo (es. a -> b -> a -> b ...)
         */
        if (visited.has(key)) continue;
        visited.add(key);

        /**
         * Trova il computed che produce questa key.
         *
         * - Se `key` è prodotta da un computed, dobbiamo esplorare le dipendenze di QUEL computed (ricorsione).
         * - Così seguiamo la catena: c dipende da b, b dipende da a, a dipende da c? -> CICLO!
         */
        const computedForKey = [...callbackComputed].find(
            ({ prop }) => prop === key
        );

        if (
            /**
             * Esplora ricorsivamente le dipendenze del computed trovato.
             *
             * - `targetProp` rimane fisso: è il computed che stiamo aggiungendo.
             * - Se nelle dipendenze transitive ritorna a `targetProp`, abbiamo un ciclo.
             * - `computedForKey.keys` sono le nuove dipendenze da esplorare.
             */
            computedForKey &&
            hasCircularDependencies(
                targetProp,
                computedForKey.keys,
                callbackComputed,
                visited
            )
        ) {
            return true;
        }
    }

    return false;
};

/**
 * Save callback in map store. Check for circular dependencies.
 *
 * @param {import('./type').MobStoreComputedAction} params
 * @returns {void}
 */
const storeComputedAction = ({ instanceId, prop, keys, fn }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { callbackComputed } = state;

    const hasCircular = hasCircularDependencies(prop, keys, callbackComputed);

    if (keys.includes(prop) || hasCircular) {
        storeComputedKeyUsedWarning(keys, getLogStyle());
        return;
    }

    callbackComputed.add({
        prop,
        keys,
        fn,
    });

    updateMainMap(instanceId, {
        ...state,
        callbackComputed,
    });
};

/**
 * Initialize first computed values.
 *
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string[]} param.keys
 * @param {string} param.prop
 * @param {(arg0: { [key: string]: any }) => void} param.callback
 * @returns {void}
 */
const initializeCompuntedProp = ({ instanceId, prop, keys, callback }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { store, bindInstance } = state;

    /**
     * Merge current store with bindInstance.
     */
    const storeMerged = mergeStoreFromBindInstance({ store, bindInstance });

    /**
     * Create onject with values for computed function.
     *
     * - Return a tuple [key, value],[key, value].
     * - Transform in an object {key, value}
     */
    const valuesObject = Object.fromEntries(
        keys
            .map((key) => {
                if (Object.hasOwn(storeMerged, key))
                    return [key, storeMerged[key]];
                return;
            })
            .filter((item) => item !== undefined)
    );

    /**
     * Get prop value.
     */
    const value = callback(valuesObject);

    /**
     * Update computed prop. On initialization will not fire callback or computed prop. Only update value This methods
     * update storeMap itself.
     */
    storeSetEntryPoint({
        instanceId,
        prop,
        value,
        fireCallback: false,
        clone: false,
        action: STORE_SET,
    });
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string[]} param.keys
 * @param {string} param.prop
 * @param {(arg0: { [key: string]: any }) => void} param.callback
 * @returns {void}
 */
export const storeComputedEntryPoint = ({
    instanceId,
    prop,
    keys,
    callback,
}) => {
    /**
     * Only one computed per prop is allowed.
     */
    const isComputed = checkIfPropIsComputed({
        instanceId,
        prop,
    });

    if (isComputed) return;

    /**
     * If there is no dependencies get keys from proxi used in callback.
     */
    const keysDetected =
        keys.length === 0
            ? (() => {
                  initializeCurrentDependencies();
                  callback({});
                  return getCurrentDependencies();
              })()
            : keys;

    /**
     * Valorize computed first time without callback.
     */
    initializeCompuntedProp({
        instanceId,
        prop,
        keys: keysDetected,
        callback,
    });

    /**
     * Update callbackComputed.
     */
    storeComputedAction({
        instanceId,
        prop,
        keys: keysDetected,
        fn: callback,
    });
};
