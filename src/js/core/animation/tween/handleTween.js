import { tweenConfig } from './tweenConfig.js';
import { getValueObj, mergeArrayTween } from '../utils/animationUtils.js';
import { handleFrame } from '../../events/rafutils/rafUtils.js';

export class handleTween {
    constructor(ease = 'easeOutBack') {
        this.uniqueId = '_' + Math.random().toString(36).substr(2, 9);
        this.ease = tweenConfig[ease];
        this.req = null;
        this.currentResolve = null;
        this.currentReject = null;
        this.promise = null;
        this.values = [];
        this.id = 0;
        this.callback = [];
        this.callbackStartInPause = [];
        this.pauseStatus = false;
        this.comeFromResume = false;
        this.duration = 1000;
        this.startTime = null;
        this.isRunning = false;
        this.timeElapsed = 0;
        this.pauseTime = 0;
        this.defaultProps = {
            duration: 1000,
            ease,
            reverse: false,
            immediate: false,
        };
    }

    onReuqestAnim(timestamp, res) {
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
                if (item.shouldUpdate) {
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
            const cbObject = getValueObj(this.values, 'currentValue');

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
                    if (item.shouldUpdate) {
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
                    this.currentReject = null;
                    this.currentResolve = null;
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

    startRaf(res, reject) {
        this.currentReject = reject;
        this.currentResolve = res;
        this.req = requestAnimationFrame((timestamp) => {
            const prevent = this.callbackStartInPause
                .map(({ cb }) => cb())
                .some((item) => item === true);

            this.onReuqestAnim(timestamp, res);
            if (prevent) this.pause();
        });
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
        if (this.currentReject) {
            this.currentReject();
            this.promise = null;
            this.currentReject = null;
            this.currentResolve = null;
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
        this.values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                toValueOnPause: value,
                toValProcessed: value,
                fromValue: value,
                currentValue: value,
                shouldUpdate: false,
            };
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
        if (this.currentReject) {
            this.currentReject();
            this.promise = null;
        }

        this.values.forEach((item, i) => {
            if (item.shouldUpdate) {
                item.fromValue = item.currentValue;
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
            if (item.shouldUpdate) {
                item.toValProcessed = item.toValue - item.fromValue;
            }
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

        const cbValues = getValueObj(this.values, 'toValue');
        this.callback.forEach(({ cb }) => {
            cb(cbValues);
        });
    }

    /**
     * mergeProps - Mege special props with default props
     *
     * @param  {Object} props { duration: <>, ease: <> , reverse <>, immediate <> }
     * @return {Object} props merged
     *
     */
    mergeProps(props) {
        const newProps = { ...this.defaultProps, ...props };
        const { ease, duration } = newProps;
        this.ease = tweenConfig[ease];
        this.duration = duration;

        return newProps;
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {number} to new toValue
     * @param  {object} props : reverse [boolean], duration [number], ease [string], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * myTween.goTo({ val: 100 }, { duration: 3000,  ease: 'easeInQuint' }).catch((err) => {});
     */
    goTo(obj, props = {}) {
        if (this.pauseStatus || this.comeFromResume) this.stop();

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
            };
        });

        this.values = mergeArrayTween(data, this.values);
        if (this.req) this.updateDataWhileRunning();
        const { reverse, immediate } = this.mergeProps(props);

        // if revert switch fromValue and toValue
        if (reverse) this.reverse(obj);

        this.setToValProcessed();

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
     * @param  {object} props : reverse [boolean], duration [number], ease [string], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * myTween.goFrom({ val: 100 }, { duration: 3000,  ease: 'easeInQuint' }).catch((err) => {});
     */
    goFrom(obj, props = {}) {
        if (this.pauseStatus || this.comeFromResume) this.stop();

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
            };
        });

        this.values = mergeArrayTween(data, this.values);
        if (this.req) this.updateDataWhileRunning();
        const { reverse, immediate } = this.mergeProps(props);

        // if revert switch fromValue and toValue
        if (reverse) this.reverse(obj);

        this.setToValProcessed();

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
     * @param  {object} props : reverse [boolean], duration [number], ease [string], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * myTween.goFromTo({ val: 0 },{ val: 100 }, { duration: 3000,  ease: 'easeInQuint' }).catch((err) => {});
     */
    goFromTo(fromObj, toObj, props = {}) {
        if (this.pauseStatus || this.comeFromResume) this.stop();

        // Check if fromObj has the same keys of toObj
        const dataIsValid = this.compareKeys(fromObj, toObj);
        if (!dataIsValid) return this.promise;

        const data = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                toValue: toObj[item],
            };
        });

        this.values = mergeArrayTween(data, this.values);
        if (this.req) this.updateDataWhileRunning();
        const { reverse, immediate } = this.mergeProps(props);

        // if revert switch fromValue and toValue
        if (reverse) this.reverse(fromObj);

        this.setToValProcessed();

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
     * @param  {object} props : reverse [boolean], duration [number], ease [string], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     *
     * @example
     * myTween.set({ val: 100 }).catch((err) => {});
     */
    set(obj, props = {}) {
        if (this.pauseStatus || this.comeFromResume) this.stop();

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                toValue: obj[item],
            };
        });

        this.values = mergeArrayTween(data, this.values);
        if (this.req) this.updateDataWhileRunning();

        // In set mode duration is small as possible
        props.duration = 1;
        const { reverse, immediate } = this.mergeProps(props);
        // if revert switch fromValue and toValue
        if (reverse) this.reverse(obj);

        this.setToValProcessed();

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
        return 'TWEEN';
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
}
