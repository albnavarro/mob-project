import { tweenConfig } from './tweenConfig.js';

export class useTween {
    constructor(ease = 'easeOutBack') {
        this.ease = tweenConfig[ease];
        this.req = null;
        this.previousResolve = null;
        this.previousReject = null;
        this.promise = null;
        this.values = [];
        this.id = 0;
        this.callback = [];
        this.pauseStatus = false;
        this.comeFromResume = false;
        this.duration = 1000;
        this.startTime = null;
        this.isRunning = false;
        this.timeElapsed = 0;
        this.pauseTime = 0;
    }

    onReuqestAnim(timestamp, res) {
        let cbObject = {};

        this.startTime = timestamp;

        const draw = (timestamp) => {
            if (this.pauseStatus) {
                this.pauseTime = timestamp - this.startTime - this.timeElapsed;
            }
            this.timeElapsed = timestamp - this.startTime - this.pauseTime;

            if (this.isRunning && parseInt(this.timeElapsed) >= this.duration) {
                this.timeElapsed = this.duration;
            }

            this.values.forEach((item, i) => {
                if (item.update) {
                    item.currentValue = this.ease(
                        this.timeElapsed,
                        item.fromValue,
                        item.toValProcessed,
                        this.duration
                    );
                } else {
                    item.currentValue = item.fromValue;
                }
            });

            const isSettled = parseInt(this.timeElapsed) === this.duration;

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

            this.isRunning = true;

            if (!isSettled) {
                this.req = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(this.req);
                this.req = null;
                this.isRunning = false;
                this.pauseTime = 0;

                // End of animation
                // Set fromValue with ended value
                // At the next call fromValue become the start value
                this.values.forEach((item, i) => {
                    if (item.update) {
                        item.toValue = item.currentValue;
                        item.fromValue = item.currentValue;
                    }
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
                    this.previousReject = null;
                    this.previousResolve = null;
                }
            }
        };

        draw(timestamp);
    }

    /**
     * this.compareKeys - Compare fromObj, toObj in goFromTo methods
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
        this.pauseTime = 0;
        this.pauseStatus = false;
        this.comeFromResume = false;

        // Update local values with last
        this.values.forEach((item, i) => {
            item.toValue = item.currentValue;
            item.fromValue = item.toValue;
        });

        // Abort promise
        if (this.previousReject) {
            this.previousReject();
            this.promise = null;
            this.previousReject = null;
            this.previousResolve = null;
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
    pause() {
        if (this.pauseStatus) return;
        this.pauseStatus = true;
    }

    /**
     * resume - resume animation if is in pause, use resolve of last promise
     *
     * @return {void}  description
     */
    resume() {
        if (!this.pauseStatus) return;
        this.pauseStatus = false;
        this.comeFromResume = true;
    }

    /**
     * setData - Set initial data structure
     *
     * @return {void}  description
     *
     * @example
     * myTween.setData({ val: 100 });
     */
    setData(obj) {
        const valToArray = Object.entries(obj);

        this.values = valToArray.map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: 0,
                toValueOnPause: 0,
                toValProcessed: 0,
                fromValue: value,
                currentValue: 0,
                update: false,
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
            return itemToMerge
                ? { ...item, ...itemToMerge, ...{ update: true } }
                : { ...item, ...{ update: false } };
        });
    }

    /**
     * updateDataWhileRunning - Cancel RAF when event fire while is isRunning
     * update form value
     *
     * @return {void}
     */
    updateDataWhileRunning() {
        cancelAnimationFrame(this.req);
        this.req = null;

        // Abort promise
        if (this.previousReject) {
            this.previousReject();
            this.promise = null;
        }

        this.values.forEach((item, i) => {
            if (item.update) {
                item.fromValue = item.currentValue;
                // item.currentValue = 0;
            }
        });
    }

    /**
     * setToValProcessed - Update to value to match an absolute destination
     *
     * @return {void}  onComplete promise
     *
     */
    setToValProcessed() {
        this.values.forEach((item, i) => {
            if (item.update) {
                item.toValProcessed = item.toValue - item.fromValue;
            }
        });
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {number} to new toValue
     * @return {promise}  onComplete promise
     *
     * @example
     * myTween.goTo({ val: 100 }).catch((err) => {});
     */
    goTo(obj, duration = 1000) {
        this.duration = duration;
        if (this.pauseStatus || this.comeFromResume) this.stop();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();
        this.setToValProcessed();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame((timestamp) => {
                    this.onReuqestAnim(timestamp, res);
                });
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
     * myTween.goFrom({ val: 100 }).catch((err) => {});
     */
    goFrom(obj, duration = 1000) {
        this.duration = duration;
        if (this.pauseStatus || this.comeFromResume) this.stop();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();
        this.setToValProcessed();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame((timestamp) => {
                    this.onReuqestAnim(timestamp, res);
                });
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
     * myTween.goFromTo({ val: 0 },{ val: 100 }).catch((err) => {});
     */
    goFromTo(fromObj, toObj, duration = 1000) {
        this.duration = duration;
        if (this.pauseStatus || this.comeFromResume) this.stop();

        // Check if fromObj has the same keys of toObj
        const dataIsValid = this.compareKeys(fromObj, toObj);
        if (!dataIsValid) return this.promise;

        const newDataArray = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                toValue: toObj[item],
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();
        this.setToValProcessed();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame((timestamp) => {
                    this.onReuqestAnim(timestamp, res);
                });
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
     * myTween.set({ val: 100 }).catch((err) => {});
     */
    set(obj, duration = 1000) {
        this.duration = duration;
        if (this.pauseStatus || this.comeFromResume) this.stop();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                toValue: obj[item],
            };
        });

        this.mergeData(newDataArray);
        if (this.req) this.updateDataWhileRunning();
        this.setToValProcessed();

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.previousReject = reject;
                this.previousResolve = res;
                this.req = requestAnimationFrame((timestamp) => {
                    this.onReuqestAnim(timestamp, res);
                });
            });
        }

        return this.promise;
    }

    /**
     * updatePreset - Update config object with new preset
     *
     * @param  {String} preset new preset
     * @return {void}
     *
     */
    updatePreset(preset) {
        if (preset in tweenConfig) {
            this.ease = tweenConfig[preset];
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
