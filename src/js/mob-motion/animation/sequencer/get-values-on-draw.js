import { MobCore } from '../../../mob-core/index.js';
import { getRoundedValue } from '../utils/animation-utils.js';
import { checkIsLastUsableProp } from './reduce-function.js';

/**
 * For each animated property (x, rotate, opacity, etc.), find the correct timeline segment at the current `partial`
 * position and compute the interpolated value.
 *
 * - A timeline can define multiple segments for the same property over different time ranges (e.g. rotate: 0→90 from 1 to
 *   2, then 90→180 from 4 to 7).
 * - This function resolves which segment is "active" for each property at the given partial, computes the eased value
 *   when partial falls inside the segment range, or clamps to the boundary value (fromValue / toValue) when partial is
 *   outside.
 *
 * The values are mutated in-place to avoid allocations in the requestAnimationFrame hot path.
 *
 * ValuesState is returned for leggebility in caller function, in reality only object pointer is passed.
 *
 * @param {Object} param
 * @param {import('./type.js').SequencerRow[]} param.timeline
 * @param {import('./type.js').SequencerValue[]} param.valuesState
 * @param {number} param.partial
 * @returns {import('./type.js').SequencerValue[]}
 */
export const sequencerGetValusOnDraw = ({ timeline, valuesState, partial }) => {
    for (const valueItem of valuesState) {
        /**
         * Reset settled before searching. If no active segment is found for this property, settled stays false and
         * currentValue is unchanged.
         */
        valueItem.settled = false;

        /**
         * Search the timeline for the segment that should control this property at the current partial position.
         */
        let activeSegment = null;

        for (let i = 0; i < timeline.length; i++) {
            const { start, end, values } = timeline[i];

            /**
             * Find this property inside the current timeline row.
             */
            let currentValuesItem = null;
            for (const val of values) {
                if (val.prop === valueItem.prop) {
                    currentValuesItem = val;
                    break;
                }
            }

            /**
             * Skip if the property is not present in this row or is marked as inactive (not involved in this row's
             * animation).
             */
            if (!currentValuesItem || !currentValuesItem.active) {
                continue;
            }

            const { prop } = currentValuesItem;

            /**
             * A property can appear in multiple timeline rows (e.g. rotate in row 1→2 and row 4→7). When partial is
             * past multiple segments, we need the LAST segment whose start <= partial, because that's the one whose
             * value should apply.
             *
             * CheckIsLastUsableProp returns false if a later row for the same prop has start <= partial, meaning a more
             * recent segment takes precedence. In that case we skip this row and keep searching forward.
             */
            const isLastUsableProp = checkIsLastUsableProp(
                timeline,
                i,
                prop,
                partial
            );

            if (!isLastUsableProp) continue;

            /**
             * This is the winning segment for this property. Capture its data and stop searching.
             */
            activeSegment = {
                toValue: currentValuesItem.toValue,
                fromValue: currentValuesItem.fromValue,
                start,
                end,
                ease: currentValuesItem.ease,
            };
            break;
        }

        /**
         * No active segment found for this property — its value stays unchanged from the previous frame.
         */
        if (!activeSegment) continue;

        const { start, end, toValue, fromValue, ease } = activeSegment;

        /**
         * Resolve dynamic values: fromValue/toValue can be functions (for dynamic sequencers where the target changes
         * at runtime).
         */
        const newToValue = MobCore.checkType(Number, toValue)
            ? toValue
            : // @ts-ignore
              toValue();

        const newFromValue = MobCore.checkType(Number, fromValue)
            ? fromValue
            : // @ts-ignore
              fromValue();

        /**
         * Determine the value based on partial's position relative to the segment range [start, end]:
         *
         * - Partial < start → fromValue (not yet reached this segment)
         * - Partial > end → toValue (segment completed, value frozen)
         * - Start <= partial <= end → eased interpolation
         */
        const duration = end - start;
        const inactivePosition = partial < end ? newFromValue : newToValue;

        let newCurrentValue;

        if (partial >= start && partial <= end) {
            const easeAny = /** @type {any} */ (ease);
            newCurrentValue = easeAny(
                partial - start,
                newFromValue,
                newToValue - newFromValue,
                duration
            );
        } else {
            newCurrentValue = inactivePosition;
        }

        /**
         * Guard against NaN from edge cases (e.g. the anchor row with duration=0 causes a division by zero in the
         * easing function).
         */
        const newCurrentValueSanitize = Number.isNaN(newCurrentValue)
            ? inactivePosition
            : newCurrentValue;

        valueItem.currentValue = getRoundedValue(newCurrentValueSanitize);
        valueItem.settled = true;
    }

    return valuesState;
};
