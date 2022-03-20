import {
    checkType,
    storeType,
    maxDepth,
    getDataRecursive,
    getValidateRecursive,
    getTypeRecursive,
} from './storeType.js';

export function SimpleStore(data) {
    /**
     * Log Style
     */
    let logStyle = 'padding: 10px;';

    /**
     * Fire computed if some prop associated change
     *
     * @param  {string} propChanged keys of prop changed
     */
    function fireComputed(propChanged) {
        fnComputed.forEach((item, i) => {
            const {
                prop: propToUpdate,
                keys: propsShouldChange,
                fn: computedFn,
            } = item;

            // Prendo la lista di tutte le chiavi dello store
            const storeKeys = Object.keys(store);

            // Controllo che tutte le chiavi da monitorare nella computed esistano nello store
            const propsShouldChangeIsInStore = propsShouldChange.every((item) =>
                storeKeys.includes(item)
            );

            // Se una delle delle chiavi da monitoriare non esiste nello store skippo
            if (!propsShouldChangeIsInStore) {
                console.warn(
                    `%c one of this key ${propsShouldChange} defined in computed method of prop to monitor '${propToUpdate}' prop not exist`,
                    logStyle
                );

                return;
            }

            // Controllo che la prop in entrata sia una dipendenza del computed
            // E' il controlo chiave che scatena il computed
            const propChangedIsDependency =
                propsShouldChange.includes(propChanged);

            if (!propChangedIsDependency) return;

            // Prendo il valore di ogni propietá data la chiave
            const propValues = propsShouldChange.map((item) => {
                return store[item];
            });

            // Genero il valore dalla funzione di callback da passare ai setter per aggiornare la prop
            const computedValue = computedFn(...propValues);
            set(propToUpdate, computedValue);
        });
    }

    /**
     * Update propierities of store item by prop keys
     * Fire all the callback associate to the prop
     * Usage:
     * myStore.set("prop", {prop: val});
     * myStore.setProp("prop", val);
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {object} val object or value to merge with the corresponding in store
     */
    const set = (prop, val, fireCallback = true) => {
        /**
         * Check if prop exist in store
         */
        if (!(prop in store)) {
            console.warn(
                `%c trying to execute set method: store.${prop} not exist`,
                logStyle
            );
            return;
        }

        if (storeType.isObject(store[prop])) {
            setObj(prop, val, fireCallback);
        } else {
            setProp(prop, val, fireCallback);
        }
    };

    // Private function

    /**
     * Set propierities value of store item
     * Fire all the callback associate to the prop
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {any} val object to merge with the corresponding in store
     */
    const setProp = (prop, val, fireCallback = true) => {
        /**
         * Check if val is an Object
         */
        if (storeType.isObject(val)) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: setProp methods doasn't allow objects as value, ${JSON.stringify(
                    val
                )} is an Object`,
                logStyle
            );
            return;
        }

        /**
         * Check if prop is an Object
         */
        if (storeType.isObject(store[prop])) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: '${JSON.stringify(
                    prop
                )}' is an objects`,
                logStyle
            );
            return;
        }

        const isValidType = checkType(type[prop], val);
        if (!isValidType) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: '${val}' is not ${type[prop]}`,
                logStyle
            );
            return;
        }

        /**
         * Check if there is a validate function and update validateResult arr
         */
        validateResult[prop] = fnValidate[prop](val);

        /**
         * Update value and fire callback associated
         */
        const oldVal = store[prop];
        store[prop] = val;

        if (fireCallback) {
            const fnByProp = fnStore.filter((item) => item.prop === prop);
            fnByProp.forEach((item, i) => {
                item.fn(val, oldVal, validateResult[prop]);
            });
        }

        fireComputed(prop);
    };

    /**
     * Update propierities of store item by prop keys, only if store item is an object
     * Fire all the callback associate to the prop
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {object} val object to merge with the corresponding in store
     */
    const setObj = (prop, val, fireCallback = true) => {
        /**
         * Check if val is not an Object
         */
        if (!storeType.isObject(val)) {
            console.warn(
                `%c trying to execute setObj method on '${prop}' propierties: setObj methods allow only objects as value, ${val} is not an Object`,
                logStyle
            );
            return;
        }

        /**
         * Check if prop is not an Object
         */
        if (!storeType.isObject(store[prop])) {
            console.warn(
                `%c trying to execute setObj data method on '${prop}' propierties: store propierties '${prop}' is not an object`,
                logStyle
            );
            return;
        }

        /**
         * Check if prop has val keys
         */
        const valKeys = Object.keys(val);
        const propKeys = Object.keys(store[prop]);
        const hasKeys = valKeys.every((item) => propKeys.includes(item));
        if (!hasKeys) {
            console.warn(
                `%c trying to execute setObj data method: one of these keys '${valKeys}' not exist in store.${prop}`,
                logStyle
            );
            return;
        }

        /**
         * Check val have nested Object
         */
        const dataDepth = maxDepth(val);
        if (dataDepth > 1) {
            console.warn(
                `%c trying to execute setObj data method on '${prop}' propierties: '${JSON.stringify(
                    val
                )}' have a depth > 1, nested obj is not allowed`,
                logStyle
            );
            return;
        }

        // Check type of eachpropierties
        const isValidType = Object.entries(val)
            .map((item, i) => {
                const [subProp, subVal] = item;
                const typeResponse = checkType(type[prop][subProp], subVal);

                if (!typeResponse) {
                    console.warn(
                        `%c trying to execute setObj data method on ${prop}.${subProp} propierties: '${subVal}' is not ${type[prop][subProp]}`,
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
         * Validate value (value passed to setObj is a Object to merge with original) and store the result in validateResult arr
         * id there is no validation return true, otherwse get boolean value from fnValidate obj
         */

        Object.entries(val).forEach((item, i) => {
            const [subProp, subVal] = item;
            validateResult[prop][subProp] = fnValidate[prop][subProp](subVal);
        });

        /**
         * Update value and fire callback associated
         */
        const oldVal = store[prop];
        store[prop] = { ...store[prop], ...val };

        if (fireCallback) {
            const fnByProp = fnStore.filter((item) => item.prop === prop);
            fnByProp.forEach((item, i) => {
                item.fn(store[prop], oldVal, validateResult[prop]);
            });
        }

        fireComputed(prop);
    };

    /**
     * Get all store object, use decostructing to get specific prop valu
     * Usage:
     * const { prop } = myStore.get();
     *
     * @return { Object } return store object
     */
    const get = () => {
        return store;
    };

    /**
     * Get value of propierties in store
     * Useful if prop is array ( es2)
     * Usage:
     * es1: const prop = myStore.getProp("prop");
     * es2: const [prop] = myStore.getProp("prop");
     *
     * @param  {string} prop keys of obj in store
     * @return {any} return prop value
     */
    const getProp = (prop) => {
        if (prop in store) {
            return store[prop];
        } else {
            console.warn(
                `%c trying to execute get data method: store.${prop} not exist`,
                logStyle
            );
        }
    };

    /**
     * Get validation store object, use decostructing to get specific prop value
     * Usage:
     * const { prop } = myStore.getValidation();
     *
     * @return {Object} return validation store object
     */
    const getValidation = () => {
        return validateResult;
    };

    /**
     * Add callback for specific propierties in store
     * Usage:
     * const id2 =  myStore.watch('prop', (newVal, oldVal, validate) => {})
     *
     * @param  {string} prop keys of obj in store
     * @param  {function} fn callback Function, fired on prop value change
     * @return {function} unsubscribe function
     */
    const watch = (prop, fn) => {
        fnStore.push({
            prop,
            fn,
            id: counterId,
        });

        const cbId = counterId;
        counterId++;

        return () => {
            fnStore = fnStore.filter((item) => item.id !== cbId);
        };
    };

    /**
     * Forse fire callback for specific key
     * Usage:
     * store.emit('prop');
     *
     * @param  {string} prop keys of obj in store
     */
    const emit = (prop) => {
        if (prop in store) {
            const fnByProp = fnStore.filter((item) => item.prop === prop);
            fnByProp.forEach((item, i) => {
                // Val , OldVal, Validate
                item.fn(store[prop], store[prop], validateResult[prop]);
            });
        } else {
            console.warn(
                `trying to execute set data method: store.${prop} not exist`
            );
        }
    };

    const debugStore = () => {
        console.log(store);
    };

    const debugValidate = () => {
        console.log(validateResult);
    };

    const setStyle = (string) => {
        logStyle = string;
    };

    /**
     * Set propierities value of store item
     * Fire all the callback associate to the prop
     * @example:
     *
     *  Prop target not Object, and not Object keys:
     *  store.computed('prop', ['key', 'key'], (val1, val2) => {
     *      return val1 + val2;
     *  });
     *
     *  Prop target not Object and Object keys (obj.val1 , obj.val2)
     *  store.computed('prop', ['obj'], (obj) => {
     *       return obj.val1 + obj.val2;
     *  })
     *
     *  Prop target Object ( obj.sum ), and not Object keys:
     *  store.computed('obj', ['key', 'key'], (val1, val2) => {
     *      return { sum: val1 + val2 };
     *  });
     *
     *  Prop target Object ( obj.sum ), and Object keys (obj.val1 , obj.val2):
     *  store.computed('obj', ['obj'], (obj) => {
     *      return { sum: obj.val1 + obj.val2 };
     *  });
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {keys} Array of keys to watch
     * @param  {fn} Function Callback
     */
    const computed = (prop, keys, fn) => {
        // Create a temp array with the fuiture computeda added to check
        const tempComputedArray = [...fnComputed, ...[{ prop, keys, fn }]];

        // Get all prop stored in tempComputedArray
        const propList = tempComputedArray.map((item) => item.prop).flat();

        //  Keys can't be a prop used in some computed
        const keysIsusedInSomeComputed = propList.some((item) =>
            keys.includes(item)
        );

        // Key is not a prop
        const keysIsNotProp = keys.includes(prop);

        /**
         * if - Key to watch can't be a prop used in some computed to avoid infinite loop
         *
         * @param  {Bollean} keysIsusedInSomeComputed
         * @return {void}
         */
        if (keysIsusedInSomeComputed) {
            console.warn(
                `%c una delel chiavi [${keys}] é gia usata come target di una computed`,
                logStyle
            );
            return;
        }

        /**
         * if - Key to watch can't be a prop to mutate to avoid infinite loop
         *
         * @param  {Bollean} keysIsNotProp
         * @return {void}
         */
        if (keysIsNotProp) {
            console.warn(
                `%c una delel chiavi [${keys}] coincide con la prop '${prop}' da mutare`,
                logStyle
            );
            return;
        }

        fnComputed.push({
            prop,
            keys,
            fn,
        });
    };

    /**
     * Inizialize store
     */
    let counterId = 0;
    let fnStore = [];
    let fnComputed = [];
    const validateResult = {};
    const dataDepth = maxDepth(data);

    // Create store obj
    const store = (() => {
        if (dataDepth > 2) {
            console.warn(
                `%c data depth on store creation allowed is maximun 2 this data is ${dataDepth}`,
                logStyle
            );
            return {};
        } else {
            return getDataRecursive(data);
        }
    })();

    const type = (() => {
        if (dataDepth > 2) {
            console.warn(
                `%c data depth on store creation allowed is maximun 2 this data is ${dataDepth}`,
                logStyle
            );
            return {};
        } else {
            return getTypeRecursive(data);
        }
    })();

    // Create array with alidate function
    const fnValidate = (() => {
        if (dataDepth > 2) {
            console.warn(
                `%c data depth on store creation allowed is maximun 2 this data is ${dataDepth}`,
                logStyle
            );
            return {};
        } else {
            return getValidateRecursive(data);
        }
    })();

    // Inzializa Empty obj in second level if nedeed
    for (const key in store) {
        if (storeType.isObject(store[key])) validateResult[key] = {};
    }

    // First run execute each propierites to check validation without fire event
    Object.entries(store).forEach((item, i) => {
        const [key, value] = item;
        set(key, value, false);
    });

    return {
        set,
        get,
        getProp,
        getValidation,
        watch,
        emit,
        computed,
        debugStore,
        debugValidate,
        setStyle,
    };
}
