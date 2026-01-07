import { STORE_SET } from './constant';
import { storeSetEntryPoint } from './store-set';
import { storeType } from './store-type';

/**
 * @param {import('./type').StoreMapValue} initialState
 * @returns {import('./type').StoreMapValue}
 */
export const inizializeValidation = (initialState) => {
    const { store } = initialState;

    /**
     * Initialize empty Object if prop is an object. Need to avois error on validation assignment ( key in object
     * doesn't exist ). No collision with any, any is used with complete declaration ( type etc.. )
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
 * @param {import('./type').StoreMapValue} initialState
 * @returns {void}
 */
export const inizializeAllProps = (instanceId, initialState) => {
    const { store } = initialState;

    /**
     * First run execute each propierites to check validation without fire event
     */
    Object.entries(store).forEach((item) => {
        const [prop, value] = item;

        storeSetEntryPoint({
            instanceId,
            prop,
            value,
            fireCallback: false,
            useStrict: false,
            action: STORE_SET,
            initalizeStep: true,
        });
    });
};
