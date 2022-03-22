import { requestTimeout } from '../../utils/requestTimeOut.js';

export class HandleAsyncTimeline {
    constructor(config = {}) {
        // Secure check timeline start with a close gruop action
        this.tweenList = [];
        this.currentTween = [];
        this.currentTweenCounter = 0;
        this.currentIndex = 0;
        this.repeat = config.repeat || 1;
        this.yoyo = config.yoyo || false;
        this.forceYoyo = false;
        this.loopCounter = 1;
        this.groupId = null;
        // group "name" star from 1 to avoid 0 = falsa
        this.groupCounter = 1;
        this.waitComplete = false;
        this.fromLabelIndex = null;
        this.defaultObj = {
            id: null,
            tween: null,
            action: null,
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: {},
            tweenProps: {},
            groupProps: {},
            syncProp: {},
            labelProps: {},
        };
        this.NOOP = () => {};

        // Timeline state
        this.isReverse = false;
        this.isInPause = false;
        this.isSuspended = false;
        this.isStopped = false;
        this.isRunninReverseRealtime = false;
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
                this.fromLabelIndex && index < this.fromLabelIndex;

            if (isImmediate) newTweenProps.immediate = true;

            const fn = {
                set: () => tween[action](valuesFrom, newTweenProps),
                goTo: () => {
                    item.data.prevValueTo = tween.getTo();
                    return tween[action](valuesTo, newTweenProps);
                },
                goFrom: () => tween[action](valuesFrom, newTweenProps),
                goFromTo: () => {
                    return tween[action](valuesFrom, valuesTo, newTweenProps);
                },

                sync: () => {
                    return new Promise((res, reject) => {
                        const { from, to } = syncProp;
                        to.setData(from.get());
                        res();
                    });
                },
                add: () => {
                    return new Promise((res, reject) => {
                        tween(this);
                        res();
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
                            console.log('fire suspend');
                            this.isSuspended = true;
                        }
                        res();
                    });
                },
            };

