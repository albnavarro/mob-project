// @ts-check

import { handleNextFrame } from '../../../mobCore/events/rafutils/handleNextFrame.js';
import { handleNextTick } from '../../../mobCore/events/rafutils/handleNextTick.js';
import { mobCore } from '../../../mobCore/index.js';
import { NOOP } from '../../utils/functionsUtils.js';
import { directionConstant } from '../utils/timeline/timelineConstant.js';
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
} from '../utils/tweenAction/tweenValidation.js';
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
import { resolveTweenPromise } from './loopCallback.js';

export default class HandleAsyncTimeline {
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
     * @type {Array<import('./type').asyncTimelineTweenItem[]>}
     */
    #tweenList;

    /**
     * @type {Array<import('./type').asyncTimelineCurrentTween>}
     */
    #currentTween;

    /**
     * @type {Array<import('./type').syncTimelineTweenStore>}
     */
    #tweenStore;

    /**
     * @type {boolean}
     */
    #waitComplete;

    /**
     * @type {import('./type').asyncTimelineRowData}
     */
    #defaultObj;

    /**
     * @description
     * Timeline state
     *
     * @type {import('./type').asyncTimelineLabelState}
     */
    #labelState;

    /**
     * @type {import('./type').asyncTimelineStarterFunction}
     */
    #starterFunction;

    /**
     * @description
     * group "name" star from 1 to avoid 0 = false
     *
     * @type {number}
     */
    #groupCounter;

    /**
     * @type {number|undefined}
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
     * @type {import('./type').asyncTimelineAfterReject}
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
     * @type {import('./type').asyncTimelineCurrentAction[]}
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
     * @type {{cb: (arg0: import('../utils/timeline/type.js').directionTypeObjectLoop) => void, id: number}[]}
     */
    #callbackLoop;

    /**
     * @type {{cb: () => void, id: number}[]}
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
     * @param {import('./type').asyncTimelineType} data
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
                    goTo: () => Promise.resolve(),
                    goFromTo: () => Promise.resolve(),
                    getToNativeType: () => {},
                    destroy: () => {},
                    onStartInPause: () => {},
                    resetData: () => {},
                    getInitialData: () => {},
                    stop: () => {},
                    pause: () => {},
                    resume: () => {},
                },
                from: {
                    getId: () => '',
                    set: () => Promise.resolve(),
                    goTo: () => Promise.resolve(),
                    goFromTo: () => Promise.resolve(),
                    getToNativeType: () => {},
                    destroy: () => {},
                    onStartInPause: () => {},
                    resetData: () => {},
                    getInitialData: () => {},
                    stop: () => {},
                    pause: () => {},
                    resume: () => {},
                },
            },
            labelProps: {},
        };
        this.#labelState = {
            active: false,
            index: -1,
            isReverse: false,
        };
        this.#starterFunction = {
            fn: () => {},
            active: false,
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
         * Store previous caction to prevent tiw add/addAsync consegutive
         */
        const currentTweelist = this.#tweenList[this.#currentIndex];
        const lastAction = this.#currentAction;
        this.#currentAction = [];

        /**
         * Prevent possible error when destroy instance.
         */
        if (!currentTweelist) return;

        /**
         * Update previous values for revert.
         */
        this.#tweenList[this.#currentIndex] = currentTweelist.map((item) => {
            const { data } = item;
            const { tween, valuesTo, prevValueSettled } = data;

            /*
             * Get current valueTo for to use in reverse methods
             * Get the value only first immediate loop
             */
            if (tween && tween?.getToNativeType && !prevValueSettled) {
                const values = tween.getToNativeType();

                /*
                 * Get only the active prop
                 * maybe unnecessary, if all prop ius used work fine
                 * Only for a cliean code
                 */
                const propsInUse = asyncReduceData(values, valuesTo);

                return {
                    ...item,
                    data: {
                        ...data,
                        prevValueTo: propsInUse,
                        prevValueSettled: true,
                    },
                };
            }

