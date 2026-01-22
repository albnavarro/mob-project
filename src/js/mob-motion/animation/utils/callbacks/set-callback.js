import { MobCore } from '../../../../mob-core';

/**
 * Add callback to Stack.
 *
 * @type {import('./type').SetCallBack}
 */
export const updateSubScribers = (currentCallback, arrayOfCallback) => {
    /**
     * Get new unbubscribeId.
     */
    const id = MobCore.getUnivoqueId();

    return {
        /**
         * Update main callback array. index and frame is settled on first run of tween
         *
         * - ArrayOfCallback.push({ cb: currentCallback, id, index: -1, frame: -1 });
         */
        arrayOfCallbackUpdated: [
            ...arrayOfCallback,
            { cb: currentCallback, id, index: -1, frame: -1 },
        ],

        /**
         * Delete item from arrayOfCallback, it is possible unsubscribe a single stagger.
         */
        unsubscribeCb: (callbackNow) =>
            callbackNow.map(({ id: idNow, cb, index, frame }) => {
                /**
                 * Disable single stagger without modify staggers order ( add NOOP )
                 */
                if (idNow === id)
                    return { id: idNow, cb: () => {}, index, frame };

                return { id: idNow, cb, index, frame };
            }),
    };
};

/**
 * @type {import('./type').SetCallBackCache}
 */
export const updateSubscribersCache = (
    currentCallback,
    arrayOfCallback,
    unsubscribeCacheArray
) => {
    /**
     * Get new unbubscribeId.
     */
    const id = MobCore.getUnivoqueId();

    /**
     * Add item and function related to handleCache.
     */
    const { id: cacheId, unsubscribe } = MobCore.useCache.add(currentCallback);

    return {
        /**
         * Update main callback array.
         *
         * - Index and frame is settled on first run of tween
         */
        arrayOfCallbackUpdated: [
            ...arrayOfCallback,
            { cb: cacheId, id, index: -1, frame: -1 },
        ],

        /**
         * Update unsubscribeCache store.
         */
        unsubscribeCache: [...unsubscribeCacheArray, unsubscribe],

        /**
         * Delete item from arrayOfCallback, it is possible unsubscribe a single stagger.
         */
        unsubscribeCb: (callbackNow) => {
            /**
             * Unsubscribe item from handleCache.
             */
            unsubscribe();

            /**
             * Disable single stagger without modify staggers order ( remove cb id from handleCache )
             */
            return callbackNow.map(({ id: idNow, cb, index, frame }) => {
                if (idNow === id) return { id: idNow, cb: '', index, frame };

                return { id: idNow, cb, index, frame };
            });
        },
    };
};
