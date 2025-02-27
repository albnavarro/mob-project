import { STORE_SET } from './constant';
import { storeMap, updateMainMap } from './storeMap';
import { storeSetEntryPoint } from './storeSet';
import { checkIfPropIsComputed } from './storeUtils';

/**
 * @description
 * Proxi state/states with the original reference of store object.
 *
 * @param {object} params
 * @param {string} params.instanceId
 * @returns {Record<string, any>}
 */
export const getProxiEntryPoint = ({ instanceId }) => {
    const state = storeMap.get(instanceId);
    if (!state) return {};

    const { bindInstance, proxiObject: previousProxiObject } = state;

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
        set(target, /** @type{string} */ prop, value) {
            if (prop in target) {
                const isComputed = checkIfPropIsComputed({ instanceId, prop });
                if (isComputed) return false;

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
     * Create proxi for binded store.
     * Binded proxi has only read operation.
     */
    const bindedProxi = bindInstance.map((id) => {
        const state = storeMap.get(id);
        const store = state?.store ?? {};

        return new Proxy(store, {
            set() {
                return false;
            },
        });
    });

    /**
     * Create a proxy with all new proxi.
     * Reflect operation to the proxies with prop
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
