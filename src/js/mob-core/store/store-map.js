import { STORE_STRATEGY_SHALLOW_COPY, storeCopyStrategy } from './strategy';

/**
 * @type {import('./type').StoreMap}
 */
export const storeMap = new Map();

/**
 * Return a shallow-copy of store value.
 *
 * @param {string} id
 * @returns {import('./type').StoreMapValue | undefined}
 */
export const getStateFromMainMap = (id) => {
    if (storeCopyStrategy === STORE_STRATEGY_SHALLOW_COPY) {
        const valueNow = storeMap.get(id);

        /**
         * Sallow-copy of wrapper object
         */
        return valueNow ? { ...valueNow } : undefined;
    }

    /**
     * Default, full mutation.
     */
    return storeMap.get(id);
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
