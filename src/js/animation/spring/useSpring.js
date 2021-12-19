import { springConfig } from './springConfig.js';

const getSpringTime = () => {
    return typeof window !== 'undefined'
        ? window.performance.now()
        : Date.now();
};

export class useSpring {
    constructor(config = 'default') {
        this.config = springConfig[config];
        this.req = null;
        this.previousResolve = null;
        this.previousReject = null;
        this.promise = null;
        this.values = [];
        this.id = 0;
        this.callback = [];
        this.pauseStatus = false;
    }

    onReuqestAnim(res) {
        let animationLastTime = 0;
        let cbObject = {};

        this.values.forEach((item, i) => {
            item.velocity = this.config.velocity;
            item.currentValue = item.fromValue;
        });

        const draw = () => {
            // Get current time
            const time = getSpringTime();

            // lastTime is set to now the first time.
            // then check the difference from now and last time to check if we lost frame
            let lastTime = animationLastTime !== 0 ? animationLastTime : time;

            // If we lost a lot of frames just jump to the end.
            if (time > lastTime + 64) lastTime = time;

            // http://gafferongames.com/game-physics/fix-your-timestep/
            let numSteps = Math.floor(time - lastTime);

            // Get lost frame, update vales until time is now
            for (let i = 0; i < numSteps; ++i) {
                this.values.forEach((item, i) => {
                    const tensionForce =
                        -this.config.tension *
                        (item.currentValue - item.toValue);
                    const dampingForce = -this.config.friction * item.velocity;
                    const acceleration =
                        (tensionForce + dampingForce) / this.config.mass;
                    item.velocity = item.velocity + (acceleration * 1) / 1000;
                    item.currentValue =
                        item.currentValue + (item.velocity * 1) / 1000;

                    // If tension == 0 linear movement
                    const isRunning =
                        this.config.tension !== 0
                            ? Math.abs(item.currentValue - item.toValue) >
                                  this.config.precision &&
                              Math.abs(item.velocity) > this.config.precision
                            : false;

                    item.settled = !isRunning;
                });
            }

            // Prepare an obj to pass to the callback
            // 1- Seta an array of object: [{prop: value},{prop2: value2} ...
            // 1- Reduce to a Object: { prop: value, prop2: value2 } ...
            cbObject = this.values
                .map((item) => {
                    return {
                        [item.prop]: parseFloat(item.currentValue),
                    };
                })
                .reduce((p, c) => {
                    return { ...p, ...c };
                }, {});

            // Fire callback
            this.callback.forEach(({ cb }) => {
                cb(cbObject);
            });

            // Update last time
            animationLastTime = time;

            // Check if all values is completed
            const allSettled = this.values.every(
                (item) => item.settled === true
            );

            console.log('draw');

            if (!allSettled) {
                this.req = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(this.req);
                this.req = null;

                // End of animation
                // Set fromValue with ended value
                // At the next call fromValue become the start value
                this.values.forEach((item, i) => {
                    item.fromValue = item.toValue;
                });

                // Fire callback with exact end value
                this.callback.forEach(({ cb }) => {
                    cb(cbObject);
                });

                // On complete
                if (!this.pauseStatus) {
                    res();

                    // Set promise reference to null once resolved
                    this.promise = null;
                }
            }
        };

        draw();
    }

