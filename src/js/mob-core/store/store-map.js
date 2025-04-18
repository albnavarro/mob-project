/**
 * @type {import('./type').StoreMap}
 */
export const storeMap = new Map();

/**
 * @param {string} id
 * @returns {import('./type').StoreMapValue | undefined}
 */
export const getStateFromMainMap = (id) => {
    const valueNow = storeMap.get(id);
    return valueNow ? { ...valueNow } : undefined;
};

/**
 * @param {string} id
 * @param {import('./type').StoreMapValue} state
 * @returns {void}
 */
export const updateMainMap = (id, state) => {
    storeMap.set(id, state);
};

/**
 * @param {string} id
 * @returns {void}
 */
export const removeStateFromMainMap = (id) => {
    storeMap.delete(id);
};
