// @ts-check

import { MobCore } from '../../../../mob-core/index.js';
import { dataTweenValueIsValid } from './tween-validation.js';
import { dataTweenValueIsNotValidWarning } from '../warning.js';

/**
 * Set goTo value, used by spring and lerp
 *
 * @param {Record<string, number | (() => number)>} obj
 * @returns {import('./type.js').GoToParamsType[]}
 */
export const parseGoToObject = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);

            return {
                prop: item,
                toValue: 0,
                toFn: () => 0,
                toIsFn: false,
                settled: false,
            };
        }

        const toValue = MobCore.checkType(Number, obj[item])
            ? obj[item]
            : // @ts-ignore
              (obj[item]?.() ?? 0);

        return {
            prop: item,
            toValue,
            toFn: /** @type{() => number} */ (obj[item]),
            toIsFn: MobCore.checkType(Function, obj[item]),
            settled: false,
        };
    });
};

/**
 * Set goFrom value, used by spring and lerp
 *
 * @param {Record<string, number | (() => number)>} obj
 * @returns {import('./type.js').GoFromType[]}
 */
export const parseGoFromObject = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);

            return {
                prop: item,
                fromValue: 0,
                currentValue: 0,
                fromFn: () => 0,
                fromIsFn: false,
                settled: false,
            };
        }
        const value = MobCore.checkType(Number, obj[item])
            ? obj[item]
            : // @ts-ignore
              (obj[item]?.() ?? 0);

        return {
            prop: item,
            fromValue: value,
            currentValue: value,
            fromFn: /** @type{() => number} */ (obj[item]),
            fromIsFn: MobCore.checkType(Function, obj[item]),
            settled: false,
        };
    });
};

/**
 * Set goFromTo value, used by spring and lerp
 *
 * @param {Record<string, number | (() => number)>} fromObj
 * @param {Record<string, number | (() => number)>} toObj
 * @returns {import('./type.js').GoFromToType[]}
 */
export const parseGoFromToObject = (fromObj, toObj) => {
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
                fromFn: () => 0,
                fromIsFn: false,
                currentValue: 0,
                toValue: 0,
                toFn: () => 0,
                toIsFn: false,
                settled: false,
            };
        }

        const fromValue = MobCore.checkType(Number, fromObj[item])
            ? fromObj[item]
            : // @ts-ignore
              (fromObj[item]?.() ?? 0);

        const toValue = MobCore.checkType(Number, toObj[item])
            ? toObj[item]
            : // @ts-ignore
              (toObj[item]?.() ?? 0);

        return {
            prop: item,
            fromValue,
            fromFn: /** @type{() => number} */ (fromObj[item]),
            fromIsFn: MobCore.checkType(Function, fromObj[item]),
            currentValue: fromValue,
            toValue,
            toFn: /** @type{() => number} */ (toObj[item]),
            toIsFn: MobCore.checkType(Function, toObj[item]),
            settled: false,
        };
    });
};

/**
 * Set set value, used by spring and lerp
 *
 * @param {Record<string, number | (() => number)>} obj
 * @returns {import('./type.js').GoFromToType[]}
 */
export const parseSetObject = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);

            return {
                prop: item,
                fromValue: 0,
                fromFn: () => 0,
                fromIsFn: false,
                currentValue: 0,
                toValue: 0,
                toFn: () => 0,
                toIsFn: false,
                settled: false,
            };
        }
        const value = MobCore.checkType(Number, obj[item])
            ? obj[item]
            : // @ts-ignore
              (obj[item]?.() ?? 0);

        return {
            prop: item,
            fromValue: value,
            fromFn: /** @type{() => number} */ (obj[item]),
            fromIsFn: MobCore.checkType(Function, obj[item]),
            currentValue: value,
            toValue: value,
            toFn: /** @type{() => number} */ (obj[item]),
            toIsFn: MobCore.checkType(Function, obj[item]),
            settled: false,
        };
    });
};
