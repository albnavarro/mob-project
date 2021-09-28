export function SimpleStore(data) {
  const store = { ...data };

  const setProp = (prop, val) => {
    if (prop in store) {
      store[prop] = val;
    } else {
      throw new Error(
        `trying to execute set data method: store.${prop} not exist`
      );
    }
  };

  const getProp = (prop) => {
    if (prop in store) {
      return store[prop];
    } else {
      throw new Error(
        `trying to execute get data method: store.${prop} not exist`
      );
    }
  };

  return {
    setProp,
    getProp,
  };
}
