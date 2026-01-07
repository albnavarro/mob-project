import { useNextLoop } from '../utils/next-tick';

/** @type {import('./type').MobStoreWatchWaintList} */
const waitMap = new Map();

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
    callBackWatcher,
    prop,
    newValue,
    oldValue,
    validationValue,
    instanceId,
}) => {
    for (const { prop: currentProp, fn, wait } of callBackWatcher.values()) {
        /*
         * No wait next loop
         */
        if (currentProp === prop && !wait) {
            fn(newValue, oldValue, validationValue);
        }

        /*
         * Wait next loop
         */
        if (instanceId && currentProp === prop && wait) {
            /**
             * Get all props for current instanceId.
             */
            const queueByInstanceId =
                waitMap.get(instanceId) ??
                /** @type{Map<string, any>} */ (new Map());

            /**
             * Props is in queue ?
             */
            const shouldWait = queueByInstanceId.has(prop);

            /**
             * Update or initialize single prop value to last.
             */
            queueByInstanceId.set(prop, {
                newValue,
                oldValue,
                validationValue,
            });

            /**
             * If is in queue return;
             */
            if (shouldWait) return;

            /**
             * Update main instanceId map
             */
            waitMap.set(instanceId, queueByInstanceId);

            /**
             * Fire callback.
             */
            useNextLoop(() => {
                /**
                 * Get last updated value
                 */
                const propsPerIdNow = waitMap.get(instanceId);
                const current = propsPerIdNow?.get(prop);

                if (
                    current.newValue !== undefined ||
                    current.newValue !== null
                ) {
                    fn(
                        current.newValue,
                        current.oldValue,
                        current.validationValue
                    );
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
};

/**
 * @param {import('./type').MobStoreCallbackQueue} param
 * @returns {Promise<any>}
 */
export const runCallbackQueqeAsync = async ({
    callBackWatcher,
    prop,
    newValue,
    oldValue,
    validationValue,
}) => {
    for (const { prop: currentProp, fn } of callBackWatcher.values()) {
        if (currentProp === prop) await fn(newValue, oldValue, validationValue);
    }
};
