// @ts-check

import { parallaxConstant } from './parallaxConstant.js';

/**
 * @param {object} obj
 * @param {number} obj.prevValue
 * @param {number} obj.value
 * @param {number} obj.maxVal
 * @param {function} obj.onEnter
 * @param {function} obj.onEnterBack
 * @param {function} obj.onLeave
 * @param {function} obj.onLeaveBack
 *
 * @returns void
 *
 */
export function parallaxEmitter({
    prevValue,
    value,
    maxVal,
    onEnter,
    onEnterBack,
    onLeave,
    onLeaveBack,
}) {
    const action = () => {
        /**
         * ON_LEAVE
         **/
        if (
            (value >= maxVal && prevValue <= maxVal && maxVal >= 0) ||
            (value <= maxVal && prevValue >= maxVal && maxVal <= 0)
        )
            return parallaxConstant.ON_LEAVE;

        /**
         * ON_ENTER_BACK
         **/
        if (
            (value > maxVal && prevValue <= maxVal && maxVal <= 0) ||
            (value < maxVal && prevValue >= maxVal && maxVal >= 0)
        )
            return parallaxConstant.ON_ENTER_BACK;

        /**
         * ON_LEAVE_BACK
         **/
        if (
            (value >= 0 && prevValue <= 0 && maxVal <= 0) ||
            (value <= 0 && prevValue >= 0 && maxVal >= 0)
        )
            return parallaxConstant.ON_LEAVE_BACK;

        /**
         * ON_ENTER
         **/
        if (
            (value > 0 && value < maxVal && prevValue <= 0 && maxVal >= 0) ||
            (value < 0 && prevValue >= 0 && maxVal <= 0)
        )
            return parallaxConstant.ON_ENTER;

        return parallaxConstant.ON_NOOP;
    };

    const fn = {
        [parallaxConstant.ON_LEAVE]: () => {
            if (onLeave) onLeave();
        },
        [parallaxConstant.ON_ENTER_BACK]: () => {
            if (onEnterBack) onEnterBack();
        },
        [parallaxConstant.ON_LEAVE_BACK]: () => {
            if (onLeaveBack) onLeaveBack();
        },
        [parallaxConstant.ON_ENTER]: () => {
            if (onEnter) onEnter();
        },
        [parallaxConstant.ON_NOOP]: () => {},
    };

    fn[action()]();
}
