export function SimpleStore(data) {
    let counterId = 0;
    let fnStore = [];
    const store = { ...data };

    // this.store.setProp("prop", val);
    const setProp = (prop, val) => {
        if (prop in store) {
            const oldVal = store[prop];
            store[prop] = val;

            const fnByProp = fnStore.filter((item) => item.prop === prop);
            fnByProp.forEach((item, i) => {
                item.fn(val, oldVal);
            });
        } else {
            throw new Error(
                `trying to execute set data method: store.${prop} not exist`
            );
        }
    };

    // const val = this.store.getProp("prop");
    const getProp = (prop) => {
        if (prop in store) {
            return store[prop];
        } else {
            throw new Error(
                `trying to execute get data method: store.${prop} not exist`
            );
        }
    };

    // const id2 =  this.store.watch('prop', (newVal, oldVal) => {
    //     console.log('old val:', oldVal);
    //     console.log('new val:', newVal);
    //     }
    // );
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
    const unWatch = (id) => {
        fnStore = fnStore.filter((item) => item.id !== id);
    };

    // store.emit('prop');
    const emit = (prop) => {
        if (prop in store) {
            const fnByProp = fnStore.filter((item) => item.prop === prop);
            fnByProp.forEach((item, i) => {
                item.fn(store[prop], store[prop]);
            });
        } else {
            throw new Error(
                `trying to execute set data method: store.${prop} not exist`
            );
        }
    };

    const debug = () => {
        console.log(store);
    };

    return {
        setProp,
        getProp,
        watch,
        unWatch,
        emit,
        debug,
    };
}
