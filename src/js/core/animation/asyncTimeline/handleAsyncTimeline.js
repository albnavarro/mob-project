import { handleFrameIndex } from '../../events/rafutils/handleFrameIndex.js';
import { getTime } from '../../utils/time.js';

export class HandleAsyncTimeline {
    constructor(config = {}) {
        // Secure check timeline start with a close gruop action
        this.tweenList = [];
        this.currentTween = [];
        this.tweenStore = [];
        this.currentTweenCounter = 0;
        this.currentIndex = 0;
        this.repeat = config.repeat || 1;
        this.yoyo = config.yoyo || false;
        this.freeMode = config.freeMode || false;
        this.autoSet = config.autoSet || false;
        this.loopCounter = 1;
        this.groupId = null;
        // group "name" star from 1 to avoid 0 = false
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
        this.sessionId = 0;
        this.activetweenCounter = 0;
        this.timeOnPause = 0;
        this.autoSetIsJustCreated = false;

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
            if (tween && tween?.getToNativeType)
                item.data.prevValueTo = tween.getToNativeType();

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
                    const sessionId = this.sessionId;

                    return new Promise((res, reject) => {
                        if (!isImmediate) {
                            tween({
                                reverse: this.isReverse,
                                resolve: () => {
                                    if (sessionId === this.sessionId) {
                                        res();
                                    } else {
                                        reject();
                                    }
                                },
                            });
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
                            : this.NOOP;

                    fn[action]()
                        .then(() => res())
                        .catch(() => {})
                        .finally(() => {
                            unsubscribeActiveTween();
                            unsubscribeTweenStartInPause();
                        });
                };

                // Get delay
                const delay = isImmediate ? false : tweenProps?.delay;
                const sessionId = this.sessionId;

                if (delay) {
                    let start = getTime();
                    this.delayIsRunning = true;
                    let deltaTimeOnpause = 0;

                    /*
                     * Delay loop
                     */
                    const loop = () => {
                        let current = getTime();
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
                         */
                        if (this.actionAfterReject.length > 0) {
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
                if (this.isSuspended || this.isStopped) return;

                /*
                 * Check for loop in test mode, to get toValue of eche tween
                 * necessary for reverse where the last
                 * toValue and the current toValue is inverted
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
                 * reverse next step
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
                 * All ended
                 **/
                // Fire and of timeline
                this.callback.forEach(({ cb }) => cb());
            })
            .catch(() => {
                // If play or reverse or playFromLabel is fired diring delay tween fail
                // Afte fail we can fire the action
                if (this.actionAfterReject.length > 0) {
                    this.actionAfterReject.forEach((item) => item());
                    this.actionAfterReject = [];
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

    addToActiveTween(tween) {
        const tweenId = tween?.uniqueId;
        if (!tweenId) return this.NOOP;

        const prevActiveTweenCounter = this.activetweenCounter;
        this.activetweenCounter++;

        this.currentTween.push({
            tween,
            uniqueId: tween?.uniqueId,
            id: prevActiveTweenCounter,
        });

        return () => {
            this.currentTween = this.currentTween.filter(
                ({ id }) => id !== prevActiveTweenCounter
            );
        };
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

    addTweenToStore(tween) {
        const uniqueId = tween.uniqueId;
        const tweenIsStored = this.tweenStore.find(({ id }) => id === uniqueId);
        if (tweenIsStored) return;

        const obj = { id: tween.uniqueId, tween };
        this.tweenStore.push(obj);
    }

    resetAllTween() {
        this.tweenStore.forEach(({ tween }) => tween.resetData());
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
        this.addTweenToStore(tween);
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
        this.addTweenToStore(tween);
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
        this.addTweenToStore(tween);
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
        this.addTweenToStore(tween);
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

    /*
     * Add a set 'tween' ati start and end of timeline.
     * ! this option can fail with sync methods becouse
     * the tween that use the prop get data during the animation
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
        this.tweenStore.forEach(({ id, tween }) => {
            /*
             * Create an object with all props updated with last
             */
            const setValueTo = this.tweenList.reduce((p, c) => {
                const tweenItem = c.find(
                    ({ data }) => data?.tween?.uniqueId === id
                );
                const currentValueTo = tweenItem?.data?.valuesTo;
                return currentValueTo ? { ...p, ...currentValueTo } : p;
            }, {});

            const obj = {
                id: this.currentTweenCounter,
                tween,
                action: 'set',
                valuesFrom: setValueTo,
                tweenProps: {},
                groupProps: { waitComplete: this.waitComplete },
            };

            this.currentTweenCounter++;

            const mergedObj = { ...this.defaultObj, ...obj };
            this.tweenList.push([{ group: null, data: mergedObj }]);
        });
    }

    play() {
        if (this.autoSet) this.addSetBlocks();

        if (this.freeMode) {
            /*
             * In freeMode every tween start form current value in use at the moment
             */
            if (this.tweenList.length === 0 || this.addAsyncIsActive) return;
            if (this.delayIsRunning) {
                this.startOnDelay = true;
                this.actionAfterReject.push(() => this.play());
                return;
            }
            this.startOnDelay = false;
            this.stop();
            this.isStopped = false;
            this.isPlayingFromLabelReverse = false;
            if (this.isReverse) this.revertTween();

            /*
             * Run one frame after stop to avoid overlap with promise resolve/reject
             */

            this.sessionId++;
            handleFrameIndex.add(() => this.run(), 1);
        } else {
            const cb = () => {
                this.stop();
                this.isStopped = false;

                /*
                 * When start form play in default mode ( no freeMode )
                 * an automatic set method is Executed with initial data
                 */
                const tweenPromise = this.tweenStore.map(({ tween }) => {
                    const data = tween.getInitialData();

                    return new Promise((resolve, reject) => {
                        tween
                            .set(data)
                            .then(() => resolve())
                            .catch(() => reject());
                    });
                });
                Promise.all(tweenPromise).then(() => {
                    this.run();
                });
            };

            this.starterFunction = cb;
            this.timelineIsInTestMode = true;
            this.currentLabel = null;
            this.currentLabelIsReversed = false;
            this.reverse();
        }
    }

    playFromLabel() {
        // Skip of there is nothing to run
        if (this.tweenList.length === 0 || this.addAsyncIsActive) return;

        /*
         * Set props
         */
        if (this.isReverse) this.revertTween();
        this.isPlayingFromLabelReverse = this.currentLabelIsReversed;

        /*
         * Get first item of group, unnecessary.
         * Use of label inside a group becouse is parallel
         */
        this.currentIndex = 0;
        this.goToLabelIndex = this.tweenList.findIndex((item) => {
            const [firstItem] = item;
            const labelCheck = firstItem.data.labelProps?.name;
            return labelCheck === this.currentLabel;
        });

        this.run();
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
        if (this.autoSet) this.addSetBlocks();

        // Skip of there is nothing to run
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
        this.loopCounter--;
        this.sessionId++;
        /*
         * Run one frame after stop to avoid overlap with promise resolve/reject
         */
        handleFrameIndex.add(() => this.run(), 1);
        return this;
    }

    reverseNext() {
        this.isReverseNext = true;
    }

    stop() {
        this.isStopped = true;
        this.currentIndex = 0;
        this.loopCounter = 1;
        // this.currentTween = [];

        // Reset state
        this.isReverseNext = false;
        this.goToLabelIndex = null;
        this.forceYoyo = false;
        this.isInPause = false;
        this.isSuspended = false;
        this.addAsyncIsActive = false;
        this.isPlayingFromLabelReverse = false;
        this.timeOnPause = 0;

        // Stop all Tween
        this.tweenStore.forEach(({ tween }) => {
            if (tween?.stop) tween.stop();
        });

        // Reset Reverse
        if (this.isReverse) this.revertTween();
        this.isReverse = false;
    }

    pause() {
        this.isInPause = true;
        this.timeOnPause = getTime();
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
            this.timeOnPause = 0;
            this.resumeEachTween();
        }

        if (this.isSuspended) {
            this.isSuspended = false;
            this.timeOnPause = 0;

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
        this.tweenStore = [];
        this.currentIndex = 0;
        this.actionAfterReject = [];
    }
}
