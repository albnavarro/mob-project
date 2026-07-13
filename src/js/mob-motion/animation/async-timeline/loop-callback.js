import { NOOP } from '../../utils/functions-utils';

/**
 * Copy of ./loop-callback.js used by MobAsyncTimelineUpdate.
 *
 * The catch swallowed the tween rejection without settling the timeline step promise. The step promise stayed pending
 * forever, so the Promise.race/all of #run() never resolved and the async frame remained suspended ( one for each
 * stop() on a running timeline ).
 *
 * @param {Object} param
 * @param {(reason?: any) => void} param.mainReject
 * @param {(reason?: any) => void} param.mainResolve
 * @param {() => boolean} param.isStopped
 * @param {() => boolean} param.isInPause
 * @param {(tween: any) => function} param.addToActiveTween
 * @param {number} param.previousSessionId
 * @param {() => number} param.currentSessionId
 * @param {any} param.tween
 * @param {Record<string, any>} param.stepFunction
 * @param {string} param.action
 * @returns {Promise<void>}
 */
export const resolveTweenPromise = async ({
    mainReject,
    mainResolve,
    isStopped,
    previousSessionId,
    currentSessionId,
    isInPause,
    tween,
    stepFunction,
    action,
    addToActiveTween,
}) => {
    /*
     * Promles section rejct timeline if:
     * - This check is utils when delay is active
     */
    if (isStopped() || previousSessionId !== currentSessionId()) {
        mainReject();
        return;
    }

    /*
     * Add tween to active stack
     */
    const unsubscribeActiveTween = addToActiveTween(tween);

    /*
     * When tween try to go, check if timeline is in pause.
     *
     * - The tween might not have been paused if it was in a delay phase.
     *   This is an additional check to ensure it doesn't start when it shouldn't.
     */
    const unsubscribeValidation =
        tween && tween?.validateInitialization
            ? tween.validateInitialization({
                  validation: () => isInPause(),
                  callback: () => tween.pause?.(),
              })
            : NOOP;

    try {
        await stepFunction[action]();
        mainResolve({ resolve: true });
    } catch (error) {
        console.log(error);

        /**
         * Resolve ( instead of reject ) so a stopped tween does not win a Promise.race ( waitComplete: false ) killing
         * the whole step: the other tween of the group can still resolve it. When the timeline itself is stopped,
         * #run() exits on the isStopped guard, so resolving here never advances a stopped timeline.
         */
        mainResolve({ resolve: false });
    } finally {
        unsubscribeActiveTween();
        unsubscribeValidation();
    }
};
