import { handleNextFrame } from '../../../mob-core/events/raf-utils/handle-next-frame.js';
import { handleNextTick } from '../../../mob-core/events/raf-utils/handle-next-tick.js';
import { MobCore } from '../../../mob-core/index.js';
import { NOOP } from '../../utils/functions-utils.js';
import { directionConstant } from '../utils/timeline/timeline-constant.js';
import {
    addAsyncFunctionIsValid,
    asyncTimelineDelayIsValid,
    asyncTimelineTweenIsValid,
    functionIsValidAndReturnDefault,
    playLabelIsValid,
    repeatIsValid,
    timelineSetTweenArrayIsValid,
    timelineSetTweenLabelIsValid,
    valueIsBooleanAndReturnDefault,
    valueStringIsValid,
} from '../utils/tween-action/tween-validation.js';
import {
    asyncTimelineMetodsInsideGroupWarining,
    relativePropInsideTimelineWarning,
    timelineReverseGoFromWarning,
    timelineSetTweenFailWarining,
    timelineSetTweenLabelNotFoundWarining,
    timelineSuspendWarning,
} from '../utils/warning.js';
import { reduceTweenUntilIndex } from './reduce-tween-until-index.js';
import { settlePrevValueTo } from './settle-prev-value-to.js';
import { resolveTweenPromise } from './loop-callback.js';

export default class MobAsyncTimeline {
    /**
     * @type {number}
     */
    #repeat;

    /**
     * @type {boolean}
     */
    #yoyo;

    /**
     * @type {boolean}
     */
    #freeMode;

    /**
     * @type {boolean}
     */
    #autoSet;

    /**
     * @type {boolean}
     */
    #inheritProps;

    /**
     * @type {boolean}
     */
    #forceFromTo;

    /**
     * @type {import('./type.js').AsyncTimelineTweenItem[][]}
     */
    #tweenList;

    /**
     * @type {import('./type.js').AsyncTimelineCurrentTween[]}
     */
    #currentTween;

    /**
     * @type {import('./type.js').AsyncTimelineTweenStore[]}
     */
    #tweenStore;

    /**
     * @type {boolean}
     */
    #waitComplete;

    /**
     * @type {import('./type.js').AsyncTimelineRowData}
     */
    #defaultObj;

    /**
     * Timeline state
     *
     * @type {import('./type.js').AsyncTimelineLabelState}
     */
    #useLabel;

    /**
     * Group "name" star from 1 to avoid 0 = false
     *
     * @type {number}
     */
    #groupCounter;

    /**
     * @type {number | undefined}
     */
    #groupId;

    /**
     * @type {number}
     */
    #currentTweenCounter;

    /**
     * @type {number}
     */
    #currentIndex;

    /**
     * @type {number}
     */
    #loopCounter;

    /**
     * @type {boolean}
     */
    #isReverseNext;

    /**
     * @type {boolean}
     */
    #forceYoyo;

    /**
     * @type {boolean}
     */
    #isReverse;

    /**
     * @type {boolean}
     */
    #isInPause;

    /**
     * @type {boolean}
     */
    #isInSuspension;

    /**
     * @type {boolean}
     */
    #isStopped;

    /**
     * @type {number}
     */
    #sessionId;

    /**
     * @type {number}
     */
    #activetweenCounter;

    /**
     * @type {boolean}
     */
    #autoSetIsJustCreated;

    /**
     * @type {boolean}
     */
    #noopSentinelsAdded;

    /**
     * @type {boolean}
     */
    #fpsIsInLoading;

    /**
     * @type {number}
     */
    #callbackId;

    /**
     * @type {{ cb: (arg0: import('../utils/timeline/type.js').DirectionTypeObjectLoop) => void; id: number }[]}
     */
    #callbackLoop;

    /**
     * @type {{ cb: () => void; id: number }[]}
     */
    #callbackComplete;

    /**
     * @type{((value:any) => void)|undefined}
     */
    #currentResolve;

    /**
     * @type{((value:any) => void)|undefined}
     */
    #currentReject;

