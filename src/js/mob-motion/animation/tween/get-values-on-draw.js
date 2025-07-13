import { getRoundedValue } from '../utils/animation-utils';

/**
 * @param {Object} param
 * @param {import('./type').TimeTweenStoreData[]} param.values
 * @param {number} param.timeElapsed
 * @param {number} param.duration
 * @param {Function} param.ease
 * @returns {import('./type').TimeTweenStoreData[]}
 */
export const tweenGetValueOnDraw = ({
    values,
    timeElapsed,
    duration,
    ease,
}) => {
    return values.map((item) => {
        if (item.shouldUpdate) {
            const rawCurrentValue = ease(
                timeElapsed,
                item.fromValue,
                item.toValProcessed,
                duration
            );

            return {
                ...item,
                currentValue: getRoundedValue(rawCurrentValue),
            };
        }

        return {
            ...item,
            currentValue: item.fromValue,
        };
    });
};
