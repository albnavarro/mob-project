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
    }

    run(index = this.currentIndex) {
        const tweenPromises = this.tweenList[index].map((item) => {
            const { group, data } = item;

            const {
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
                    // Pause the tween when try to start when timeline is isInPause
                    // pause was triggered in delay status
                    const unsubscribePrevent =
                        tween && tween?.onStartInPause
                            ? tween.onStartInPause(() =>
                                  this.isInPause ? true : false
                              )
                            : this.NOOP;

                    // Add tween to stack to pause it when necessary
                    this.currentTween.push({
                        id: this.currentTweenCounter,
                        tween,
                    });
                    const cbId = this.currentTweenCounter;
                    this.currentTweenCounter++;

                    fn[action]()
                        .then(() => {
                            // Remove tween from active tween store
                            this.unsubscribeTween(cbId);
                            // Unsubscribe from pause on start
                            unsubscribePrevent();
                            res();
                        })
                        .catch((error) => {
                            // Remove tween from active tween store
                            this.unsubscribeTween(cbId);
                            // Unsubscribe from pause on start
                            unsubscribePrevent();
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

    unsubscribeTween(cbId) {
        this.currentTween = this.currentTween.filter(({ id }) => id !== cbId);
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
            tween,
            action: 'set',
            valuesFrom,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    goTo(tween, valuesTo, tweenProps = {}) {
        const obj = {
            tween,
            action: 'goTo',
            valuesTo,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    goFrom(tween, valuesFrom, tweenProps = {}) {
        const obj = {
            tween,
            action: 'goFrom',
            valuesFrom,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

        const mergedObj = { ...this.defaultObj, ...obj };
        this.addToMainArray(tweenProps, mergedObj);
        return this;
    }

    goFromTo(tween, valuesFrom, valuesTo, tweenProps = {}) {
        const obj = {
            tween,
            action: 'goFromTo',
            valuesFrom,
            valuesTo,
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
        };

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
