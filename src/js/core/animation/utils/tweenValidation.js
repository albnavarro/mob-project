import { storeType } from '../../store/storeType';

/*
 * Check is value is number or function
 *
 **/
export const dataTweenValueIsValid = (val) => {
    return storeType.isNumber(val) || storeType.isFunction(val);
};
