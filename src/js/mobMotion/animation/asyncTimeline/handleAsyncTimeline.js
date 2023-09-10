import { mobCore } from '../../../mobCore/index.js';
import { NOOP } from '../../utils/functionsUtils.js';
import { directionConstant } from '../utils/constant.js';
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
} from '../utils/tweenValidation.js';
import {
    asyncTimelineMetodsInsideGroupWarining,
    relativePropInsideTimelineWarning,
    timelineReverseGoFromWarning,
    timelineSetTweenFailWarining,
    timelineSetTweenLabelNotFoundWarining,
    timelineSuspendWarning,
} from '../utils/warning.js';
import { asyncReduceData } from './asyncReduceData.js';
import { asyncReduceTween } from './asyncReduceTween.js';

/**
 * @typedef {Object} asyncTimelineTypes
 * @prop {Boolean} [yoyo=0]
    Reverse the direction each time the animation ends.
 * @prop {Number} [repeat=1]
    How many times the animation should be repeated.
    -1 means that the animation will run in an infinite loop.
 * @prop {Boolean} [freeMode=false]
    By default when a play or a playReverse is performed a `set method` is executed on each tween using the `initial values` (play)
    or the `final values` (playReverse) to make each tween start from a 'neutral' position regardless of its value current.
    Sets are not saved in the timeline but are temporary.
    If the `freeMode` property is set to `false` the sets are not executed so that multiple timelines can control the same tweens always starting from the current value of each tween. `The default is false`.
 * @prop {Boolean} [autoSet=false]
    If `autoSet` is set to true for each tween a `set method` corresponding to the `beginning` and `end` of the same timeline will be created.
    The newly created methods will be `permanently` added to the ends of the timeline.
    As these sets are permanent unlike the default behavior (with freeMode = false) during a repeat the timeline will always restart from the initial (or final) value.
    `The default is false`
 */

/**
 * @typedef {Object} asyncTimelineTweenTypes
 */

/**
 * @typedef {Object} asyncTimelineLoopType
 * @prop {number} loop
 **/

/**
 * @typedef {Object} asyncTimelineAddAsyncType
 * @prop {number} loop
 * @prop {Promise<Token>} - resolve promise function
 **/

/**
 * @typedef {Object} asyncTimelineSpecialPropTypes
 * @prop {Number} [delay = 0] delay - dealy value in millisecond.
 */
export default class HandleAsyncTimeline {
    /**
     * @param { asyncTimelineTypes } data
     *
     * @example
     * ```javascript
     * const myTimeline = new HandleAsyncTimeline({
     *   yoyo: [ Boolean ],
     *   repeat: [ Number ],
     *   freeMode: [ Number ],
     *   autoSet: [ Number ],
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```javascript
     *
     * `Methods to create timeline`
     * myTimeline.set()
     * myTimeline.goTo()
     * myTimeline.goFrom()
     * myTimeline.goFromTo()
     * myTimeline.add()
     * myTimeline.addAsync()
     * myTimeline.sync()
     * myTimeline.createGroup()
     * myTimeline.closeGroup()
     * myTimeline.suspend()
     * myTimeline.label()
     *
     *
     * `Methods to control timeline`
     * myTimeline.play()
     * myTimeline.playFromLabel()
     * myTimeline.playFrom()
     * myTimeline.playFromReverse()
     * myTimeline.playReverse()
     * myTimeline.reverseNext()
     * myTimeline.stop()
     * myTimeline.pause()
     * myTimeline.resume()
     * myTimeline.isActive()
     * myTimeline.isPaused()
     * myTimeline.isSuspended()
     * myTimeline.getDirection()
     * myTimeline.setTween()
     * myTimeline.get()
     * myTimeline.onLoopEnd()
     * myTimeline.onComplete()
     * myTimeline.destroy()
     * ```
     */
    constructor(data = {}) {
        /**
         * @private
         */
        this.repeat = repeatIsValid(data?.repeat);

        /**
         * @private
         */
        this.yoyo = valueIsBooleanAndReturnDefault(
            data?.yoyo,
            'asyncTimeline: yoyo',
            false
        );

        /**
         * @private
         */
        this.freeMode = valueIsBooleanAndReturnDefault(
            data?.freeMode,
            'asyncTimeline: freeMode',
            false
        );

        /**
         * @private
         */
        this.autoSet = valueIsBooleanAndReturnDefault(
            data?.autoSet,
            'asyncTimeline: autoSet',
            false
        );

        /**
         * @private
         */
        this.tweenList = [];

        /**
         * @private
         */
        this.currentTween = [];

        /**
         * @private
         */
        this.tweenStore = [];

        /**
         * @private
         */
        this.waitComplete = false;

        /**
         * @private
         */
        this.defaultObj = {
            id: null,
            tween: null,
            action: null,
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: null,
            prevValueSettled: false,
            tweenProps: {},
            groupProps: {},
            syncProp: {},
            labelProps: {},
        };

        /**
         * @private
         * @description
         * Timeline state
         */
        this.labelState = {
            active: false,
            index: -1,
            isReverse: false,
        };

        /**
         * @private
         */
        this.starterFunction = {
            fn: NOOP,
            active: false,
        };

        /**
         * @private
         * @description
         * group "name" star from 1 to avoid 0 = false
         */
        this.groupCounter = 1;

        /**
         * @private
         */
        this.groupId = null;

        /**
         * @private
         */
        this.currentTweenCounter = 0;

        /**
         * @private
         */
        this.currentIndex = 0;

        /**
         * @private
         */
        this.loopCounter = 1;

        /**
         * @private
         */
        this.isReverseNext = false;

        /**
         * @private
         */
        this.forceYoyo = false;

        /**
         * @private
         */
        this.isReverse = false;

        /**
         * @private
         */
        this.isInPause = false;

        /**
         * @private
         */
        this.isInSuspension = false;

        /**
         * @private
         */
        this.addAsyncIsActive = false;

        /**
         * @private
         */
        this.isStopped = true;

        /**
         * @private
         */
        this.delayIsRunning = false;

        /**
         * @private
         */
        this.startOnDelay = false;

        /**
         * @private
         */
        this.actionAfterReject = {
            active: false,
            fn: () => {},
        };

        /**
         * @private
         */
        this.sessionId = 0;

        /**
         * @private
         */
        this.activetweenCounter = 0;

        /**
         * @private
         */
        this.timeOnPause = 0;

        /**
         * @private
         */
        this.autoSetIsJustCreated = false;

        /**
         * @private
         */
        this.currentAction = [];

        /**
         * @private
         */
        this.fpsIsInLoading = false;

        /**
         * @private
         */
        this.id = 0;

        /**
         * @private
         */
        this.callbackLoop = [];

        /**
         * @private
         */
        this.callbackComplete = [];

        /**
         * @private
         */
        this.currentResolve = null;

        /**
         * @private
         */
        this.currentReject = null;

        /**
         * @private
         */
        this.immediate = {
            counter: 0,
            firstReverseStatus: false,
            currentReverseStatus: false,
        };
    }

