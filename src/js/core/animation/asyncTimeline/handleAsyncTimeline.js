import { getTime } from '../../utils/time.js';

export class HandleAsyncTimeline {
    constructor(config = {}) {
        // Secure check timeline start with a close gruop action
        this.tweenList = [];
        this.currentTween = [];
        this.currentTweenCounter = 0;
        this.currentIndex = 0;
        this.repeat = config.repeat || 1;
        this.yoyo = config.yoyo || false;
        this.loopCounter = 1;
        this.groupId = null;
        // group "name" star from 1 to avoid 0 = falsa
        this.groupCounter = 1;
        this.waitComplete = false;
        this.defaultObj = {
            id: null,
            tween: null,
            action: null,
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: null,
            tweenProps: {},
            groupProps: {},
            syncProp: {},
            labelProps: {},
        };
        this.NOOP = () => {};

        // Timeline state
        this.isReverseNext = false;
        this.goToLabelIndex = null;
        this.forceYoyo = false;
        this.isReverse = false;
        this.isInPause = false;
        this.isSuspended = false;
        this.addAsyncIsActive = false;
        this.isStopped = false;
        this.delayIsRunning = false;
        this.startOnDelay = false;
        this.actionAfterReject = [];
        this.isPlayingFromLabelReverse = false;
        this.starterFunction = this.NOOP;
        this.timelineIsInTestMode = false;
        this.currentLabel = null;
        this.currentLabelIsReversed = false;
        this.resetTweenData = false;

        // Callback
        this.id = 0;
        this.callback = [];
    }

