import { filterActiveProps } from './fitler-active-props.js';

/**
 * Settle `prevValueTo` of every tween of a timeline group ( the value each tween has BEFORE the step is executed ).
 *
 * `#revertTween()` use this value to invert a `goTo` action ( swap `valuesTo` <-> `prevValueTo` ), so the timeline can
 * run backward.
 *
 * `prevValueSettled` is settled only once during the entire life of the timeline: after the first visit of an index the
 * group is returned untouched.
 *
 * Pure: no timeline state involved, the group is not mutated, a new group is returned.
 *
 * @param {import('./type.js').AsyncTimelineTweenItem[]} group Every item of the timeline is a group of tween.
 * @returns {import('./type.js').AsyncTimelineTweenItem[]}
 */
export const settlePrevValueTo = (group) => {
    return group.map((item) => {
        const { data } = item;
        const { tween, valuesTo: currentValuesTo, prevValueSettled } = data;

        /**
         * Skip the item without a real tween ( add, addAsync, label ... ) and the item already settled.
         */
        if (!tween || !tween?.getToNativeType || prevValueSettled) return item;

        /*
         * nativeValues -> current value of the tween, before the step is executed.
         * currentValuesTo -> value of the step to execute.
         *
         * Get only the prop in use in this step: nativeValues rappresent the previous set of value.
         */
        const nativeValues = tween.getToNativeType();
        const prevValueTo = filterActiveProps({
            data: nativeValues,
            filterBy: currentValuesTo,
        });

        return {
            ...item,
            data: {
                ...data,
                prevValueTo,
                prevValueSettled: true,
            },
        };
    });
};
