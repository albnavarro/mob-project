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
        this.isStopped = false;
        this.delayIsRunning = false;
        this.startOnDelay = false;
        this.actionAfterReject = [];

        // Callback
        this.id = 0;
        this.callback = [];
    }

    run(index = this.currentIndex) {
        const tweenPromises = this.tweenList[index].map((item) => {
            const { group, data } = item;

            const {
                id,
                tween,
                action,
                valuesFrom,
                valuesTo,
                tweenProps,
                groupProps,
                syncProp,
            } = data;

            // Clone teen prop and clean from timeline props
            const newTweenProps = { ...tweenProps };
            delete newTweenProps.delay;

            const isImmediate =
                this.goToLabelIndex && index < this.goToLabelIndex;

            if (isImmediate) newTweenProps.immediate = true;

            // Get current valueTo for to use in reverse methods
            if (tween && tween?.getTo) item.data.prevValueTo = tween.getTo();

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
                    return new Promise((res, reject) => {
                        const { from, to } = syncProp;
                        to.set(from.get(), { immediate: true }).then((value) =>
                            res()
                        );
                    });
                },
                add: () => {
                    return new Promise((res, reject) => {
                        // Custom function
                        tween();
                        res();
                    });
                },
                addAsync: () => {
                    return new Promise((res, reject) => {
                        // Custom function that fire the result of the promise
                        tween(res);
                    });
                },
                createGroup: () => {
                    return new Promise((res, reject) => res());
                },
                closeGroup: () => {
                    return new Promise((res, reject) => res());
                },
                label: () => {
                    return new Promise((res, reject) => res());
                },
                suspend: () => {
                    return new Promise((res, reject) => {
                        if (!isImmediate) {
                            this.isSuspended = true;
                        }
                        res();
                    });
                },
            };

            return new Promise((res, reject) => {
                const cb = () => {
                    // If after delay tween is stopped or some action start are started we fail tween
                    if (this.isStopped || this.startOnDelay) {
                        reject();
                        return;
                    }

                    // Add tween to active stack
                    this.addToActiveTween(tween, valuesTo);

                    // Add tween to active stack, if timelienstatus is in pause
                    //  onStartInPause methids trigger pause status inside
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

                        // If play, resume, playFromLabel is fired whith another tween in delay
                        // fire this tween immediatly, so avoid probem with musch much delay in same group
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
                this.currentTween = [];

                if (this.isSuspended || this.isStopped) return;

                if (this.isReverseNext) {
                    // Check if need reverse at next step
                    this.isReverseNext = false;
                    this.currentIndex =
                        this.tweenList.length - this.currentIndex - 1;
                    this.goToLabelIndex = null;
                    this.revertTween();
                    this.run();
                    return;
                }

                if (this.currentIndex < this.tweenList.length - 1) {
                    // Inside timeline pipe
                    this.currentIndex++;
                    this.run();
                } else if (
                    // At the end : Loop
                    this.loopCounter < this.repeat ||
                    this.repeat === -1
                ) {
                    this.loopCounter++;
                    this.currentIndex = 0;
                    this.goToLabelIndex = null;
                    if (this.yoyo || this.forceYoyo) this.revertTween();
                    this.run();
                    this.forceYoyo = false;
                } else {
                    // Rest all timeline is ended
                    this.stop();

                    // Fire and of timeline
                    this.callback.forEach(({ cb }) => {
                        cb();
                    });
                }
            })
            .catch((error) => {
                this.currentTween = [];

                // If play or reverse or playFromLabel is fired diring delay tween fail
                // Afte fail we can fire the action
                if (this.actionAfterReject.length > 0) {
                    this.actionAfterReject.forEach((item, i) => item());
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
        this.tweenList.reverse();
        this.tweenList.forEach((group) => {
            group.reverse();
            group.forEach((item) => {
                const { data } = item;
                const { tween, action, valuesFrom, valuesTo, syncProp } = data;

                if (action === 'goTo') {
                    const prevValueTo = item.data.prevValueTo
                        ? item.data.prevValueTo
                        : valuesFrom; //Fallback if there is no preveValue Settled
                    const currentValueTo = item.data.valuesTo;
                    item.data.valuesTo = prevValueTo;
                    item.data.prevValueTo = currentValueTo;
                }

                if (action === 'goFrom') {
                    // item.data.valuesTo = tween.get();
                    // TODO:
                }

                if (action === 'goFromTo') {
                    item.data.valuesFrom = valuesTo;
                    item.data.valuesTo = valuesFrom;
                }

                if (action === 'sync') {
                    const { from, to } = syncProp;
                    item.data.syncProp.from = to;
                    item.data.syncProp.to = from;
                }
            });
        });
    }

    addToMainArray(tweenProps, obj) {
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
        this.addToMainArray(tweenProps, mergedObj);
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
        this.addToMainArray(tweenProps, mergedObj);
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
        this.addToMainArray(tweenProps, mergedObj);
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
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    add(fn, tweenProps = {}) {
        const obj = {
            tween: fn,
            action: 'add',
            groupProps: { waitComplete: this.waitComplete },
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    addAsync(fn, tweenProps = {}) {
        const obj = {
            tween: fn,
            action: 'addAsync',
            groupProps: { waitComplete: this.waitComplete },
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    sync(syncProp, tweenProps = {}) {
        const obj = {
            action: 'sync',
            groupProps: { waitComplete: this.waitComplete },
            syncProp,
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    createGroup(groupProps = {}, tweenProps = {}) {
        const obj = {
            action: 'createGroup',
            groupProps,
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        this.waitComplete = groupProps?.waitComplete
            ? groupProps.waitComplete
            : false;
        this.groupId = this.groupCounter++;
        return this;
    }

    closeGroup(tweenProps = {}) {
        this.groupId = null;
        const obj = {
            action: 'closeGroup',
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        this.waitComplete = false;
        return this;
    }

    // Don't use inside group
    suspend(tweenProps = {}) {
        const obj = {
            action: 'suspend',
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    // Don't use inside group
    label(labelProps = {}, tweenProps = {}) {
        const obj = {
            action: 'label',
            labelProps,
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    play() {
        if (this.delayIsRunning) {
            this.startOnDelay = true;
            this.actionAfterReject.push(() => this.play());
            return;
        }
        this.startOnDelay = false;

        this.stop();
        this.isStopped = false;
        if (this.isReverse) this.revertTween();

        Promise.resolve().then(() => this.run());
    }

    playFrom(label) {
        if (this.delayIsRunning) {
            this.startOnDelay = true;
            this.actionAfterReject.push(() => this.playFrom(label));
            return;
        }
        this.startOnDelay = false;

        this.stop();
        this.isStopped = false;
        if (this.isReverse) this.revertTween();

        this.goToLabelIndex = this.tweenList.findIndex((item) => {
            // Get first item of group, unnecessary use of label inside a group becouse is parallel
            const [firstItem] = item;
            const labelCheck = firstItem.data.labelProps?.name;
            return labelCheck === label;
        });

        Promise.resolve().then(() => this.run());
    }

    reverse() {
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

        Promise.resolve().then(() => this.run());
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

        // Stop all Tween
        this.currentTween.forEach(({ tween }) => tween.stop());

        // Reset Reverse
        if (this.isReverse) this.revertTween();
        this.isReverse = false;
    }

    pause() {
        this.isInPause = true;
        this.currentTween.forEach(({ tween }) => {
            tween.pause();
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
        this.currentTween.forEach(({ tween }) => tween.resume());
    }

    get() {
        return this.currentTween;
    }

    destroy() {
        this.tweenList = [];
        this.currentTween = [];
        this.callback = [];
        this.currentIndex = 0;
    }

    onComplete(cb) {
        this.callback.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callback = this.callback.filter((item) => item.id !== cbId);
        };
    }
}
