// @ts-check

import { mobCore } from '../../../../mobCore/index.js';
import { dataTweenValueIsValid } from './tweenValidation.js';
import { dataTweenValueIsNotValidWarning } from '../warning.js';

/**
 * @param {import('./type.js').valueToparseType} obj
 * @return {Object}
 *
 * @description
 * Set goTo value, used by spring and lerp
 */
export const goToUtils = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);

            return {
                prop: item,
                toValue: 0,
                toFn: () => {},
                toIsFn: false,
                settled: false,
            };
        }

        const toValue = mobCore.checkType(Number, obj[item])
            ? obj[item]
            : // @ts-ignore
              obj[item]();

        return {
            prop: item,
            toValue,
            toFn: obj[item],
            toIsFn: mobCore.checkType(Function, obj[item]),
            settled: false,
        };
    });
};

/**
 * @param {import('./type.js').valueToparseType} obj
 * @return {Object}
 *
 * @description
 * Set goFrom value, used by spring and lerp
 */
export const goFromUtils = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);

            return {
                prop: item,
                fromValue: 0,
                currentValue: 0,
                fromFn: () => {},
                fromIsFn: false,
                settled: false,
            };
        }
        const value = mobCore.checkType(Number, obj[item])
            ? obj[item]
            : // @ts-ignore
              obj[item]();

        return {
            prop: item,
            fromValue: value,
            currentValue: value,
            fromFn: obj[item],
            fromIsFn: mobCore.checkType(Function, obj[item]),
            settled: false,
        };
    });
};

/**
 * @param {import('./type.js').valueToparseType} fromObj
 * @param {import('./type.js').valueToparseType} toObj
 * @return {Object}
 *
 * @description
 * Set goFromTo value, used by spring and lerp
 */
export const goFromToUtils = (fromObj, toObj) => {
    return Object.keys(fromObj).map((item) => {
        if (
            !dataTweenValueIsValid(toObj[item]) ||
            !dataTweenValueIsValid(fromObj[item])
        ) {
            dataTweenValueIsNotValidWarning(
                `${item}: ${toObj[item]} || ${item}: ${fromObj[item]}`
            );

            return {
                prop: item,
                fromValue: 0,
                fromFn: () => {},
                fromIsFn: false,
                currentValue: 0,
                toValue: 0,
                toFn: () => {},
                toIsFn: false,
                settled: false,
            };
        }

        const fromValue = mobCore.checkType(Number, fromObj[item])
            ? fromObj[item]
            : // @ts-ignore
              fromObj[item]();

        const toValue = mobCore.checkType(Number, toObj[item])
            ? toObj[item]
            : // @ts-ignore
              toObj[item]();

        return {
            prop: item,
            fromValue,
            fromFn: fromObj[item],
            fromIsFn: mobCore.checkType(Function, fromObj[item]),
            currentValue: fromValue,
            toValue,
            toFn: toObj[item],
            toIsFn: mobCore.checkType(Function, toObj[item]),
            settled: false,
        };
    });
};

/**
 * @param {import('./type.js').valueToparseType} obj
 * @returns {Object}
 *
 * @description
 * Set set value, used by spring and lerp
 */
export const setUtils = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);

            return {
                prop: item,
                fromValue: 0,
                fromFn: () => {},
                fromIsFn: false,
                currentValue: 0,
                toValue: 0,
                toFn: () => {},
                toIsFn: false,
                settled: false,
            };
        }
        const value = mobCore.checkType(Number, obj[item])
            ? obj[item]
            : // @ts-ignore
              obj[item]();

        return {
            prop: item,
            fromValue: value,
            fromFn: obj[item],
            fromIsFn: mobCore.checkType(Function, obj[item]),
            currentValue: value,
            toValue: value,
            toFn: obj[item],
            toIsFn: mobCore.checkType(Function, obj[item]),
            settled: false,
        };
    });
};
