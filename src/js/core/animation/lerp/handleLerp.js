import {
    getValueObj,
    mergeArray,
    lerp,
    compareKeys,
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
import { DIRECTION_COL } from '../utils/stagger/staggerCostant.js';

const LERP_DEFAULT_PRECISION = 0.01;

export class handleLerp {
    constructor(velocity = 0.06) {
        this.uniqueId =
            '_' +
            Math.random()
                .toString(36)
                .substr(2, 9);
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
        this.firstRun = true;

        // Store max fps so is the fops of monitor using
        this.maxFps = 60;
        // If fps is under this.maxFps by this.fpsThreshold is algging, so skip to not overload
        this.fpsThreshold = handleSetUp.get('fpsThreshold');

        this.defaultProps = {
            reverse: false,
            velocity,
            precision: LERP_DEFAULT_PRECISION,
            immediate: false,
            stagger: {
                each: 0,
                waitComplete: false,
                from: 'start',
                grid: {
                    col: -1,
                    row: -1,
                    direction: DIRECTION_COL,
                },
            },
        };

        this.stagger = {
            each: 0,
            waitComplete: false,
            from: 'start',
            grid: {
                col: -1,
                row: -1,
                direction: DIRECTION_COL,
            },
        };

        this.slowlestStagger = {
            index: 0,
            frame: 0,
        };
        this.fastestStagger = {
            index: 0,
            frame: 0,
        };
    }

    onReuqestAnim(timestamp, fps, res) {
        this.values.forEach((item, i) => {
            item.currentValue = parseFloat(item.fromValue);
        });

        const velocity = parseFloat(this.velocity);
        const precision = this.precision;

        const o = {};
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
                    (velocity / fps) * 60
                );

                item.settled =
                    Math.abs(item.toValue - item.currentValue) <= precision;

                if (item.settled) {
                    item.currentValue = item.toValue;
                }
            });

            // Prepare an obj to pass to the callback
            const cbObject = getValueObj(this.values, 'currentValue');

            // Check if we lost some fps so we skip update to not overload browser rendering
            // Not first time, only inside motion and once fps is real ( stable )
            o.deltaFps =
                !o.inMotion || !o.isRealFps ? 0 : Math.abs(this.maxFps - fps);
            o.inMotion = true;

            handleFrame.add(() => {
                // Fire callback
                if (this.stagger.each === 0) {
                    // No stagger, run immediatly
                    this.callback.forEach(({ cb }) => {
                        if (o.deltaFps < this.fpsThreshold || fps > this.maxFps)
                            cb(cbObject);
                    });
                } else {
                    // Stagger
                    this.callback.forEach(({ cb, index, frame }, i) => {
                        handleFrameIndex(() => {
                            if (
                                o.deltaFps < this.fpsThreshold ||
                                fps > this.maxFps
                            )
                                cb(cbObject);
                        }, frame);
                    });
                }
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
                        res();

                        // Set promise reference to null once resolved
                        this.promise = null;
                        this.currentReject = null;
                        this.currentResolve = null;
                    }
                };

                // Prepare an obj to pass to the callback with rounded value ( end user value)
                const cbObjectSettled = getValueObj(this.values, 'toValue');

                if (this.stagger.each === 0) {
                    onComplete();

                    handleNextFrame.add(() => {
                        // Fire callback with exact end value
                        this.callback.forEach(({ cb }) => {
                            cb(cbObjectSettled);
                        });

                        this.callbackOnComplete.forEach(({ cb }) => {
                            cb(cbObjectSettled);
                        });
                    });
                } else {
                    this.callback.forEach(({ cb, index, frame }, i) => {
                        handleFrameIndex(() => {
                            cb(cbObjectSettled);

                            if (this.stagger.waitComplete) {
                                if (i === this.slowlestStagger.index) {
                                    onComplete();
                                }
                            } else {
                                if (i === this.fastestStagger.index) {
                                    onComplete();
                                }
                            }
                        }, frame);
                    });

                    this.callbackOnComplete.forEach(
                        ({ cb, index, frame }, i) => {
                            handleFrameIndex(() => {
                                cb(cbObjectSettled);
                            }, frame + 1);
                        }
                    );
                }
            }
        };

        draw(timestamp, fps);
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
        const { velocity, precision, stagger } = newProps;
        this.velocity = velocity;
        this.precision = precision;

        /*
        CREATE STAGGER INDEX
        */

        if (this.firstRun) {
            // Update stagger global value first time
            this.stagger = mergeDeep(this.stagger, stagger);
        }

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
                `handleLerp: ${JSON.stringify(fromObj)} and to ${JSON.stringify(
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
