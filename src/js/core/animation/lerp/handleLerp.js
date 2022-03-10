import { getValueObj, mergeArray, lerp } from '../utils/animationUtils.js';

import {
    handleFrame,
    handleNextFrame,
} from '../../events/rafutils/rafUtils.js';

const LERP_DEFAULT_PRECISION = 0.01;

export class handleLerp {
    constructor(velocity = 0.06) {
        this.uniqueId = '_' + Math.random().toString(36).substr(2, 9);
        this.config = {};
        this.velocity = velocity;
        this.precision = LERP_DEFAULT_PRECISION;
        this.req = false;
        this.currentResolve = null;
        this.currentReject = null;
        this.promise = null;
        this.values = [];
        this.id = 0;
        this.callback = [];
        this.callbackOnComplete = [];
        this.callbackStartInPause = [];
        this.pauseStatus = false;
        this.lostFrameTresold = 64;
        this.defaultProps = {
            reverse: false,
            velocity,
            precision: LERP_DEFAULT_PRECISION,
            immediate: false,
        };
    }

    onReuqestAnim(timestamp, fps, res) {
        this.values.forEach((item, i) => {
            item.currentValue = parseFloat(item.fromValue);
        });

        const velocity = parseFloat(this.velocity);
        const precision = this.precision;

        const o = {};

        const draw = (timestamp, fps) => {
            this.req = true;

            this.values.forEach((item, i) => {
                if (item.settled) return;

                item.currentValue = lerp(
                    item.currentValue,
                    item.toValue,
                    (velocity / fps) * 60
                );

                item.settled =
                    Math.abs(item.toValue - item.currentValue) <= precision;

                if (item.settled) {
                    item.currentValue = item.toValue;
                }
            });

            // Prepare an obj to pass to the callback
            o.cbObject = getValueObj(this.values, 'currentValue');

            // Fire callback
            this.callback.forEach(({ cb }) => {
                cb(o.cbObject);
            });

            // Check if all values is completed
            o.allSettled = this.values.every((item) => item.settled === true);

            if (!o.allSettled) {
                handleNextFrame.add((timestamp, fps) => {
                    if (this.req) draw(timestamp, fps);
                });
            } else {
                this.req = false;

                // End of animation
                // Set fromValue with ended value
                // At the next call fromValue become the start value
                this.values.forEach((item, i) => {
                    item.fromValue = item.toValue;
                });

                // Prepare an obj to pass to the callback with rounded value ( end user value)
                const cbObjectSettled = getValueObj(this.values, 'toValue');

                handleNextFrame.add(() => {
                    // Fire callback with exact end value
                    this.callback.forEach(({ cb }) => {
                        cb(cbObjectSettled);
                    });

                    this.callbackOnComplete.forEach(({ cb }) => {
                        cb(cbObjectSettled);
                    });
                });

                // On complete
                if (!this.pauseStatus) {
                    res();

                    // Set promise reference to null once resolved
                    this.promise = null;
                    this.currentReject = null;
                    this.currentResolve = null;
                }
            }
        };

        draw(timestamp, fps);
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

    startRaf(res, reject) {
        this.currentReject = reject;
        this.currentResolve = res;

        handleFrame.add((timestamp, fps) => {
            // this.req = true;
            const prevent = this.callbackStartInPause
                .map(({ cb }) => cb())
                .some((item) => item === true);

            this.onReuqestAnim(timestamp, fps, res);
            if (prevent) this.pause();
        });
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
        if (this.currentReject) {
            this.currentReject();
            this.promise = null;
            this.currentReject = null;
            this.currentResolve = null;
        }

        // Reset RAF
        if (this.req) this.req = false;
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
        if (this.req) this.req = false;

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

        if (!this.req && this.currentResolve) {
            handleFrame.add((timestamp, fps) => {
                this.onReuqestAnim(timestamp, fps, this.currentResolve);
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
        this.values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                fromValue: value,
                currentValue: value,
                previousValue: 0,
                settled: false,
                onPause: false,
            };
        });
    }

    /**
     * immediate - Jump immaediate to the end of tween
     *
     */
    immediate() {
        this.req = false;

        this.values.forEach((item, i) => {
            item.fromValue = item.toValue;
            item.currentValue = item.toValue;
        });

        const cbValues = getValueObj(this.values, 'toValue');
        this.callback.forEach(({ cb }) => {
            cb(cbValues);
        });
    }

    /**
     * mergeProps - Mege special props with default props
     *
     * @param  {Object} props { reverse: <>, velocity: <> , precision <>, immediate <> }
     * @return {Object} props merged
     *
     */
    mergeProps(props) {
        const newProps = { ...this.defaultProps, ...props };
        const { velocity, precision } = newProps;
        this.velocity = velocity;
        this.precision = precision;

        return newProps;
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {number} to new toValue
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goTo({ val: 100 }, { velocity: 30 }).catch((err) => {});
     */
    goTo(obj, props = {}) {
        if (this.pauseStatus) return;

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(obj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.startRaf(res, reject);
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
     * mySpring.goFrom({ val: 100 }, { velocity: 30 }).catch((err) => {});
     */
    goFrom(obj, props = {}) {
        if (this.pauseStatus) return;

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(obj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.startRaf(res, reject);
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
     * mySpring.goFromTo({ val: 0 },{ val: 100 }, { velocity: 30 }).catch((err) => {});
     */
    goFromTo(fromObj, toObj, props = {}) {
        if (this.pauseStatus) return;

        // Check if fromObj has the same keys of toObj
        const dataIsValid = this.compareKeys(fromObj, toObj);
        if (!dataIsValid) return this.promise;

        const data = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                currentValue: fromObj[item],
                toValue: toObj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(fromObj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.startRaf(res, reject);
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

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                toValue: obj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(obj);

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.startRaf(res, reject);
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
        return getValueObj(this.values, 'currentValue');
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
        return getValueObj(this.values, 'fromValue');
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
        return getValueObj(this.values, 'toValue');
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
        this.defaultProps = {
            reverse: false,
            velocity: velocity,
            precision: LERP_DEFAULT_PRECISION,
        };
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

    /**
     * subscribe - add callback to start in pause to stack
     *
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    onStartInPause(cb) {
        this.callbackStartInPause.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callbackStartInPause = this.callbackStartInPause.filter(
                (item) => item.id !== cbId
            );
        };
    }

    onComplete(cb) {
        this.callbackOnComplete.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callbackOnComplete = this.callbackOnComplete.filter(
                (item) => item.id !== cbId
            );
        };
    }
}