    /**
     * compareKeys - Compare fromObj, toObj in goFromTo methods
     * Check if has the same keys
     *
     * @param  {Object} a fromObj Object
     * @param  {Object} b toObj Object
     * @return {bollean} has thew same keys
     */
    compareKeys(a, b) {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    /**
     * stop - Stop animatona and force return reject form promise
     *
     * @return {void}  description
     */
    stop() {
        this.resetValueOnResume();

        // Update local values with last
        this.values.forEach((item, i) => {
            item.toValue = item.currentValue;
            item.fromValue = item.toValue;
        });

        // Abort promise
        if (this.previousReject) {
            this.previousReject();
            this.promise = null;
        }

        // Reset RAF
        if (this.req) {
            cancelAnimationFrame(this.req);
            this.req = null;
        }
    }

    /**
     * pause - Pause animation
     * @param  {Number} decay px amout to decay animation
     *
     * @return {void}  description
     */
    pause(decay = 0.01) {
        if (this.pauseStatus) return;
        this.pauseStatus = true;

        this.values.forEach((item, i) => {
            if (!item.settled) {
                item.toValueOnPause = item.toValue;
                item.toValue = item.currentValue + decay;
                item.onPause = true;
            } else {
                item.onPause = false;
            }
        });
    }

    resetValueOnResume() {
        this.values.forEach((item, i) => {
            if (item.onPause) {
                item.toValue = item.toValueOnPause;
                (item.velocity = this.config.velocity), (item.onPause = false);
                item.settled = false;
            }
        });

        this.pauseStatus = false;
    }

    /**
     * resume - resume animation if is in pause, use resolve of last promise
     *
     * @return {void}  description
     */
    resume() {
        if (!this.pauseStatus) return;
        this.resetValueOnResume();

        if (!this.req && this.previousResolve) {
            this.req = requestAnimationFrame(() => {
                this.onReuqestAnim(this.previousResolve);
            });
        }
    }

    /**
     * setData - Set initial data structure
     *
     * @return {void}  description
     *
     * @example
     * mySpring.setData({ val: 100 });
     */
    setData(obj) {
        const valToArray = Object.entries(obj);

        this.values = valToArray.map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: 0,
                toValueOnPause: 0,
                fromValue: value,
                velocity: this.config.velocity,
                currentValue: 0,
                settled: false,
                onPause: false,
            };
        });
    }

    /**
     * mergeData - Update values array with new data form methods
     * Check if newData has new value for each prop
     * If yes merge new value
     *
     * @param  {Array} newData description
     * @return {void}         description
     */
    mergeData(newData) {
        this.values = this.values.map((item) => {
            const itemToMerge = newData.find((newItem) => {
                return newItem.prop === item.prop;
            });

            // If exist merge
            return itemToMerge ? { ...item, ...itemToMerge } : item;
        });
    }

    /**
     * Force fail primse when new event is call while running, so clear che promise chain
     *
     * @return {void}
     */
    updateDataWhileRunning() {
        // Abort promise
        if (this.previousReject) {
            this.previousReject();
        }
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {number} to new toValue
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goTo({ val: 100 }).catch((err) => {});
     */
    goTo(obj) {
        if (this.pauseStatus) this.resetValueOnResume();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame(() => this.onReuqestAnim(res));
            });
        }

        return this.promise;
    }

    /**
     * goFrom - go from new fromValue ( manually update fromValue )  to toValue sored
     *
     * @param  {number} from new fromValue
     * @param  {boolean} force force cancel FAR and restart
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFrom({ val: 100 }).catch((err) => {});
     */
    goFrom(obj) {
        if (this.pauseStatus) this.resetValueOnResume();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame(() => this.onReuqestAnim(res));
            });
        }

        return this.promise;
    }

    /**
     * goFromTo - Go From new fromValue to new toValue
     *
     * @param  {number} from new fromValue
     * @param  {number} to new toValue
     * @param  {boolean} force force cancel FAR and restart
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFromTo({ val: 0 },{ val: 100 }).catch((err) => {});
     */
    goFromTo(fromObj, toObj) {
        if (this.pauseStatus) this.resetValueOnResume();

        // Check if fromObj has the same keys of toObj
        const dataIsValid = this.compareKeys(fromObj, toObj);
        if (!dataIsValid) return this.promise;

        const newDataArray = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                toValue: toObj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame(() => this.onReuqestAnim(res));
            });
        }

        return this.promise;
    }

    /**
     * set - set a a vlue without animation ( teleport )
     *
     * @param  {number} value new fromValue and new toValue
     * @return {promise}  onComplete promise
     *
     *
     * @example
     * mySpring.set({ val: 100 }).catch((err) => {});
     */
    set(obj) {
        if (this.pauseStatus) this.resetValueOnResume();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                toValue: obj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame(() => this.onReuqestAnim(res));
            });
        }

        return this.promise;
    }

    /**
     * updateConfig - Update config object
     *
     * @param  {Object} config udate single prop of config object
     * @return {void}
     *
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * updatePreset - Update config object with new preset
     *
     * @param  {String} preset new preset
     * @return {void}
     *
     */
    updatePreset(preset) {
        if (preset in springConfig) {
            this.config = springConfig[preset];
        }
    }

    /**
     * subscribe - add callback to stack
     *
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    subscribe(cb) {
        this.callback.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callback = this.callback.filter((item) => item.id !== cbId);
        };
    }
}
