import { requestTimeout } from '../../utils/requestTimeOut.js';
import { handleFrame } from '../../events/rafutils/rafUtils.js';

export class HandleTimeline {
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
                    this.addToActiveTween(tween, id, valuesTo);

                    // Add tween to active stack, if timelienstatus is in pause
                    //  onStartInPause methids trigger pause status inside
                    const unsubscribeOnStartTween =
                        tween && tween?.onStartInPause
                            ? tween.onStartInPause(() => {
                                  this.addToActiveTween(tween, id, valuesTo);
                                  return this.isInPause ? true : false;
                              })
                            : this.NOOP;

                    fn[action]()
                        .then(() => {
                            // Remove tween from active tween store
                            this.unsubscribeTween(id);
                            // Unsubscribe from pause on start
                            unsubscribeOnStartTween();
                            res();
                        })
                        .catch((error) => {
                            // Remove tween from active tween store
                            this.unsubscribeTween(id);
                            // Unsubscribe from pause on start
                            unsubscribeOnStartTween();
                            return error;
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

                this.isRunninReverseRealtime = false;
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
                    if (this.yoyo) this.revertTween();
                    this.run();
                } else {
                    this.currentIndex = 0;
                    this.loopCounter = 1;
                    this.fromLabelIndex = null;
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    addToActiveTween(tween, id, valuesTo) {
        // Add tween tif is not present in tack
        const tweenIsAleadyTrackedId = this.currentTween.findIndex(
            ({ tween: currentTween }) => {
                if (!currentTween || !tween) return -1;
                return currentTween.uniqueId === tween.uniqueId;
            }
        );

        // If tween is in stack update current value in use
        if (tweenIsAleadyTrackedId === -1) {
            this.currentTween.push({
                id,
                current: valuesTo,
                tween,
            });
        } else {
            this.currentTween[tweenIsAleadyTrackedId].current = valuesTo;
        }

        console.log(this.currentTween);
    }

    unsubscribeTween(idToCheck) {
        this.currentTween = this.currentTween.filter(
            ({ id }) => id !== idToCheck
        );
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

        const mergedObj = { ...this.defaultObj, ...mergedObj };
        this.addToMainArray(tweenProps, obj);
        return this;
    }

    play() {
        this.stop();
        if (this.isReverse) this.revertTween();
        this.run();
    }

    playFrom(label) {
        this.stop();
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
        if (this.currentTween.length === 0) return;
        this.fromLabelIndex = null;
        this.isSuspended = false;
        this.isInPause = false;
        this.currentIndex = 0;
        this.loopCounter = 1;
        this.fromLabelIndex = null;

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

    doReverseNext() {
        this.isReverseNext = true;
    }

    doReverse() {
        // Secure check only one reverse for pipe
        if (this.isRunninReverseRealtime || this.currentTween.length === 0)
            return;

        // Back current tween
        const reverseTweenPrmises = this.currentTween.map(
            ({ tween, id, current }) => {
                const currentValuesTo = tween.getFrom();
                const currentKeys = Object.keys(current);

                // Get key of current tween based to vale stored in tween
                // Get only key used in current pipe
                const toValues = Object.entries(currentValuesTo).reduce(
                    (p, c) => {
                        const [key, val] = c;
                        return currentKeys.includes(key)
                            ? { ...p, ...{ [key]: val } }
                            : p;
                    },
                    {}
                );

                return new Promise((res, reject) => {
                    this.addToActiveTween(tween, id, current);
                    tween.stop();
                    tween
                        .goTo(toValues)
                        .then(() => {
                            this.unsubscribeTween(id);
                            res();
                        })
                        .catch((err) => {
                            this.unsubscribeTween(id);
                        });
                });
            }
        );

        // Resolved new tween group restar pipe
        Promise.all(reverseTweenPrmises).then((value) => {
            this.isRunninReverseRealtime = true;
            this.currentIndex = this.tweenList.length - this.currentIndex - 1;
            this.fromLabelIndex = null;
            this.revertTween();
            this.currentIndex++;
            this.run();
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
