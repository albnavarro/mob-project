import {
    getUnivoqueId,
    getValueObj,
    mergeArray,
    lerp,
    compareKeys,
    getRoundedValue,
} from '../utils/animationUtils.js';

import {
    handleFrame,
    handleNextFrame,
    handleNextTick,
    handleFrameIndex,
} from '../../events/rafutils/rafUtils.js';
import { mergeDeep } from '../../utils/mergeDeep.js';
import { handleSetUp } from '../../setup.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    DIRECTION_COL,
    STAGGER_DEFAULT_INDEX_OBJ,
} from '../utils/stagger/staggerCostant.js';
import { getStaggerFromProps } from '../utils/stagger/staggerUtils.js';
import {
    defaultCallbackOnComplete,
    defaultCallback,
    getDeltaFps,
} from '../utils/callbacks/defaultCallback.js';

export class HandleLerp {
    constructor(data = {}) {
        this.uniqueId = getUnivoqueId();
        this.config = {};
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
        this.firstRun = true;

        // Store max fps so is the fops of monitor using
        this.maxFps = 60;
        // If fps is under this.maxFps by this.fpsThreshold is algging, so skip to not overload
        this.fpsThreshold = handleSetUp.get('fpsThreshold');

        /**
        This value lives from user call ( goTo etc..) until next call
         **/
        this.velocity =
            'velocity' in data
                ? data.velocity
                : handleSetUp.get('lerp').velocity;

        this.precision =
            'precision' in data
                ? data.precision
                : handleSetUp.get('lerp').precision;

        /**
        This value is the base value merged with new value in custom prop
        passed form user in goTo etc..
         **/
        this.defaultProps = {
            reverse: false,
            velocity: this.velocity,
            precision: this.precision,
            immediate: false,
        };

        /**
        Stagger value
         **/
        this.stagger = getStaggerFromProps(data);
        this.slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;
        this.fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;
    }

    onReuqestAnim(timestamp, fps, res) {
        if (this.firstRun) this.setStagger();

        this.values.forEach((item, i) => {
            item.currentValue = parseFloat(item.fromValue);
        });

        let o = {};
        o.velocity = parseFloat(this.velocity);
        o.inMotion = false;

        // Reset maxFos when animartion start
        this.maxFps = 0;

        const draw = (timestamp, fps) => {
            this.req = true;
            o.isRealFps = handleFrame.isRealFps();

            // Get max fps upper limit
            if (fps > this.maxFps && o.isRealFps) this.maxFps = fps;

            this.values.forEach((item, i) => {
                if (item.settled) return;

                item.currentValue = lerp(
                    item.currentValue,
                    item.toValue,
                    (o.velocity / fps) * 60
                );

                item.currentValue = getRoundedValue(item.currentValue);

                item.settled =
                    Math.abs(
                        parseFloat(item.toValue - item.currentValue).toFixed(4)
                    ) <= this.precision;

                if (item.settled) {
                    item.currentValue = item.toValue;
                }
            });

            // Prepare an obj to pass to the callback
            o.cbObject = getValueObj(this.values, 'currentValue');

            /**
            Check if we lost some fps so we skip update to not overload browser rendering
            Not first time, only inside motion and once fps is real ( stable )
            **/
            o.deltaFps = getDeltaFps({
                inMotion: o.inMotion,
                isRealFps: o.isRealFps,
                maxFps: this.maxFps,
                fps,
            });
            o.inMotion = true;

            /**
            Fire CallBack
             **/
            defaultCallback({
                stagger: this.stagger,
                callback: this.callback,
                deltaFps: o.deltaFps,
                fpsThreshold: this.fpsThreshold,
                maxFps: this.maxFps,
                fps,
                cbObject: o.cbObject,
            });

            // Check if all values is completed
            o.allSettled = this.values.every((item) => item.settled === true);

            if (!o.allSettled) {
                handleNextFrame.add(() => {
                    handleNextTick.add((timestamp, fps) => {
                        if (this.req) draw(timestamp, fps);
                    });
                });
            } else {
                const onComplete = () => {
                    this.req = false;

                    // End of animation
                    // Set fromValue with ended value
                    // At the next call fromValue become the start value
                    this.values.forEach((item, i) => {
                        item.fromValue = item.toValue;
                    });

                    // On complete
                    if (!this.pauseStatus) {
                        // Remove reference to o Object
                        o = null;
                        //
                        res();

                        // Set promise reference to null once resolved
                        this.promise = null;
                        this.currentReject = null;
                        this.currentResolve = null;
                    }
                };

                // Prepare an obj to pass to the callback with rounded value ( end user value)
                const cbObjectSettled = getValueObj(this.values, 'toValue');

                defaultCallbackOnComplete({
                    onComplete,
                    callback: this.callback,
                    callbackOnComplete: this.callbackOnComplete,
                    cbObject: cbObjectSettled,
                    stagger: this.stagger,
                    slowlestStagger: this.slowlestStagger,
                    fastestStagger: this.fastestStagger,
                });
            }
        };

        draw(timestamp, fps);
    }

    setStagger() {
        if (this.stagger.each > 0 && this.firstRun) {
            if (this.stagger.grid.col > this.callback.length) {
                console.warn(
                    'stagger col of grid is out of range, it must be less than the number of staggers '
                );
                this.firstRun = false;
                return;
            }

            const {
                cbNow,
                cbCompleteNow,
                fastestStagger,
                slowlestStagger,
            } = setStagger({
                cb: this.callback,
                endCb: this.callbackOnComplete,
                stagger: this.stagger,
                slowlestStagger: this.slowlestStagger,
                fastestStagger: this.fastestStagger,
            });

            this.callback = [...cbNow];
            this.callbackOnComplete = [...cbCompleteNow];
            this.slowlestStagger = { ...slowlestStagger };
            this.fastestStagger = { ...fastestStagger };

            this.firstRun = false;
        }
    }

    startRaf(res, reject) {
        this.currentReject = reject;
        this.currentResolve = res;

        handleFrame.add(() => {
            handleNextTick.add((timestamp, fps) => {
                // this.req = true;
                const prevent = this.callbackStartInPause
                    .map(({ cb }) => cb())
                    .some((item) => item === true);

                this.onReuqestAnim(timestamp, fps, res);
                if (prevent) this.pause();
            });
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
            handleFrame.add(() => {
                handleNextTick.add((timestamp, fps) => {
                    this.onReuqestAnim(timestamp, fps, this.currentResolve);
                });
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
    }

    /**
     * mergeProps - Mege special props with default props
     *
     * @param  {Object} props { reverse: <>, velocity: <> , precision <>, immediate <> }
     * @return {Object} props merged
     *
     */
    mergeProps(props) {
        const newProps = mergeDeep(this.defaultProps, props);
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
        const dataIsValid = compareKeys(fromObj, toObj);
        if (!dataIsValid) {
            console.warn(
                `HandleLerp: ${JSON.stringify(fromObj)} and to ${JSON.stringify(
                    toObj
                )} is not equal`
            );
            return this.promise;
        }

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
        this.defaultProps = mergeDeep(this.defaultProps, {
            velocity: velocity,
        });
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
