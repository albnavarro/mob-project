export function SimpleStore(data) {
    // Private function

    /**
     * Set propierities value of store item
     * Fire all the callback associate to the prop
     * Usage:
     * this.store.setProp("prop", val);
     *
     * @param  {object} Obj target
     * @param  {Boolean} true if Onj is a Object
     */
    const isObject = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Object]';
    };

    /**
     * Set propierities value of store item
     * Fire all the callback associate to the prop
     * Usage:
     * this.store.setProp("prop", val);
     *
     * @param  {object} Obj target
     * @param  {Number} max number of nested levels
     */
    const maxDepth = (object) => {
        if (!isObject(object)) return 0;
        const values = Object.values(object);

        return (
            (values.length &&
                Math.max(...values.map((value) => maxDepth(value)))) + 1
        );
    };

    /**
     * Log Style
     */
    let logStyle = 'background: #222; color: yellow; padding: 10px;';

    /**
     * Set propierities value of store item
     * Fire all the callback associate to the prop
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {void}
     */
    function fireComputed(prop) {
        fnComputed.forEach((item, i) => {
            const { prop: propTarget, keys, fn: computedFn } = item;

            // Prendo la lista di tutte le chiavi dello store
            const storeKeys = Object.keys(store);

            // Controllo che tutte le chiavi da monitorare nella computed esistano nello store
            const hasKeys = keys.every((item) => storeKeys.includes(item));

            // Controllo se la prop principale esiste come chiave da monitorare e tutte le chiavi esistono nello store
            if (keys.includes(prop) && hasKeys) {
                // Prendo il valore di ogni propietá data la chiave
                const props = keys.map((item) => {
                    return store[item];
                });

                // Genero il valore dalla funzione di callback da passare ai setter per aggiornare la prop
                const computedValue = computedFn(...props);

                // Eseguo la funzione di call back passandogli tutti i valori delle props
                if (!isObject(store[propTarget])) {
                    setProp(propTarget, computedValue);
                } else {
                    setObj(propTarget, computedValue);
                }
            } else if (!hasKeys) {
                // se una delle delle chiavi da monitoriare non esiste nello store
                console.warn(
                    `%c one of this key ${keys} defined in computed method of prop to monitor '${propTarget}' prop not exist`,
                    logStyle
                );
            }
        });
    }

    // Public function

    /**
     * Set propierities value of store item
     * Fire all the callback associate to the prop
     * Usage:
     * this.store.setProp("prop", val);
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {any} val object to merge with the corresponding in store
     */
    const setProp = (prop, val) => {
        /**
         * Check if val is an Object
         */
        if (isObject(val)) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: setProp methods doasn't allow objects as value, ${JSON.stringify(
                    val
                )} is an Object`,
                logStyle
            );
            return;
        }

        /**
         * Check if prop exist in store
         */
        if (!(prop in store)) {
            console.warn(
                `%c trying to execute setProp method: store.${prop} not exist`,
                logStyle
            );
            return;
        }

        /**
         * Check if prop is an Object
         */
        if (isObject(store[prop])) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: '${JSON.stringify(
                    prop
                )}' is an objects`,
                logStyle
            );
            return;
        }

        /**
         * Check if there is a validate function and update validateError arr
         */
        if (prop in fnValidate) validateError[prop] = fnValidate[prop](val);

        /**
         * Update value and fire callback associated
         */
        const oldVal = store[prop];
        store[prop] = val;

        const fnByProp = fnStore.filter((item) => item.prop === prop);
        fnByProp.forEach((item, i) => {
            item.fn(val, oldVal, validateError[prop]);
        });

        fireComputed(prop);
    };

    /**
     * Update propierities of store item by prop keys, only if store item is an object
     * Fire all the callback associate to the prop
     * Usage:
     * this.store.setObj("prop", {prop: val});
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {object} val object to merge with the corresponding in store
     */
    const setObj = (prop, val) => {
        /**
         * Check if val is not an Object
         */
        if (!isObject(val)) {
            console.warn(
                `%c trying to execute setObj method on '${prop}' propierties: setObj methods allow only objects as value, ${val} is not an Object`,
                logStyle
            );
            return;
        }

        /**
         * Check if prop exist in store
         */
        if (!(prop in store)) {
            console.warn(
                `%c trying to execute set setObj method: store.${prop} not exist`,
                logStyle
            );
            return;
        }

        /**
         * Check if prop is not an Object
         */
        if (!isObject(store[prop])) {
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

        /**
         * Validate value (value passed to setObj is a Object to merge with original) and store the result in validateError arr
         * id there is no validation return true, otherwse get boolean value from fnValidate obj
         */

        const valuesArray = Object.entries(val);
        valuesArray.forEach((item, i) => {
            const [subProp, subVal] = item;

            if (prop in fnValidate && subProp in fnValidate[prop])
                validateError[prop][subProp] =
                    fnValidate[prop][subProp](subVal);
        });

        /**
         * Update value and fire callback associated
         */
        const oldVal = store[prop];
        store[prop] = { ...store[prop], ...val };

        const fnByProp = fnStore.filter((item) => item.prop === prop);
        fnByProp.forEach((item, i) => {
            item.fn(store[prop], oldVal, validateError[prop]);
        });

        fireComputed(prop);
    };

    /**
     * Get value of propierties in store
     * Usage:
     * this.store.getProp("prop");
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
     * Get validation value of propierties in validateError obj
     * Usage:
     * this.store.getValidation("prop");
     *
     * @param  {string} prop keys of obj in store
     * @return {Boolean} return validation status
     */
    const getValidation = (prop) => {
        if (prop in validateError) {
            return validateError[prop];
        } else {
            console.warn(
                `%c trying to execute getValidation method: validateError.${prop} not exist`,
                logStyle
            );
        }
    };

    /**
     * Add callback for specific propierties in store
     * Usage:
     * const id2 =  this.store.watch('prop', (newVal, oldVal, validate) => {})
     *
     * @param  {string} prop keys of obj in store
     * @param  {function} fn callback Function, fired on prop value change
     * @return {number} return a reference to watcher ( for unwatch )
     */
    const watch = (prop, fn) => {
        fnStore.push({
            prop,
            fn,
            id: counterId,
        });

        counterId++;
        return counterId;
    };

    // store.unWatch(id);
    /**
     * Remove watcher by reference
     * Usage:
     * store.unWatch(id);
     *
     * @param  {id} number reference to watcher
     */
    const unWatch = (id) => {
        fnStore = fnStore.filter((item) => item.id !== id);
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
                item.fn(store[prop], store[prop]);
            });
        } else {
            console.warn(
                `trying to execute set data method: store.${prop} not exist`
            );
        }
    };

    /**
     * Set validate array
     * Usage:
     *   this.store.validate({
     *       prop: (val) => {
     *           return ....
     *       },
     *       prop2: {
     *           subprop: (val) => {
     *               return ....
     *           },
     *       }
     *     });
     *
     * @param  {Object} data Object with validate function
     */
    const validate = (data) => {
        const dataDepth = maxDepth(data);

        fnValidate = (() => {
            if (dataDepth > 2) {
                console.warn(
                    `%c data depth on validate object creation allowed is maximun 2 this data is ${dataDepth}`,
                    logStyle
                );
                return {};
            } else {
                return { ...data };
            }
        })();

        // Update validateError Object for every element in store that have a validate function asociated
        for (const key in store) {
            if (isObject(store[key])) {
                for (const subkey in store[key]) {
                    if (subkey in fnValidate[key]) {
                        validateError[key][subkey] = fnValidate[key][subkey](
                            store[key][subkey]
                        );
                    }
                }
            } else {
                // Get value from not obj
                if (fnValidate[key]) {
                    validateError[key] = fnValidate[key](store[key]);
                }
            }
        }
    };

    const debugStore = () => {
        console.log(store);
    };

    const debugValidate = () => {
        console.log(validateError);
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
     *  store.addComputed('prop', ['key', 'key'], (val1, val2) => {
     *      return val1 + val2;
     *  });
     *
     *  Prop target not Object and Object keys (obj.val1 , obj.val2)
     *  store.addComputed('prop', ['obj'], (obj) => {
     *       return obj.val1 + obj.val2;
     *  })
     *
     *  Prop target Object ( obj.sum ), and not Object keys:
     *  store.addComputed('obj', ['key', 'key'], (val1, val2) => {
     *      return { sum: val1 + val2 };
     *  });
     *
     *  Prop target Object ( obj.sum ), and Object keys (obj.val1 , obj.val2):
     *  store.addComputed('obj', ['obj'], (obj) => {
     *      return { sum: obj.val1 + obj.val2 };
     *  });
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {keys} Array of keys to watch
     * @param  {fn} Function Callback
     */
    const addComputed = (prop, keys, fn) => {
        // Create a temp array with the fuiture computeda added to check
        const tempComputedArray = [...fnComputed, ...[{ prop, keys, fn }]];

        // Get all prop stored in tempComputedArray
        const keyList = tempComputedArray.map((item) => item.prop).flat();

        //  Keys can't be a prop used in some computed
        const keysIsusedInSomeComputed = keyList.some((item) =>
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
                `%c una delel chiavi [${keys}] é gia usata come target di una mutazione`,
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
    let fnValidate = {};
    const validateError = {};
    const dataDepth = maxDepth(data);
    const store = (() => {
        if (dataDepth > 2) {
            console.warn(
                `%c data depth on store creation allowed is maximun 2 this data is ${dataDepth}`,
                logStyle
            );
            return {};
        } else {
            return { ...data };
        }
    })();

    // Update validateError Object with basic value at store inizialization
    // At inizialization every propierites dasn't have a validate function associated, so th validation is true
    for (const key in store) {
        if (isObject(store[key])) {
            // If there is no obj create an empty obj
            validateError[key] = {};

            for (const subkey in store[key]) {
                validateError[key][subkey] = true;
            }
        } else {
            validateError[key] = true;
        }
    }

    return {
        setProp,
        setObj,
        getProp,
        getValidation,
        watch,
        unWatch,
        emit,
        validate,
        addComputed,
        debugStore,
        debugValidate,
        setStyle,
    };
}
