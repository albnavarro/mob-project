// @ts-check

import { UNTYPED } from './storeType';
import { getLogStyle } from './logStyle';
import {
    inizializeSpecificProp,
    inizializeStoreData,
    maxDepth,
} from './storeUtils';

/**
 * @param {import('./type').MobStoreParams} data
 * @returns {import('./type').storeMapValue}
 */
export const inizializeInstance = (data) => {
    /**
     * @type {number}
     */
    const dataDepth = maxDepth(data);

    return {
        callBackWatcher: new Map(),
        callBackComputed: new Set(),
        computedPropsQueque: new Set(),
        validationStatusObject: {},
        dataDepth,
        computedRunning: false,
        store: inizializeStoreData({
            data,
            depth: dataDepth,
            logStyle: getLogStyle(),
        }),
        type: inizializeSpecificProp({
            data,
            prop: 'type',
            depth: dataDepth,
            logStyle: getLogStyle(),
            fallback: UNTYPED,
        }),
        fnTransformation: inizializeSpecificProp({
            data,
            prop: 'transform',
            depth: dataDepth,
            logStyle: getLogStyle(),
            fallback: (/** @type {any} */ value) => value,
        }),
        fnValidate: inizializeSpecificProp({
            data,
            prop: 'validate',
            depth: dataDepth,
            logStyle: getLogStyle(),
            fallback: () => true,
        }),
        strict: inizializeSpecificProp({
            data,
            prop: 'strict',
            depth: dataDepth,
            logStyle: getLogStyle(),
            fallback: false,
        }),
        skipEqual: inizializeSpecificProp({
            data,
            prop: 'skipEqual',
            depth: dataDepth,
            logStyle: getLogStyle(),
            fallback: true,
        }),
        proxiObject: undefined,
        bindInstance: [],
        unsubscribeBindInstance: [],
    };
};