    /**
     * @private
     */
    run() {
        /**
         * Store previous caction to prevent tiw add/addAsync consegutive
         */
        const lastAction = this.currentAction;
        this.currentAction = [];

        const tweenPromises = this.tweenList[this.currentIndex].map((item) => {
            const { data } = item;

            const {
                tween,
                action,
                valuesFrom,
                valuesTo,
                tweenProps,
                syncProp,
                id,
            } = data;

            // Clone teen prop and clean from timeline props
            const newTweenProps = { ...tweenProps };
            delete newTweenProps.delay;

            /*
             * activeate immediate prop if we walk thru tweens in test mode
             */
            const { active: labelIsActive, index: labelIndex } =
                this.labelState;
            const isImmediate = labelIsActive && this.currentIndex < labelIndex;

            if (isImmediate) newTweenProps.immediate = true;

            /*
             * If some tween use relative props the value is applied as relative
             * only the in the rist loop
             */
            if ('relative' in tweenProps && tweenProps.relative) {
                tweenProps.relative = false;
                relativePropInsideTimelineWarning();
            }

            /*
             * Get current valueTo for to use in reverse methods
             * Get the value only first immediate loop
             */
            if (
                tween &&
                tween?.getToNativeType &&
                !item.data?.prevValueSettled
            ) {
                const values = tween.getToNativeType();

                /*
                 * Get only the active prop
                 * maybe unnecessary, if all prop ius used work fine
                 * Only for a cliean code
                 */
                const propsInUse = asyncReduceData(values, valuesTo);
                item.data.prevValueTo = propsInUse;
                item.data.prevValueSettled = true;
            }

            /*
             * Store current action
             */
            this.currentAction.push({ id, action });

            /*
             * Check if the previus block i running again
             */
            const prevActionIsCurrent = lastAction.find(
                ({ id: prevId, action: prevAction }) => {
                    return prevId === id && prevAction === action;
                }
            );

            const fn = {
                set: () => {
                    return tween[action](valuesFrom, newTweenProps);
                },
                goTo: () => {
                    return tween[action](valuesTo, newTweenProps);
                },
                goFrom: () => {
                    return tween[action](valuesFrom, newTweenProps);
                },
                goFromTo: () => {
                    return tween[action](valuesFrom, valuesTo, newTweenProps);
                },
                sync: () => {
                    return new Promise((res) => {
                        const { from, to } = syncProp;
                        to.set(from.getToNativeType(), {
                            immediate: true,
                        }).then(() => res());
                    });
                },
                add: () => {
                    /*
                     * Prevent fire the same last add
                     * Es reverseNext inside it cause an infinite loop
                     */
                    if (prevActionIsCurrent) {
                        return new Promise((res) => res());
                    }

                    return new Promise((res) => {
                        if (isImmediate) {
                            res();
                        } else {
                            // Custom function
                            const direction = this.getDirection();
                            tween({
                                direction,
                                loop: this.loopCounter,
                            });
                            res();
                        }
                    });
                },
                addAsync: () => {
                    // Activate addAsyncFlag
                    this.addAsyncIsActive = true;
                    const sessionId = this.sessionId;

                    /*
                     * Prevent fire the same last addAsync
                     * Es reverseNext inside it cause an infinite loop
                     */
                    if (prevActionIsCurrent) {
                        return new Promise((res) => res());
                    }

                    return new Promise((res, reject) => {
                        if (isImmediate) {
                            res();
                        } else {
                            const direction = this.getDirection();

                            tween({
                                direction,
                                loop: this.loopCounter,
                                resolve: () => {
                                    if (sessionId === this.sessionId) {
                                        res();
                                    } else {
                                        reject();
                                    }
                                },
                            });
                        }
                    });
                },
                createGroup: () => {
                    return new Promise((res) => res());
                },
                closeGroup: () => {
                    return new Promise((res) => res());
                },
                label: () => {
                    return new Promise((res) => res());
                },
                suspend: () => {
                    /*
                     * Prevent fire the same last add
                     * Es reverseNext inside it cause an infinite loop
                     */
                    if (prevActionIsCurrent) {
                        return new Promise((res) => res());
                    }

                    /*
                     * Check callback that return a bollean to fire supend
                     */
                    const valueIsValid = mobCore.checkType(Boolean, tween());
                    if (!valueIsValid) timelineSuspendWarning(tween);
                    const sholudSuspend = valueIsValid ? tween() : true;
                    return new Promise((res) => {
                        if (!isImmediate && sholudSuspend) {
                            this.isInSuspension = true;
                        }
                        res();
                    });
                },
            };

            return new Promise((res, reject) => {
                // Get delay
                const delay = isImmediate ? false : tweenProps?.delay;
                const sessionId = this.sessionId;

                const cb = () => {
                    /*
                     * IF:
                     * --
                     * this.isStopped: Timelie is stopped
                     * --
                     * this.startOnDelay: play() etc.. is firedin delay
                     * --
                     * sessionId: another tween is fired and this tween is in a
                     * { waitComplete: false }, so the promise is resolved but
                     * this tween is in delay status, if antther session start
                     * the value of this.sessionId change,
                     * in this case isStopped doasn't work becouse next
                     * session set it to true
                     * --
                     */
                    if (
                        this.isStopped ||
                        this.startOnDelay ||
                        sessionId !== this.sessionId
                    ) {
                        reject();
                        return;
                    }

                    /*
                     * Add tween to active stack
                     */
                    const unsubscribeActiveTween = this.addToActiveTween(tween);

                    /*
                     * Add tween to active stack, if timelienstatus is in pause
                     * onStartInPause methods trigger pause status inside
                     */
                    const unsubscribeTweenStartInPause =
                        tween && tween?.onStartInPause
                            ? tween.onStartInPause(() => {
                                  return this.isInPause;
                              })
                            : NOOP;

                    fn[action]()
                        .then(() => res())
                        .catch(() => {})
                        .finally(() => {
                            unsubscribeActiveTween();
                            unsubscribeTweenStartInPause();
                        });
                };

                if (delay) {
                    const start = mobCore.getTime();
                    this.delayIsRunning = true;
                    let deltaTimeOnpause = 0;

                    /*
                     * Delay loop
                     */
                    const loop = () => {
                        const current = mobCore.getTime();
                        let delta = current - start;

                        /*
                         * Update delata value on pause to compensate delta velue
                         */
                        if (this.isInPause)
                            deltaTimeOnpause = current - this.timeOnPause;

                        /*
                         * If play, resume, playFromLabel is fired whith
                         * another tween in delay
                         * fire this tween immediatly, so avoid probem
                         * with much delay in same group
                         *
                         * ! when stop the timeline manually ( es timeline.stop() )
                         * It will not activate
                         */
                        if (this.actionAfterReject.active) {
                            deltaTimeOnpause = 0;
                            delta = delay;
                        }

                        // Start after dealy or immediate in caso of stop or reverse Next
                        if (
                            delta - deltaTimeOnpause >= delay ||
                            this.isStopped ||
                            this.isReverseNext
                        ) {
                            this.delayIsRunning = false;
                            cb();
                            return;
                        }

                        requestAnimationFrame(loop);
                    };
                    requestAnimationFrame(loop);
                } else {
                    cb();
                }
            });
        });

        // When gruop have waitComplete === true, all the teen in group have the same props
        // so, check if the griup item is seted to waitComplete or not
        const waitComplete = this.tweenList[this.currentIndex].some((item) => {
            return item.data.groupProps?.waitComplete;
        });
        const promiseType = waitComplete ? 'all' : 'race';

        Promise[promiseType](tweenPromises)
            .then(() => {
                if (this.isInSuspension || this.isStopped) return;

                const {
                    active: labelIsActive,
                    index: labelIndex,
                    isReverse: labelIsReverse,
                } = this.labelState;

                const { fn: starterFunction, active: starterFunctionIsActive } =
                    this.starterFunction;

                /*
                 * End virtual loop to get prevValueTo
                 * We have reach the end of timeline and we we fire
                 * play ( !this.freeMode ) || playFrom || playFromReverse (this.starterFunction)
                 *
                 * With this.starterFunctionIsActive active this.labelState
                 * is equal the timeline length
                 *
                 * Becouse we doasn't reach the repeat condition down
                 * we manually increment loopCounter
                 * The loop counter is decrtement in virutal loop
                 *
                 */
                if (
                    starterFunctionIsActive &&
                    labelIsActive &&
                    this.currentIndex === labelIndex - 1
                ) {
                    this.starterFunction.active = false;
                    this.disableLabel();
                    this.loopCounter++;
                    starterFunction();
                    return;
                }

                /*
                 * This is used after this.starterFunction is fired
                 * ( starterFunction start from index = 0 )
                 * and timeline running to right index in immediate
                 * and labelState.isReverse is active
                 * The timeline is reversed next step without increment currentIndex
                 **/
                if (
                    labelIsActive &&
                    labelIsReverse &&
                    this.currentIndex === labelIndex - 1
                ) {
                    this.reverseNext();
                }

                /**
                 * Reverse on next step default
                 **/
                if (this.isReverseNext) {
                    this.isReverseNext = false;
                    this.currentIndex =
                        this.tweenList.length - this.currentIndex - 1;
                    this.disableLabel();
                    this.revertTween();
                    this.run();
                    return;
                }

                /**
                 * Run next step default
                 **/
                if (this.currentIndex < this.tweenList.length - 1) {
                    this.currentIndex++;
                    this.run();
                    return;
                }

                /**
                 * End of timeline, check repeat
                 **/
                if (this.loopCounter < this.repeat || this.repeat === -1) {
                    const cb = () => {
                        /*
                         * Fire callbackLoop
                         */
                        if (this.loopCounter > 0) {
                            const direction = this.getDirection();
                            this.callbackLoop.forEach(({ cb }) =>
                                cb({
                                    direction,
                                    loop: this.loopCounter,
                                })
                            );
                        }

                        this.loopCounter++;
                        this.currentIndex = 0;
                        this.disableLabel();
                        if (this.yoyo || this.forceYoyo) this.revertTween();
                        this.forceYoyo = false;
                        this.run();
                    };

                    /*
                     * Start timeline in reverse mode here
                     * set all tween to end position and go
                     */
                    if (
                        labelIsActive &&
                        labelIndex === this.tweenList.length &&
                        !this.freeMode
                    ) {
                        const tweenPromise = this.tweenStore.map(
                            ({ tween }) => {
                                const data = asyncReduceTween(
                                    this.tweenList,
                                    tween,
                                    this.tweenList.length
                                );

                                return new Promise((resolve, reject) => {
                                    tween
                                        .set(data)
                                        .then(() => resolve())
                                        .catch(() => reject());
                                });
                            }
                        );
                        Promise.all(tweenPromise)
                            .then(() => {
                                cb();
                            })
                            .catch(() => {});
                        return;
                    }

                    /*
                     * Go default
                     */
                    cb();
                    return;
                }

                /**
                 * All ended
                 **/
                // Fire and of timeline
                this.callbackComplete.forEach(({ cb }) => cb());
                this.isStopped = true;
                if (this.currentResolve) this.currentResolve();
            })
            .catch(() => {
                // If play or reverse or playFromLabel is fired diring delay tween fail
                // Afte fail we can fire the action
                if (this.actionAfterReject.active) {
                    console.log('actionAfterReject fired');
                    this.actionAfterReject.fn();
                    this.actionAfterReject.fn = () => {};
                    this.actionAfterReject.active = false;
                    return;
                }
            })
            .finally(() => {
                /**
                Primise was completed
                AddAsync is resolved
                */
                this.addAsyncIsActive = false;
            });
    }

