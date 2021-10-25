export function SimpleStore(data) {
    let counterId = 0;
    let fnStore = [];
    const store = { ...data };

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
        if (prop in store) {
            const oldVal = store[prop];
            store[prop] = val;

            const fnByProp = fnStore.filter((item) => item.prop === prop);
            fnByProp.forEach((item, i) => {
                item.fn(val, oldVal);
            });
        } else {
            console.warn(
                `trying to execute set data method: store.${prop} not exist`
            );
        }
    };

    /**
     * Update propierities of store item by prop keys, only if store item is an object
     * Fire all the callback associate to the prop
     * Usage:
     * this.store.updatePropObj("prop", {prop: val});
     *
     * @param  {string} prop keys of obj in store to update
     * @param  {object} val object to merge with the corresponding in store
     */
    const updatePropObj = (prop, val) => {
        if (prop in store) {
            const valKeys = Object.keys(val);
            const propKeys = Object.keys(store[prop]);
            const hasKeys = valKeys.every((item) => propKeys.includes(item));

            if (hasKeys) {
                const oldVal = store[prop];
                store[prop] = { ...store[prop], ...val };

                const fnByProp = fnStore.filter((item) => item.prop === prop);
                fnByProp.forEach((item, i) => {
                    item.fn(store[prop], oldVal);
                });
            } else {
                console.warn(
                    `trying to execute updatePropObj data method: one of these keys '${valKeys}' not exist in store.${prop}`
                );
            }
        } else {
            console.warn(
                `trying to execute set updatePropObj method: store.${prop} not exist`
            );
        }
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
                `trying to execute get data method: store.${prop} not exist`
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

    const debug = () => {
        console.log(store);
    };

    return {
        setProp,
        updatePropObj,
        getProp,
        watch,
        unWatch,
        emit,
        debug,
    };
}
