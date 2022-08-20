import { getTweenFn } from '../tween/tweenConfig.js';
import { valueIsValid } from '../utils/actions.js';
import { valueIsNotValidWarning } from '../utils/warning.js';

export const goToSync = (obj, ease) => {
    return Object.keys(obj).map((item) => {
        if (!valueIsValid(obj[item])) {
            valueIsNotValidWarning(`${item}: ${obj[item]}`);
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

export const goFromSync = (obj, ease) => {
    return Object.keys(obj).map((item) => {
        if (!valueIsValid(obj[item])) {
            valueIsNotValidWarning(`${item}: ${obj[item]}`);
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

export const goFromToSync = (fromObj, toObj, ease) => {
    return Object.keys(fromObj).map((item) => {
        if (!valueIsValid(toObj[item]) || !valueIsValid(fromObj[item])) {
            valueIsNotValidWarning(
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
