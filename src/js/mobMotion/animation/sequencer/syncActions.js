// @ts-check

import { getTweenFn } from '../tween/tweenConfig.js';
import { dataTweenValueIsValid } from '../utils/tweenAction/tweenValidation.js';
import { dataTweenValueIsNotValidWarning } from '../utils/warning.js';

/**
 * @param {import('../utils/tweenAction/type.js').valueToparseType} obj
 * @param {string|undefined} ease
 *
 * @returns {object}
 */
export const goToSyncUtils = (obj, ease) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);
            return {
                prop: item,
                toValue: 0,
                ease: getTweenFn(ease),
            };
        }

        return {
            prop: item,
            toValue: obj[item],
            ease: getTweenFn(ease),
        };
    });
};

/**
 * @param {import('../utils/tweenAction/type.js').valueToparseType} obj
 * @param {string|undefined} ease
 *
 * @returns {object}
 */
export const goFromSyncUtils = (obj, ease) => {
    return Object.keys(obj).map((item) => {
        if (!dataTweenValueIsValid(obj[item])) {
            dataTweenValueIsNotValidWarning(`${item}: ${obj[item]}`);
            return {
                prop: item,
                fromValue: 0,
                ease: getTweenFn(ease),
            };
        }

        return {
            prop: item,
            fromValue: obj[item],
            ease: getTweenFn(ease),
        };
    });
};

/**
 * @param {import('../utils/tweenAction/type.js').valueToparseType} fromObj
 * @param {import('../utils/tweenAction/type.js').valueToparseType} toObj
 * @param {string|undefined} ease
 *
 * @returns {object}
 */
export const goFromToSyncUtils = (fromObj, toObj, ease) => {
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
                toValue: 0,
                ease: getTweenFn(ease),
            };
        }

        return {
            prop: item,
            fromValue: fromObj[item],
            toValue: toObj[item],
            ease: getTweenFn(ease),
        };
    });
};