    /**
     * Available methods:
     *
     * ```javascript
     * `Methods to create timeline`;
     * myTimeline.set();
     * myTimeline.goTo();
     * myTimeline.goFrom();
     * myTimeline.goFromTo();
     * myTimeline.add();
     * myTimeline.addAsync();
     * myTimeline.createGroup();
     * myTimeline.closeGroup();
     * myTimeline.suspend();
     * myTimeline.label()`Methods to control timeline`;
     * myTimeline.play();
     * myTimeline.playFromLabel();
     * myTimeline.playFrom();
     * myTimeline.playFromReverse();
     * myTimeline.playReverse();
     * myTimeline.reverseNext();
     * myTimeline.stop();
     * myTimeline.pause();
     * myTimeline.resume();
     * myTimeline.isActive();
     * myTimeline.isPaused();
     * myTimeline.isSuspended();
     * myTimeline.getDirection();
     * myTimeline.setTween();
     * myTimeline.get();
     * myTimeline.onLoopEnd();
     * myTimeline.onComplete();
     * myTimeline.destroy();
     * ```
     *
     * @example
     *     ```javascript
     *     const myTimeline = new MobAsyncTimeline({
     *       yoyo: [ boolean ],
     *       repeat: [ number ],
     *       freeMode: [ boolean ],
     *       autoSet: [ boolean ],
     *       inheritProps: [ number ],
     *     })
     *
     *
     *     ```;
     *
     * @param {import('./type.js').AsyncTimeline} data
     */
    constructor(data) {
        this.#repeat = repeatIsValid(data?.repeat);
        this.#yoyo = valueIsBooleanAndReturnDefault(
            data?.yoyo,
            'asyncTimeline: yoyo',
            false
        );
        this.#freeMode = valueIsBooleanAndReturnDefault(
            data?.freeMode,
            'asyncTimeline: freeMode',
            false
        );
        this.#autoSet = valueIsBooleanAndReturnDefault(
            data?.autoSet,
            'asyncTimeline: autoSet',
            true
        );
        this.#forceFromTo = valueIsBooleanAndReturnDefault(
            data?.forceFromTo,
            'asyncTimeline: forceFromTo',
            false
        );

        /**
         * As documented forceFromTo is an evolution of inheritProps and use the inherited value to transform an action
         * ( goTo ) in a goFromTo. The activation was replicated inline in goTo() and goFrom() ( `#inheritProps ||
         * #forceFromTo` ) but not in set() and goFromTo(): with `{ inheritProps: false, forceFromTo: true }` half of
         * the methods inherited the previous values and half didn't. Enable it here, once.
         */
        this.#inheritProps = this.#forceFromTo
            ? true
            : valueIsBooleanAndReturnDefault(
                  data?.inheritProps,
                  'asyncTimeline: inheritProps',
                  true
              );
        this.#tweenList = [];
        this.#currentTween = [];
        this.#tweenStore = [];
        this.#waitComplete = false;
        this.#defaultObj = {
            id: -1,
            tween: undefined,
            callback: () => {},
            action: '',
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: {},
            prevValueSettled: false,
            tweenProps: {},
            groupProps: {},
            labelProps: {},
        };
        this.#useLabel = {
            active: false,
            index: -1,
            isReverse: false,
            callback: undefined,
        };
        this.#groupCounter = 1;
        this.#groupId = undefined;
        this.#currentTweenCounter = 0;
        this.#currentIndex = 0;
        this.#loopCounter = 1;
        this.#isReverseNext = false;
        this.#forceYoyo = false;
        this.#isReverse = false;
        this.#isInPause = false;
        this.#isInSuspension = false;
        this.#isStopped = true;
        this.#sessionId = 0;
        this.#activetweenCounter = 0;
        this.#autoSetIsJustCreated = false;
        this.#noopSentinelsAdded = false;
        this.#fpsIsInLoading = false;
        this.#callbackId = 0;
        this.#callbackLoop = [];
        this.#callbackComplete = [];
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
    }

    /**
     * Transition to STOPPED state.
     *
     * Resets timeline to initial idle state:
     *
     * - Clears position (currentIndex, loopCounter)
     * - Clears direction flags (isReverseNext, forceYoyo)
     * - Clears label state
     * - Clears pause/suspend flags
     *
     * @type {() => void}
     */
    #transitionToStopped() {
        this.#isStopped = true;
        this.#isInPause = false;
        this.#isInSuspension = false;
        this.#currentIndex = 0;
        this.#loopCounter = 1;
        this.#isReverseNext = false;
        this.#resetUseLabel();
        this.#forceYoyo = false;
    }

    /**
     * Transition to PLAYING state.
     *
     * Starts a new execution session:
     *
     * - Clears stopped flag
     * - Clears pause/suspend flags
     * - Increments sessionId (invalidates previous session's async operations)
     *
     * @type {() => void}
     */
    #transitionToPlaying() {
        this.#isStopped = false;
        this.#isInPause = false;
        this.#isInSuspension = false;
        this.#sessionId++;
    }

    /**
     * Transition to PAUSED state.
     *
     * Pauses current execution but maintains position and state. Timeline can be resumed with resume().
     *
     * @type {() => void}
     */
    #transitionToPaused() {
        this.#isInPause = true;
    }

    /**
     * Transition to SUSPENDED state.
     *
     * Enters suspend state, waiting for resume(). Similar to pause but triggered by suspend() step in timeline.
     *
     * @type {() => void}
     */
    #transitionToSuspended() {
        this.#isInSuspension = true;
    }

    /**
     * Transition to RESUMED state (from PAUSED or SUSPENDED).
     *
     * Clears pause and suspend flags, allowing execution to continue. Does NOT start a new session (sessionId
     * unchanged).
     *
     * @type {() => void}
     */
    #transitionToResumed() {
        this.#isInPause = false;
        this.#isInSuspension = false;
    }

    /**
     * @type {() => Promise<void>}
     */
    async #run() {
        /**
         * Session of this step.
         *
         * A play() while this step is in flight stop the timeline and bump the sessionId. When the step is released (
         * the tween settle its promise ) this chain must not walk the timeline beside the chain of the new session.
         *
         * `#isStopped` alone is not enough: play() set it back to false, so the check would depend on the order in
         * which the stopped tween settle their promise. The sessionId does not.
         */
        const sessionId = this.#sessionId;

        /**
         * Store previous action to prevent two add/addAsync consegutive
         */
        const currentTweelist = this.#tweenList[this.#currentIndex];

        /**
         * Prevent possible error when destroy instance.
         */
        if (!currentTweelist) return;

        /**
         * Each is item is a group, so we need to loop over each tween in group. Update prevValueSettled value for
         * current loop index.
         *
         * First immediate loop is necessary. Once every index is visited the map inside is always skipped.
         */
        this.#tweenList[this.#currentIndex] =
            settlePrevValueTo(currentTweelist);

        /**
         * Each is item is a group, so we need to loop over each tween in group.
         */
        const tweenPromises = currentTweelist.map((item) => {
            const { data } = item;

            const {
                tween,
                callback,
                action,
                valuesFrom,
                valuesTo,
                tweenProps,
            } = data;

            /**
             * Clone tween prop and remove from timeline props We need to manipulate props.
             *
             * Immediate = true if we walk timeline only for set prevValueTo. relative props reset ( not allowed )
             */
            const newTweenProps = { ...tweenProps };
            delete newTweenProps.delay;

            /*
             * activate immediate prop if we walk thru tweens in test mode
             */
            const { active: labelIsActive, index: labelIndex } = this.#useLabel;

            /*
             * Loop immediate ( test mode ) if:
             *
             * labelIsActive is true;
             * labelIndex is minus currentIndex
             */
            const isImmediate = Number.isNaN(labelIndex)
                ? false
                : labelIsActive &&
                  labelIndex &&
                  // @ts-ignore
                  this.#currentIndex < labelIndex;

            /*
             * set new immediate prop to true.
             */
            if (isImmediate) newTweenProps.immediate = true;

            /*
             * If some tween use relative props the value is applied as relative
             * only the in the this loop
             */
            if (tweenProps && 'relative' in tweenProps && tweenProps.relative) {
                tweenProps.relative = false;
                relativePropInsideTimelineWarning();
            }

            /**
             * Current action data. Than we match key in object.
             *
             * NORMALI TWEEN
             *
             * - Create a fresh primise from tween: Tweens, when called with a new action while still running, do not
             *   create a new promise but instead reuse the first promise created. The promise is resolved once the
             *   tween completes. Here, we have a special case: with Promise.race (waitComplete: false), the
             *   longest-running tween will not create a new promise in the next step because it is still active. This
             *   leads to entering a step without a new promise to resolve. In this scenario, we need to ensure that
             *   whenever a tween executes an action in the current step, there is always a promise related to that
             *   step. Therefore, we force the tween to reject any active promises and create a new one.
             * - Normalize pasue status, if timeline is not in pause tween should not be in pause.
             *   tween.validateInitialization() if used set tween in pause. in next loop remov epause if timeline is
             *   not.
             */
            const stepFunction = {
                set: () => {
                    if (!this.#isInPause) tween?.clearCurretPromise?.();

                    return tween?.[/** @type {'set'} */ (action)](
                        valuesFrom,
                        newTweenProps
                    );
                },
                goTo: () => {
                    if (!this.#isInPause) tween?.clearCurretPromise?.();

                    return tween?.[/** @type {'goTo'} */ (action)](
                        valuesTo,
                        newTweenProps
                    );
                },
                goFrom: () => {
                    if (!this.#isInPause) tween?.clearCurretPromise?.();

                    return tween?.[/** @type {'goFrom'} */ (action)](
                        valuesFrom,
                        newTweenProps
                    );
                },
                goFromTo: () => {
                    if (!this.#isInPause) tween?.clearCurretPromise?.();

                    return tween?.[/** @type {'goFromTo'} */ (action)](
                        valuesFrom,
                        valuesTo,
                        newTweenProps
                    );
                },
                add: () => {
                    return new Promise((res) => {
                        if (isImmediate) {
                            res({ resolve: true });
                            return;
                        }

                        // Custom function
                        const direction = this.getDirection();
                        callback({
                            direction,
                            loop: this.#loopCounter,
                        });
                        res({ resolve: true });
                    });
                },
                addAsync: () => {
                    /**
                     * SessionId change each play/playReverse and so on. Make sure that this step run only in current
                     * session.
                     */
                    const sessionId = this.#sessionId;

                    return new Promise((res, reject) => {
                        if (isImmediate) {
                            res({ resolve: true });
                            return;
                        }

                        let isSettled = false;
                        const direction = this.getDirection();

                        callback({
                            direction,
                            loop: this.#loopCounter,
                            resolve: () => {
                                /**
                                 * User may fire resolve() more than once.
                                 */
                                if (isSettled) return;
                                isSettled = true;

                                /**
                                 * A play() while this step is waiting for the user resolve() bump the sessionId: the
                                 * resolve() of the abandoned step must not release the step of the new session.
                                 */
                                if (sessionId !== this.#sessionId) {
                                    reject();
                                    return;
                                }

                                res({ resolve: true });
                            },
                        });
                    });
                },
                createGroup: () => {
                    return new Promise((res) => res({ resolve: true }));
                },
                closeGroup: () => {
                    return new Promise((res) => res({ resolve: true }));
                },
                label: () => {
                    return new Promise((res) => res({ resolve: true }));
                },
                suspend: () => {
                    /*
                     * Check callback that return a bollean to fire supend
                     *
                     * The callback was fired twice ( checkType + sholudSuspend ), plus a third time inside
                     * timelineSuspendWarning, that interpolates `${val()}`. Fire it once and pass the resolved value
                     * to the warning.
                     */
                    const suspendValue = callback();
                    const valueIsValid = MobCore.checkType(
                        Boolean,
                        suspendValue
                    );
                    if (!valueIsValid)
                        timelineSuspendWarning(() => suspendValue);
                    const shouldSuspend = valueIsValid ? suspendValue : true;

                    return new Promise((res) => {
                        if (!isImmediate && shouldSuspend) {
                            this.#transitionToSuspended();
                        }
                        res({ resolve: true });
                    });
                },
            };

            return new Promise((mainResolve, mainReject) => {
                // Get delay
                const delay = isImmediate ? false : tweenProps?.delay;
                const previousSessionId = this.#sessionId;

                /**
                 * Start specific delay item group
                 */
                if (delay) {
                    const start = MobCore.getTime();
                    const groupIndex = this.#currentIndex;

                    requestAnimationFrame(() => {
                        this.#loopOnDelay({
                            start,
                            deltaTimeOnpause: 0,
                            lastFrameTime: start,
                            delay,
                            groupIndex,
                            mainReject,
                            mainResolve,
                            previousSessionId,
                            tween,
                            stepFunction,
                            action,
                        });
                    });

                    return;
                }

                /**
                 * Here we resolve single tween promise
                 */
                resolveTweenPromise({
                    mainReject,
                    mainResolve,
                    isStopped: () => this.#isStopped,
                    isInPause: () => this.#isInPause,
                    addToActiveTween: (tween) => this.#addToActiveTween(tween),
                    currentSessionId: () => this.#sessionId,
                    previousSessionId,
                    tween,
                    stepFunction,
                    action,
                });
            });
        });

        /**
         * When group have waitComplete === true, all the teen in group have the same props so, check if the griup item
         * is seted to waitComplete or not
         */
        const waitComplete = this.#tweenList[this.#currentIndex].some(
            (item) => {
                return item.data.groupProps?.waitComplete;
            }
        );

        const promiseType = waitComplete ? 'all' : 'race';

        try {
            // @ts-ignore
            await Promise[promiseType](tweenPromises);

            if (
                this.#isInSuspension ||
                this.#isStopped ||
                sessionId !== this.#sessionId
            )
                return;

            /**
             * Current label state
             */
            const {
                active: labelIsActive,
                index: labelIndex,
                isReverse: labelIsReverse,
                callback: callbackLabel,
            } = this.#useLabel;

            /*
             * this.#play() / this.#playFromLabel() / this.#playFromReverse() use this condition.
             *
             * Walk immediate from 0 to end of Timeline ( this.playReverse() ),
             * Here we have reach the end, and callback will be fired to reach the right label ( this.#play() use 0 ).
             *
             * Is skipped by this.playReverse(): does not set callback
             * simply reach the and of timeline in immediate mode then go on natuarally ( use this.#forceYoYo = false ).
             *
             */
            if (
                callbackLabel &&
                labelIsActive &&
                // @ts-ignore
                this.#currentIndex === labelIndex - 1
            ) {
                this.#resetUseLabel();
                this.#loopCounter++;

                /**
                 * ResetUseLabel() reset reference to function not function itSelf.
                 */
                callbackLabel();
                return;
            }

            /*
             * this.#playFromReverse() only
             *
             * 1) Test loop ( previous condition ) o to end of timeline.
             *
             * 2) Walk until label ( index - 1 ) is reached
             *
             * 3) Reverse next step because is playFromReverse.
             *
             * The timeline is reversed next step without increment currentIndex ( the condition end with a return statement )
             **/
            if (
                labelIsActive &&
                labelIsReverse &&
                // @ts-ignore
                this.#currentIndex === labelIndex - 1
            ) {
                this.reverseNext();
            }

            /**
             * Reverse on next step default
             */
            if (this.#isReverseNext) {
                this.#isReverseNext = false;
                this.#currentIndex =
                    this.#tweenList.length - this.#currentIndex - 1;
                this.#resetUseLabel();
                this.#revertTween();
                this.#run();
                return;
            }

            /**
             * Run next step default Update currentIndex
             */
            if (this.#currentIndex < this.#tweenList.length - 1) {
                this.#currentIndex++;
                this.#run();
                return;
            }

            /**
             * End of timeline, check repeat
             */
            if (this.#loopCounter < this.#repeat || this.#repeat === -1) {
                /*
                 * Start timeline in reverse mode here set all tween to end position and go,
                 * This step is used if we come form playReverse() ( we have labelIsActive = true )
                 */
                if (
                    labelIsActive &&
                    labelIndex === this.#tweenList.length &&
                    !this.#freeMode
                ) {
                    /**
                     * The promise is deliberately not awaited: the current step should be released now, the next loop
                     * starts once every tween is settled to the end position.
                     */
                    this.#setTweenToEndAndRepeat();
                    return;
                }

                /*
                 * Go default
                 */
                this.#onRepeat();
                return;
            }

            /**
             * All ended Fire and of timeline
             */
            this.#onTimelineEnd();
        } catch (error) {
            if (error) console.log(error);
        }
    }

    /**
     * End of timeline: fire the onComplete callback, stop the timeline and resolve the promise of play().
     *
     * @type {() => void}
     */
    #onTimelineEnd() {
        for (const { cb } of this.#callbackComplete) cb();
        this.#transitionToStopped();

        if (!this.#currentResolve) return;

        handleNextFrame.add(() => {
            handleNextTick.add(() => {
                this.#currentResolve?.({ resolve: true });
            });
        });
    }

    /**
     * Set every tween to the end position, then start a new loop.
     *
     * Used when timeline run in reverse mode ( playReverse ): every tween should be settled at the end of timeline
     * before repeat.
     *
     * @type {() => Promise<void>}
     */
    async #setTweenToEndAndRepeat() {
        const tweenPromises = this.#tweenStore.map(({ tween }) => {
            const data = reduceTweenUntilIndex({
                timeline: this.#tweenList,
                tween,
                index: this.#tweenList.length,
            });

            return tween.set(data);
        });

        try {
            await Promise.all(tweenPromises);
            this.#onRepeat();
        } catch {
            /**
             * Tween was stopped, timeline should not repeat.
             */
        }
    }

    /**
     * The method run only if tween has delay. Resolve tween delay.
     *
     * @param {Object} param0
     * @param {number} param0.start
     * @param {number} param0.deltaTimeOnpause
     * @param {number} param0.lastFrameTime
     * @param {number} param0.delay
     * @param {number} param0.groupIndex
     * @param {(value: any) => void} param0.mainReject
     * @param {(value: any) => void} param0.mainResolve
     * @param {number} param0.previousSessionId
     * @param {any} param0.tween
     * @param {Record<string, () => void>} param0.stepFunction
     * @param {string} param0.action
     */
    #loopOnDelay({
        start,
        deltaTimeOnpause,
        lastFrameTime,
        delay,
        groupIndex,
        mainReject,
        mainResolve,
        previousSessionId,
        tween,
        stepFunction,
        action,
    }) {
        const current = MobCore.getTime();

        /**
         * Time elapsed from the start of current timeline step.
         */
        const delta = current - start;

        /*
         * Time elapsed in pause.
         *
         * Was `deltaTimeOnpause = current - this.#timeOnPause`, so every new pause overwrote the value and the
         * time of the previous pauses was lost ( delay fired in advance ). Now every frame spent in pause is added to
         * the total.
         */
        if (this.#isInPause) deltaTimeOnpause += current - lastFrameTime;

        /**
         * RESOLVE DELAY:
         *
         * - Delta - deltaTimeOnpause: reconciliate time: total duration of current timeline step less time elapsed in
         *   pause.
         * - When reconciliate time is over delay value the tween should go ( delay is ended ). NOTE: dealy is timeline
         *   internal property not tween property. th if is the real delay check.
         * - If the time elapsed in current timeline step is over delay value need to resolve or reject timeline item
         *   group promsie.
         * - If there is no problem run tween, if there is problem reject promise of current timeline group item, so
         *   timeline con go in next step.
         */
        if (
            delta - deltaTimeOnpause >= delay ||
            this.#isStopped ||
            this.#isReverseNext
        ) {
            /**
             * Promise.race issue: con un delay troppo lungo un tween può tentare di partire dopo che il proprio gruppo
             * è già stato risolto e la timeline è avanzata nello step successivo.
             *
             * Eseguire lo step a questo punto farebbe partire l'azione del gruppo precedente nel contesto del nuovo
             * gruppo, inquinando lo stato. Abortiamo silenziosamente.
             */
            const currentIndex = this.#currentIndex;
            const isLate = currentIndex !== groupIndex;
            if (isLate) {
                mainReject?.({ reason: 'delay overrun' });
                return;
            }

            /**
             * Here we resolve single tween promise
             */
            resolveTweenPromise({
                mainReject,
                mainResolve,
                isStopped: () => this.#isStopped,
                isInPause: () => this.#isInPause,
                addToActiveTween: (tween) => {
                    return this.#addToActiveTween(tween);
                },
                currentSessionId: () => this.#sessionId,
                previousSessionId,
                tween,
                stepFunction,
                action,
            });

            return;
        }

        /**
         * Continue delay loop.
         */
        requestAnimationFrame(() => {
            this.#loopOnDelay({
                start,
                deltaTimeOnpause,
                lastFrameTime: current,
                delay,
                groupIndex,
                mainReject,
                mainResolve,
                previousSessionId,
                tween,
                stepFunction,
                action,
            });
        });
    }

    /**
     * Execute repeat.
     *
     * @type {() => void}
     */
    #onRepeat() {
        /*
         * Fire callbackLoop
         */
        if (this.#loopCounter > 0) {
            const direction = this.getDirection();
            for (const { cb } of this.#callbackLoop)
                cb({
                    direction,
                    loop: this.#loopCounter,
                });
        }

        this.#loopCounter++;
        this.#currentIndex = 0;
        this.#resetUseLabel();
        if (this.#yoyo || this.#forceYoyo) this.#revertTween();
        this.#forceYoyo = false;
        this.#run();
    }

    /**
     * @type {import('./type.js').AsyncTimelineAddToActiveTween}
     */
    #addToActiveTween(tween) {
        const tweenId = tween?.getId && tween.getId();
        if (!tweenId) return NOOP;

        const prevActiveTweenCounter = this.#activetweenCounter;
        this.#activetweenCounter++;

        this.#currentTween.push({
            tween,
            uniqueId: tweenId,
            id: prevActiveTweenCounter,
        });

        return () => {
            this.#currentTween = this.#currentTween.filter(
                ({ id }) => id !== prevActiveTweenCounter
            );
        };
    }

    /**
     * Revert main tweenList array. When timeline run inverse, run from currentIndex equal 0 but with an array reverted
     * and tween props reverted.
     *
     * @type {() => void}
     */
    #revertTween() {
        /**
         * A 'goFrom' can't be reverted ( without forceFromTo ).
         *
         * Was detected inside the map, firing this.stop() in the middle of the transformation: stop() calls
         * #revertTween() again ( #isReverse is already toggled ) and the timeline ended with #tweenList reverted but
         * #isReverse === false. Every normalization is guarded by `if (this.#isReverse)`, so nothing restored it and
         * the next play() run the timeline backward.
         *
         * Now the check run before the map: warn, stop, and leave the state untouched.
         *
         * NOTE: action 'goFrom' is stored only when #forceFromTo is false ( otherwise a 'goFromTo' is stored ), so a
         * timeline with a 'goFrom' can never reach the reverse state: no recursion from stop().
         */
        const hasGoFrom = this.#tweenList.some((group) => {
            return group.some(({ data }) => data.action === 'goFrom');
        });

        if (hasGoFrom) {
            timelineReverseGoFromWarning();
            this.stop();
            return;
        }

        this.#isReverse = !this.#isReverse;
        this.#tweenList = this.#tweenList.toReversed().map((group) => {
            return group.toReversed().map((item) => {
                const { data } = item;
                const { action, valuesFrom, prevValueTo, valuesTo } = data;

                const currentValueTo = valuesTo;

                switch (action) {
                    case 'goTo': {
                        return {
                            ...item,
                            data: {
                                ...data,
                                valuesTo: prevValueTo,
                                prevValueTo: currentValueTo,
                            },
                        };
                    }

                    case 'goFromTo': {
                        return {
                            ...item,
                            data: {
                                ...data,
                                valuesFrom: valuesTo,
                                valuesTo: valuesFrom,
                            },
                        };
                    }
                }

                return item;
            });
        });
    }

    /**
     * Common method, add all action to main array
     *
     * @type {import('./type.js').AsyncTimelineAddAction}
     */
    #addAction(obj) {
        /**
         * Check if the is an active group and the group is just created
         */
        const rowIndex = this.#tweenList.findIndex((item) => {
            return item[0]?.group && item[0].group === this.#groupId;
        });

        /**
         * If there is an active group append interpolation to current group
         */
        if (rowIndex !== -1) {
            this.#tweenList[rowIndex].push({ group: this.#groupId, data: obj });
            return;
        }

        this.#tweenList.push([{ group: this.#groupId, data: obj }]);
    }

    /**
     * Register all tween used in timeline.
     *
     * @type {import('./type.js').AsyncTimelineAddTweenToStore} tween
     */
    #addTweenToStore(tween) {
        const uniqueId = tween?.getId?.();
        const tweenIsStored = this.#tweenStore.find(
            ({ id }) => id === uniqueId
        );
        if (tweenIsStored) return;

        const obj = { id: uniqueId, tween };
        this.#tweenStore.push(obj);
    }

    /**
     * Reset all tween used in timeline.
     *
     * @type {() => void}
     */
    #resetAllTween() {
        for (const { tween } of this.#tweenStore) tween.resetData();
    }

    /**
     * AutoSet: Add a set 'tween' at start and end of timeline.
     *
     * @type {() => void}
     */
    #addSetBlocks() {
        // Create set only one time
        if (this.#autoSetIsJustCreated) return;
        this.#autoSetIsJustCreated = true;

        /*
         * END Blocks
         * Add set block at the end of timeline for every tween with last toValue
         */
        for (const { tween } of this.#tweenStore) {
            const setValueTo = tween.getInitialData();

            this.#currentTweenCounter++;

            this.#tweenList = [
                [
                    {
                        group: undefined,
                        data: {
                            ...this.#defaultObj,
                            id: this.#currentTweenCounter,
                            tween,
                            action: 'set',
                            valuesFrom: setValueTo,
                            valuesTo: setValueTo,
                            groupProps: { waitComplete: this.#waitComplete },
                        },
                    },
                ],
                ...this.#tweenList,
            ];
        }

        /*
         * END Blocks
         * Add set block at the end of timeline for every tween with last toValue
         */
        for (const { tween } of this.#tweenStore) {
            const setValueTo = reduceTweenUntilIndex({
                timeline: this.#tweenList,
                tween,
                index: this.#tweenList.length,
            });

            this.#currentTweenCounter++;

            this.#tweenList.push([
                {
                    group: undefined,
                    data: {
                        ...this.#defaultObj,
                        id: this.#currentTweenCounter,
                        tween,
                        action: 'set',
                        valuesFrom: setValueTo,
                        valuesTo: setValueTo,
                        groupProps: { waitComplete: this.#waitComplete },
                    },
                },
            ]);
        }
    }

    /**
     * Aggiunge sentinelle NOOP all'inizio e alla fine della timeline.
     *
     * - Chiamato dopo #addSetBlocks() e prima di #run().
     * - Seplifica il resume della timeline quando abbiamo un suspend/add alla fine
     * - Wrappiamo la timeline in una NOOP per non doverci preoccupare del primo/ultimo frame
     * - Se saltiamo il primo/ultimo frame non ci saranno effeti collaterali.
     *
     * @type {() => void}
     */
    #addNoopSentinels() {
        if (this.#noopSentinelsAdded) return;
        this.#noopSentinelsAdded = true;

        const createNoop = () => ({
            ...this.#defaultObj,
            id: this.#currentTweenCounter++,
            callback: () => {},
            action: 'add',
            groupProps: { waitComplete: this.#waitComplete },
        });

        /**
         * Sentinella iniziale (indice 0)
         */
        this.#tweenList.unshift([{ group: undefined, data: createNoop() }]);

        /**
         * Sentinella finale (indice length - 1)
         */
        this.#tweenList.push([{ group: undefined, data: createNoop() }]);
    }

    /**
     * Reject promise without error in console ( Firefix do not ).
     */
    #rejectPromise() {
        if (!this.#currentReject) {
            return;
        }

        this.#currentReject(MobCore.ANIMATION_STOP_REJECT);
        this.#currentReject = undefined;
    }

    /**
     * Utils for play() / playReverse() / etc...
     */
    async #waitFps() {
        /**
         * Always play after FPS is ready. Reject every tentative to run timeline while fps is loading after first call.
         * Ensure timeline return only first resolve created.
         */
        if (this.#fpsIsInLoading)
            // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
            return Promise.reject(MobCore.ANIMATION_STOP_REJECT);

        this.#fpsIsInLoading = true;

        /**
         * Await fps check.
         */
        await MobCore.useFps();
        this.#fpsIsInLoading = false;
    }

    /**
     * FLow:
     *
     * 2. Execute test loop via this.playReverse() to set `prevValueSettled`.
     * 3. Then when timeline reach the end useLabel is reassigned, so walk thru right label.
     *
     * @type {import('./type.js').AsyncTimelinePlayUpeDown}
     */
    #playFromUpDown(label, isReverse) {
        return new Promise((resolve, reject) => {
            /**
             * RUN
             *
             * Always do a test loop to get right prevValueSettled value Than redefine useLabel inside callback to reach
             * right label index In this case no other callback after label is needed.
             */
            this.playReverse({
                forceYoYo: false,
                resolve,
                reject,
                callback: () => {
                    /**
                     * Skip of there is nothing to run.
                     *
                     * Reject instead of leaving the promise pending forever.
                     */
                    if (this.#tweenList.length === 0) {
                        reject(MobCore.ANIMATION_STOP_REJECT);
                        return;
                    }

                    /**
                     * Normalize reverse status.
                     */
                    if (this.#isReverse) this.#revertTween();

                    /*
                     * Reset currentIndex.
                     */
                    this.#currentIndex = 0;

                    /**
                     * Get the index of the label.
                     */
                    const labelIndex = MobCore.checkType(String, label)
                        ? this.#tweenList.findIndex((item) => {
                              const [firstItem] = item;
                              const labelCheck =
                                  firstItem.data.labelProps?.name;
                              return labelCheck === label;
                          })
                        : label;

                    /**
                     * Check if label index is valid.
                     *
                     * PlayLabelIsValid() only warn, then the timeline used to run from the start ( and
                     * playFromReverse() run forward, the opposite of the request ). Now the promise is rejected.
                     */
                    if (MobCore.checkType(String, label)) {
                        playLabelIsValid(labelIndex, label);

                        if (labelIndex === -1) {
                            reject(MobCore.ANIMATION_STOP_REJECT);
                            return;
                        }
                    }

                    /**
                     * Define condition to go to right timeline index after first test loop. When playReverse loop is
                     * ended, this.#useLabel is reassigned here, this time no callback is needed.
                     */
                    this.#useLabel = {
                        isReverse,
                        active: true,
                        index: labelIndex,
                        callback: undefined,
                    };

                    this.#run();
                },
            });
        });
    }

    /**
     * @returns {void}
     */
    #pauseAllTween() {
        for (const { tween } of this.#currentTween) {
            tween?.pause?.();
        }
    }

    /**
     * @returns {void}
     */
    #resumeAllTween() {
        for (const { tween } of this.#currentTween) {
            tween?.resume?.();
        }
    }

    /**
     * Unfreeze stagger used with subscribeCache. Use es: play after pause need restore stagger cache
     *
     * @returns {void}
     */
    // #unFreezeAllTweenStagger() {
    //     this.#currentTween.forEach(({ tween }) => {
    //         tween?.unFreezeStagger?.();
    //     });
    // }

    /**
     * @type {() => void}
     */
    #resetUseLabel() {
        this.#useLabel = {
            active: false,
            index: -1,
            isReverse: false,
            callback: undefined,
        };
    }

    /**
     * @type {import('./type.js').AsyncTimelineSet}
     */
    set(tween, valuesSet = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        /**
         * Get previousValues until this step and merge with user data
         */
        const previousValues = this.#inheritProps
            ? reduceTweenUntilIndex({
                  timeline: this.#tweenList,
                  tween,
                  index: this.#tweenList.length,
              })
            : {};

        this.#currentTweenCounter++;

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            tween,
            action: 'set',
            valuesTo: { ...previousValues, ...valuesSet },
            valuesFrom: { ...previousValues, ...valuesSet },
            tweenProps,
            groupProps: { waitComplete: this.#waitComplete },
        });

        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineGoTo}
     */
    goTo(tween, valuesTo = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const inheritProps = reduceTweenUntilIndex({
            timeline: this.#tweenList,
            tween,
            index: this.#tweenList.length,
        });

        /**
         * Get previousValues until this step and merge with user data
         */
        const previousValues = this.#inheritProps ? inheritProps : {};

        this.#currentTweenCounter++;

        if (this.#forceFromTo) {
            this.#addAction({
                ...this.#defaultObj,
                id: this.#currentTweenCounter,
                tween,
                action: 'goFromTo',
                valuesFrom: { ...previousValues },
                valuesTo: { ...previousValues, ...valuesTo },

                tweenProps: tweenProps ?? {},
                groupProps: { waitComplete: this.#waitComplete },
            });
        } else {
            this.#addAction({
                ...this.#defaultObj,
                id: this.#currentTweenCounter,
                tween,
                action: 'goTo',
                valuesTo: { ...previousValues, ...valuesTo },
                tweenProps: tweenProps ?? {},
                groupProps: { waitComplete: this.#waitComplete },
            });
        }

        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineGoFrom}
     */
    goFrom(tween, valuesFrom = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const inheritProps = reduceTweenUntilIndex({
            timeline: this.#tweenList,
            tween,
            index: this.#tweenList.length,
        });

        /**
         * Get previousValues until this step and merge with user data
         */
        const previousValues = this.#inheritProps ? inheritProps : {};

        this.#currentTweenCounter++;

        if (this.#forceFromTo) {
            this.#addAction({
                ...this.#defaultObj,
                id: this.#currentTweenCounter,
                tween,
                action: 'goFromTo',
                valuesFrom: { ...previousValues, ...valuesFrom },
                valuesTo: { ...previousValues },
                tweenProps: tweenProps ?? {},
                groupProps: { waitComplete: this.#waitComplete },
            });
        } else {
            this.#addAction({
                ...this.#defaultObj,
                id: this.#currentTweenCounter,
                tween,
                action: 'goFrom',
                valuesFrom: { ...previousValues, ...valuesFrom },
                tweenProps,
                groupProps: { waitComplete: this.#waitComplete },
            });
        }

        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineGoFromTo}
     */
    goFromTo(tween, valuesFrom = {}, valuesTo = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        /**
         * Get previousValues until this step and merge with user data
         */
        const previousValues = this.#inheritProps
            ? reduceTweenUntilIndex({
                  timeline: this.#tweenList,
                  tween,
                  index: this.#tweenList.length,
              })
            : {};

        this.#currentTweenCounter++;

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            tween,
            action: 'goFromTo',
            valuesFrom: { ...previousValues, ...valuesFrom },
            valuesTo: { ...previousValues, ...valuesTo },
            tweenProps,
            groupProps: { waitComplete: this.#waitComplete },
        });

        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineAdd}
     */
    add(fn = NOOP) {
        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('add');
            return this;
        }

        this.#currentTweenCounter++;
        const callback = functionIsValidAndReturnDefault(
            fn,
            () => {},
            'timeline add function'
        );

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            callback,
            action: 'add',
            groupProps: { waitComplete: this.#waitComplete },
        });

        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineAddAsync}
     */
    addAsync(fn) {
        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('addAsync');
            return this;
        }

        const callback = addAsyncFunctionIsValid(fn);
        this.#currentTweenCounter++;

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            callback,
            action: 'addAsync',
            groupProps: { waitComplete: this.#waitComplete },
        });

        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineCreateGroup}
     */
    createGroup(groupProps = {}) {
        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('createGroup');
            return this;
        }

        this.#currentTweenCounter++;

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            action: 'createGroup',
            groupProps,
        });

        this.#waitComplete = groupProps?.waitComplete ?? false;
        this.#groupId = this.#groupCounter++;
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineCloseGroup}
     */
    closeGroup() {
        this.#groupId = undefined;

        this.#currentTweenCounter++;

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            action: 'closeGroup',
        });

        this.#waitComplete = false;
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineSuspend}
     */
    suspend(fn = () => true) {
        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('suspend');
            return this;
        }

        this.#currentTweenCounter++;

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            callback: fn,
            action: 'suspend',
            groupProps: { waitComplete: this.#waitComplete },
        });

        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineLabel}
     */
    label(labelProps = {}) {
        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('label');
            return this;
        }

        if (!valueStringIsValid(labelProps?.name, 'asyncTimeline label:'))
            return this;

        this.#currentTweenCounter++;

        this.#addAction({
            ...this.#defaultObj,
            id: this.#currentTweenCounter,
            action: 'label',
            labelProps,
            groupProps: { waitComplete: this.#waitComplete },
        });

        return this;
    }

    /**
     * Execute a set() method of specified tweens at specified label
     *
     * @type {import('./type.js').AsyncTimelineSetTween}
     */
    async setTween(label = '', items = []) {
        this.stop();

        const itemsIsArray = timelineSetTweenArrayIsValid(items);
        const labelIsString = timelineSetTweenLabelIsValid(label);

        if (!itemsIsArray || !labelIsString)
            throw new Error('timeline setTween: props is wrong');

        /*
         * Filter user tween from frameStore
         */
        const itemsId = new Set(items.map((item) => item?.getId?.()));
        const tweens = this.#tweenStore.filter(({ id }) => {
            return itemsId.has(id);
        });

        /*
         * Get index from label
         */
        const index = this.#tweenList.findIndex((item) => {
            const [firstItem] = item;
            const labelCheck = firstItem.data.labelProps?.name;
            return labelCheck === label;
        });

        if (index === -1) {
            timelineSetTweenLabelNotFoundWarining(label);
            throw new Error(
                `asyncTimeline.setTween() label: ${label} not found`
            );
        }

        /*
         * Fire set method of selected tween and resolve promise
         */
        const tweenPromises = tweens.map(({ tween }) => {
            const data = reduceTweenUntilIndex({
                timeline: this.#tweenList,
                tween,
                index,
            });

            return tween.set(data);
        });

        try {
            await Promise.all(tweenPromises);
            return { resolve: true };
        } catch {
            timelineSetTweenFailWarining();
        }
    }

    /**
     * @type {import('./type.js').AsyncTimelinePlayFrom}
     */
    async playFrom(label) {
        await this.#waitFps();
        return this.#playFromUpDown(label, false);
    }

    /**
     * @type {import('./type.js').AsyncTimelinePlayFrom}
     */
    async playFromReverse(label) {
        await this.#waitFps();
        return this.#playFromUpDown(label, true);
    }

    /**
     * 1. Execute test loop via this.playReverse() to set `prevValueSettled`.
     * 2. Then when timeline reach the end run from currentIndex 0, ( stop() reset currentIndex )
     *
     * @type {() => Promise<any>}
     */
    async play() {
        /**
         * Stop before the await.
         *
         * Stop() and `#isStopped = false` used to run in the same synchronous block, so the #run() chain of a previous
         * play() ( suspended on the Promise.race/all of its step ) never observed `#isStopped === true`: when the
         * stopped tween settled its promise the old chain woke up, found the timeline running again and kept walking
         * the timeline beside the new one. The await below give the old chain the chance to see the stopped state and
         * return.
         *
         * Without this a play() on a running timeline needed an explicit stop() from outside.
         */
        await this.#waitFps();
        this.stop();

        return new Promise((resolve, reject) => {
            /*
             * In freeMode every tween start form current value in use at the moment
             *
             * Reject instead of leaving the promise pending forever.
             */
            if (this.#tweenList.length === 0) {
                reject(MobCore.ANIMATION_STOP_REJECT);
                return;
            }

            /**
             * Add Tween at start/end if needed
             */
            if (this.#autoSet) this.#addSetBlocks();
            this.#addNoopSentinels();

            /**
             * RUN free mode and exit method. In free mode stop current loop. than play normally without set tween to
             * start value ( autoSet ).
             */
            if (this.#freeMode) {
                /**
                 * Timeline is already stopped at the top of the method. Start new playing session.
                 */
                this.#transitionToPlaying();

                /**
                 * Normalize this.#isReverse status.
                 */
                if (this.#isReverse) this.#revertTween();

                /*
                 * Run one frame after stop to avoid overlap with promise resolve/reject
                 */
                MobCore.useFrameIndex(() => {
                    // Set current promise action after stop so is not fired in stop method
                    this.#currentReject = reject;
                    this.#currentResolve = resolve;

                    /**
                     * Clean run
                     */
                    this.#run();
                }, 1);

                return;
            }

            /**
             * RUN No free mode
             */
            this.playReverse({
                forceYoYo: false,
                callback: async () => {
                    /**
                     * Need to reset current data after reverse() of tween so use stop() this.#currentIndex is updated
                     * in this.stop() function
                     */
                    this.stop();
                    this.#transitionToPlaying();

                    /*
                     * When start form play in default mode ( no freeMode )
                     * an automatic set method is Executed with initial data
                     */
                    const tweenPromises = this.#tweenStore.map(({ tween }) => {
                        const data = tween.getInitialData();

                        return tween.set(data);
                    });

                    try {
                        await Promise.all(tweenPromises);

                        // Set current promise action after stop so is not fired in stop method
                        this.#currentReject = reject;
                        this.#currentResolve = resolve;
                        this.#run();
                    } catch {
                        /**
                         * Tween was stopped, timeline should not start.
                         */
                    }
                },
            });
        });
    }

    /**
     * 1. Run a test loop to update prevValueSettled
     *
     * 2a) callback is defined: When timeline reach the end fire this callback.
     *
     * 2b) no callback is defined && forceYoYo = true ( this.playReverse() clean ): this.#forceYoYo = true force
     * timeline to fire this.#revertTween() that revert main timeline array and then go on naturally after test loop.
     *
     * 2c) no callback is defined && forceYoYo = false ( this.play ) start from 0 after test loop
     *
     * @type {import('./type.js').AsyncTimelinePlayReverse}
     */
    async playReverse({
        forceYoYo = true,
        callback,
        resolve = null,
        reject = null,
    } = {}) {
        /**
         * Stop before the await, same reason of play(): give the #run() chain of a previous play a chance to observe
         * `#isStopped === true` and return, instead of walking the timeline beside the new one.
         *
         * PlayFrom() / playFromReverse() delegate here, so they inherit the same behavior.
         */
        this.stop();

        await this.#waitFps();

        return new Promise((thisResolve, thisReject) => {
            const currentResolve = resolve ?? thisResolve;
            const currentReject = reject ?? thisReject;

            /**
             * Skip of there is nothing to run.
             *
             * Reject instead of leaving the promise pending forever. currentReject is the reject of the caller (
             * playFrom / playFromReverse ) when they delegate to playReverse.
             */
            if (this.#tweenList.length === 0) {
                currentReject(MobCore.ANIMATION_STOP_REJECT);
                return;
            }

            const forceYoYoNow = forceYoYo;

            if (this.#autoSet) this.#addSetBlocks();
            this.#addNoopSentinels();

            /**
             * Timeline is already stopped at the top of the method. Start new playing session.
             */
            this.#transitionToPlaying();

            /*
             * Default playReverse()
             *
             * Walk thru timeline until the end,
             * so we can run reverse next step with forceyoyo
             * forceyoyo is used only if we play directly from end
             * PlayFrom which use reverse() need to go in forward direction
             */
            if (forceYoYoNow) this.#forceYoyo = true;

            /*
             * Lalbel state, this run is for get prevValueSettled.
             *
             * Set callback to fire when timeline reach end in immediate mode ( useLabel ). In case
             * this.playReverse() is called by play/playFromLabel/playFrom, need to reach right index after
             * immediate loop.
             *
             * If no callback is used run from currentIndex 0.
             */
            this.#useLabel = {
                active: true,
                index: this.#tweenList.length,
                isReverse: false,
                callback,
            };

            /**
             * When play reverse first loop is virtual So decrement the loop number by 1
             */
            this.#loopCounter--;

            /*
             * Run one frame after stop to avoid overlap with promise resolve/reject
             */
            MobCore.useFrameIndex(() => {
                // Set current promise action after stop so is not fired in stop method
                this.#currentResolve = currentResolve;
                this.#currentReject = currentReject;
                this.#run();
            }, 1);
        });
    }

    /**
     * @type {() => void}
     */
    reverseNext() {
        this.#isReverseNext = true;
    }

    /**
     * @type {import('./type.js').AsyncTimelineStop}
     */
    stop({ clearCache = true } = {}) {
        this.#transitionToStopped();
        this.#rejectPromise();

        // Stop all Tween
        for (const { tween } of this.#tweenStore) {
            tween?.stop?.({ clearCache });
        }

        /**
         * Force reset current tween.
         */
        this.#currentTween = [];

        // If reverse back to default direction
        if (this.#isReverse) this.#revertTween();
        this.#isReverse = false;

        /*
         * If freeMode is false we
         * set tween 'store' with original data.
         * So we are sure that next loop start from initial data
         */
        if (!this.#freeMode) this.#resetAllTween();
    }

    /**
     * @type {import('./type.js').AsyncTimelinePause}
     */
    pause() {
        if (this.#isInPause || this.#isStopped) return;

        this.#transitionToPaused();
        this.#pauseAllTween();
    }

    /**
     * @type {import('./type.js').AsyncTimelineResume}
     */
    resume() {
        if ((!this.#isInPause && !this.#isInSuspension) || this.#isStopped)
            return;

        const wasPaused = this.#isInPause;
        const wasSuspended = this.#isInSuspension;

        if (wasPaused || wasSuspended) {
            this.#transitionToResumed();
        }

        if (wasPaused) {
            this.#resumeAllTween();
        }

        if (wasSuspended) {
            if (this.#currentIndex < this.#tweenList.length - 1) {
                this.#currentIndex++;
            }

            this.#run();
        }
    }

    /**
     * Get an array of active instance.
     *
     * @example
     *     ```javascript
     *     const tweens = myTimeline.get()
     *
     *
     *     ```;
     *
     * @returns {import('./type.js').AsyncTimelineCurrentTween[]} - Returns an array with all tweens active at the time
     *   the method is called
     */
    get() {
        return this.#currentTween;
    }

    /**
     * Return active state.
     *
     * @example
     *     ```javascript
     *     const isActive = myTimeline.isActive();
     *
     *
     *     ```;
     *
     * @returns {boolean} Returns a boolean value indicating whether the timeline is active
     */
    isActive() {
        return !this.#isStopped;
    }

    /**
     * Return pause state.
     *
     * @example
     *     ```javascript
     *     const isPaused = myTimeline.isPaused():
     *
     *
     *     ```;
     *
     * @returns {boolean} Returns a boolean value indicating whether the timeline is in pause
     */
    isPaused() {
        return this.#isInPause;
    }

    /**
     * Return suspended state.
     *
     * @example
     *     ```javascript
     *     const isSuspended = myTimeline.isSuspended();
     *
     *
     *     ```;
     *
     * @returns {boolean} Returns a boolean value indicating whether the timeline is suspended
     */
    isSuspended() {
        return this.#isInSuspension;
    }

    /**
     * Return current direction.
     *
     * @example
     *     ```javascript
     *     const direction = myTimeline.getDirection();
     *
     *
     *     ```;
     *
     * @returns {import('../utils/timeline/type.js').DirectionType} Returns a boolean value indicating whether the
     *   timeline is suspended
     */
    getDirection() {
        if (this.#isStopped) return directionConstant.NONE;

        /**
         * Default
         */
        return this.#isReverse
            ? directionConstant.BACKWARD
            : directionConstant.FORWARD;
    }

    /**
     * @type {import('./type.js').AsyncTimelineOnLoopEnd}
     */
    onLoopEnd(cb) {
        /**
         * #callbackId was never incremented here, so every callback was stored with the same id and the unsubscribe of
         * one removed all of them. Same pattern of MobSyncTimeline.
         */
        this.#callbackLoop.push({ cb, id: this.#callbackId });
        const cbId = this.#callbackId;
        this.#callbackId++;

        return () => {
            this.#callbackLoop = this.#callbackLoop.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * @type {import('./type.js').AsyncTimelineOnComplete}
     */
    onComplete(cb) {
        this.#callbackComplete.push({ cb, id: this.#callbackId });
        const cbId = this.#callbackId;
        this.#callbackId++;

        return () => {
            this.#callbackComplete = this.#callbackComplete.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * Destroy timeline and all the sequencer
     */
    destroy() {
        /**
         * Stop the timeline first.
         *
         * Without stop() the timeline stayed 'active' ( #isStopped false ): the promise of play() was never settled, a
         * running #loopOnDelay kept looping in rAF and, at the end of the delay, fired the tween action on a destroyed
         * tween ( zombie rAF ). Every other class of the library ( MobSyncTimeline, MobTween, MobSpring, MobLerp ) call
         * stop() in destroy().
         */
        this.stop();

        for (const { tween } of this.#tweenStore) {
            tween?.destroy?.();
        }
        this.#tweenList = [];
        this.#currentTween = [];
        this.#callbackComplete = [];
        this.#callbackLoop = [];
        this.#tweenStore = [];
        this.#currentIndex = 0;

        /**
         * Invalidano la sessione corrente.
         */
        this.#sessionId++;
        this.#useLabel = {
            active: false,
            callback: undefined,
            index: -1,
            isReverse: false,
        };
    }
}