    run(index = this.currentIndex) {
        const tweenPromises = this.tweenList[index].map((item) => {
            const { data } = item;

            const {
                tween,
                action,
                valuesFrom,
                valuesTo,
                tweenProps,
                syncProp,
            } = data;

            // Clone teen prop and clean from timeline props
            const newTweenProps = { ...tweenProps };
            delete newTweenProps.delay;

            const isImmediate =
                this.goToLabelIndex && index < this.goToLabelIndex;

            if (isImmediate) newTweenProps.immediate = true;

            // Get current valueTo for to use in reverse methods
            if (tween && tween?.getToNativeType && isImmediate)
                item.data.prevValueTo = tween.getToNativeType();

            /*
             * on firt run after test mode the tween back to start data
             */
            if (
                tween &&
                tween?.resetData &&
                !isImmediate &&
                this.resetTweenData
            )
                tween.resetData();

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
                        to.set(from.get(), { immediate: true }).then(() =>
                            res()
                        );
                    });
                },
                add: () => {
                    return new Promise((res) => {
                        if (!isImmediate) {
                            // Custom function
                            tween({ reverse: this.isReverse });
                            res();
                        } else {
                            res();
                        }
                    });
                },
                addAsync: () => {
                    // Activate addAsyncFlag
                    this.addAsyncIsActive = true;

                    return new Promise((res) => {
                        if (!isImmediate) {
                            // Custom function that fire the result of the promise
                            tween({ reverse: this.isReverse, resolve: res });
                        } else {
                            res();
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
                    return new Promise((res) => {
                        if (!isImmediate) {
                            this.isSuspended = true;
                        }
                        res();
                    });
                },
            };

            return new Promise((res, reject) => {
                const cb = () => {
                    this.resetTweenData = false;
                    /*
                     * If after delay tween is stopped or some action
                     * start are started we fail tween
                     */
                    if (this.isStopped || this.startOnDelay) {
                        reject();
                        return;
                    }

                    /*
                     * Add tween to active stack
                     */
                    this.addToActiveTween(tween, valuesTo);

                    /*
                     * Add tween to active stack, if timelienstatus is in pause
                     * onStartInPause methods trigger pause status inside
                     */
                    const unsubscribeTweenStartInPause =
                        tween && tween?.onStartInPause
                            ? tween.onStartInPause(() => {
                                  this.addToActiveTween(tween, valuesTo);
                                  return this.isInPause ? true : false;
                              })
                            : this.NOOP;

                    fn[action]()
                        .then(() => res())
                        .catch(() => {})
                        .finally(() => {
                            this.setctiveTweenCompleted(tween);
                            unsubscribeTweenStartInPause();
                        });
                };

                // Get delay
                const delay = isImmediate ? false : tweenProps?.delay;

                if (delay) {
                    let start = getTime();
                    this.delayIsRunning = true;

                    // Delay loop
                    const loop = () => {
                        let current = getTime();
                        let delta = current - start;

                        /*
                         * If play, resume, playFromLabel is fired whith
                         * another tween in delay
                         * fire this tween immediatly, so avoid probem
                         * with much delay in same group
                         */
                        if (this.actionAfterReject.length > 0) delta = delay;

                        // Start after dealy or immediate in caso of stop or reverse Next
                        if (
                            delta >= delay ||
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
                /**
                Primise was completed
                AddAsync is resolved
                */
                this.addAsyncIsActive = false;
                this.currentTween = [];
                if (this.isSuspended || this.isStopped) return;

                /*
                 * Timeline line end test cycle
                 */
                if (
                    this.timelineIsInTestMode &&
                    this.currentIndex === this.goToLabelIndex - 1
                ) {
                    this.timelineIsInTestMode = false;
                    this.goToLabelIndex = null;
                    this.starterFunction();
                    return;
                }

                /*
                 * If play from label in reverse mode
                 * reverse next step, current step is immediate
                 **/
                if (
                    this.isPlayingFromLabelReverse &&
                    this.goToLabelIndex &&
                    this.currentIndex === this.goToLabelIndex - 1
                ) {
                    this.reverseNext();
                }

                /**
                 * Reverse on next step
                 **/
                if (this.isReverseNext) {
                    this.isReverseNext = false;
                    this.currentIndex =
                        this.tweenList.length - this.currentIndex - 1;
                    this.goToLabelIndex = null;
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
                    this.loopCounter++;
                    this.currentIndex = 0;
                    this.goToLabelIndex = null;
                    if (this.yoyo || this.forceYoyo) this.revertTween();
                    this.run();
                    this.forceYoyo = false;
                    return;
                }

                /**
                 * End of timeline, check repeat
                 **/
                this.stop();
                // Fire and of timeline
                this.callback.forEach(({ cb }) => cb());
            })
            .catch(() => {
                this.currentTween = [];

                // If play or reverse or playFromLabel is fired diring delay tween fail
                // Afte fail we can fire the action
                if (this.actionAfterReject.length > 0) {
                    this.actionAfterReject.forEach((item) => item());
                    this.actionAfterReject = [];
                    return;
                }
            });
    }

    addToActiveTween(tween, valuesTo = {}) {
        // Add tween tif is not present in tack
        const tweenIndex = this.currentTween.findIndex(
            ({ tween: currentTween }) => {
                if (!currentTween || !tween) return -1;
                return currentTween.uniqueId === tween.uniqueId;
            }
        );

        // If tween is in stack update current value in use
        if (tweenIndex === -1) {
            this.currentTween.push({
                tween,
                propiertiesInUse: Object.keys(valuesTo),
                valuesTo: tween && tween?.getTo ? tween.getTo() : {},
                valuesFrom: tween && tween?.getTo ? tween.getFrom() : {},
                completed: false,
            });
        }
    }

    // Set cerrent tween completed if needed
    // At moment is not used
    setctiveTweenCompleted(tween) {
        const tweenIndex = this.currentTween.findIndex(
            ({ tween: currentTween }) => {
                if (!currentTween || !tween) return -1;
                return currentTween.uniqueId === tween.uniqueId;
            }
        );

        if (tweenIndex !== -1) {
            this.currentTween[tweenIndex].completed = true;
        }
    }

    revertTween() {
        this.isReverse = !this.isReverse;
        this.tweenList.reverse().forEach((group) => {
            group.reverse().forEach((item) => {
                const { data } = item;
                const { action, valuesFrom, valuesTo, syncProp } = data;
                const prevValueTo = item.data.prevValueTo || valuesFrom;
                const currentValueTo = item.data.valuesTo;
                const { from, to } = syncProp;

                switch (action) {
                    case 'goTo':
                        item.data.valuesTo = prevValueTo;
                        item.data.prevValueTo = currentValueTo;
                        break;

                    case 'goFromTo':
                        item.data.valuesFrom = valuesTo;
                        item.data.valuesTo = valuesFrom;
                        break;

                    case 'sync':
                        item.data.syncProp.from = to;
                        item.data.syncProp.to = from;
                        break;

                    case 'goFrom':
                        console.warn(
                            `SyncTimeline: in revese ( or yoyo mode) only goTo || goFromTo || set action is allowed.
                            Using goFrom makes no sense in this context. Timeline will stopped.`
                        );
                        this.stop();
                }
            });
        });
    }

    addToMainArray(obj) {
        const rowIndex = this.tweenList.findIndex((item) => {
            return item[0]?.group && item[0].group === this.groupId;
        });

        if (rowIndex >= 0) {
            this.tweenList[rowIndex].push({ group: this.groupId, data: obj });
        } else {
            this.tweenList.push([{ group: this.groupId, data: obj }]);
        }
    }

    set(tween, valuesFrom, tweenProps = {}) {
        const obj = {
            id: this.currentTweenCounter,
            tween,
            action: 'set',
            valuesFrom,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        this.currentTweenCounter++;

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    goTo(tween, valuesTo, tweenProps = {}) {
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
        return this;
    }

    goFrom(tween, valuesFrom, tweenProps = {}) {
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
        return this;
    }

    goFromTo(tween, valuesFrom, valuesTo, tweenProps = {}) {
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
        return this;
    }

    add(fn) {
        const obj = {
            tween: fn,
            action: 'add',
            groupProps: { waitComplete: this.waitComplete },
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    addAsync(fn) {
        const obj = {
            tween: fn,
            action: 'addAsync',
            groupProps: { waitComplete: this.waitComplete },
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    sync(syncProp) {
        const obj = {
            action: 'sync',
            groupProps: { waitComplete: this.waitComplete },
            syncProp,
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    createGroup(groupProps = {}) {
        const obj = {
            action: 'createGroup',
            groupProps,
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.waitComplete = groupProps?.waitComplete
            ? groupProps.waitComplete
            : false;
        this.groupId = this.groupCounter++;
        return this;
    }

    closeGroup() {
        this.groupId = null;
        const obj = {
            action: 'closeGroup',
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        this.waitComplete = false;
        return this;
    }

    // Don't use inside group
    suspend() {
        const obj = {
            action: 'suspend',
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    // Don't use inside group
    label(labelProps = {}) {
        const obj = {
            action: 'label',
            labelProps,
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(mergedObj);
        return this;
    }

    play() {
        const cb = () => {
            this.stop();
            this.isStopped = false;
            this.resetTweenData = true;
            Promise.resolve().then(() => this.run());
        };

        this.starterFunction = cb;
        this.timelineIsInTestMode = true;
        this.currentLabel = null;
        this.currentLabelIsReversed = false;
        this.reverse();
        return this;
    }

    playFromLabel() {
        /*
         * Set props
         */
        if (this.isReverse) this.revertTween();
        this.isPlayingFromLabelReverse = this.currentLabelIsReversed;

        /*
         * Get first item of group, unnecessary.
         * Use of label inside a group becouse is parallel
         */

        this.resetTweenData = true;
        this.currentIndex = 0;
        this.forceYoyo = false;
        this.goToLabelIndex = this.tweenList.findIndex((item) => {
            const [firstItem] = item;
            const labelCheck = firstItem.data.labelProps?.name;
            return labelCheck === this.currentLabel;
        });

        Promise.resolve().then(() => this.run());
    }

    playFrom(label) {
        this.starterFunction = this.playFromLabel;
        this.timelineIsInTestMode = true;
        this.currentLabel = label;
        this.currentLabelIsReversed = false;
        this.reverse();
        return this;
    }

    playFromReverse(label) {
        this.starterFunction = this.playFromLabel;
        this.timelineIsInTestMode = true;
        this.currentLabel = label;
        this.currentLabelIsReversed = true;
        this.reverse();
        return this;
    }

    reverse() {
        if (this.tweenList.length === 0 || this.addAsyncIsActive) return;
        if (this.delayIsRunning) {
            this.startOnDelay = true;
            this.actionAfterReject.push(() => this.reverse());
            return;
        }
        this.startOnDelay = false;
        this.stop();
        this.isStopped = false;
        this.forceYoyo = true;
        this.goToLabelIndex = this.tweenList.length;

        /**
         * When start form end first loop is lost in immediate
         * so increment the loop number by 1
         **/
        this.repeat >= 1 && this.repeat++;
        Promise.resolve().then(() => this.run());
        return this;
    }

    reverseNext() {
        this.isReverseNext = true;
    }

    stop() {
        this.isStopped = true;
        this.currentIndex = 0;
        this.loopCounter = 1;

        // Reset state
        this.isReverseNext = false;
        this.goToLabelIndex = null;
        this.forceYoyo = false;
        this.isInPause = false;
        this.isSuspended = false;
        this.addAsyncIsActive = false;

        // Stop all Tween
        this.currentTween.forEach(({ tween }) => {
            if (tween?.stop) tween.stop();
        });

        // Reset Reverse
        if (this.isReverse) this.revertTween();
        this.isReverse = false;
    }

    pause() {
        this.isInPause = true;
        this.currentTween.forEach(({ tween }) => {
            if (tween?.pause) tween.pause();
        });
    }

    /**
     * resume - if there is no tween active ( pause settend by add methods )
     * run next pipe element, otherwise resume current tween
     *
     * @return {type}  description
     */
    resume() {
        if (this.isInPause) {
            this.isInPause = false;
            this.resumeEachTween();
        }

        if (this.isSuspended) {
            this.isSuspended = false;

            if (this.currentIndex <= this.tweenList.length - 2) {
                this.currentIndex++;
                this.run(this.currentIndex);
            } else if (this.currentIndex === this.tweenList.length - 1) {
                // At the end suspend become item in pipe first ro skip it
                this.currentIndex = this.yoyo && !this.isReverse ? 1 : 0;
                this.goToLabelIndex = null;
                if (this.yoyo) this.revertTween();
                this.loopCounter++;
                this.run();
            }
        }
    }

    resumeEachTween() {
        this.currentTween.forEach(({ tween }) => {
            if (tween?.resume) tween.resume();
        });
    }

    get() {
        return this.currentTween;
    }

    onComplete(cb) {
        this.callback.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callback = this.callback.filter((item) => item.id !== cbId);
        };
    }

    /**
     * Remove all reference from tween
     */
    destroy() {
        this.tweenList = [];
        this.currentTween = [];
        this.callback = [];
        this.currentIndex = 0;
        this.actionAfterReject = [];
    }
}
