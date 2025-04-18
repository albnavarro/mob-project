// @ts-check
import { getRoundedValue, lerp } from '../utils/animation-utils';

/**
 * @param {Object} param
 * @param {import('./type').lerpValues[]} param.values
 * @param {number} param.fps
 * @param {number} param.velocity
 * @param {number} param.precision
 * @returns {import('./type').lerpValues[]}
 */
export const lerpGetValuesOnDraw = ({ values, fps, velocity, precision }) => {
    return values.map((item) => {
        if (item.settled) return item;

        const { currentValue, toValue } = item;

        const lerpValue = lerp(currentValue, toValue, (velocity / fps) * 60);
        const newCurrentValue = getRoundedValue(lerpValue);
        const settled =
            Number(Math.abs(toValue - newCurrentValue).toFixed(4)) <= precision;

        if (settled) {
            return {
                ...item,
                currentValue: toValue,
                settled: true,
            };
        }

        return {
            ...item,
            currentValue: newCurrentValue,
            settled: false,
        };
    });
};
