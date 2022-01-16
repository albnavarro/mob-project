export class HandleTimeline {
    constructor(config = {}) {
        this.tweenList = [];
        this.currentTween = [];
        this.currentIndex = 0;
        this.repeat = config.repeat || 1;
        this.loopCounter = 1;
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
                syncProp,
            } = data;

            this.currentTween.push(tween);

            const fn = {
                set: () => tween[action](valuesFrom, tweenProps),
                goTo: () => tween[action](valuesTo, tweenProps),
                goFrom: () => tween[action](valuesFrom, tweenProps),
                goFromTo: () => tween[action](valuesFrom, valuesTo, tweenProps),
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
            };

            return new Promise((res) => {
                fn[action]()
                    .then(() => res())
                    .catch((err) => {});
            });
        });

        const promiseType =
            this.currentIndex === this.tweenList.length - 1 ? 'all' : 'race';

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
        const group = 'group' in tweenProps ? tweenProps.group : null;
        delete tweenProps.group;

        const rowIndex = this.tweenList.findIndex((item) => {
            return (
                item[0].group === group &&
                item[0].group !== null &&
                item[0].group !== undefined
            );
        });

        if (rowIndex >= 0) {
            this.tweenList[rowIndex].push({ group, data: obj });
        } else {
            this.tweenList.push([{ group, data: obj }]);
        }
    }

    set(tween, valuesFrom, tweenProps = {}) {
        const obj = {
            tween,
            action: 'set',
            valuesFrom,
            valuesTo: {},
            tweenProps,
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
            syncProp,
        };

        this.addToMainArray(tweenProps, obj);

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
