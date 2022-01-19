const getLerpTime = () => {
    return typeof window !== 'undefined'
        ? window.performance.now()
        : Date.now();
};

export class handleLerp {
    constructor(velocity = 15) {
        this.config = {};
        this.velocity = velocity;
        this.req = null;
        this.previousResolve = null;
        this.previousReject = null;
        this.promise = null;
        this.values = [];
        this.id = 0;
        this.callback = [];
        this.pauseStatus = false;
        this.defaultProps = { reverse: false, velocity: 15 };
    }

    onReuqestAnim(res) {
        this.values.forEach((item, i) => {
            item.currentValue = item.fromValue;
        });

        const draw = () => {
            this.values.forEach((item, i) => {
                if (item.settled) return;

                item.previousValue = item.currentValue;

                const s = item.currentValue;
                const f = item.toValue;
                const v = this.velocity;
                const val = (f - s) / v + s * 1;
                item.currentValue = val;

                item.settled =
                    parseFloat(item.previousValue).toFixed(4) ===
                    parseFloat(item.currentValue).toFixed(4);

                if (item.settled) {
                    item.currentValue = item.toValue;
                }
            });

            // Prepare an obj to pass to the callback
            // 1- Seta an array of object: [{prop: value},{prop2: value2} ...
            // 1- Reduce to a Object: { prop: value, prop2: value2 } ...
            const cbObject = this.values
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

            // Check if all values is completed
            const allSettled = this.values.every(
                (item) => item.settled === true
            );

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

                // Prepare an obj to pass to the callback with rounded value ( end user value)
                const cbObjectSettled = this.values
                    .map((item) => {
                        return {
                            [item.prop]: parseFloat(item.toValue),
                        };
                    })
                    .reduce((p, c) => {
                        return { ...p, ...c };
                    }, {});

                // Fire callback with exact end value
                this.callback.forEach(({ cb }) => {
                    cb(cbObjectSettled);
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
        if (this.pauseStatus) this.pauseStatus = false;

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

        // Reset RAF
        if (this.req) {
            cancelAnimationFrame(this.req);
            this.req = null;
        }

        this.values.forEach((item, i) => {
            if (!item.settled) {
                item.fromValue = item.currentValue;
            }
        });
    }

    /**
     * resume - resume animation if is in pause, use resolve of last promise
     *
     * @return {void}  description
     */
    resume() {
        if (!this.pauseStatus) return;
        this.pauseStatus = false;

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
                toValue: value,
                fromValue: value,
                velocity: this.velocity,
                currentValue: value,
                previousValue: 0,
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
     * immediate - Jump immaediate to the end of tween
     *
     */
    immediate() {
        this.values.forEach((item, i) => {
            item.fromValue = item.toValue;
            item.currentValue = item.toValue;
        });

        const cbValues = this.values
            .map((item) => {
                return {
                    [item.prop]: parseFloat(item.toValue),
                };
            })
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});

        this.callback.forEach(({ cb }) => {
            cb(cbValues);
        });
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
    goTo(obj, props = {}) {
        if (this.pauseStatus) return;

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);

        // merge special props with default
        const newProps = { ...this.defaultProps, ...props };
        // if revert switch fromValue and toValue
        const { reverse, velocity, immediate } = newProps;
        this.velocity = velocity;

        if (reverse) this.reverse(obj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

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
    goFrom(obj, props = {}) {
        if (this.pauseStatus) return;

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);

        // merge special props with default
        const newProps = { ...this.defaultProps, ...props };
        // if revert switch fromValue and toValue
        const { reverse, velocity, immediate } = newProps;
        this.velocity = velocity;

        if (reverse) this.reverse(obj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

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
    goFromTo(fromObj, toObj, props = {}) {
        if (this.pauseStatus) return;

        // Check if fromObj has the same keys of toObj
        const dataIsValid = this.compareKeys(fromObj, toObj);
        if (!dataIsValid) return this.promise;

        const newDataArray = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                currentValue: fromObj[item],
                toValue: toObj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);

        // merge special props with default
        const newProps = { ...this.defaultProps, ...props };
        // if revert switch fromValue and toValue
        const { reverse, velocity, immediate } = newProps;
        this.velocity = velocity;

        if (reverse) this.reverse(fromObj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

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
    set(obj, props = {}) {
        if (this.pauseStatus) return;

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                toValue: obj[item],
                settled: false,
            };
        });

        this.mergeData(newDataArray);

        // merge special props with default
        const newProps = { ...this.defaultProps, ...props };
        const { reverse, velocity, immediate } = newProps;
        this.velocity = velocity;

        if (reverse) this.reverse(obj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

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
     * get - get current value
     *
     * @return {Object} current value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    get() {
        return this.values
            .map((item) => {
                return {
                    [item.prop]: parseFloat(item.currentValue),
                };
            })
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});
    }

    /**
     * getFrom - get fromValue value
     *
     * @return {Object} fromValue value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    getFrom() {
        return this.values
            .map((item) => {
                return {
                    [item.prop]: parseFloat(item.fromValue),
                };
            })
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});
    }

    /**
     * getFrom - get toValue value
     *
     * @return {Object} toValue value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    getTo() {
        return this.values
            .map((item) => {
                return {
                    [item.prop]: parseFloat(item.toValue),
                };
            })
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});
    }

    getType() {
        return 'LERP';
    }

    /**
     * updatePreset - Update config object with new preset
     *
     * @param  {String} preset new preset
     * @return {void}
     *
     */
    updateVelocity(velocity) {
        this.velocity = velocity;
    }

    /**
     * reverse - sitch fromValue and ToValue for specific input value
     *
     * @return {void}
     *
     */
    reverse(obj) {
        const keysTorevert = Object.keys(obj);

        this.values.forEach((item, i) => {
            if (keysTorevert.includes(item.prop)) {
                const fromValue = item.fromValue;
                const toValue = item.toValue;
                item.fromValue = toValue;
                item.toValue = fromValue;
            }
        });
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
