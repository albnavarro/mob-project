// @ts-check

import { MobScrollerConstant } from './mob-scroller-constant.js';

/**
 * @param {object} obj
 * @param {number} obj.prevValue
 * @param {number} obj.value
 * @param {number} obj.maxVal
 * @returns {string}
 */
const action = ({ prevValue, value, maxVal }) => {
    /**
     * ON_LEAVE
     */
    if (
        (value >= maxVal && prevValue <= maxVal && maxVal >= 0) ||
        (value <= maxVal && prevValue >= maxVal && maxVal <= 0)
    )
        return MobScrollerConstant.ON_LEAVE;

    /**
     * ON_ENTER_BACK
     */
    if (
        (value > maxVal && prevValue <= maxVal && maxVal <= 0) ||
        (value < maxVal && prevValue >= maxVal && maxVal >= 0)
    )
        return MobScrollerConstant.ON_ENTER_BACK;

    /**
     * ON_LEAVE_BACK
     */
    if (
        (value >= 0 && prevValue <= 0 && maxVal <= 0) ||
        (value <= 0 && prevValue >= 0 && maxVal >= 0)
    )
        return MobScrollerConstant.ON_LEAVE_BACK;

    /**
     * ON_ENTER
     */
    if (
        (value > 0 && value < maxVal && prevValue <= 0 && maxVal >= 0) ||
        (value < 0 && prevValue >= 0 && maxVal <= 0)
    )
        return MobScrollerConstant.ON_ENTER;

    return MobScrollerConstant.ON_NOOP;
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
 * @returns {void}
 */
export function MobScrollerEmitter({
    prevValue,
    value,
    maxVal,
    onEnter,
    onEnterBack,
    onLeave,
    onLeaveBack,
}) {
    const fn = {
        [MobScrollerConstant.ON_LEAVE]: () => {
            if (onLeave) onLeave();
        },
        [MobScrollerConstant.ON_ENTER_BACK]: () => {
            if (onEnterBack) onEnterBack();
        },
        [MobScrollerConstant.ON_LEAVE_BACK]: () => {
            if (onLeaveBack) onLeaveBack();
        },
        [MobScrollerConstant.ON_ENTER]: () => {
            if (onEnter) onEnter();
        },
        [MobScrollerConstant.ON_NOOP]: () => {},
    };

    fn[action({ prevValue, value, maxVal })]();
}
