// @ts-check

import { asyncReduceData } from './asyncReduceData';

/**
 * @param {Array<import('./type').asyncTimelineTweenItem[]>} tweenList
 * @param {object} tween
 * @param {number} index
 *
 * @returns {import('../utils/tweenAction/type').valueToparseType}
 *
 * @description
 * Get Obj data of tween in specific index
 * Indlude check when multiple tween is synchronized
 * index: get data until specific index
 */
export const asyncReduceTween = (tweenList, tween, index) => {
    let currentId = tween?.getId?.();
    const initialData = tween?.getInitialData?.() || {};

    return tweenList.slice(0, index).reduce((p, c) => {
        /*
         * Sync must be outside group so is at 0
         */
        const currentFirstData = c[0].data;
        const action = currentFirstData.action;

        /*
         * If tween is synchronize with another tween,
         * switch currenTween to the new one
         */
        if (action === 'sync') {
            const syncProp = currentFirstData?.syncProp;

            const from = {
                tween: syncProp.from,
                id: syncProp.from?.getId?.(),
            };
            const to = {
                tween: syncProp.to,
                id: syncProp.to?.getId?.(),
            };

            /*
             * Switch current id ( uniqueID )
             */
            if (from.id === currentId) {
                currentId = to.id;
            }
        }

        const currentTween = c.find(({ data }) => {
            const uniqueId = data?.tween?.getId?.();
            return uniqueId === currentId;
        });

        /*
         * Align isntant without promise the tween so we have all the data of tween
         * the current and the previous merged
         */
        currentTween?.data?.tween?.set?.(currentTween?.data?.valuesTo, {
            immediateNoPromise: true,
        });

        const currentValueTo = currentTween?.data?.tween?.getToNativeType?.();

        /*
         * Filter only the prop in use in this step
         */
        const propsInUse =
            currentValueTo && currentTween
                ? asyncReduceData(currentValueTo, currentTween.data.valuesTo)
                : {};

        return { ...p, ...propsInUse };
    }, initialData);
};
