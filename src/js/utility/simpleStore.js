export function SimpleStore(data) {
  const fnStore = [];
  const store = { ...data };

  // this.store.setProp("prop", val);
  const setProp = (prop, val) => {
    if (prop in store) {

      const fnByProp = fnStore.filter((item) => item.prop === prop);
      fnByProp.forEach((item, i) => {
          item.fn(val, store[prop]);
      });

      store[prop] = val;

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


  // this.store.watch('prop', (newVal, oldVal) => {
  //     console.log('old val:', oldVal);
  //     console.log('new val:', newVal);
  //     }
  // );
  const watch = (prop, fn) => {
      fnStore.push({
          prop,
          fn,
      })
  }

  return {
    setProp,
    getProp,
    watch
  };
}
