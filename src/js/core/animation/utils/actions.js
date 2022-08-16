import { storeType } from '../../store/storeType.js';

const valueIsValid = (val) => {
    return storeType.isNumber(val) || storeType.isFunction(val);
};

export const goTo = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!valueIsValid(obj[item])) return;
        const toValue = storeType.isNumber(obj[item]) ? obj[item] : obj[item]();

        return {
            prop: item,
            toValue,
            toFn: obj[item],
            toIsFn: storeType.isFunction(obj[item]),
            settled: false,
        };
    });
};

export const goFrom = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!valueIsValid(obj[item])) return;
        const value = storeType.isNumber(obj[item]) ? obj[item] : obj[item]();

        return {
            prop: item,
            fromValue: value,
            currentValue: value,
            fromFn: obj[item],
            fromIsFn: storeType.isFunction(obj[item]),
            settled: false,
        };
    });
};

export const goFromTo = (fromObj, toObj) => {
    return Object.keys(fromObj).map((item) => {
        if (!valueIsValid(toObj[item]) || !valueIsValid(fromObj[item])) return;

        const fromValue = storeType.isNumber(fromObj[item])
            ? fromObj[item]
            : fromObj[item]();

        const toValue = storeType.isNumber(toObj[item])
            ? toObj[item]
            : toObj[item]();

        return {
            prop: item,
            fromValue,
            fromFn: fromObj[item],
            fromIsFn: storeType.isFunction(fromObj[item]),
            currentValue: fromValue,
            toValue,
            toFn: toObj[item],
            toIsFn: storeType.isFunction(toObj[item]),
            settled: false,
        };
    });
};

export const set = (obj) => {
    return Object.keys(obj).map((item) => {
        if (!valueIsValid(obj[item])) return;
        const value = storeType.isNumber(obj[item]) ? obj[item] : obj[item]();

        return {
            prop: item,
            fromValue: value,
            fromFn: obj[item],
            fromIsFn: storeType.isFunction(obj[item]),
            currentValue: value,
            toValue: value,
            toFn: obj[item],
            toIsFn: storeType.isFunction(obj[item]),
            settled: false,
        };
    });
};
