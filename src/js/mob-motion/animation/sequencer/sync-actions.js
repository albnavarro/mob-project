import { getTweenFn } from '../tween/tween-config.js';
import { dataTweenValueIsValid } from '../utils/tween-action/tween-validation.js';
import { dataTweenValueIsNotValidWarning } from '../utils/warning.js';

/**
 * @param {Record<string, number | (() => number)>} obj
 * @param {string} ease
 * @returns {{ prop: string; toValue: number | (() => number); ease: () => void }[]}
 */
export const goToSyncUtils = (obj, ease) => {
    return Object.entries(obj).map(([item, value]) => {
        if (!dataTweenValueIsValid(value)) {
            dataTweenValueIsNotValidWarning(`${item}: ${value}`);
            return {
                prop: item,
                toValue: 0,
                ease: getTweenFn(ease),
            };
        }

        return {
            prop: item,
            toValue: value,
            ease: getTweenFn(ease),
        };
    });
};

/**
 * @param {Record<string, number | (() => number)>} obj
 * @param {string} ease
 * @returns {{ prop: string; fromValue: number | (() => number); ease: () => void }[]}
 */
export const goFromSyncUtils = (obj, ease) => {
    return Object.entries(obj).map(([item, value]) => {
        if (!dataTweenValueIsValid(value)) {
            dataTweenValueIsNotValidWarning(`${item}: ${value}`);
            return {
                prop: item,
                fromValue: 0,
                ease: getTweenFn(ease),
            };
        }

        return {
            prop: item,
            fromValue: value,
            ease: getTweenFn(ease),
        };
    });
};

/**
 * @param {Record<string, number | (() => number)>} fromObj
 * @param {Record<string, number | (() => number)>} toObj
 * @param {string} ease
 * @returns {{
 *     prop: string;
 *     fromValue: number | (() => number);
 *     toValue: number | (() => number);
 *     ease: () => void;
 * }[]}
 */
export const goFromToSyncUtils = (fromObj, toObj, ease) => {
    return Object.entries(fromObj).map(([item, fromValue]) => {
        const toValue = toObj[item];

        if (
            !dataTweenValueIsValid(toValue) ||
            !dataTweenValueIsValid(fromValue)
        ) {
            dataTweenValueIsNotValidWarning(
                `${item}: ${toValue} || ${item}: ${fromValue}`
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
            fromValue,
            toValue,
            ease: getTweenFn(ease),
        };
    });
};
