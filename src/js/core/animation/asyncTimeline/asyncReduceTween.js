import { asyncReduceData } from './asyncReduceData';

/*
 * Get Obj data of tween in specific index
 * Indlude check when multiple tween is syncronized
 * index: get data until specific index
 */
export const asyncReduceTween = (tweenList, tween, index) => {
    let currentId = tween?.getId?.();
    const initialData = tween?.getInitialData?.() || {};

    return tweenList.slice(0, index).reduce((p, c) => {
        /*
         * Sync must be outside group so is at 0
         */
        const currentData = c[0].data;
        const action = currentData.action;

        /*
         * If tween is syncronize with another tween,
         * switch currenTween to the new one
         */
        if (action === 'sync') {
            const syncProp = currentData?.syncProp;

            const from = {
                tween: syncProp.from,
                id: syncProp.from.getId?.(),
            };
            const to = {
                tween: syncProp.to,
                id: syncProp.to.getId?.(),
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
        if (currentTween?.data?.tween?.set) {
            currentTween.data.tween.set(currentTween?.data?.valuesTo, {
                immediateNoPromise: true,
            });
        }

        const currentValueTo = currentTween?.data?.tween.getToNativeType();

        /*
         * Filter only the prop in use in this step
         */
        const propsInUse = currentValueTo
            ? asyncReduceData(currentValueTo, currentTween.data.valuesTo)
            : {};

        return { ...p, ...propsInUse };
    }, initialData);
};
