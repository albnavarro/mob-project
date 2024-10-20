// @ts-check

import { runCallbackQueqe, runCallbackQueqeAsync } from './fireQueque';
import { getLogStyle } from './logStyle';
import { getStateFromMainMap } from './storeMap';
import { storeEmitWarning } from './storeWarining';

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {void}
 */
export const storeEmitEntryPoint = ({ instanceId, prop }) => {
    const { store, callBackWatcher, validationStatusObject } =
        getStateFromMainMap(instanceId);

    if (!store) return;

    if (prop in store) {
        runCallbackQueqe({
            callBackWatcher,
            prop,
            newValue: store[prop],
            oldValue: store[prop],
            validationValue: validationStatusObject[prop],
        });
    } else {
        storeEmitWarning(prop, getLogStyle());
    }
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @returns {Promise<any>}
 */
export const storeEmitAsyncEntryPoint = async ({ instanceId, prop }) => {
    const { store, callBackWatcher, validationStatusObject } =
        getStateFromMainMap(instanceId);

    if (!store) return { success: false };

    if (prop in store) {
        await runCallbackQueqeAsync({
            callBackWatcher,
            prop,
            newValue: store[prop],
            oldValue: store[prop],
            validationValue: validationStatusObject[prop],
        });

        return { success: true };
    } else {
        storeEmitWarning(prop, getLogStyle());
        return { success: false };
    }
};
