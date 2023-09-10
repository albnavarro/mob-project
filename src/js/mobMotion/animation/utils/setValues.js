/*
 * Set fromValue with currentValue
 *
 **/
export const setFromByCurrent = (arr) => {
    return arr.map((item) => {
        if (!item.settled) {
            item.fromValue = item.currentValue;
        }

        return item;
    });
};

/*
 * Set fromValue and currentValue with toValue
 *
 **/
export const setFromCurrentByTo = (arr) => {
    return arr.map((item) => {
        item.fromValue = item.toValue;
        item.currentValue = item.toValue;

        return item;
    });
};

/*
 * Set toValue and fromValue with currentValue
 *
 **/
export const setFromToByCurrent = (arr) => {
    return arr.map((item) => {
        item.toValue = item.currentValue;
        item.fromValue = item.currentValue;

        return item;
    });
};

/*
 * Revert fromValue and toValue
 *
 **/
export const setReverseValues = (obj, arr) => {
    const keysTorevert = Object.keys(obj);
    return arr.map((item) => {
        if (keysTorevert.includes(item.prop)) {
            const fromValue = item.fromValue;
            const toValue = item.toValue;
            item.fromValue = toValue;
            item.toValue = fromValue;
        }
        return item;
    });
};

/*
 * Set toValue in realtive mode, sum value from currentValue
 * Used by spring and lerp
 *
 **/
export const setRelative = (arr, relative) => {
    return arr.map((item) => {
        item.toValue = relative
            ? item.toValue + item.currentValue
            : item.toValue;
        return item;
    });
};

/*
 * Set toValue in realtive mode, sum value from currentValue
 * Used by classic tween
 *
 **/
const tweenSmallNumber = 0.000_01;
export const setRelativeTween = (arr, relative) => {
    return arr.map((item) => {
        if (item.shouldUpdate) {
            /*
                Prevent error on tween revert if is 0 some easeType can't run
                es: easeInElastic
                */
            item.toValProcessed = relative
                ? item.toValue + tweenSmallNumber
                : item.toValue - item.fromValue + tweenSmallNumber;
        }
        return item;
    });
};