    /**
     * @private
     */
    addToActiveTween(tween) {
        const tweenId = tween?.getId && tween.getId();
        if (!tweenId) return NOOP;

        const prevActiveTweenCounter = this.activetweenCounter;
        this.activetweenCounter++;

        this.currentTween.push({
            tween,
            uniqueId: tweenId,
            id: prevActiveTweenCounter,
        });

        return () => {
            this.currentTween = this.currentTween.filter(
                ({ id }) => id !== prevActiveTweenCounter
            );
        };
    }

    /**
     * @private
     */
    revertTween() {
        this.isReverse = !this.isReverse;
        this.tweenList.reverse().forEach((group) => {
            group.reverse().forEach((item) => {
                const { data } = item;
                const { action, valuesFrom, valuesTo, syncProp } = data;
                const prevValueTo = item.data.prevValueTo;
                const currentValueTo = item.data.valuesTo;
                const { from, to } = syncProp;

                switch (action) {
                    case 'goTo': {
                        item.data.valuesTo = prevValueTo;
                        item.data.prevValueTo = currentValueTo;
                        break;
                    }

                    case 'goFromTo': {
                        item.data.valuesFrom = valuesTo;
                        item.data.valuesTo = valuesFrom;
                        break;
                    }

                    case 'sync': {
                        item.data.syncProp.from = to;
                        item.data.syncProp.to = from;
                        break;
                    }

                    case 'goFrom': {
                        timelineReverseGoFromWarning();
                        this.stop();
                    }
                }
            });
        });
    }

