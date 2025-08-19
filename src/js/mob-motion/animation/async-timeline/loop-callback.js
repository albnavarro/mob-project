import { NOOP } from '../../utils/functions-utils';

/**
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
 */
export const resolveTweenPromise = ({
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

    stepFunction[action]()
        .then(() => mainResolve({ resolve: true }))
        .catch(() => {})
        .finally(() => {
            unsubscribeActiveTween();
            unsubscribeValidation();
        });
};
