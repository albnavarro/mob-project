// @ts-check

import { getUnivoqueId } from '../utils';
import { getLogStyle } from './logStyle';
import { getStateFromMainMap, updateMainMap } from './storeMap';
import { storeWatchWarning } from './storeWarining';

/**
 * @param {import("./type").storeWatchAction} param
 * @returns {import('./type').storeWatchReturnObject}
 */
export const storeWatchAction = ({ state, prop, callback }) => {
    const { store, callBackWatcher } = state;
    const logStyle = getLogStyle();

    if (!(prop in store)) {
        storeWatchWarning(prop, logStyle);

        return {
            state: undefined,
            unsubscribeId: '',
        };
    }

    const id = getUnivoqueId();
    callBackWatcher.set(id, { fn: callback, prop });

    return {
        state: { ...state, callBackWatcher },
        unsubscribeId: id,
    };
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.unsubscribeId
 */
export const unsubScribeWatch = ({ instanceId, unsubscribeId }) => {
    const state = getStateFromMainMap(instanceId);
    const { callBackWatcher } = state;
    callBackWatcher.delete(unsubscribeId);
    updateMainMap(instanceId, { ...state, callBackWatcher });
};

/**
 * @param {Object} param
 * @param {string} param.instanceId
 * @param {string} param.prop
 * @param {(current: any, previous: any, validate: boolean | { [key: string]: boolean }) => void} param.callback
 * @returns {() => any}
 */
export const watchEntryPoint = ({ instanceId, prop, callback }) => {
    const state = getStateFromMainMap(instanceId);
    if (!state) return () => {};

    const { state: newState, unsubscribeId } = storeWatchAction({
        state,
        prop,
        callback,
    });

    if (!newState) return () => {};
    updateMainMap(instanceId, newState);

    return () => {
        unsubScribeWatch({ instanceId, unsubscribeId });
    };
};