    /**
     * @private
     */
    addToMainArray(obj) {
        /**
         * Check if the is an active group and the group is just created
         */
        const rowIndex = this.tweenList.findIndex((item) => {
            return item[0]?.group && item[0].group === this.groupId;
        });

        /**
         * If there is an active group append interpolation to current group
         */
        if (rowIndex >= 0) {
            this.tweenList[rowIndex].push({ group: this.groupId, data: obj });
        } else {
            this.tweenList.push([{ group: this.groupId, data: obj }]);
        }
    }

    /**
     * @private
     */
    addTweenToStore(tween) {
        const uniqueId = tween?.getId?.();
        const tweenIsStored = this.tweenStore.find(({ id }) => id === uniqueId);
        if (tweenIsStored) return;

        const obj = { id: uniqueId, tween };
        this.tweenStore.push(obj);
    }

    /**
     * @private
     */
    resetAllTween() {
        this.tweenStore.forEach(({ tween }) => tween.resetData());
    }

    /**
     * @param {asyncTimelineTweenTypes} tween instance of HandleTween | HandleLerp | HandleSpring
     * @param {Object.<string, number>} valuesSet - set values Object
     * @param {asyncTimelineSpecialPropTypes & import('../tween/handleTween.js').tweenCommonSpecialProps} tweenProps - special props
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline.set(
     *      myTweenInstance,
     *      { Object.<string, number>, },
     *      {
     *          delay: [ Number ],
     *          immediate [ Boolean ],
     *          immediateNoPromise: [ Boolean ]
     *      }
     *  )
     *
     *
     * ```
     *
     * @description
     Transform some properties of your choice from the `current value` to the `entered value` immediately.
     The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
     It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
      - immediate (internal use)
      - immediateNoPromise (internal use)
      - dealy
     */
    set(tween, valuesSet = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.currentTweenCounter,
            tween,
            action: 'set',
            valuesTo: valuesSet,
            valuesFrom: valuesSet,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.addTweenToStore(tween);
        return this;
    }

    /**
     * @param {asyncTimelineTweenTypes} tween instance of HandleTween | HandleLerp | HandleSpring
     * @param {Object.<string, number>} valuesTo - to values Object
     * @param {asyncTimelineSpecialPropTypes & import('../tween/handleTween.js').tweenCommonSpecialProps & import('../tween/handleTween.js').tweenSpecialProps & import('../tween/tweenConfig.js').easeTypes & import('../spring/springConfig.js').springConfigTypes & import('../spring/springConfig.js').springConfigPropsTypes & import('../lerp/handleLerp.js').lerpPropTypes} tweenProps - special props
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline.goTo(
     *      myTweenInstance,
     *      { Object.<string, (Number|Function)> },
     *      {
     *          `Tween properties`
     *          ease: [ String ],
     *          duration: [ ( Number|Function ) ],
     *          --------------
     *          `Spring properties`
     *          config: [ String ],
     *          configProp: {
     *             tension: [ Number ],
     *             mass: [ Number ],
     *             friction: [ Number ],
     *             velocity: [ Number ],
     *             precision: [ Number ],
     *          },
     *          --------------
     *          `Lerp properties`
     *          precision: [ Number ],
     *          velocity: [ Number ],
     *          --------------
     *          reverse: [ Boolean ],
     *          delay: [ Number ],
     *          immediate [ Boolean ],
     *          immediateNoPromise: [ Boolean ]
     *      }
     *  )
     *
     *
     * ```
     *
     * @description
     Transform some properties of your choice from the `current value` to the `entered value`.
     The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
     It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
      - duration
      - ease ( HandleTween )
      - config  ( HandleSpring )
      - configProp ( HandleSpring )
      - velocity ( HandleLerp )
      - precision ( HandleLerp )
      - relative
      - reverse
      - delay
      - immediate (internal use)
      - immediateNoPromise (internal use)
     */
    goTo(tween, valuesTo = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.currentTweenCounter,
            tween,
            action: 'goTo',
            valuesTo,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.addTweenToStore(tween);
        return this;
    }

    /**
     * @param {asyncTimelineTweenTypes} tween instance of HandleTween | HandleLerp | HandleSpring
     * @param {Object.<string, number>} valuesFrom - from values Object
     * @param {asyncTimelineSpecialPropTypes & import('../tween/handleTween.js').tweenCommonSpecialProps & import('../tween/handleTween.js').tweenSpecialProps & import('../tween/tweenConfig.js').easeTypes & import('../spring/springConfig.js').springConfigTypes & import('../spring/springConfig.js').springConfigPropsTypes & import('../lerp/handleLerp.js').lerpPropTypes} tweenProps - special props
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline.goFrom(
     *      myTweenInstance,
     *      { Object.<string, (Number|Function)> },
     *      {
     *          `Tween properties`
     *          ease: [ String ],
     *          duration: [ ( Number|Function ) ],
     *          --------------
     *          `Spring properties`
     *          config: [ String ],
     *          configProp: {
     *             tension: [ Number ],
     *             mass: [ Number ],
     *             friction: [ Number ],
     *             velocity: [ Number ],
     *             precision: [ Number ],
     *          },
     *          --------------
     *          `Lerp properties`
     *          precision: [ Number ],
     *          velocity: [ Number ],
     *          --------------
     *          reverse: [ Boolean ],
     *          delay: [ Number ],
     *          immediate [ Boolean ],
     *          immediateNoPromise: [ Boolean ]
     *      }
     *  )
     *
     *
     * ```
     *
     * @description
     Transform some properties of your choice from the `entered value` to the `current value`.
     The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
     It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
      - duration
      - ease ( HandleTween )
      - config  ( HandleSpring )
      - configProp ( HandleSpring )
      - velocity ( HandleLerp )
      - precision ( HandleLerp )
      - relative
      - reverse
      - delay
      - immediate (internal use)
      - immediateNoPromise (internal use)
     */
    goFrom(tween, valuesFrom = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.currentTweenCounter,
            tween,
            action: 'goFrom',
            valuesFrom,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.addTweenToStore(tween);
        return this;
    }

