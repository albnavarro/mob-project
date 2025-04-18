// @ts-check

import { getRoundedValue } from '../utils/animation-utils';

/**
 * @param {Object} param
 * @param {import('./type').SpringValues[]} param.values
 * @param {number} param.tension
 * @param {number} param.friction
 * @param {number} param.mass
 * @param {number} param.precision
 * @param {number} param.fps
 * @returns {import('./type').SpringValues[]}
 */
export const springGetValuesOndraw = ({
    values,
    tension,
    friction,
    mass,
    precision,
    fps,
}) => {
    return values.map((item) => {
        const { currentValue, toValue, velocity } = item;
        const tensionForce = -tension * (currentValue - toValue);
        const dampingForce = -friction * velocity;
        const acceleration = (tensionForce + dampingForce) / mass;

        // New values.
        const newVelocity = velocity + (acceleration * 1) / fps;
        const rawCurrentValue = currentValue + (newVelocity * 1) / fps;
        const newCurrentValue = getRoundedValue(rawCurrentValue);

        const isVelocity = Math.abs(newVelocity) <= 0.1;
        const isDisplacement =
            tension === 0
                ? true
                : Math.abs(toValue - newCurrentValue) <= precision;

        const settled = isVelocity && isDisplacement;

        if (settled) {
            return {
                ...item,
                currentValue: toValue,
                velocity: newVelocity,
                settled: true,
            };
        }

        return {
            ...item,
            currentValue: newCurrentValue,
            velocity: newVelocity,
            settled: false,
        };
    });
};
