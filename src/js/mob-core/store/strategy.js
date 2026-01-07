/**
 * DEFAULT
 *
 * Refer directly to original data.
 */
export const STORE_STRATEGY_DEFAULT = 'store_default';

/**
 * SHALLOW COPY
 *
 * Create a copy of `wrapper` witch contains data.
 *
 * - Propierties refer to original data. Proxies use original state in map
 */
export const STORE_STRATEGY_SHALLOW_COPY = 'store_shallow_copy';

/**
 * CUSTOM COPY
 *
 * In getStateFromMainMap() is possible return a custom copy of data.
 */
export const STORE_STRATEGY_CUSTOM_COPY = 'store_custom_copy';

/**
 * DEEP COPY
 *
 * Deep copy of store and validationStatusObject for testing purpose.
 */
export const STORE_STRATEGY_DEEP_COPY = 'store_deep_copy';

/**
 * BOTH CASE:
 *
 * In both case, for consistency, data is update like use CUSTOM COPY strategy.
 *
 * @type {string}
 */
export const storeCopyStrategy = STORE_STRATEGY_SHALLOW_COPY;

/**
 * Proxies need fresh copy of store each time set && get is invoked.
 */
export const storeStrategyNeedCopy = () =>
    storeCopyStrategy === STORE_STRATEGY_CUSTOM_COPY ||
    storeCopyStrategy === STORE_STRATEGY_DEEP_COPY;
