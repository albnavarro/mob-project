import { NOOP } from '../../utils/functions-utils';

/**
 * @param {Object} param
 * @param {(reason?: any) => void} param.reject
 * @param {(reason?: any) => void} param.res
 * @param {boolean} param.isStopped
 * @param {boolean} param.startOnDelay
 * @param {boolean} param.isInPause
 * @param {(tween: any) => function} param.addToActiveTween
 * @param {number} param.previousSessionId
 * @param {number} param.currentSessionId
 * @param {any} param.tween
 * @param {Record<string, any>} param.fn
 * @param {string} param.action
 */
export const resolveTweenPromise = ({
    reject,
    res,
    isStopped,
    startOnDelay,
    previousSessionId,
    currentSessionId,
    isInPause,
    tween,
    fn,
    action,
    addToActiveTween,
}) => {
    /*
     * IF:
     * --
     * this.isStopped: Timeline is stopped
     * --
     * this.startOnDelay: play() etc.. is firedin delay
     * --
     * sessionId: another tween is fired and this tween is in a
     * { waitComplete: false }, so the promise is resolved but
     * this tween is in delay status, if antther session start
     * the value of this.sessionId change,
     * in this case isStopped doesn't work because next
     * session set it to true
     * --
     */

    if (isStopped || startOnDelay || previousSessionId !== currentSessionId) {
        reject();
        return;
    }

    /*
     * Add tween to active stack
     */
    const unsubscribeActiveTween = addToActiveTween(tween);

    /*
     * Add tween to active stack, if timelienstatus is in pause
     * onStartInPause methods trigger pause status inside
     */
    const unsubscribeTweenStartInPause =
        tween && tween?.onStartInPause
            ? tween.onStartInPause(() => {
                  return isInPause;
              })
            : NOOP;

    fn[action]()
        .then(() => res({ resolve: true }))
        .catch(() => {})
        .finally(() => {
            unsubscribeActiveTween();
            unsubscribeTweenStartInPause();
        });
};