            return new Promise((res, reject) => {
                // Get delay
                const delay = isImmediate ? false : tweenProps?.delay;

                const cb = () => {
                    // Add tween to active stack
                    this.addToActiveTween(tween, valuesTo);

                    // Add tween to active stack, if timelienstatus is in pause
                    //  onStartInPause methids trigger pause status inside
                    const unsubscribeOnStartTween =
                        tween && tween?.onStartInPause
                            ? tween.onStartInPause(() => {
                                  this.addToActiveTween(tween, valuesTo);
                                  return this.isInPause ? true : false;
                              })
                            : this.NOOP;

                    // Prevent tween start after stop because have some delay
                    if (this.isStopped) {
                        reject();
                        return;
                    }

                    fn[action]()
                        .then(() => {
                            // Remove tween from active tween store
                            this.setctiveTweenCompleted(tween);
                            // Unsubscribe from pause on start
                            unsubscribeOnStartTween();
                            res();
                        })
                        .catch((error) => {
                            // Remove tween from active tween store
                            this.setctiveTweenCompleted(tween);
                            // Unsubscribe from pause on start
                            unsubscribeOnStartTween();
                            reject();
                        });
                };

                if (delay) {
                    let t = null;
                    requestTimeout(cb, delay, (id) => (t = id));
                    cancelAnimationFrame(t);
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
                this.isRunninReverseRealtime = false;

                console.log('resolve promise group');
                if (this.isSuspended) return;

                if (this.isReverseNext) {
                    this.isReverseNext = false;
                    this.currentIndex =
                        this.tweenList.length - this.currentIndex - 1;
                    this.fromLabelIndex = null;
                    this.revertTween();
                    this.run();
                    return;
                }

                if (this.currentIndex < this.tweenList.length - 1) {
                    this.currentIndex++;
                    this.run();
                } else if (
                    this.loopCounter < this.repeat ||
                    this.repeat === -1
                ) {
                    this.loopCounter++;
                    this.currentIndex = 0;
                    this.fromLabelIndex = null;
                    if (this.yoyo || this.forceYoyo) this.revertTween();
                    this.run();
                    this.forceYoyo = false;
                } else {
                    this.currentIndex = 0;
                    this.loopCounter = 1;
                    this.fromLabelIndex = null;
                }
            })
            .catch((error) => {
                this.currentTween = [];
                console.log(error);
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

        console.log(this.currentTween);
    }

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
                    const prevValueTo = item.data.prevValueTo;
                    const currentValueTo = item.data.valuesTo;
                    item.data.valuesTo = prevValueTo;
                    item.data.prevValueTo = currentValueTo;
                }

                if (action === 'goFrom') {
                    // item.data.valuesTo = tween.get();
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
        this.addToMainArray(tweenProps, obj);
        return this;
    }

    play() {
        this.stop();
        this.isStopped = false;
        if (this.isReverse) this.revertTween();
        this.run();
    }

    playFrom(label) {
        this.stop();
        this.isStopped = false;
        if (this.isReverse) this.revertTween();

        this.fromLabelIndex = this.tweenList.findIndex((item) => {
            // Get first item of group, unnecessary use of label inside a group becouse is parallel
            const [firstItem] = item;
            const labelCheck = firstItem.data.labelProps?.name;
            return labelCheck === label;
        });

        this.run();
    }

    stop() {
        this.fromLabelIndex = null;
        this.isSuspended = false;
        this.isInPause = false;
        this.currentIndex = 0;
        this.loopCounter = 1;
        this.fromLabelIndex = null;
        this.isStopped = true;
        this.forceYoyo = false;

        // Reset
        if (this.isReverse) this.revertTween();
        this.tweenList.forEach((group) => {
            group.forEach((item) => {
                const { data } = item;
                const { action } = data;

                if (action === 'goTo') {
                    item.data.prevValueTo = {};
                }
            });
        });

        // Stop all Tween
        this.currentTween.forEach(({ tween }) => tween.stop());
        this.isReverse = false;
    }

    pause() {
        this.isInPause = true;
        console.log('call pause', this.isInPause);
        this.currentTween.forEach(({ tween }) => {
            tween.pause();
        });
    }

    reverse() {
        this.stop();
        this.isStopped = false;
        this.forceYoyo = true;
        this.fromLabelIndex = this.tweenList.length;
        this.run();
    }

    reverseNext() {
        this.isReverseNext = true;
    }

    reverseImmediate() {
        if (this.isRunninReverseRealtime) return;
        this.isRunninReverseRealtime = true;

        // Back current tween
        const reverseTweenPrmises = this.currentTween.map(
            ({ tween, propiertiesInUse, valuesFrom, valuesTo, completed }) => {
                // If tween is completed ( delay side effect ) go to previous from value stored
                // otherview if tween is in motion go to current form position
                const targetValue = completed ? valuesFrom : valuesTo;

                return new Promise((res, reject) => {
                    this.addToActiveTween(tween, propiertiesInUse);
                    tween.stop();
                    tween
                        .goTo(targetValue)
                        .then(() => {
                            res();
                        })
                        .catch((err) => {
                            reject();
                        });
                });
            }
        );

        const waitComplete = this.tweenList[this.currentIndex].some((item) => {
            return item.data.groupProps?.waitComplete;
        });
        const promiseType = waitComplete ? 'all' : 'race';
        console.log(promiseType);

        // Resolved new tween group restar pipe
        Promise[promiseType](reverseTweenPrmises)
            .then((value) => {
                this.currentIndex =
                    this.tweenList.length - this.currentIndex - 1;
                this.fromLabelIndex = null;
                this.revertTween();
                if (this.currentIndex < this.tweenList.length - 1)
                    this.currentIndex++;
                this.run();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * resume - if there is no tween active ( pause settend by add methods )
     * run next pipe element, otherwise resume current tween
     *
     * @return {type}  description
     */
    resume() {
        console.log('call resume check');

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
                this.fromLabelIndex = null;
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
        this.currentIndex = 0;
    }
}
