import { requestTimeout } from '../../utils/requestTimeOut.js';

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
        this.reverse = false;
        this.isRunning = false;
        this.isInPause = false;
        this.tweenResolveInPause = false;
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

            const fn = {
                set: () => tween[action](valuesFrom, newTweenProps),
                goTo: () => {
                    if (!this.tweenResolveInPause) {
                        item.data.prevValueTo = this.reverse
                            ? tween.getTo()
                            : tween.get();
                    }

                    return tween[action](valuesTo, newTweenProps);
                },
                goFrom: () => tween[action](valuesFrom, newTweenProps),
                goFromTo: () =>
                    tween[action](valuesFrom, valuesTo, newTweenProps),
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
                suspend: () => {
                    return new Promise((res, reject) => {
                        tweenPromises.resolve();
                        this.pause();
                        res();
                    });
                },
            };

            return new Promise((res, reject) => {
                // Get delay
                const delay = tweenProps?.delay;

                const cb = () => {
                    this.currentTween.push({
                        id: this.currentTweenCounter,
                        tween,
                    });
                    const cbId = this.currentTweenCounter;
                    this.currentTweenCounter++;

                    if (this.isInPause) {
                        this.unsubscribeTween(cbId);
                        reject(Error('Run tween in pause, delay sideEffect'));
                        return;
                    }

                    fn[action]()
                        .then(() => {
                            this.unsubscribeTween(cbId);

                            if (!this.isInPause) {
                                res();
                            } else {
                                reject(
                                    Error(
                                        'Run tween in pause, delay sideEffect'
                                    )
                                );
                            }
                        })
                        .catch((error) => {
                            this.unsubscribeTween(cbId);
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
                this.tweenResolveInPause = false;

                if (this.currentIndex < this.tweenList.length - 1) {
                    this.currentIndex++;
                    this.run();
                } else if (
                    this.loopCounter < this.repeat ||
                    this.repeat === -1
                ) {
                    this.loopCounter++;
                    this.currentIndex = 0;
                    if (this.yoyo) this.revertTween();
                    this.run();
                } else {
                    this.currentIndex = 0;
                    this.loopCounter = 1;
                    this.isRunning = false;
                }
            })
            .catch((error) => {
                // Tween ws rolverd in pause , probable delay sideEffect
                if (this.isInPause) {
                    console.log(error);
                    this.tweenResolveInPause = true;
                }
            });
    }

    unsubscribeTween(cbId) {
        this.currentTween = this.currentTween.filter(({ id }) => id !== cbId);
    }

    revertTween() {
        this.reverse = !this.reverse;
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
            valuesTo: {},
            prevValueTo: {},
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        return this;
    }

    goTo(tween, valuesTo, tweenProps = {}) {
        const obj = {
            tween,
            action: 'goTo',
            valuesFrom: {},
            valuesTo,
            prevValueTo: {},
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        return this;
    }

    goFrom(tween, valuesFrom, tweenProps = {}) {
        const obj = {
            tween,
            action: 'goFrom',
            valuesFrom,
            valuesTo: {},
            prevValueTo: {},
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        return this;
    }

    goFromTo(tween, valuesFrom, valuesTo, tweenProps = {}) {
        const obj = {
            tween,
            action: 'goFromTo',
            valuesFrom,
            valuesTo,
            prevValueTo: {},
            tweenProps,
            groupProps: { waitComplete: this.waitComplete },
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        return this;
    }

    add(fn, tweenProps = {}) {
        const obj = {
            tween: fn,
            action: 'add',
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: {},
            tweenProps: {},
            groupProps: { waitComplete: this.waitComplete },
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        return this;
    }

    sync(syncProp, tweenProps = {}) {
        const obj = {
            tween: null,
            action: 'sync',
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: {},
            tweenProps: {},
            groupProps: { waitComplete: this.waitComplete },
            syncProp,
        };

        this.addToMainArray(tweenProps, obj);
        return this;
    }

    createGroup(groupProps = {}, tweenProps = {}) {
        const obj = {
            tween: null,
            action: 'createGroup',
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: {},
            tweenProps: {},
            groupProps,
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        this.waitComplete = groupProps?.waitComplete
            ? groupProps.waitComplete
            : false;
        this.groupId = this.groupCounter++;
        return this;
    }

    closeGroup(tweenProps = {}) {
        this.groupId = null;
        const obj = {
            tween: null,
            action: 'closeGroup',
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: {},
            tweenProps: {},
            groupProps: {},
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        this.waitComplete = false;
        return this;
    }

    // Don't use inside group
    suspend(tweenProps = {}) {
        const obj = {
            tween: null,
            action: 'suspend',
            valuesFrom: {},
            valuesTo: {},
            prevValueTo: {},
            tweenProps: {},
            groupProps: {},
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        return this;
    }

    play() {
        this.stop();
        this.currentIndex = 0;
        this.loopCounter = 1;
        this.run();
        this.isRunning = true;
    }

    stop() {
        if (this.currentTween.length === 0) return;
        this.isRunning = false;

        // Reset
        if (this.reverse) this.revertTween();
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
        this.reverse = false;
    }

    pause() {
        if (this.currentTween.length === 0) return;

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
        if (this.tweenResolveInPause) {
            this.isInPause = false;
            this.run();
            return;
        }

        if (!this.isRunning) return;

        this.isInPause = false;
        if (this.currentTween.length === 0) {
            if (this.currentIndex <= this.tweenList.length - 2) {
                this.currentIndex++;
                this.run(this.currentIndex);
            } else if (this.currentIndex === this.tweenList.length - 1) {
                // At the end suspend become item in pipe first ro skip it
                this.currentIndex = this.yoyo && !this.reverse ? 1 : 0;
                if (this.yoyo) this.revertTween();
                this.loopCounter++;
                this.run();
            }
        } else {
            this.currentTween.forEach(({ tween }) => tween.resume());
        }
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