    /**
     * @param {asyncTimelineTweenTypes} tween instance of HandleTween | HandleLerp | HandleSpring
     * @param {Object.<string, number>} valuesFrom - from values Object
     * @param {Object.<string, number>} valuesTo - to values Object
     * @param {asyncTimelineSpecialPropTypes & import('../tween/handleTween.js').tweenCommonSpecialProps & import('../tween/handleTween.js').tweenSpecialProps & import('../tween/tweenConfig.js').easeTypes & import('../spring/springConfig.js').springConfigTypes & import('../spring/springConfig.js').springConfigPropsTypes & import('../lerp/handleLerp.js').lerpPropTypes} tweenProps - special props
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline.goFromTo(
     *      myTweenInstance,
     *      { Object.<string, (Number|Function)> },
     *      { Object.<string, (Number|Function)> },
     *      {
     *          `Tween properties`
     *          ease: [ String ],
     *          duration: [ ( Number|Function ) ],
     *          --------------
     *          `Spring properties`
     *          config: [ String ],
     *          configProp: {
     *             tension: [ Number ],
     *             mass: [ Number ],
     *             friction: [ Number ],
     *             velocity: [ Number ],
     *             precision: [ Number ],
     *          },
     *          --------------
     *          `Lerp properties`
     *          precision: [ Number ],
     *          velocity: [ Number ],
     *          --------------
     *          reverse: [ Boolean ],
     *          delay: [ Number ],
     *          immediate [ Boolean ],
     *          immediateNoPromise: [ Boolean ]
     *      }
     *  )
     *
     *
     * ```
     *
     * @description
     Transform some properties of your choice from the `first entered value` to the `second entered value`.
     The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
     It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
      - duration
      - ease ( HandleTween )
      - config  ( HandleSpring )
      - configProp ( HandleSpring )
      - velocity ( HandleLerp )
      - precision ( HandleLerp )
      - relative
      - reverse
      - delay
      - immediate (internal use)
      - immediateNoPromise (internal use)
     */
    goFromTo(tween, valuesFrom = {}, valuesTo = {}, tweenProps = {}) {
        if (!asyncTimelineTweenIsValid(tween)) return this;
        tweenProps.delay = asyncTimelineDelayIsValid(tweenProps?.delay);

        const obj = {
            id: this.currentTweenCounter,
            tween,
            action: 'goFromTo',
            valuesFrom,
            valuesTo,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.addTweenToStore(tween);
        return this;
    }

    /**
     * @param {Function} fn - Function to perform
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     *
     * myTimeline.add(() => {
     *      // code
     * });
     *
     *
     * ```
     * @description
     Adds a `custom function` to the timeline, the function will be executed after the previous promise and before the next one, `the function will not overlap the tweens`.
    `This property cannot be used within a group`.
     */
    add(fn = NOOP) {
        const cb = functionIsValidAndReturnDefault(
            fn,
            () => {},
            'timeline add function'
        );
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.groupId) {
            asyncTimelineMetodsInsideGroupWarining('add');
            return this;
        }

        const obj = {
            id: this.currentTweenCounter,
            tween: cb,
            action: 'add',
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    /**
     * @param { function(import('../utils/constant.js').directionTypes & asyncTimelineAddAsyncType):void } fn - callback function
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     *   myTimeline.addAsync(({ loop, direction, resolve }) => {
     *       // code
     *       resolve();
     *   });
     *
     *
     * ```
     * @description
     Adds an `asynchronous` function to the timeline.
     The function receives the `resolve parameter as input`, the timeline will automatically enter the `suspended state`
     Here it is possible to perform asynchronous operations, the timeline will be active again by launching the resolve function.
     `This property cannot be used within a group`.
     */
    addAsync(fn) {
        const cb = addAsyncFunctionIsValid(fn);
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.groupId) {
            asyncTimelineMetodsInsideGroupWarining('addAsync');
            return this;
        }

        const obj = {
            id: this.currentTweenCounter,
            tween: cb,
            action: 'addAsync',
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    /**
     * @param {Object} syncProp
     * @param {Object} syncProp.from - HandleTween | HandleSpring | HandleSpring - from tween
     * @param {Object} syncProp.to - HandleTween | HandleSpring | HandleSpring - to tween
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline.sync({ from: instanceA, to: instanceB });
     *
     *
     * ```
     * @description
     This method `synchronizes two different tweens` by updating their `current values`, it is possible for example to synchronize a tween with a spring and vice versa in order to manage a single element with two different interpolation methods.
    `This property cannot be used within a group`
     */
    sync(syncProp) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.groupId) {
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
            id: this.currentTweenCounter,
            action: 'sync',
            groupProps: { waitComplete: this.waitComplete },
            syncProp,
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    /**
     * @param {Object} [ groupProps ]
     * @param {Boolean} [ groupProps.waitComplete ]
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline
     *      .createGroup({waitComplete: [Boolean]})
     *      .goTo(..)
     *      ...
     *      .closeGroup();
     *
     *
     * ```
     *
     * @description
     Initialize a group, within this group all instances will run in `parallel`.
     If the waitComplete property is set to true the group will behave like a `promise.all()` otherwise it will behave like a `promise.race()`. This means that if waitComplete is equal to false the group of promises will be resolved by the fastest, otherwise it will be resolved only when each of the single promises (tween) are resolved.
     To close the group use the `closeGroup()` method.
     `Within a group, only the goTo, goFrom, goFromTo methods can be used`
     */
    createGroup(groupProps = {}) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.groupId) {
            asyncTimelineMetodsInsideGroupWarining('createGroup');
            return this;
        }

        const obj = {
            id: this.currentTweenCounter,
            action: 'createGroup',
            groupProps,
        };

        this.currentTweenCounter++;

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.waitComplete = groupProps?.waitComplete
            ? groupProps.waitComplete
            : false;
        this.groupId = this.groupCounter++;
        return this;
    }

    /**
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline
     *      .createGroup({waitComplete: [Boolean]})
     *      .goTo(..)
     *      ...
     *      .closeGroup();
     *
     *
     * ```
     *
     * @description
     * Closes a previously opened group.
     */
    closeGroup() {
        this.groupId = null;
        const obj = {
            id: this.currentTweenCounter,
            action: 'closeGroup',
        };

        this.currentTweenCounter++;

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.waitComplete = false;
        return this;
    }

    /**
     * @param { function():Boolean } fn - callback function
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline.suspend(() => {
     *     return true
     * });
     *
     *
     * ```
     *
     * @description
     This method puts the timeline in a state of `suspension`, the individual instances if within a group with the property waitComplete = false, they will finish their interpolation, suspend in fact does not pause the individual instances but only the timeline.
     It is possible to use a `function that returns a Boolean` value as a parameter to have conditional control.
     To reactivate the timeline use the resume() method. `This property cannot be used within a group`.
     */
    suspend(fn = () => true) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.groupId) {
            asyncTimelineMetodsInsideGroupWarining('suspend');
            return this;
        }

        const obj = {
            id: this.currentTweenCounter,
            tween: fn,
            action: 'suspend',
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    /**
     * @param {Object} labelProps
     * @param {String} labelProps.name - label name
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * myTimeline.label({ name: 'labelName' });
     *
     *
     * ```
     *
     * @description
     Add a label, this label can be used by the playFrom(), playFromReverse(), setTween() methods.
    `This property cannot be used within a group`
     */
    label(labelProps = {}) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.groupId) {
            asyncTimelineMetodsInsideGroupWarining('label');
            return this;
        }

        if (!valueStringIsValid(labelProps?.name, 'asyncTimeline label:'))
            return this;

