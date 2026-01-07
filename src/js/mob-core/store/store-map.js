import { deepClone } from './clone-obj';
import {
    STORE_STRATEGY_CUSTOM_COPY,
    STORE_STRATEGY_DEEP_COPY,
    STORE_STRATEGY_SHALLOW_COPY,
    storeCopyStrategy,
} from './strategy';

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

    if (storeCopyStrategy === STORE_STRATEGY_CUSTOM_COPY) {
        const valueNow = storeMap.get(id);

        /**
         * Sallow-copy of wrapper store and validationStatusObject
         */
        return valueNow
            ? {
                  ...valueNow,
                  store: { ...valueNow.store },
                  validationStatusObject: {
                      ...valueNow.validationStatusObject,
                  },
              }
            : undefined;
    }

    if (storeCopyStrategy === STORE_STRATEGY_DEEP_COPY) {
        const valueNow = storeMap.get(id);

        /**
         * Deep-copy of wrapper store and validationStatusObject
         *
         * - Store && validationStatusObject is the only object where propierties should be overridden.
         * - Test only overridden object not new insert or delete propierties
         * - Primiteves is copy with shallow-copy by defat.
         */
        return valueNow
            ? {
                  ...valueNow,
                  store: deepClone(valueNow.store),
                  validationStatusObject: deepClone(
                      valueNow.validationStatusObject
                  ),
              }
            : undefined;
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
