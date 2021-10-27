export function SimpleStore(data) {
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
     * Inizialize varibales
     */
    let counterId = 0;
    let fnStore = [];
    let fnValidate = {};
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
         * Validates the value if it has an associated validation function
         */
        const valueIsValidated = (() => {
            if (!(prop in fnValidate)) {
                return true;
            } else {
                return fnValidate[prop](val);
            }
        })();

        if (!valueIsValidated) {
            console.warn(
                `%c trying to execute setProp method on '${prop}' propierties: '${val}' is not a valid value, check validate function`,
                logStyle
            );
            return;
        }

        /**
         * Update value and fire callback associated
         */
        const oldVal = store[prop];
        store[prop] = val;

        const fnByProp = fnStore.filter((item) => item.prop === prop);
        fnByProp.forEach((item, i) => {
            item.fn(val, oldVal);
        });
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
         * Validate each value if there is a validation function associated with each value
         */
        const valueIsValidated = (() => {
            const arr = Object.entries(val);

            return arr.every((item) => {
                const [subProp, subVal] = item;

                if (!(prop in fnValidate)) return true;

                return subProp in fnValidate[prop]
                    ? fnValidate[prop][subProp](subVal)
                    : true;
            });
        })();

        if (!valueIsValidated) {
            console.warn(
                `%c trying to execute setObj method on '${prop}' propierties: one of the values passed to the object is not a valid value, check validate function`,
                logStyle
            );
            return;
        }

        /**
         * Update value and fire callback associated
         */
        const oldVal = store[prop];
        store[prop] = { ...store[prop], ...val };

        const fnByProp = fnStore.filter((item) => item.prop === prop);
        fnByProp.forEach((item, i) => {
            item.fn(store[prop], oldVal);
        });
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
     * Add callback for specific propierties in store
     * Usage:
     * const id2 =  this.store.watch('prop', (newVal, oldVal) => {})
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
    };

    const debug = () => {
        console.log(store);
    };

    const setStyle = (string) => {
        logStyle = string;
    };

    return {
        setProp,
        setObj,
        getProp,
        watch,
        unWatch,
        emit,
        validate,
        debug,
        setStyle,
    };
}
