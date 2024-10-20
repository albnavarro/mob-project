// @ts-check

import { getStateFromMainMap, updateMainMap } from './storeMap';
import { storeSetAction } from './storeSet';
import { storeType } from './storeType';

/**
 * @param {import('./type').storeMapValue} initialState
 * @returns {import('./type').storeMapValue}
 */
export const inizializeValidation = (initialState) => {
    const { store } = initialState;

    /**
     * Initialize empty Object if prop is an object.
     * Need to avois error on validation assignment ( key in object doesn't exist ).
     * No collision with any, any is used with complete declaration ( type etc.. )
     */
    const validationStatusObject = Object.entries(store).reduce(
        (previous, current) => {
            const [key, value] = current;
            return storeType.isObject(value)
                ? { ...previous, [key]: {} }
                : previous;
        },
        {}
    );

    return { ...initialState, validationStatusObject };
};

/**
 * @param {string} instanceId
 * @param {import('./type').storeMapValue} initialState
 * @returns {void}
 */
export const inizializeAllProps = (instanceId, initialState) => {
    const { store } = initialState;

    /**
     * First run execute each propierites to check validation without fire event
     */
    Object.entries(store).forEach((item) => {
        const [prop, value] = item;

        /**
         * Get last updated state.
         */
        const state = getStateFromMainMap(instanceId);
        const newState = storeSetAction({
            instanceId,
            state,
            prop,
            value,
            fireCallback: false,
            useStrict: false,
        });

        if (!newState) return;

        /**
         * Update main store state
         */
        updateMainMap(instanceId, newState);
    });
};
