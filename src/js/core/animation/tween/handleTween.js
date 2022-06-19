import { tweenConfig } from './tweenConfig.js';
import {
    getUnivoqueId,
    getValueObj,
    mergeArrayTween,
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
    STAGGER_DEFAULT_OBJ,
    STAGGER_DEFAULT_INDEX_OBJ,
} from '../utils/stagger/staggerCostant.js';
import {
    defaultCallbackOnComplete,
    defaultCallback,
    getDeltaFps,
} from '../utils/callbacks/defaultCallback.js';

export class HandleTween {
    constructor(ease = 'easeOutBack') {
        this.uniqueId = getUnivoqueId();
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
        this.comeFromResume = false;
        this.startTime = null;
        this.isRunning = false;
        this.timeElapsed = 0;
        this.pauseTime = 0;
        this.firstRun = true;

        // Store max fps so is the fops of monitor using
        this.maxFps = 60;
        // If fps is under this.maxFps by this.fpsThreshold is algging, so skip to not overload
        this.fpsThreshold = handleSetUp.get('fpsThreshold');

        /**
        This value lives from user call ( goTo etc..) until next call
         **/
        this.ease = tweenConfig[ease];
        this.duration = 1000;

        /**
        This value is the base value merged with new value in custom prop
        passed form user in goTo etc..
         **/
        this.defaultProps = {
            duration: 1000,
            ease,
            reverse: false,
            immediate: false,
            stagger: STAGGER_DEFAULT_OBJ,
        };

        /**
        Stagger value
         **/
        this.stagger = STAGGER_DEFAULT_OBJ;
        this.slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;
        this.fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;
    }

    onReuqestAnim(timestamp, fps, res) {
        this.startTime = timestamp;

        let o = {};
        o.inMotion = false;

        // Reset maxFos when animartion start
        this.maxFps = 0;

        const draw = (timestamp, fps) => {
            this.req = true;

            o.isRealFps = handleFrame.isRealFps();

            // Get max fps upper limit
            if (fps > this.maxFps && o.isRealFps) this.maxFps = fps;

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
                    item.currentValue = getRoundedValue(item.currentValue);
                } else {
                    item.currentValue = item.fromValue;
                }
            });

            o.isSettled = parseInt(this.timeElapsed) === this.duration;

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

            this.isRunning = true;

            if (!o.isSettled) {
                handleNextFrame.add(() => {
                    handleNextTick.add((timestamp, fps) => {
                        if (this.req) draw(timestamp, fps);
                    });
                });
            } else {
                const onComplete = () => {
                    this.req = false;
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

                defaultCallbackOnComplete({
                    onComplete,
                    callback: this.callback,
                    callbackOnComplete: this.callbackOnComplete,
                    cbObject: o.cbObject,
                    stagger: this.stagger,
                    slowlestStagger: this.slowlestStagger,
                    fastestStagger: this.fastestStagger,
                });
            }
        };

        draw(timestamp, fps);
    }

    startRaf(res, reject) {
        this.currentReject = reject;
        this.currentResolve = res;

        handleFrame.add(() => {
            handleNextTick.add((timestamp, fps) => {
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
        this.req = false;

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
                /*
                Prevent error on tween revert if is 0 some easeType can't run
                es: easeInElastic
                */
                item.toValProcessed = item.toValue - item.fromValue + 0.00001;
            }
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
     * @param  {Object} props { duration: <>, ease: <> , reverse <>, immediate <> }
     * @return {Object} props merged
     *
     */
    mergeProps(props) {
        const newProps = mergeDeep(this.defaultProps, props);
        const { ease, duration, stagger } = newProps;
        this.ease = tweenConfig[ease];
        this.duration = duration;

        /*
        CREATE STAGGER INDEX
        */

        if (this.firstRun) {
            // Update stagger global value first time
            this.stagger = mergeDeep(this.stagger, stagger);
        }

        if (stagger.each > 0 && this.firstRun) {
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
        const dataIsValid = compareKeys(fromObj, toObj);
        if (!dataIsValid) {
            console.warn(
                `HandleTween: ${JSON.stringify(
                    fromObj
                )} and to ${JSON.stringify(toObj)} is not equal`
            );
            return this.promise;
        }

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

        this.defaultProps = mergeDeep(this.defaultProps, {
            ease: preset,
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
