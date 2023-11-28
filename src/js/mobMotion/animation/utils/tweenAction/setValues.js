// @ts-check

/**
 * @description
 * Set fromValue with currentValue
 *
 * @param {Array} arr
 * @returns {Array}
 */
export const setFromByCurrent = (arr) => {
    return arr.map((item) => {
        if (!item.settled) {
            item.fromValue = item.currentValue;
        }

        return item;
    });
};

/**
 * @description
 * Set fromValue and currentValue with toValue
 *
 * @param {Array} arr
 * @returns {Array}
 */
export const setFromCurrentByTo = (arr) => {
    return arr.map((item) => {
        item.fromValue = item.toValue;
        item.currentValue = item.toValue;

        return item;
    });
};

/**
 * @description
 * Set toValue and fromValue with currentValue
 *
 * @param {Array} arr
 * @returns {Array}
 */
export const setFromToByCurrent = (arr) => {
    return arr.map((item) => {
        item.toValue = item.currentValue;
        item.fromValue = item.currentValue;

        return item;
    });
};

/**
 * @description
 * Revert fromValue and toValue
 *
 * @param {import("./type").valueToparseType} obj
 * @param {Array} arr
 *
 * @returns {Array} arr
 *
 */
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

/**
 * @description
 * Set toValue in relative mode, sum value from currentValue
 * Used by spring and lerp
 *
 * @param {Array} arr
 * @param {boolean} relative
 *
 * @returns {Array} arr
 *
 */
export const setRelative = (arr, relative) => {
    return arr.map((item) => {
        item.toValue = relative
            ? item.toValue + item.currentValue
            : item.toValue;
        return item;
    });
};

/**
 * @type {number}
 */
const tweenSmallNumber = 0.000_01;

/**
 * @description
 * Set toValue in relative mode, sum value from currentValue
 * Used by classic tween
 *
 * @param {Array} arr
 * @param {boolean} relative
 *
 * @returns {Array} arr
 *
 */
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
