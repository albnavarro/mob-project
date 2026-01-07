import { STORE_SET } from './constant';
import { setCurrentDependencies } from './current-key';
import { getLogStyle } from './log-style';
import { storeMap, updateMainMap } from './store-map';
import { storeSetEntryPoint } from './store-set';
import { checkIfPropIsComputed } from './store-utils';
import { storeProxiReadOnlyWarning } from './store-warining';
import { storeStrategyNeedCopy } from './strategy';

/**
 * Proxi state/states with the original reference of store object.
 *
 * @param {object} params
 * @param {string} params.instanceId
 * @returns {Record<string, any>}
 */
export const getProxiEntryPoint = ({ instanceId }) => {
    const logStyle = getLogStyle();
    const state = storeMap.get(instanceId);
    if (!state) return {};

    const {
        bindInstance,
        proxiObject: previousProxiObject,
        proxiReadOnlyProp,
    } = state;

    /**
     * Return previous proxi if exist.
     */
    if (previousProxiObject) {
        return previousProxiObject;
    }

    const store = state?.store;

    /**
     * Create self proxi
     */
    const selfProxi = new Proxy(store, {
        set(target, /** @type {string} */ prop, value) {
            /**
             * - With shallow copy refer to original store reference
             * - With custom copy get update store from main map, copies here is not necessary.
             * - Fallback to target if component is destroyed and there is no reference, typically call proxi after
             *   destroy
             */
            const store = storeStrategyNeedCopy()
                ? (storeMap.get(instanceId)?.store ?? target)
                : target;

            if (!store) return false;

            if (prop in store) {
                const isComputed = checkIfPropIsComputed({ instanceId, prop });
                const isReadOnly = proxiReadOnlyProp.has(prop);

                if (isReadOnly) {
                    storeProxiReadOnlyWarning(prop, logStyle);
                }

                if (isComputed || isReadOnly) return false;

                storeSetEntryPoint({
                    instanceId,
                    prop,
                    value,
                    fireCallback: true,
                    clone: false,
                    action: STORE_SET,
                });

                return true;
            }

            return false;
        },
        get(target, /** @type {string} */ prop) {
            /**
             * - With shallow copy refer to original store reference
             * - With custom copy get update store from main map, copies here is not necessary.
             * - Fallback to target if component is destroyed and there is no reference, typically call proxi after
             *   destroy
             */
            const store = storeStrategyNeedCopy()
                ? (storeMap.get(instanceId)?.store ?? target)
                : target;

            if (!store) return false;

            if (!(prop in store)) {
                return false;
            }

            /**
             * Autodetect dependencies
             */
            setCurrentDependencies(prop);

            /**
             * Return value
             */
            return store[prop];
        },
    });

    /**
     * Rerturn self proxi if no bindedInstace is used.
     */

    if (!bindInstance || bindInstance.length === 0) {
        updateMainMap(instanceId, {
            ...state,
            proxiObject: selfProxi,
        });

        return selfProxi;
    }

    /**
     * Create proxi for binded store. Binded proxi has only read operation.
     */
    const bindedProxi = bindInstance.map((id) => {
        const state = storeMap.get(id);
        const store = state?.store ?? {};

        return new Proxy(store, {
            set() {
                return false;
            },
            get(target, /** @type {string} */ prop) {
                /**
                 * - With shallow copy refer to original store reference
                 * - With custom copy get update store from main map, copies here is not necessary.
                 * - Fallback to target if component is destroyed and there is no reference, typically call proxi after
                 *   destroy
                 */
                const store = storeStrategyNeedCopy()
                    ? (storeMap.get(id)?.store ?? target)
                    : target;

                if (!store) return false;

                if (!(prop in store)) {
                    return false;
                }

                /**
                 * Autodetect dependencies
                 */
                setCurrentDependencies(prop);

                /**
                 * Return value
                 */
                return store[prop];
            },
        });
    });

    /**
     * Create a proxy with all new proxi. Reflect operation to the proxies with prop
     */
    const bindedProxiArray = new Proxy([selfProxi, ...bindedProxi], {
        set(proxies, prop, value) {
            const currentProxi = proxies.find((proxi) => prop in proxi);
            if (!currentProxi) return false;

            Reflect.set(currentProxi, prop, value);
            return true;
        },
        get(proxies, prop) {
            const currentProxi = proxies.find((proxi) => prop in proxi);
            if (!currentProxi) return false;

            return Reflect.get(currentProxi, prop);
        },
    });

    updateMainMap(instanceId, {
        ...state,
        proxiObject: bindedProxiArray,
    });

    return bindedProxiArray;
};
