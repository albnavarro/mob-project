/**
 * @type {import("./type").storeMap}
 */
export const storeMap = new Map();

/**
 * @param {string} id
 * @returns {import("./type").storeMapValue}
 */
export const getStateFromMainMap = (id) => ({ ...storeMap.get(id) });

/**
 * @param {string} id
 * @param {import("./type").storeMapValue} state
 * @returns {void}
 */
export const updateMainMap = (id, state) => storeMap.set(id, state);

/**
 * @param {string} id
 * @returns {void}
 */
export const removeStateFromMainMap = (id) => storeMap.delete(id);
