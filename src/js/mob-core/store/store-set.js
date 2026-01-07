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
import { cloneValueOrGet, maxDepth } from './store-utils';
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
        callBackWatcher,
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
     */
    const valueTransformed =
        /** @type{{[key:string]: ((current: any, previous: any) => any)}} */ (
            fnTransformation
        )[prop]?.(val, oldVal) ?? val;

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
    if (strict[prop] && !isValidated && useStrict) return;

    /**
     * Update validation array.
     */
    validationStatusObject[prop] = isValidated;

    /**
     * Check if last value is equal new value. if true and skipEqual is true for this prop return.
     */
    const isEqual = skipEqual[prop]
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
            callBackWatcher,
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
        bindInstanceBy.forEach((id) => {
            addToComputedWaitLsit({ instanceId: id, prop });
        });
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
        callBackWatcher,
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
    const valueTransformed = Object.fromEntries(
        Object.entries(val).map((item) => {
            const [subProp, subVal] = item;
            const subValOld = store[prop][subProp];

            return [
                subProp,
                fnTransformation[prop][subProp]?.(subVal, subValOld) ?? subVal,
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

            return strict[prop][subProp] && useStrict
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
     */
    Object.entries(newValParsedByStrict).forEach((item) => {
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
    });

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

    /**
     * Check if all old props value is equal new props value.
     */
    const prevValueIsEqualNew = shouldSkipEqual
        ? Object.entries(newObjectValues).every(([key, value]) => {
              const isCustomObject = type[prop][key] === TYPE_IS_ANY;

              /**
               * Check val have nested Object ( not 'Any' )
               */
              const dataDepth = maxDepth(value);
              if (dataDepth > 1 && !isCustomObject) {
                  storeSetObjDepthWarning(prop, valueTransformed, logStyle);
                  return;
              }

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
            callBackWatcher,
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
        bindInstanceBy.forEach((id) => {
            addToComputedWaitLsit({ instanceId: id, prop });
        });
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
    if (!(prop in store)) {
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

    const { store, callBackWatcher } = state;

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
        callBackWatcher,
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

    const { computedPropsQueque, callBackComputed, store, bindInstance } =
        state;

    /**
     * Filter computed callback that has some prop changed as dependencies.
     */
    const computedFiltered = [...(callBackComputed ?? [])].filter(
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
    computedValues.forEach(({ prop, value }) => {
        storeSetEntryPoint({
            instanceId,
            prop,
            value,
            action: STORE_SET,
        });
    });
};

/**
 * When a prop is updated ( set o emit ). add prop to computed waiting list.
 *
 * - At the end of current event loop fire computed.
 * - ComputedPropsQueque save all props for computed check.
 * - At this time we doesn't now if prop is a dependencies.
 * - ComputedRunning is reset in fireComputed function.
 * - The same function is used both for current instance and binded instance.
 *
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {void}
 */
export const addToComputedWaitLsit = ({ instanceId, prop }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { callBackComputed, computedPropsQueque, computedRunning } = state;

    if (!callBackComputed || callBackComputed.size === 0) return;

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
 * Save callback in map store. Check for circular dependencies.
 *
 * @param {import('./type').MobStoreComputedAction} params
 * @returns {void}
 */
const storeComputedAction = ({ instanceId, prop, keys, fn }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return;

    const { callBackComputed } = state;

    const hasCircularDependecies = [...callBackComputed].reduce(
        (previous, { prop: currentProp, keys: currentKeys }) => {
            return (
                currentKeys.includes(prop) &&
                keys.includes(currentProp) &&
                !previous
            );
        },
        false
    );

    if (keys.includes(prop) || hasCircularDependecies) {
        storeComputedKeyUsedWarning(keys, getLogStyle());
        return;
    }

    callBackComputed.add({
        prop,
        keys,
        fn,
    });

    updateMainMap(instanceId, {
        ...state,
        callBackComputed,
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
                if (key in storeMerged) return [key, storeMerged[key]];
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
     * Update callBackComputed.
     */
    storeComputedAction({
        instanceId,
        prop,
        keys: keysDetected,
        fn: callback,
    });
};
