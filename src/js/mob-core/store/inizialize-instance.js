import { UNTYPED } from './store-type';
import {
    inizializeSpecificProp,
    inizializeStoreData,
    maxDepth,
} from './store-utils';
import {
    STORE_SKIP_EQUAL_KEY,
    STORE_STRICT_KEY,
    STORE_TRANSFORM_KEY,
    STORE_TYPE_KEY,
    STORE_VALIDATE_KEY,
} from './constant';

/**
 * @param {import('./type').MobStoreParams} data
 * @returns {import('./type').StoreMapValue}
 */
export const inizializeInstance = (data) => {
    /**
     * @type {number}
     */
    const dataDepth = maxDepth(data);

    return {
        watcherByProp: new Map(),
        watcherMetadata: new Map(),
        callBackComputed: new Set(),
        computedPropsQueque: new Set(),
        validationStatusObject: {},
        dataDepth,
        computedRunning: false,
        store: inizializeStoreData({
            data,
        }),
        type: inizializeSpecificProp({
            data,
            prop: STORE_TYPE_KEY,
            fallback: UNTYPED,
        }),
        fnTransformation: inizializeSpecificProp({
            data,
            prop: STORE_TRANSFORM_KEY,
            fallback: (/** @type {any} */ value) => value,
        }),
        fnValidate: inizializeSpecificProp({
            data,
            prop: STORE_VALIDATE_KEY,
            fallback: () => true,
        }),
        strict: inizializeSpecificProp({
            data,
            prop: STORE_STRICT_KEY,
            fallback: false,
        }),
        skipEqual: inizializeSpecificProp({
            data,
            prop: STORE_SKIP_EQUAL_KEY,
            fallback: true,
        }),
        proxiObject: undefined,
        boundedProxiObject: undefined,
        selfProxiObject: undefined,
        bindInstance: [],
        bindInstanceBy: [],
        unsubscribeBindInstance: [],
        proxiReadOnlyProp: new Set(),
    };
};
