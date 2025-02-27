// @ts-check

import { HandleScrollerConstant } from './HandleScrollerConstant.js';

/**
 * @param {object} obj
 * @param {number} obj.prevValue
 * @param {number} obj.value
 * @param {number} obj.maxVal
 *
 * @returns {string}
 *
 */
const action = ({ prevValue, value, maxVal }) => {
    /**
     * ON_LEAVE
     **/
    if (
        (value >= maxVal && prevValue <= maxVal && maxVal >= 0) ||
        (value <= maxVal && prevValue >= maxVal && maxVal <= 0)
    )
        return HandleScrollerConstant.ON_LEAVE;

    /**
     * ON_ENTER_BACK
     **/
    if (
        (value > maxVal && prevValue <= maxVal && maxVal <= 0) ||
        (value < maxVal && prevValue >= maxVal && maxVal >= 0)
    )
        return HandleScrollerConstant.ON_ENTER_BACK;

    /**
     * ON_LEAVE_BACK
     **/
    if (
        (value >= 0 && prevValue <= 0 && maxVal <= 0) ||
        (value <= 0 && prevValue >= 0 && maxVal >= 0)
    )
        return HandleScrollerConstant.ON_LEAVE_BACK;

    /**
     * ON_ENTER
     **/
    if (
        (value > 0 && value < maxVal && prevValue <= 0 && maxVal >= 0) ||
        (value < 0 && prevValue >= 0 && maxVal <= 0)
    )
        return HandleScrollerConstant.ON_ENTER;

    return HandleScrollerConstant.ON_NOOP;
};

/**
 * @param {object} obj
 * @param {number} obj.prevValue
 * @param {number} obj.value
 * @param {number} obj.maxVal
 * @param {Function} obj.onEnter
 * @param {Function} obj.onEnterBack
 * @param {Function} obj.onLeave
 * @param {Function} obj.onLeaveBack
 *
 * @returns void
 *
 */
export function handleScrollerEmitter({
    prevValue,
    value,
    maxVal,
    onEnter,
    onEnterBack,
    onLeave,
    onLeaveBack,
}) {
    const fn = {
        [HandleScrollerConstant.ON_LEAVE]: () => {
            if (onLeave) onLeave();
        },
        [HandleScrollerConstant.ON_ENTER_BACK]: () => {
            if (onEnterBack) onEnterBack();
        },
        [HandleScrollerConstant.ON_LEAVE_BACK]: () => {
            if (onLeaveBack) onLeaveBack();
        },
        [HandleScrollerConstant.ON_ENTER]: () => {
            if (onEnter) onEnter();
        },
        [HandleScrollerConstant.ON_NOOP]: () => {},
    };

    fn[action({ prevValue, value, maxVal })]();
}
