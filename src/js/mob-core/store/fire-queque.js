import { useNextLoop } from '../utils/next-tick';

/** @type {import('./type').MobStoreWatchWaintList} */
const waitMap = new Map();

/**
 * Clean waitMap when component is destroyed
 *
 * - WaitMap is global
 * - Component should be destroyed before useNextLoop is called.
 *
 * @type {(id: string) => void}
 */
export const removeIdFromWaitMap = (id) => {
    waitMap.delete(id);
};

/**
 * Fire callback on state update ( setState, emit ). Used to fire callback in watch function.
 *
 * - Wait: ( fire next event loop )
 * - Why : before next loop prop maybe change
 * - WaitMap is global all instance add prop to this map.
 * - Save Prop ( key ) invoked in current loop inside `waitMap` ( track instance id for each key ).
 * - Inside next loop get each invoked prop for all instance and get the updated value ( maybe changed ).
 * - Then fire normally.
 * - Prop is deleted from waitMap after first use, so when multiple runCallbackQueqe is inked only one callback is fired.
 *
 * @param {import('./type').MobStoreCallbackQueue} param
 * @returns {void}
 */
export const runCallbackQueqe = ({
    watcherByProp,
    prop,
    newValue,
    oldValue,
    validationValue,
    instanceId,
}) => {
    const propWatchers = watcherByProp?.get(prop);
    if (!propWatchers || propWatchers.size === 0) return;

    for (const { fn, wait } of propWatchers.values()) {
        if (!wait) {
            fn(newValue, oldValue, validationValue);
        }

        /*
         * Wait next loop
         */
        if (instanceId && wait) {
            /**
             * Get all props for current instanceId.
             */
            const queueByInstanceId =
                waitMap.get(instanceId) ??
                /** @type{Map<string, any>} */ (new Map());

            /**
             * Props is in queue ?
             */
            const firstCycle = !queueByInstanceId.has(prop);

            /**
             * With multiple watch with multiple wait we should stare every single callback.
             */
            const callbacksAccumulated = firstCycle
                ? []
                : (queueByInstanceId.get(prop)?.callbacks ?? []);

            /**
             * Preserve old value before tick
             */
            const existing = queueByInstanceId.get(prop);

            /**
             * Update or initialize single prop value to last.
             */
            queueByInstanceId.set(prop, {
                newValue,

                /**
                 * Preserve old value before tick
                 */
                oldValue: existing?.oldValue ?? oldValue,
                validationValue,

                /**
                 * NOTE: for more efficence consider to push `fn` instead use spread.
                 */
                callbacks: [...new Set([...callbacksAccumulated, fn])],
            });

            /**
             * Update main instanceId map
             */
            waitMap.set(instanceId, queueByInstanceId);

            /**
             * Fire callback one tick after.
             *
             * - Fire only one time nextLoop is fired on first watch with wait props setteld.
             */
            if (firstCycle) {
                useNextLoop(() => {
                    /**
                     * Get last updated value
                     */
                    const propsPerIdNow = waitMap.get(instanceId);
                    const current = propsPerIdNow?.get(prop);

                    if (
                        current &&
                        current.newValue !== undefined &&
                        current.newValue !== null
                    ) {
                        /**
                         * Fire every single callback related to every watch with wait props active.
                         */
                        for (const currentFunction of current.callbacks) {
                            currentFunction(
                                current.newValue,
                                current.oldValue,
                                current.validationValue
                            );
                        }
                    }

                    /**
                     * Remove prop in instanceId map once fired.
                     */
                    propsPerIdNow?.delete(prop);

                    /**
                     * If instanceId has no more prop in queque delete.
                     */
                    if (propsPerIdNow?.size === 0) {
                        waitMap.delete(instanceId);
                    }
                });
            }
        }
    }
};

/**
 * @param {import('./type').MobStoreCallbackQueue} param
 * @returns {Promise<any>}
 */
export const runCallbackQueqeAsync = async ({
    watcherByProp,
    prop,
    newValue,
    oldValue,
    validationValue,
}) => {
    const propWatchers = watcherByProp?.get(prop);
    if (!propWatchers || propWatchers.size === 0) return;

    for (const { fn } of propWatchers.values()) {
        await fn(newValue, oldValue, validationValue);
    }
};
