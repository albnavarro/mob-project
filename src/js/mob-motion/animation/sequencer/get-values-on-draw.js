import { MobCore } from '../../../mob-core';
import { getRoundedValue } from '../utils/animation-utils';
import { checkIsLastUsableProp } from './reduce-function';

/**
 * @param {Object} param
 * @param {import('./type').SequencerRow[]} param.timeline
 * @param {import('./type').SequencerValue[]} param.valuesState
 * @param {number} param.partial
 * @returns {import('./type').SequencerValue[]}
 */
export const sequencerGetValusOnDraw = ({ timeline, valuesState, partial }) => {
    /**
     * @type {import('./type').SequencerValue[]}
     */
    return valuesState.map((valueItem) => {
        /**
         * @type {{
         *           toValue: number | function;
         *           fromValue: number | function;
         *           start: number;
         *           end: number;
         *           ease: function;
         *       }
         *     | {}}
         */
        const item = timeline.reduce(
            (previous, { start, end, values }, index) => {
                /**
                 * Find current valueState item in current timeline node.
                 */
                const currentValuesItem = values.find(
                    ({ prop }) => prop === valueItem.prop
                );

                /**
                 * Check if item is settled or not active or previous value was funded.
                 */
                if (
                    !currentValuesItem ||
                    !currentValuesItem?.active ||
                    Object.keys(previous).length > 0 ||
                    valueItem.settled
                )
                    return previous;

                const { prop, toValue, fromValue, ease } = currentValuesItem;

                /**
                 * Check if in the next step of timeline the same prop is active an start before partial
                 */
                const isLastUsableProp = checkIsLastUsableProp(
                    timeline,
                    index,
                    prop,
                    partial
                );

                /**
                 * Id the prop is settled or is inactive skip Check if in the next step of timeline the same prop is
                 * active an start before partial
                 */
                if (!isLastUsableProp) return previous;

                return {
                    toValue,
                    fromValue,
                    start,
                    end,
                    ease,
                };
            },
            {}
        );

        /**
         * Prop not found
         */
        if (Object.keys(item).length === 0) return valueItem;

        // @ts-ignore
        const { start, end, toValue, fromValue, ease } = item;

        const newToValue = MobCore.checkType(Number, toValue)
            ? toValue
            : // @ts-ignore
              toValue();

        const newFromValue = MobCore.checkType(Number, fromValue)
            ? fromValue
            : // @ts-ignore
              fromValue();

        /**
         * At least we get the current value
         */
        const duration = end - start;
        const inactivePosition = partial < end ? newFromValue : newToValue;

        const newCurrentValue =
            partial >= start && partial <= end
                ? ease(
                      partial - start,
                      newFromValue,
                      newToValue - newFromValue,
                      duration
                  )
                : inactivePosition;

        const newCurrentValueSanitize = Number.isNaN(newCurrentValue)
            ? inactivePosition
            : newCurrentValue;

        const currentValueRoudned = getRoundedValue(newCurrentValueSanitize);

        return {
            ...valueItem,
            currentValue: currentValueRoudned,
            settled: true,
        };
    });
};
