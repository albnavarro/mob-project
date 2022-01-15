export class HandleTimeline {
    constructor(config = {}) {
        this.tweenList = [];
        this.currentTween = null;
        this.currentIndex = 0;
        this.repeat = config.repeat || 1;
        this.loopCounter = 1;
    }

    run() {
        const { tween, action, valuesFrom, valuesTo, props } =
            this.tweenList[this.currentIndex];

        this.currentTween = tween;
        const fn = {
            set: () => tween[action](valuesFrom, props),
            goTo: () => tween[action](valuesTo, props),
            goFrom: () => tween[action](valuesFrom, props),
            goFromTo: () => tween[action](valuesFrom, valuesTo, props),
            add: () => {
                return new Promise((res, reject) => {
                    tween();
                    res();
                });
            },
        };

        fn[action]()
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

    goTo(tween, valuesTo, props = {}) {
        const obj = { tween, action: 'goTo', valuesFrom: {}, valuesTo, props };
        this.tweenList.push(obj);

        return this;
    }

    goFrom(tween, valuesFrom, props = {}) {
        const obj = {
            tween,
            action: 'goFrom',
            valuesFrom,
            valuesTo: {},
            props,
        };
        this.tweenList.push(obj);

        return this;
    }

    goFromTo(tween, valuesFrom, valuesTo, props = {}) {
        const obj = { tween, action: 'goFromTo', valuesFrom, valuesTo, props };
        this.tweenList.push(obj);

        return this;
    }

    add(fn) {
        const obj = {
            tween: fn,
            action: 'add',
            valuesFrom: {},
            valuesTo: {},
            props: {},
        };
        this.tweenList.push(obj);

        return this;
    }

    set(tween, valuesFrom, props = {}) {
        const obj = { tween, action: 'set', valuesFrom, valuesTo: {}, props };
        this.tweenList.push(obj);

        return this;
    }

    sync() {}

    play() {
        this.stop();
        this.currentIndex = 0;
        this.loopCounter = 1;
        this.run();
    }

    stop() {
        if (!this.currentTween) return;
        this.currentTween.stop();
    }

    pause() {
        if (!this.currentTween) return;
        this.currentTween.pause();
    }

    resume() {
        if (!this.currentTween) return;
        this.currentTween.resume();
    }

    destroy() {
        this.tweenList = [];
        this.currentTween = null;
        this.currentIndex = 0;
    }
}
