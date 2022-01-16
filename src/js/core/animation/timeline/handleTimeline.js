import { requestTimeout } from '../../utils/requestTimeOut.js';

export class HandleTimeline {
    constructor(config = {}) {
        // Secure check timeline start with a close gruop action
        this.tweenList = [];
        this.currentTween = [];
        this.currentIndex = 0;
        this.repeat = config.repeat || 1;
        this.loopCounter = 1;
        this.groupId = null;
        // group "name" star from 1 to avoid 0 = falsa
        this.groupCounter = 1;
        this.waitComplete = false;
    }

    run() {
        this.currentTween = [];

        const twenList = this.tweenList[this.currentIndex].map((item) => {
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

            this.currentTween.push(tween);

            // Clone teen prop and clean from timeline props
            const newTweenProps = { ...tweenProps };
            delete newTweenProps.delay;

            const fn = {
                set: () => tween[action](valuesFrom, newTweenProps),
                goTo: () => tween[action](valuesTo, newTweenProps),
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
                        tween();
                        res();
                    });
                },
                createGroup: () => {
                    return new Promise((res, reject) => res());
                },
                closeGroup: () => {
                    return new Promise((res, reject) => res());
                },
            };

            return new Promise((res) => {
                // Get delay
                const delay = tweenProps?.delay;

                const cb = () =>
                    fn[action]()
                        .then(() => res())
                        .catch((err) => {});

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

        Promise[promiseType](twenList)
            .then(() => {
                if (this.currentIndex < this.tweenList.length - 1) {
                    this.currentIndex++;
                    this.run();
                } else if (
                    this.loopCounter < this.repeat ||
                    this.repeat === -1
                ) {
                    this.loopCounter++;
                    this.currentIndex = 0;
                    this.run();
                } else {
                    this.currentIndex = 0;
                    this.loopCounter = 1;
                }
            })
            .catch((err) => {});
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
            tweenProps: {},
            groupProps: {},
            syncProp: {},
        };

        this.addToMainArray(tweenProps, obj);
        this.waitComplete = false;
        return this;
    }

    play() {
        this.stop();
        this.currentIndex = 0;
        this.loopCounter = 1;
        this.run();
    }

    stop() {
        if (this.currentTween.length === 0) return;
        this.currentTween.forEach((item) => item.stop());
    }

    pause() {
        if (this.currentTween.length === 0) return;
        this.currentTween.forEach((item) => {
            item.pause();
        });
    }

    resume() {
        if (this.currentTween.length === 0) return;
        this.currentTween.forEach((item) => item.resume());
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
