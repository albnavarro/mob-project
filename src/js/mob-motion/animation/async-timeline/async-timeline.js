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
import { filterActiveProps } from './fitler-active-props.js';
import { reduceTweenUntilIndex } from './reduce-tween-until-index.js';
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
    #addAsyncIsActive;

    /**
     * @type {boolean}
     */
    #isStopped;

    /**
     * @type {boolean}
     */
    #delayIsRunning;

    /**
     * @type {boolean}
     */
    #startOnDelay;

    /**
     * @type {import('./type.js').AsyncTimelineAfterReject}
     */
    #actionAfterReject;

    /**
     * @type {number}
     */
    #sessionId;

    /**
     * @type {number}
     */
    #activetweenCounter;

    /**
     * @type {number}
     */
    #timeOnPause;

    /**
     * @type {boolean}
     */
    #autoSetIsJustCreated;

    /**
     * @type {import('./type.js').AsyncTimelineCurrentAction[]}
     */
    #currentAction;

    /**
     * @type {boolean}
     */
    #fpsIsInLoading;

    /**
     * @type {number}
     */
    #id;

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
     * myTimeline.sync();
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
     *       yoyo: [ Boolean ],
     *       repeat: [ Number ],
     *       freeMode: [ Number ],
     *       autoSet: [ Number ],
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
            false
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
            syncProp: {
                to: {
                    getId: () => '',
                    set: () => Promise.resolve(),
                    setImmediate: () => {},
                    goTo: () => Promise.resolve(),
                    goFrom: () => Promise.resolve(),
                    goFromTo: () => Promise.resolve(),
                    getToNativeType: () => ({ a: 1 }),
                    destroy: () => {},
                    onStartInPause: () => {},
                    resetData: () => {},
                    getInitialData: () => ({ a: 1 }),
                    stop: () => {},
                    pause: () => {},
                    resume: () => {},
                },
                from: {
                    getId: () => '',
                    set: () => Promise.resolve(),
                    setImmediate: () => {},
                    goTo: () => Promise.resolve(),
                    goFrom: () => Promise.resolve(),
                    goFromTo: () => Promise.resolve(),
                    getToNativeType: () => ({ a: 1 }),
                    destroy: () => {},
                    onStartInPause: () => {},
                    resetData: () => {},
                    getInitialData: () => ({ a: 1 }),
                    stop: () => {},
                    pause: () => {},
                    resume: () => {},
                },
            },
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
        this.#addAsyncIsActive = false;
        this.#isStopped = true;
        this.#delayIsRunning = false;
        this.#startOnDelay = false;
        this.#actionAfterReject = {
            active: false,
            fn: () => {},
        };
        this.#sessionId = 0;
        this.#activetweenCounter = 0;
        this.#timeOnPause = 0;
        this.#autoSetIsJustCreated = false;
        this.#currentAction = [];
        this.#fpsIsInLoading = false;
        this.#id = 0;
        this.#callbackLoop = [];
        this.#callbackComplete = [];
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
    }

    /**
     * @type {() => void}
     */
    #run() {
        /**
         * Store previous action to prevent two add/addAsync consegutive
         */
        const currentTweelist = this.#tweenList[this.#currentIndex];
        const lastAction = this.#currentAction;
        this.#currentAction = [];

        /**
         * Prevent possible error when destroy instance.
         */
        if (!currentTweelist) return;

        /**
         * Each is item is a group, so we need to loop over each tween in group. Update prevValueSettled value for
         * current loop index.
         *
         * First immediate loop is necessary. Once every index is visited the if inside is always skipped.
         */
        this.#tweenList[this.#currentIndex] = currentTweelist.map((item) => {
            const { data } = item;
            const { tween, valuesTo: currentValuesTo, prevValueSettled } = data;

            /*
             * Get current valueTo for to use in reverse methods
             * Get the value only first immediate loop, so if prevValueSettled is settled skip
             *
             * prevValueSettled is defined non only for tween but suspended etc..
             * So check if is tween and as method getToNativeType.
             *
             * prevValueSettled is settled only once during the entire life of timeline.
             */
            if (tween && tween?.getToNativeType && !prevValueSettled) {
                const nativeValues = tween.getToNativeType();

                /*
                 * Get only the active prop
                 * maybe unnecessary, if all prop ius used work fine
                 * Only for a clean code
                 */
                const prevValueTo = filterActiveProps({
                    data: nativeValues,
                    filterBy: currentValuesTo,
                });

                return {
                    ...item,
                    data: {
                        ...data,
                        prevValueTo,
                        prevValueSettled: true,
                    },
                };
            }

            return item;
        });

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
                syncProp,
                id,
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

            /*
             * Update current action.
             * Use this to check if we execute the same cicly two time consegutive.
             */
            this.#currentAction.push({ id, action });

            /*
             * Check if the previous block is running again
             */
            const prevActionIsCurrent = lastAction.find(
                ({ id: prevId, action: prevAction }) => {
                    return prevId === id && prevAction === action;
                }
            );

            /*
             * Current action data. Than we match key in object.
             */
            const fn = {
                set: () => {
                    return tween?.[/** @type {'set'} */ (action)](
                        valuesFrom,
                        newTweenProps
                    );
                },
                goTo: () => {
                    return tween?.[/** @type {'goTo'} */ (action)](
                        valuesTo,
                        newTweenProps
                    );
                },
                goFrom: () => {
                    return tween?.[/** @type {'goFrom'} */ (action)](
                        valuesFrom,
                        newTweenProps
                    );
                },
                goFromTo: () => {
                    return tween?.[/** @type {'goFromTo'} */ (action)](
                        valuesFrom,
                        valuesTo,
                        newTweenProps
                    );
                },
                sync: () => {
                    return new Promise((res) => {
                        const { from, to } = syncProp;
                        to?.set(from?.getToNativeType(), {
                            immediate: true,
                        }).then(() => res({ resolve: true }));
                    });
                },
                add: () => {
                    /*
                     * Prevent fire the same last add
                     * Es reverseNext inside it cause an infinite loop
                     */
                    if (prevActionIsCurrent) {
                        return new Promise((res) => res({ resolve: true }));
                    }

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
                     * Activate addAsyncFlag
                     *
                     * SessionId change each play/playReverse and so on. Make sure that this step run only in current
                     * session.
                     */
                    this.#addAsyncIsActive = true;
                    const sessionId = this.#sessionId;

                    /*
                     * Prevent fire the same last addAsync
                     * Es reverseNext inside it cause an infinite loop
                     * prevActionIsCurrent check if the same block run twice consegutive.
                     */
                    if (prevActionIsCurrent) {
                        return new Promise((res) => res({ resolve: true }));
                    }

                    return new Promise((res, reject) => {
                        if (isImmediate) {
                            res({ resolve: true });
                            return;
                        }

                        const direction = this.getDirection();

                        callback({
                            direction,
                            loop: this.#loopCounter,
                            resolve: () => {
                                if (sessionId === this.#sessionId) {
                                    res({ resolve: true });
                                    return;
                                }

                                reject();
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
                     * Prevent fire the same last add
                     * Es reverseNext inside it cause an infinite loop
                     * prevActionIsCurrent check if the same block run twice consegutive.
                     */
                    if (prevActionIsCurrent) {
                        return new Promise((res) => res({ resolve: true }));
                    }

                    /*
                     * Check callback that return a bollean to fire supend
                     */
                    const valueIsValid = MobCore.checkType(Boolean, callback());
                    if (!valueIsValid) timelineSuspendWarning(callback);
                    const sholudSuspend = valueIsValid ? callback() : true;
                    return new Promise((res) => {
                        if (!isImmediate && sholudSuspend) {
                            this.#isInSuspension = true;
                        }
                        res({ resolve: true });
                    });
                },
            };

            return new Promise((res, reject) => {
                // Get delay
                const delay = isImmediate ? false : tweenProps?.delay;
                const previousSessionId = this.#sessionId;

                /**
                 * Start specific delay item group
                 */
                if (delay) {
                    const start = MobCore.getTime();
                    this.#delayIsRunning = true;

                    requestAnimationFrame(() => {
                        this.#loopOnDelay({
                            start,
                            deltaTimeOnpause: 0,
                            delay,
                            reject,
                            res,
                            previousSessionId,
                            tween,
                            fn,
                            action,
                        });
                    });

                    return;
                }

                resolveTweenPromise({
                    reject,
                    res,
                    isStopped: this.#isStopped,
                    startOnDelay: this.#startOnDelay,
                    isInPause: this.#isInPause,
                    addToActiveTween: (tween) => this.#addToActiveTween(tween),
                    currentSessionId: this.#sessionId,
                    previousSessionId,
                    tween,
                    fn,
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

        // @ts-ignore
        Promise[promiseType](tweenPromises)
            .then(() => {
                if (this.#isInSuspension || this.#isStopped) return;

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
                        const tweenPromise = this.#tweenStore.map(
                            ({ tween }) => {
                                const data = reduceTweenUntilIndex({
                                    timeline: this.#tweenList,
                                    tween,
                                    index: this.#tweenList.length,
                                });

                                return new Promise((resolve, reject) => {
                                    tween
                                        .set(data)
                                        .then(() => resolve({ resolve: true }))
                                        .catch(() => reject());
                                });
                            }
                        );
                        Promise.all(tweenPromise)
                            .then(() => {
                                this.#onRepeat();
                            })
                            .catch(() => {});
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
                this.#callbackComplete.forEach(({ cb }) => cb());
                this.#isStopped = true;

                if (this.#currentResolve) {
                    handleNextFrame.add(() => {
                        handleNextTick.add(() => {
                            this.#currentResolve?.({ resolve: true });
                        });
                    });
                }
            })
            .catch(() => {
                // If play or reverse or playFromLabel is fired diring delay tween fail
                // After fail we can fire the action
                if (this.#actionAfterReject.active) {
                    console.log('actionAfterReject fired');
                    this.#actionAfterReject.fn();
                    this.#actionAfterReject.fn = () => {};
                    this.#actionAfterReject.active = false;
                    return;
                }
            })
            .finally(() => {
                /**
                 * Primise was completed AddAsync is resolved
                 */
                this.#addAsyncIsActive = false;
            });
    }

    /**
     * The method run only if tween has delay. Resolve tween delay.
     *
     * @param {Object} param0
     * @param {number} param0.start
     * @param {number} param0.deltaTimeOnpause
     * @param {number} param0.delay
     * @param {(value: any) => void} param0.reject - Timeline current group item promise
     * @param {(value: any) => void} param0.res - Timeline current group item promise
     * @param {number} param0.previousSessionId
     * @param {any} param0.tween
     * @param {Record<string, () => void>} param0.fn
     * @param {string} param0.action
     */
    #loopOnDelay({
        start,
        deltaTimeOnpause,
        delay,
        reject,
        res,
        previousSessionId,
        tween,
        fn,
        action,
    }) {
        const current = MobCore.getTime();

        /**
         * Time elapsed from the start of current timeline step.
         */
        let delta = current - start;

        /*
         * Time elapsed from pause() start.
         */
        if (this.#isInPause) deltaTimeOnpause = current - this.#timeOnPause;

        /*
         * #actionAfterReject cache next action ( play/playReverse ) when user call previous method and a tween is waitng delay end.
         * this condition equalize delay && delta value so enter in the resolveTweenPromise function.
         */
        if (this.#actionAfterReject.active) {
            deltaTimeOnpause = 0;
            delta = delay;
        }

        /**
         * RESOLVE DELAY:
         *
         * Delta - deltaTimeOnpause: reconciliate time: total duration of current timeline step less time elapsed in
         * pause. Loop #loopOnDelay until reconciliate time is minus delay time
         *
         * When reconciliate time is over delay value the tween should go ( delay is ended ). NOTE: dealy is timeline
         * internal property not tween property. th if is the real delay check.
         *
         * If the time elapsed in current timeline step is over delay value need to resolve or reject timeline item
         * group promsie. the same in case of stop new play, or reverse next
         *
         * If there is no problem run tween, if there is problem reject promise of current timeline group item, so
         * timeline con go in next step.
         *
         * OK: resolve current timeline group promise. timeline group item promise is resolved by tweeen resolve.
         *
         * NO OK: reject current timeline group promise. if isStopped if play() if fired when pause status is active if
         * sessionId change
         */
        if (
            delta - deltaTimeOnpause >= delay ||
            this.#isStopped ||
            this.#isReverseNext
        ) {
            /**
             * Is settled to true on first loopOnDelay() execution.
             */
            this.#delayIsRunning = false;

            resolveTweenPromise({
                reject,
                res,
                isStopped: this.#isStopped,
                startOnDelay: this.#startOnDelay,
                isInPause: this.#isInPause,
                addToActiveTween: (tween) => {
                    return this.#addToActiveTween(tween);
                },
                currentSessionId: this.#sessionId,
                previousSessionId,
                tween,
                fn,
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
                delay,
                reject,
                res,
                previousSessionId,
                tween,
                fn,
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
            this.#callbackLoop.forEach(({ cb }) =>
                cb({
                    direction,
                    loop: this.#loopCounter,
                })
            );
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
        this.#isReverse = !this.#isReverse;
        this.#tweenList = this.#tweenList.reverse().map((group) => {
            return group.reverse().map((item) => {
                const { data } = item;
                const { action, valuesFrom, syncProp, prevValueTo, valuesTo } =
                    data;

                const currentValueTo = valuesTo;
                const { from, to } = syncProp;

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

                    case 'sync': {
                        return {
                            ...item,
                            data: {
                                ...data,
                                syncProp: {
                                    ...syncProp,
                                    from: to,
                                    to: from,
                                },
                            },
                        };
                    }

                    case 'goFrom': {
                        timelineReverseGoFromWarning();
                        this.stop();
                    }
                }

                return item;
            });
        });
    }

    /**
     * Common method, add all action to main array
     *
     * @type {import('./type.js').AsyncTimelineAddToMainArray}
     */
    #addToMainArray(obj) {
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
        this.#tweenStore.forEach(({ tween }) => tween.resetData());
    }

    /**
     * @type {import('./type.js').AsyncTimelineSet}
     */
    set(tween, valuesSet = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.#currentTweenCounter,
            tween,
            action: 'set',
            valuesTo: valuesSet,
            valuesFrom: valuesSet,
            tweenProps,
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineGoTo}
     */
    goTo(tween, valuesTo = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.#currentTweenCounter,
            tween,
            action: 'goTo',
            valuesTo,
            tweenProps: tweenProps ?? {},
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineGoFrom}
     */
    goFrom(tween, valuesFrom = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.#currentTweenCounter,
            tween,
            action: 'goFrom',
            valuesFrom,
            tweenProps,
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineGoFromTo}
     */
    goFromTo(tween, valuesFrom = {}, valuesTo = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.#currentTweenCounter,
            tween,
            action: 'goFromTo',
            valuesFrom,
            valuesTo,
            tweenProps,
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        this.#addTweenToStore(tween);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineAdd}
     */
    add(fn = NOOP) {
        const callback = functionIsValidAndReturnDefault(
            fn,
            () => {},
            'timeline add function'
        );
        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('add');
            return this;
        }

        const obj = {
            id: this.#currentTweenCounter,
            callback,
            action: 'add',
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineAddAsync}
     */
    addAsync(fn) {
        const callback = addAsyncFunctionIsValid(fn);

        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('addAsync');
            return this;
        }

        const obj = {
            id: this.#currentTweenCounter,
            callback,
            action: 'addAsync',
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineSync}
     */
    sync(syncProp) {
        /**
         * Can't add this interpolation inside a group. groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('sync');
            return this;
        }

        /*
         * Check if from and to is a tween
         */
        const fromIsTween = asyncTimelineTweenIsValid(syncProp?.from);
        const toIsTween = asyncTimelineTweenIsValid(syncProp?.to);
        if (!toIsTween || !fromIsTween) return this;

        const obj = {
            id: this.#currentTweenCounter,
            action: 'sync',
            groupProps: { waitComplete: this.#waitComplete },
            syncProp,
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
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

        const obj = {
            id: this.#currentTweenCounter,
            action: 'createGroup',
            groupProps,
        };

        this.#currentTweenCounter++;

        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        this.#waitComplete = groupProps?.waitComplete ?? false;
        this.#groupId = this.#groupCounter++;
        return this;
    }

    /**
     * @type {import('./type.js').AsyncTimelineCloseGroup}
     */
    closeGroup() {
        this.#groupId = undefined;

        const obj = {
            id: this.#currentTweenCounter,
            action: 'closeGroup',
        };

        this.#currentTweenCounter++;

        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
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

        const obj = {
            id: this.#currentTweenCounter,
            callback: fn,
            action: 'suspend',
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
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

        const obj = {
            id: this.#currentTweenCounter,
            action: 'label',
            labelProps,
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        return this;
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
        this.#tweenStore.forEach(({ tween }) => {
            const setValueTo = tween.getInitialData();

            const obj = {
                id: this.#currentTweenCounter,
                tween,
                action: 'set',
                valuesFrom: setValueTo,
                valuesTo: setValueTo,
                groupProps: { waitComplete: this.#waitComplete },
            };

            this.#currentTweenCounter++;

            const mergedObj = { ...this.#defaultObj, ...obj };
            this.#tweenList = [
                [{ group: undefined, data: mergedObj }],
                ...this.#tweenList,
            ];
        });

        /*
         * END Blocks
         * Add set block at the end of timeline for every tween with last toValue
         */
        this.#tweenStore.forEach(({ tween }) => {
            const setValueTo = reduceTweenUntilIndex({
                timeline: this.#tweenList,
                tween,
                index: this.#tweenList.length,
            });

            const obj = {
                id: this.#currentTweenCounter,
                tween,
                action: 'set',
                valuesFrom: setValueTo,
                valuesTo: setValueTo,
                groupProps: { waitComplete: this.#waitComplete },
            };

            this.#currentTweenCounter++;
            const mergedObj = { ...this.#defaultObj, ...obj };
            this.#tweenList.push([{ group: undefined, data: mergedObj }]);
        });
    }

    /**
     * Execute a set() method of specified tweens at specified label
     *
     * @type {import('./type.js').AsyncTimelineSetTween}
     */
    setTween(label = '', items = []) {
        this.stop();

        const itemsIsArray = timelineSetTweenArrayIsValid(items);
        const labelIsString = timelineSetTweenLabelIsValid(label);

        if (!itemsIsArray || !labelIsString)
            return Promise.reject(
                new Error('timeline setTween: props is wrong')
            );

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
            return Promise.reject(
                new Error(`asyncTimeline.setTween() label: ${label} not found`)
            );
        }

        /*
         * Fire set method of selected tween and resolve promise
         */
        return new Promise((resolve) => {
            const tweenPromise = tweens.map(({ tween }) => {
                const data = reduceTweenUntilIndex({
                    timeline: this.#tweenList,
                    tween,
                    index,
                });

                return new Promise((resolveTween, rejectTween) => {
                    tween
                        .set(data)
                        .then(() => resolveTween({ resolve: true }))
                        .catch(() => rejectTween());
                });
            });
            Promise.all(tweenPromise)
                .then(() => {
                    resolve({ resolve: true });
                })
                .catch(() => {
                    timelineSetTweenFailWarining();
                });
        });
    }

    /**
     * Reject promise without error in console ( Firefix do not ).
     */
    #rejectPromise() {
        if (this.#currentReject) {
            this.#currentReject(MobCore.ANIMATION_STOP_REJECT);
            this.#currentReject = undefined;
        }
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
                     * Skip of there is nothing to run
                     */
                    if (this.#tweenList.length === 0 || this.#addAsyncIsActive)
                        return;

                    /**
                     * Normalize reverse status.
                     */
                    if (this.#isReverse) this.#revertTween();

                    /*
                     * Reset currentIndex.
                     */
                    this.#currentIndex = 0;

                    /**
                     * Define condition to go to right timeline index after first test loop. When playReverse loop is
                     * ended, this.#useLabel is reassigned here, this time no callback is needed.
                     */
                    this.#useLabel = {
                        isReverse,
                        active: true,
                        index: MobCore.checkType(String, label)
                            ? this.#tweenList.findIndex((item) => {
                                  const [firstItem] = item;
                                  const labelCheck =
                                      firstItem.data.labelProps?.name;
                                  return labelCheck === label;
                              })
                            : label,
                        callback: undefined,
                    };

                    /**
                     * Check if label index is valid
                     */
                    if (MobCore.checkType(String, label))
                        playLabelIsValid(this.#useLabel.index, label);

                    this.#run();
                },
            });
        });
    }

    /**
     * 1. Execute test loop via this.playReverse() to set `prevValueSettled`.
     * 2. Then when timeline reach the end run from currentIndex 0, ( stop() reset currentIndex )
     *
     * @type {() => Promise<any>}
     */
    async play() {
        await this.#waitFps();

        return new Promise((resolve, reject) => {
            /**
             * Add Tween at start/end if needed
             */
            if (this.#autoSet) this.#addSetBlocks();

            /**
             * RUN free mode and exit method. In free mode stop current loop. than play normally without set tween to
             * start value ( autoSet ).
             */
            if (this.#freeMode) {
                /*
                 * In freeMode every tween start form current value in use at the moment
                 */
                if (this.#tweenList.length === 0 || this.#addAsyncIsActive)
                    return;

                /**
                 * If a tween has delay and is not start reject main promise and fire the new pipe
                 * This.#actionAfterReject will be fired when reject main promise.
                 */
                if (this.#delayIsRunning && !this.#actionAfterReject.active) {
                    this.#startOnDelay = true;
                    this.#actionAfterReject = {
                        fn: () => this.play(),
                        active: true,
                    };
                    return;
                }

                this.#startOnDelay = false;
                this.stop();
                this.#isStopped = false;

                /**
                 * Normalize this.#isReverse status.
                 */
                if (this.#isReverse) this.#revertTween();

                /**
                 * Update session id.
                 */
                this.#sessionId++;

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
                callback: () => {
                    /**
                     * Need to reset current data after reverse() of tween so use stop() this.#currentIndex is updated
                     * in this.stop() function
                     */
                    this.stop();
                    this.#isStopped = false;

                    /*
                     * When start form play in default mode ( no freeMode )
                     * an automatic set method is Executed with initial data
                     */
                    const tweenPromise = this.#tweenStore.map(({ tween }) => {
                        const data = tween.getInitialData();

                        return new Promise((resolve, reject) => {
                            tween
                                .set(data)
                                .then(() => resolve({ resolve: true }))
                                .catch(() => reject());
                        });
                    });
                    Promise.all(tweenPromise)
                        .then(() => {
                            // Set current promise action after stop so is not fired in stop method
                            this.#currentReject = reject;
                            this.#currentResolve = resolve;
                            this.#run();
                        })
                        .catch(() => {});
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
        await this.#waitFps();

        return new Promise((thisResolve, thisReject) => {
            const currentResolve = resolve ?? thisResolve;
            const currentReject = reject ?? thisReject;
            const forceYoYoNow = forceYoYo;
            const callbackNow = callback;

            if (this.#autoSet) this.#addSetBlocks();

            /**
             * Skip of there is nothing to run
             */
            if (this.#tweenList.length === 0 || this.#addAsyncIsActive) return;

            /**
             * If a tween has delay and is not start reject main promise and fire the new pipe This.#actionAfterReject
             * will be fired when reject main promise.
             */
            if (this.#delayIsRunning && !this.#actionAfterReject.active) {
                this.#startOnDelay = true;

                this.#actionAfterReject = {
                    fn: () =>
                        this.playReverse({
                            forceYoYo: forceYoYoNow,
                            callback: callbackNow,
                            resolve: currentResolve,
                            reject: currentReject,
                        }),
                    active: true,
                };

                return;
            }

            /**
             * Rest necessary props
             */
            this.#startOnDelay = false;
            this.stop();
            this.#isStopped = false;

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
            this.#sessionId++;

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
        this.#isStopped = true;
        this.#currentIndex = 0;
        this.#loopCounter = 1;
        this.#rejectPromise();

        // Reset state
        this.#isReverseNext = false;
        this.#resetUseLabel();
        this.#forceYoyo = false;
        this.#isInPause = false;
        this.#isInSuspension = false;
        this.#addAsyncIsActive = false;
        this.#timeOnPause = 0;

        // Stop all Tween
        this.#tweenStore.forEach(({ tween }) => {
            tween?.stop?.({ clearCache });
        });

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
        this.#isInPause = true;
        this.#timeOnPause = MobCore.getTime();
        this.#currentTween.forEach(({ tween }) => {
            tween?.pause?.();
        });
    }

    /**
     * @type {import('./type.js').AsyncTimelineResume}
     */
    resume() {
        if (this.#isInPause) {
            this.#isInPause = false;
            this.#timeOnPause = 0;
            this.#resumeEachTween();
        }

        if (this.#isInSuspension) {
            this.#isInSuspension = false;
            this.#timeOnPause = 0;

            if (this.#currentIndex <= this.#tweenList.length - 2) {
                this.#currentIndex++;
                this.#run();
                return;
            }

            if (this.#currentIndex === this.#tweenList.length - 1) {
                /**
                 * At the end suspend become item in pipe first ro skip it
                 */
                this.#currentIndex = this.#yoyo && !this.#isReverse ? 1 : 0;
                this.#resetUseLabel();
                if (this.#yoyo) this.#revertTween();
                this.#loopCounter++;
                this.#run();
            }
        }
    }

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
     * @type {() => void}
     */
    #resumeEachTween() {
        this.#currentTween.forEach(({ tween }) => {
            tween?.resume?.();
        });
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
        this.#callbackLoop.push({ cb, id: this.#id });
        const cbId = this.#id;
        // this.callbackId++;

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
        this.#callbackComplete.push({ cb, id: this.#id });
        const cbId = this.#id;
        this.#id++;

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
        this.#tweenStore.forEach(({ tween }) => {
            tween?.destroy?.();
        });
        this.#tweenList = [];
        this.#currentTween = [];
        this.#callbackComplete = [];
        this.#callbackLoop = [];
        this.#tweenStore = [];
        this.#currentIndex = 0;
        this.#useLabel = {
            active: false,
            callback: undefined,
            index: -1,
            isReverse: false,
        };
        this.#actionAfterReject = {
            active: false,
            fn: () => {},
        };
    }
}