            return item;
        });

        /**
         */
        const tweenPromises = currentTweelist.map((item) => {
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
                this.#labelState;

            const isImmediate = Number.isNaN(labelIndex)
                ? false
                : labelIsActive &&
                  labelIndex &&
                  // @ts-ignore
                  this.#currentIndex < labelIndex;

            if (isImmediate) newTweenProps.immediate = true;

            /*
             * If some tween use relative props the value is applied as relative
             * only the in the rist loop
             */
            if (tweenProps && 'relative' in tweenProps && tweenProps.relative) {
                tweenProps.relative = false;
                relativePropInsideTimelineWarning();
            }

            /*
             * Store current action
             */
            this.#currentAction.push({ id, action });

            /*
             * Check if the previous block i running again
             */
            const prevActionIsCurrent = lastAction.find(
                ({ id: prevId, action: prevAction }) => {
                    return prevId === id && prevAction === action;
                }
            );

            const fn = {
                set: () => {
                    return tween?.[action](valuesFrom, newTweenProps);
                },
                goTo: () => {
                    return tween?.[action](valuesTo, newTweenProps);
                },
                goFrom: () => {
                    return tween?.[action](valuesFrom, newTweenProps);
                },
                goFromTo: () => {
                    return tween?.[action](valuesFrom, valuesTo, newTweenProps);
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
                        tween({
                            direction,
                            loop: this.#loopCounter,
                        });
                        res({ resolve: true });
                    });
                },
                addAsync: () => {
                    // Activate addAsyncFlag
                    this.#addAsyncIsActive = true;
                    const sessionId = this.#sessionId;

                    /*
                     * Prevent fire the same last addAsync
                     * Es reverseNext inside it cause an infinite loop
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

                        tween({
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
                     */
                    if (prevActionIsCurrent) {
                        return new Promise((res) => res({ resolve: true }));
                    }

                    /*
                     * Check callback that return a bollean to fire supend
                     */
                    const valueIsValid = mobCore.checkType(Boolean, tween());
                    if (!valueIsValid) timelineSuspendWarning(tween);
                    const sholudSuspend = valueIsValid ? tween() : true;
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

                if (delay) {
                    const start = mobCore.getTime();
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

        // When group have waitComplete === true, all the teen in group have the same props
        // so, check if the griup item is seted to waitComplete or not
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

                const {
                    active: labelIsActive,
                    index: labelIndex,
                    isReverse: labelIsReverse,
                } = this.#labelState;

                const { fn: starterFunction, active: starterFunctionIsActive } =
                    this.#starterFunction;

                /*
                 * End virtual loop ( first loop of playReverse) to get prevValueTo
                 * We have reach the end of timeline and we we fire starterFunction
                 * play ( !this.freeMode ) || playFrom || playFromReverse use this.starterFunction
                 *
                 * - playFromLabel (playFrom/playFromReverse call it) use playReverse first loop
                 * - playReverse first loop is executed in forward direction.
                 * This is useful to store prevValueTo value needed in backward direction ( revertTween ).
                 *
                 * At the end of playReverse first loop starterFunction is fired
                 *
                 * Inside  of playReverse first loop and starterFunction loop when
                 * currentindex is minus labelIndex a immediate methods of tween is used.
                 *
                 * Because we doesn't reach the repeat condition down
                 * we manually increment loopCounter
                 * The loop counter is decrtement in virtual loop
                 *
                 */
                if (
                    starterFunctionIsActive &&
                    labelIsActive &&
                    // @ts-ignore
                    this.#currentIndex === labelIndex - 1
                ) {
                    this.#starterFunction.active = false;
                    this.#disableLabel();
                    this.#loopCounter++;
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
                    // @ts-ignore
                    this.#currentIndex === labelIndex - 1
                ) {
                    this.reverseNext();
                }

                /**
                 * Reverse on next step default
                 **/
                if (this.#isReverseNext) {
                    this.#isReverseNext = false;
                    this.#currentIndex =
                        this.#tweenList.length - this.#currentIndex - 1;
                    this.#disableLabel();
                    this.#revertTween();
                    this.#run();
                    return;
                }

                /**
                 * Run next step default
                 **/
                if (this.#currentIndex < this.#tweenList.length - 1) {
                    this.#currentIndex++;
                    this.#run();
                    return;
                }

                /**
                 * End of timeline, check repeat
                 **/
                if (this.#loopCounter < this.#repeat || this.#repeat === -1) {
                    /*
                     * Start timeline in reverse mode here
                     * set all tween to end position and go
                     */
                    if (
                        labelIsActive &&
                        labelIndex === this.#tweenList.length &&
                        !this.#freeMode
                    ) {
                        const tweenPromise = this.#tweenStore.map(
                            ({ tween }) => {
                                const data = asyncReduceTween(
                                    this.#tweenList,
                                    tween,
                                    this.#tweenList.length
                                );

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
                 * All ended
                 * Fire and of timeline
                 **/
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
                // Afte fail we can fire the action
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
                Primise was completed
                AddAsync is resolved
                */
                this.#addAsyncIsActive = false;
            });
    }

    /**
     * @param {Object} param0
     * @param {number} param0.start
     * @param {number} param0.deltaTimeOnpause
     * @param {number} param0.delay
     * @param {(value: any) => void} param0.reject
     * @param {(value: any) => void} param0.res
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
        const current = mobCore.getTime();
        let delta = current - start;

        /*
         * Update delata value on pause to compensate delta velue
         */
        if (this.#isInPause) deltaTimeOnpause = current - this.#timeOnPause;

        /*
         * If play, resume, playFromLabel is fired with
         * another tween in delay
         * fire this tween immediately, so avoid problem
         * with much delay in same group
         *
         * ! when stop the timeline manually ( es timeline.stop() )
         * It will not activate
         */
        if (this.#actionAfterReject.active) {
            deltaTimeOnpause = 0;
            delta = delay;
        }

        // Start after dealy or immediate in caso of stop or reverse Next
        if (
            delta - deltaTimeOnpause >= delay ||
            this.#isStopped ||
            this.#isReverseNext
        ) {
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
        this.#disableLabel();
        if (this.#yoyo || this.#forceYoyo) this.#revertTween();
        this.#forceYoyo = false;
        this.#run();
    }

    /**
     * @type {import('./type').addToActiveTween}
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
     * @type {import('./type').addToMainArray}
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
     * @type {import('./type').addTweenToStore} tween
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
     * @type {() => void}
     */
    #resetAllTween() {
        this.#tweenStore.forEach(({ tween }) => tween.resetData());
    }

    /**
     * @type {import('./type').asyncTimelineSet}
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
     * @type {import('./type').asyncTimelineGoTo}
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
     * @type {import('./type').asyncTimelineGoFrom}
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
     * @type {import('./type').asyncTimelineGoFromTo}
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
     * @type {import('./type').asyncTimelineAdd}
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
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('add');
            return this;
        }

        const obj = {
            id: this.#currentTweenCounter,
            tween: cb,
            action: 'add',
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        return this;
    }

    /**
     * @type {import('./type').asyncTimelineAddAsync}
     */
    addAsync(fn) {
        const cb = addAsyncFunctionIsValid(fn);

        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('addAsync');
            return this;
        }

        const obj = {
            id: this.#currentTweenCounter,
            tween: cb,
            action: 'addAsync',
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        return this;
    }

    /**
     * @type {import('./type').asyncTimelineSync}
     */
    sync(syncProp) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
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
     * @type {import('./type').asyncTimelineCreateGroup}
     */
    createGroup(groupProps = {}) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
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
     * @type {import('./type').asyncTimelineCloseGroup}
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
     * @type {import('./type').asyncTimelineSuspend}
     */
    suspend(fn = () => true) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
         */
        if (this.#groupId) {
            asyncTimelineMetodsInsideGroupWarining('suspend');
            return this;
        }

        const obj = {
            id: this.#currentTweenCounter,
            tween: fn,
            action: 'suspend',
            groupProps: { waitComplete: this.#waitComplete },
        };

        this.#currentTweenCounter++;
        const mergedObj = { ...this.#defaultObj, ...obj };
        this.#addToMainArray(mergedObj);
        return this;
    }

    /**
     * @type {import('./type').asyncTimelineLabel}
     */
    label(labelProps = {}) {
        /**
         * Can't add this interpolation inside a group.
         * groupId props is not null when active.
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
     * @type {() => void}
     *
     * @description
     * Add a set 'tween' at start and end of timeline.
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
            const setValueTo = asyncReduceTween(
                this.#tweenList,
                tween,
                this.#tweenList.length
            );
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
     * @type {import('./type').asyncTimelineSetTween}
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
                const data = asyncReduceTween(this.#tweenList, tween, index);

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
     * Private
     */
    #rejectPromise() {
        if (this.#currentReject) {
            this.#currentReject(mobCore.ANIMATION_STOP_REJECT);
            this.#currentReject = undefined;
        }
    }

    /**
     * @type {() => Promise<any>}
     */
    play() {
        return new Promise((resolve, reject) => {
            if (this.#fpsIsInLoading) return;
            this.#fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.#fpsIsInLoading = false;

                if (this.#autoSet) this.#addSetBlocks();

                if (this.#freeMode) {
                    /*
                     * In freeMode every tween start form current value in use at the moment
                     */
                    if (this.#tweenList.length === 0 || this.#addAsyncIsActive)
                        return;

                    // If all tween is in delay reject main promise and fire the new pipe
                    if (
                        this.#delayIsRunning &&
                        !this.#actionAfterReject.active
                    ) {
                        this.#startOnDelay = true;
                        this.#actionAfterReject.fn = () => this.play();
                        this.#actionAfterReject.active = true;
                        return;
                    }

                    this.#startOnDelay = false;
                    this.stop();
                    this.#isStopped = false;
                    if (this.#isReverse) this.#revertTween();

                    /*
                     * Run one frame after stop to avoid overlap with promise resolve/reject
                     */

                    this.#sessionId++;
                    mobCore.useFrameIndex(() => {
                        // Set current promise action after stop so is not fired in stop method
                        this.#currentReject = reject;
                        this.#currentResolve = resolve;
                        this.#run();
                    }, 1);

                    return;
                }

                this.#starterFunction.fn = () => {
                    /**
                     * need to reset current data after reverse() of tween so use stop()
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
                };

                this.#starterFunction.active = true;

                /**
                 * First loop reverse at the end start function fired
                 * reverse set label.active at true
                 * so label.active && starterFunction.active is necessary to fire cb
                 */
                this.playReverse({ forceYoYo: true });
            });
        });
    }

    /**
     * @private
     * @type {import('./type').asyncTimelinePlayFromLabel}
     */
    playFromLabel({ isReverse = false, label = null }) {
        // Skip of there is nothing to run
        if (this.#tweenList.length === 0 || this.#addAsyncIsActive) return;
        if (this.#isReverse) this.#revertTween();

        /*
         * Set props
         */
        this.#currentIndex = 0;
        this.#labelState.isReverse = isReverse;
        this.#labelState.active = true;
        this.#labelState.index = mobCore.checkType(String, label)
            ? this.#tweenList.findIndex((item) => {
                  const [firstItem] = item;
                  const labelCheck = firstItem.data.labelProps?.name;
                  return labelCheck === label;
              })
            : label;

        if (mobCore.checkType(String, label))
            playLabelIsValid(this.#labelState.index, label);

        this.#run();
    }

    /**
     * @type {import('./type').asyncTimelinePlayFrom}
     */
    playFrom(label) {
        return new Promise((resolve, reject) => {
            if (this.#fpsIsInLoading) return;
            this.#fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.#fpsIsInLoading = false;

                this.#starterFunction.fn = () =>
                    this.playFromLabel({
                        isReverse: false,
                        label,
                    });
                this.#starterFunction.active = true;

                /**
                 * In playReverse first run is executed in forward direction.
                 * This is useful to store the value needed in backward direction ( revertTween ).
                 *
                 * After this 'test' loop starterFunction function is fired.
                 * playFromLabel method set the right direction.
                 *
                 * playFromLabel set label.active at true
                 * So label.active && starterFunction.active is necessary to fire starterFunction
                 */
                this.playReverse({ forceYoYo: false, resolve, reject });
            });
        });
    }

    /**
     * @type {import('./type').asyncTimelinePlayFromReverse}
     */
    playFromReverse(label) {
        return new Promise((resolve, reject) => {
            if (this.#fpsIsInLoading) return;
            this.#fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.#fpsIsInLoading = false;

                this.#starterFunction.fn = () =>
                    this.playFromLabel({
                        isReverse: true,
                        label,
                    });
                this.#starterFunction.active = true;

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
     * @type {import('./type').asyncTimelinePlayReverse}
     */
    playReverse({ forceYoYo = true, resolve = null, reject = null } = {}) {
        return new Promise((resolveFromReverse, rejectFromReverse) => {
            const resolveInUse = resolve || resolveFromReverse;
            const rejectInUse = reject || rejectFromReverse;

            if (this.#fpsIsInLoading) return;
            this.#fpsIsInLoading = true;

            mobCore.useFps(() => {
                this.#fpsIsInLoading = false;

                if (this.#autoSet) this.#addSetBlocks();
                const forceYoYonow = forceYoYo;

                // Skip of there is nothing to run
                if (this.#tweenList.length === 0 || this.#addAsyncIsActive)
                    return;

                // If all tween is in delay reject main promise and fire the new pipe
                if (this.#delayIsRunning && !this.#actionAfterReject.active) {
                    this.#startOnDelay = true;
                    this.#actionAfterReject.fn = () =>
                        this.playReverse({ forceYoYo: forceYoYonow });
                    this.#actionAfterReject.active = true;

                    return;
                }

                /**
                 * Rest necessary props
                 */
                this.#startOnDelay = false;
                this.stop();
                this.#isStopped = false;

                /*
                 * Walk thru timeline until the end,
                 * so we can run reverse next step with forceyoyo
                 * forceyoyo is used only if we play directly from end
                 * PlayFrom which use reverse() need to go in forward direction
                 */
                if (forceYoYonow) this.#forceYoyo = true;

                /*
                 * Lalbel state
                 */
                this.#labelState.active = true;
                this.#labelState.index = this.#tweenList.length;

                /**
                 * When play reverse first loop is virtual
                 * So increment the loop number by 1
                 **/
                this.#loopCounter--;
                this.#sessionId++;

                /*
                 * Run one frame after stop to avoid overlap with promise resolve/reject
                 */
                mobCore.useFrameIndex(() => {
                    // Set current promise action after stop so is not fired in stop method
                    this.#currentResolve = resolveInUse;
                    this.#currentReject = rejectInUse;
                    this.#run();
                }, 1);
            });
        });
    }

    /**
     * @type {() => void}
     */
    reverseNext() {
        this.#isReverseNext = true;
    }

    /**
     * @type {import('./type').asyncTimelineStop}
     */
    stop({ clearCache = true } = {}) {
        this.#isStopped = true;
        this.#currentIndex = 0;
        this.#loopCounter = 1;
        this.#rejectPromise();

        // Reset state
        this.#isReverseNext = false;
        this.#disableLabel();
        this.#forceYoyo = false;
        this.#isInPause = false;
        this.#isInSuspension = false;
        this.#addAsyncIsActive = false;
        this.#timeOnPause = 0;

        /*
         * Reset necessary label state
         */
        this.#labelState.isReverse = false;

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
     * @type {import('./type').asyncTimelinePause}
     */
    pause() {
        this.#isInPause = true;
        this.#timeOnPause = mobCore.getTime();
        this.#currentTween.forEach(({ tween }) => {
            tween?.pause?.();
        });
    }

    /**
     * @type {import('./type').asyncTimelineResume}
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
            } else if (this.#currentIndex === this.#tweenList.length - 1) {
                // At the end suspend become item in pipe first ro skip it
                this.#currentIndex = this.#yoyo && !this.#isReverse ? 1 : 0;
                this.#disableLabel();
                if (this.#yoyo) this.#revertTween();
                this.#loopCounter++;
                this.#run();
            }
        }
    }

    /**
     * @type {() => void}
     */
    #disableLabel() {
        this.#labelState.active = false;
        this.#labelState.index = -1;
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
     * @return {import('./type').asyncTimelineCurrentTween[]} - Returns an array with all tweens active at the time the method is called
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
        return this.#currentTween;
    }

    /**
     * @return {boolean} Returns a boolean value indicating whether the timeline is active
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
        return !this.#isStopped;
    }

    /**
     * @return {boolean} Returns a boolean value indicating whether the timeline is in pause
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
        return this.#isInPause;
    }

    /**
     * @return {boolean} Returns a boolean value indicating whether the timeline is suspended
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
        return this.#isInSuspension;
    }

    /**
     * @return {import('../utils/timeline/type.js').directionType} Returns a boolean value indicating whether the timeline is suspended
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
        if (this.#isStopped) return directionConstant.NONE;

        /**
         * Default
         */
        return this.#isReverse
            ? directionConstant.BACKWARD
            : directionConstant.FORWARD;
    }

    /**
     * @type {import('./type').asyncTimelineOnLoopEnd}
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
     * @type {import('./type').asyncTimelineOnComplete}
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
     * @description
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
        this.#actionAfterReject = {
            active: false,
            fn: () => {},
        };
    }
}
