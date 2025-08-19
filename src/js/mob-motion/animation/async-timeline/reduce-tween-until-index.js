import { filterActiveProps } from './fitler-active-props';

/**
 * Get Obj data of tween in specific index Indlude check when multiple tween is synchronized index: get data until
 * specific index
 *
 * @param {object} params
 * @param {import('./type').AsyncTimelineTweenItem[][]} params.timeline
 * @param {import('./type').AsyncTimelineTween} params.tween
 * @param {number} params.index
 * @returns {Record<string, number | (() => number)>}
 */
export const reduceTweenUntilIndex = ({ timeline, tween, index }) => {
    const currentId = tween?.getId?.();

    /**
     * TODO: resolve better.
     *
     * Reduce issue, initial data in only number but function return number | (() => number), so cast constant.
     *
     * @type{Record<string, number|(()=>number)>}
     */
    const initialData = tween?.getInitialData?.() || {};

    const result = timeline.slice(0, index).reduce((previous, current) => {
        const currentTween = current.find(({ data }) => {
            const uniqueId = data?.tween?.getId?.();
            return uniqueId === currentId;
        });

        /*
         * Align isntant without promise the tween so we have all the data of tween
         * the current and the previous merged
         */
        currentTween?.data?.tween?.setImmediate?.(currentTween?.data?.valuesTo);
        const currentValueTo = currentTween?.data?.tween?.getToNativeType?.();

        /*
         * Filter only the prop in use in this step
         */
        const propsInUse =
            currentValueTo && currentTween
                ? filterActiveProps({
                      data: currentValueTo,
                      filterBy: currentTween.data.valuesTo,
                  })
                : {};

        return { ...previous, ...propsInUse };
    }, initialData);

    /**
     * Reset tween to initial value.
     */
    tween.setImmediate(initialData);
    return result;
};
