import { orderByProp } from './order-row';

/**
 * Update timeline and order by start value and priority.
 *
 * @param {Object} param
 * @param {import('./type').SequencerRow[]} param.timeline
 * @param {import('./type').SequencerValue[]} param.values
 * @param {number} param.start
 * @param {number} param.end
 * @param {number} param.duration
 * @param {import('./type').PropToFind} param.propToFind
 * @returns {import('./type').SequencerRow[]}
 */
export const insertNewRow = ({
    timeline,
    values,
    start,
    end,
    duration,
    propToFind,
}) => {
    const priority = timeline.length === 0 ? 0 : 1;

    /**
     * Add new row
     */
    const newTimeline = [
        ...timeline,
        {
            values,
            start: start ?? 0,
            end: end ?? duration,
            priority,
            propToFind,
        },
    ];

    /**
     * Ordr by start
     */
    const timelineOrderByStart = orderByProp(newTimeline, 'start');

    /**
     * Order by priority
     */
    return orderByProp(timelineOrderByStart, 'priority');
};