        const obj = {
            id: this.currentTweenCounter,
            action: 'label',
            labelProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;
        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    /*
     * @private
     *
     * @description
     * Add a set 'tween' at start and end of timeline.
     */
    addSetBlocks() {
        // Create set only one time
        if (this.autoSetIsJustCreated) return;
        this.autoSetIsJustCreated = true;

        /*
         * END Blocks
         * Add set block at the end of timeline for every tween with last toValue
         */
        this.tweenStore.forEach(({ tween }) => {
            const setValueTo = tween.getInitialData();

            const obj = {
                id: this.currentTweenCounter,
                tween,
                action: 'set',
                valuesFrom: setValueTo,
                valuesTo: setValueTo,
                tweenProps: {},
                groupProps: { waitComplete: this.waitComplete },
            };

            this.currentTweenCounter++;

            const mergedObj = { ...this.defaultObj, ...obj };
            this.tweenList = [
                [{ group: null, data: mergedObj }],
                ...this.tweenList,
            ];
        });

        /*
         * END Blocks
         * Add set block at the end of timeline for every tween with last toValue
         */
        this.tweenStore.forEach(({ tween }) => {
            const setValueTo = asyncReduceTween(
                this.tweenList,
                tween,
                this.tweenList.length
            );
            const obj = {
                id: this.currentTweenCounter,
                tween,
                action: 'set',
                valuesFrom: setValueTo,
                valuesTo: setValueTo,
                tweenProps: {},
                groupProps: { waitComplete: this.waitComplete },
            };

            this.currentTweenCounter++;
            const mergedObj = { ...this.defaultObj, ...obj };
            this.tweenList.push([{ group: null, data: mergedObj }]);
        });
    }

    /**
     * @param {String} label
     * @param {Array} items
     * @returns {Promise} Return a promise which is resolved when tween is settled
     *
     * @example
     * ```javascript
     * myTimeline
     *     .setTween('myLabel', [tweenA,tweenB])
     *     .then(() => {
     *         // es:
     *         myTimeline.playFrom('myLabel');
     *     })
     *     .catch((error) => {
     *         // code
     *     });
     *
     *
     * ```
     *
     * @description
     Executes the set method on the tweens contained in the array to a specific label.
     The method will return a promise.
     It is possible for example to execute a set of specific instances before using the playFrom() method to be sure that all instances are in position, the instances on which a delay is applied could in fact remain in the old position until the delay is finished , by doing so we can be put in the right position before launching the method.
     `This property cannot be used within a group`
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
        const tweens = this.tweenStore.filter(({ id }) => {
            return itemsId.has(id);
        });

        /*
         * Get index from label
         */
        const index = this.tweenList.findIndex((item) => {
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
                const data = asyncReduceTween(this.tweenList, tween, index);

                return new Promise((resolveTween, rejectTween) => {
                    tween
                        .set(data)
                        .then(() => resolveTween())
                        .catch(() => rejectTween());
                });
            });
            Promise.all(tweenPromise)
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    timelineSetTweenFailWarining();
                });
        });
    }

    /**
     * Private
     */
    rejectPromise() {
        if (this.currentReject) {
            this.currentReject(mobCore.ANIMATION_STOP_REJECT);
            this.currentReject = null;
        }
    }

    /**
     * @return {Promise} - The promise launched at the end of the animation
     *
     * @example
     * ```javascript
     * myTimeline.play().then(() => {
     *      // Code
     * });
     *
     *
     * ```
     *
     * @description
     * Plays the timeline from start
     */
    play() {
        return new Promise((resolve, reject) => {
            if (this.fpsIsInLoading) return;
            this.fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.fpsIsInLoading = false;

                if (this.autoSet) this.addSetBlocks();

                if (this.freeMode) {
                    /*
                     * In freeMode every tween start form current value in use at the moment
                     */
                    if (this.tweenList.length === 0 || this.addAsyncIsActive)
                        return;

                    // If all tween is in delay reject main promise and fire the new pipe
                    if (this.delayIsRunning && !this.actionAfterReject.active) {
                        this.startOnDelay = true;
                        this.actionAfterReject.fn = () => this.play();
                        this.actionAfterReject.active = true;
                        return;
                    }

                    this.startOnDelay = false;
                    this.stop();
                    this.isStopped = false;
                    if (this.isReverse) this.revertTween();

                    /*
                     * Run one frame after stop to avoid overlap with promise resolve/reject
                     */

                    this.sessionId++;
                    mobCore.useFrameIndex(() => {
                        // Set current promise action after stop so is not fired in stop method
                        this.currentReject = reject;
                        this.currentResolve = resolve;
                        this.run();
                    }, 1);
                } else {
                    const cb = () => {
                        /**
                         * need to reset current data after reverse() of tween so use stop()
                         */
                        this.stop();
                        this.isStopped = false;

                        /*
                         * When start form play in default mode ( no freeMode )
                         * an automatic set method is Executed with initial data
                         */
                        const tweenPromise = this.tweenStore.map(
                            ({ tween }) => {
                                const data = tween.getInitialData();

                                return new Promise((resolve, reject) => {
                                    tween
                                        .set(data)
                                        .then(() => resolve())
                                        .catch(() => reject());
                                });
                            }
                        );
                        Promise.all(tweenPromise)
                            .then(() => {
                                // Set current promise action after stop so is not fired in stop method
                                this.currentReject = reject;
                                this.currentResolve = resolve;
                                this.run();
                            })
                            .catch(() => {});
                    };

                    this.starterFunction.fn = () => cb();
                    this.starterFunction.active = true;

                    /**
                     * First loop reverse at the end start function fired
                     * reverse set label.active at true
                     * so label.active && starterFunction.active is necessary to fire cb
                     */
                    this.playReverse({ forceYoYo: true });
                }
            });
        });
    }

    /**
     * @private
     */
    playFromLabel({ isReverse = false, label = null } = {}) {
        // Skip of there is nothing to run
        if (this.tweenList.length === 0 || this.addAsyncIsActive) return;
        if (this.isReverse) this.revertTween();

        /*
         * Set props
         */
        this.currentIndex = 0;
        this.labelState.isReverse = isReverse;
        this.labelState.active = true;
        this.labelState.index = mobCore.checkType(String, label)
            ? this.tweenList.findIndex((item) => {
                  const [firstItem] = item;
                  const labelCheck = firstItem.data.labelProps?.name;
                  return labelCheck === label;
              })
            : label;

        if (mobCore.checkType(String, label))
            playLabelIsValid(this.labelState.index, label);

        this.run();
    }

    /**
     * @param {String} label
     * @return {Promise} - The promise launched at the end of the animation
     *
     * @example
     * ```javascript
     * myTimeline.playFrom('myLabel').then(() => {
     *      // Code
     * });
     *
     *
     * ```
     *
     * @description
     * Play timeline from a specific label.
     */
    playFrom(label) {
        return new Promise((resolve, reject) => {
            if (this.fpsIsInLoading) return;
            this.fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.fpsIsInLoading = false;

                this.starterFunction.fn = () =>
                    this.playFromLabel({
                        isReverse: false,
                        label,
                    });
                this.starterFunction.active = true;

                /**
                 * First loop reverse at the end start function fired
                 * reverse set label.active at true
                 * so label.active && starterFunction.active is necessary to fire cb
                 */
                this.playReverse({ forceYoYo: false, resolve, reject });
            });
        });
    }

    /**
     * @param {String} label
     * @return {Promise} - The promise launched at the end of the animation
     *
     * @example
     * ```javascript
     * myTimeline.playFromReverse('myLabel').then(() => {
     *      // Code
     * });
     *
     *
     * ```
     *
     * @description
     * Play timeline from a specific label in backward direction.
     */
    playFromReverse(label) {
        return new Promise((resolve, reject) => {
            if (this.fpsIsInLoading) return;
            this.fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.fpsIsInLoading = false;

                this.starterFunction.fn = () =>
                    this.playFromLabel({
                        isReverse: true,
                        label,
                    });
                this.starterFunction.active = true;

                /**
                 * First loop reverse at the end start function fired
                 * reverse set label.active at true
                 * so label.active && starterFunction.active is necessary to fire cb
                 */
                this.playReverse({ forceYoYo: false, resolve, reject });
            });
        });
    }

    /**
     * @param {Boolean} [ forceYoYo = true ]  !internal use
     * @return {Promise} - The promise launched at the end of the animation
     *
     * @example
     * ```javascript
     * myTimeline.playReverse().then(() => {
     *      // Code
     * });
     *
     *
     * ```
     * @description
     * Play timeline in backward direction.
     */
    playReverse({ forceYoYo = true, resolve = null, reject = null } = {}) {
        return new Promise((resolveFromReverse, rejectFromReverse) => {
            const resolveInUse = resolve || resolveFromReverse;
            const rejectInUse = reject || rejectFromReverse;

            if (this.fpsIsInLoading) return;
            this.fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.fpsIsInLoading = false;

                if (this.autoSet) this.addSetBlocks();
                const forceYoYonow = forceYoYo;

                // Skip of there is nothing to run
                if (this.tweenList.length === 0 || this.addAsyncIsActive)
                    return;

                // If all tween is in delay reject main promise and fire the new pipe
                if (this.delayIsRunning && !this.actionAfterReject.active) {
                    this.startOnDelay = true;
                    this.actionAfterReject.fn = () =>
                        this.playReverse({ forceYoYo: forceYoYonow });
                    this.actionAfterReject.active = true;

                    return;
                }

                /**
                 * Rest necessary props
                 */
                this.startOnDelay = false;
                this.stop();
                this.isStopped = false;

                /*
                 * Walk thru timeline until the end,
                 * so we can run reverse next step with forceyoyo
                 * forceyoyo is used only if we play directly from end
                 * PlayFrom wich use reverse() need to go in forward direction
                 */
                if (forceYoYonow) this.forceYoyo = true;

                /*
                 * Lalbel state
                 */
                this.labelState.active = true;
                this.labelState.index = this.tweenList.length;

                /**
                 * When play reverse first loop is virtual
                 * So increment the loop number by 1
                 **/
                this.loopCounter--;
                this.sessionId++;

                /*
                 * Run one frame after stop to avoid overlap with promise resolve/reject
                 */
                mobCore.useFrameIndex(() => {
                    // Set current promise action after stop so is not fired in stop method
                    this.currentResolve = resolveInUse;
                    this.currentReject = rejectInUse;
                    this.run();
                }, 1);
            });
        });
    }

    /**
     * @example
     * ```javascript
     * myTimeline.reverseNext();
     *
     *
     * ```
     *
     * @description
     * Reverse timeline direction at the end of current interpolation.
     */
    reverseNext() {
        this.isReverseNext = true;
    }

    /**
     * @private
     *
     * @description
     * TODO:
     * No syncTween! - low
     * No reverse next until main timeline is on! - medium
     * No time management - high
     *
     * Tips:
     * Saltare i tween che non sono attivi ?
     */
    reverseImmediate() {
        if (this.isStopped || this.isInPause) return;

        /**
         * Get current position of all tween
         */
        const currentPositions = this.tweenStore.map(({ tween }) => {
            const currentData = tween.get();
            return { currentData };
        });

        /**
         * Get current index for asyncReduceTween
         */
        const index = this.isReverse
            ? this.tweenList.length - this.currentIndex
            : this.currentIndex;

        /**
         * Get reverse status
         */
        const isReverse = this.isReverse;

        if (this.immediate.counter === 0) {
            /**
             * Store first reverse status
             * first change direction
             */
            this.immediate.firstReverseStatus = isReverse;
            this.immediate.currentReverseStatus = isReverse;
        } else {
            /**
             * Store currenmt reverse status.
             * On multiple change direction in same index.
             */
            this.immediate.currentReverseStatus =
                !this.immediate.currentReverseStatus;
        }

        /**
         * If all tween is in delay reject main promise and fire the new pipe
         */
        if (this.delayIsRunning && !this.actionAfterReject.active) {
            this.startOnDelay = true;
            this.actionAfterReject.fn = () => this.reverseImmediate();
            this.actionAfterReject.active = true;
            return;
        }

        this.startOnDelay = false;
        this.stop({ resetImmediateStatus: false, clearCache: false });
        this.isStopped = false;
        this.sessionId++;

        /**
         * Update current index for next reverse before primiseAll is resolved.
         */
        const multiplier = this.immediate.firstReverseStatus ? -1 : 1;
        this.currentIndex =
            this.immediate.counter % 2 === 0
                ? index + 1 * multiplier
                : index - 1 * multiplier;

        /**
         * Update number of reverse before promise All is resolverd.
         */
        this.immediate.counter++;

        /**
         * Fire goFromTo (reverse action).
         */
        const tweenPromise = this.tweenStore.map(({ tween }, i) => {
            /**
             * Get target position.
             */
            const data = asyncReduceTween(this.tweenList, tween, index);

            return new Promise((resolve) => {
                const { currentData } = currentPositions[i];

                const unsubscribeActiveTween = this.addToActiveTween(tween);
                const unsubscribeTweenStartInPause =
                    tween && tween?.onStartInPause
                        ? tween.onStartInPause(() => {
                              return this.isInPause;
                          })
                        : NOOP;

                tween.goFromTo(currentData, data).then(() => {
                    unsubscribeActiveTween();
                    unsubscribeTweenStartInPause();
                    resolve();
                });
            });
        });

        Promise.all(tweenPromise)
            .then(() => {
                /**
                 * Reset number of reverse after promise is ended>
                 */
                this.immediate.counter = 0;

                /**
                 * Go !
                 */
                if (this.immediate.currentReverseStatus) {
                    this.playFrom(index);
                } else {
                    this.playFromReverse(index);
                }
            })
            .catch(() => {});
    }

    /**
     * @private
     * Reset reverse immediate status
     */
    resetImmediateStatus() {
        this.immediate = {
            counter: 0,
            firstReverseStatus: false,
            currentReverseStatus: false,
        };
    }

    /**
     * @typedef {Object} asyncTimelineStopTypes
     * @prop {Boolean} resetImmediateStatus
        Internal use
     * @prop {Boolean} clearCache
       Stop all stagger implemented with subscribeCache methods.
     */

    /**
     * @param {asyncTimelineStopTypes}
     * @prop {Boolean} resetImmediateStatus
     *
     * @example
     * ```javascript
     * myTimeline.stop();
     *
     *
     * ```
     * @description
     * Stop timeline.
     */
    stop({ resetImmediateStatus = true, clearCache = true } = {}) {
        this.isStopped = true;
        this.currentIndex = 0;
        this.loopCounter = 1;
        this.rejectPromise();

        // Reset state
        this.isReverseNext = false;
        this.disableLabel();
        this.forceYoyo = false;
        this.isInPause = false;
        this.isInSuspension = false;
        this.addAsyncIsActive = false;
        this.timeOnPause = 0;

        if (resetImmediateStatus) this.resetImmediateStatus();

        /*
         * Reset necessary label state
         */
        this.labelState.isReverse = false;

        // Stop all Tween
        this.tweenStore.forEach(({ tween }) => {
            tween?.stop?.({ clearCache });
        });

        // If reverse back to default direction
        if (this.isReverse) this.revertTween();
        this.isReverse = false;

        /*
         * If freeMode is false we
         * set tween 'store' with original data.
         * So we are sure that next loop start from initial data
         */
        if (!this.freeMode) this.resetAllTween();
    }

    /**
     * @example
     * ```javascript
     * myTimeline.pause();
     *
     *
     * ```
     * @description
     * Pause all the instance.
     */
    pause() {
        this.isInPause = true;
        this.timeOnPause = mobCore.getTime();
        this.currentTween.forEach(({ tween }) => {
            tween?.pause?.();
        });
    }

    /**
     * @example
     * ```javascript
     * myTimeline.resume();
     *
     *
     * ```
     * @description
     * Resume all the instance or resume timeline from suspend.
     */
    resume() {
        if (this.isInPause) {
            this.isInPause = false;
            this.timeOnPause = 0;
            this.resumeEachTween();
        }

        if (this.isInSuspension) {
            this.isInSuspension = false;
            this.timeOnPause = 0;

            if (this.currentIndex <= this.tweenList.length - 2) {
                this.currentIndex++;
                this.run();
            } else if (this.currentIndex === this.tweenList.length - 1) {
                // At the end suspend become item in pipe first ro skip it
                this.currentIndex = this.yoyo && !this.isReverse ? 1 : 0;
                this.disableLabel();
                if (this.yoyo) this.revertTween();
                this.loopCounter++;
                this.run();
            }
        }
    }

    /**
     * @private
     */
    disableLabel() {
        this.labelState.active = false;
        this.labelState.index = -1;
    }

    /**
     * @private
     */
    resumeEachTween() {
        this.currentTween.forEach(({ tween }) => {
            tween?.resume?.();
        });
    }

    /**
     * @return {Array} - Returns an array with all tweens active at the time the method is called
     * @example
     * ```javascript
     * const tweens = myTimeline.get()
     *
     *
     * ```
     * @description
     * Get an array of active instance.
     */
    get() {
        return this.currentTween;
    }

    /**
     * @return {Boolean} Returns a boolean value indicating whether the timeline is active
     * @example
     * ```javascript
     * const isActive = myTimeline.isActive();
     *
     *
     * ```
     * @description
     * Return active state.
     */
    isActive() {
        return !this.isStopped;
    }

    /**
     * @return {Boolean} Returns a boolean value indicating whether the timeline is in pause
     * @example
     * ```javascript
     * const isPaused = myTimeline.isPaused():
     *
     *
     * ```
     * @description
     * Return pause state.
     */
    isPaused() {
        return this.isInPause;
    }

    /**
     * @return {Boolean} Returns a boolean value indicating whether the timeline is suspended
     * @example
     * ```javascript
     * const isSuspended = myTimeline.isSuspended();
     *
     *
     * ```
     * @description
     * return suspended state.
     */
    isSuspended() {
        return this.isInSuspension;
    }

    /**
     * @return {import('../utils/constant.js').directionStringTypes} Returns a boolean value indicating whether the timeline is suspended
     * @example
     * ```javascript
     * const direction = myTimeline.getDirection();
     *
     *
     * ```
     * @description
     * return current direction.
     */
    getDirection() {
        if (this.isStopped) return directionConstant.NONE;

        /**
         * If reverse immediate is running
         */
        if (this.immediate.counter > 0)
            return this.immediate.currentReverseStatus
                ? directionConstant.FORWARD
                : directionConstant.BACKWARD;

        /**
         * Default
         */
        return this.isReverse
            ? directionConstant.BACKWARD
            : directionConstant.FORWARD;
    }

    /**
     * @param {function(import('../utils/constant.js').directionTypes & asyncTimelineLoopType):void } cb - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     *```javascript
     * const unsubscribeOnLoopEnd = myTimeline.onLoopEnd(({direction, loop})=>{
     *      /// code
     * })
     * unsubscribeOnLoopEnd();
     *
     *
     * ```
     * @description
     * Callback thrown at the end of each cycle
     */
    onLoopEnd(cb) {
        this.callbackLoop.push({ cb, id: this.id });
        const cbId = this.id;
        this.callbackId++;

        return () => {
            this.callbackLoop = this.callbackLoop.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * @param {function():void } cb - callback function
     * @return {Function} unsubscribe callback
     *
     * @example
     *```javascript
     * const unsubscribeOnComplete = myTimeline.onComplete(() => {
     *      /// code
     * })
     * unsubscribeOnComplete();
     *
     *
     * ```
     * @description
     * Callback thrown at the end of timeline
     */
    onComplete(cb) {
        this.callbackComplete.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callbackComplete = this.callbackComplete.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * @description
     * Destroy timeline and all the sequencer
     */
    destroy() {
        this.tweenStore.forEach(({ tween }) => {
            tween?.destroy?.();
        });
        this.tweenList = [];
        this.currentTween = [];
        this.callbackComplete = [];
        this.callbackLoop = [];
        this.tweenStore = [];
        this.currentIndex = 0;
        this.actionAfterReject = {
            active: false,
            fn: () => {},
        };
    }
}
