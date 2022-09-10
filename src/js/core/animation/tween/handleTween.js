import { tweenConfig, getTweenFn } from './tweenConfig.js';
import {
    getUnivoqueId,
    getValueObj,
    getValueObjToNative,
    getValueObjFromNative,
    mergeArrayTween,
    compareKeys,
    getRoundedValue,
} from '../utils/animationUtils.js';
import {
    setFromCurrentByTo,
    setFromToByCurrent,
    setReverseValues,
    setRelativeTween,
} from '../utils/setValues.js';
import { loadFps } from '../../events/rafutils/loadFps.js';
import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { mergeDeep } from '../../utils/mergeDeep.js';
import { handleSetUp } from '../../setup.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import { STAGGER_DEFAULT_INDEX_OBJ } from '../utils/stagger/staggerCostant.js';
import {
    getStaggerFromProps,
    getStaggerArray,
} from '../utils/stagger/staggerUtils.js';
import {
    defaultCallbackOnComplete,
    defaultCallback,
} from '../utils/callbacks/defaultCallback.js';
import {
    setCallBack,
    setCallBackCache,
} from '../utils/callbacks/setCallback.js';
import {
    goToUtils,
    goFromUtils,
    goFromToUtils,
    setUtils,
} from '../utils/actions.js';
import { initRaf } from '../utils/initRaf.js';
import {
    compareKeysWarning,
    staggerIsOutOfRangeWarning,
} from '../utils/warning.js';
import { fpsLoadedLog } from '../utils/log.js';
import { shouldInizializzeStagger } from '../utils/condition.js';
import { handleCache } from '../../events/rafutils/handleCache.js';
import { storeType } from '../../store/storeType.js';

export class HandleTween {
    constructor(data = {}) {
        this.uniqueId = getUnivoqueId();
        this.isActive = false;
        this.currentResolve = null;
        this.currentReject = null;
        this.promise = null;
        this.values = [];
        this.initialData = [];
        this.callback = [];
        this.callbackCache = [];
        this.callbackOnComplete = [];
        this.callbackStartInPause = [];
        this.unsubscribeCache = [];
        this.pauseStatus = false;
        this.comeFromResume = false;
        this.startTime = null;
        this.isRunning = false;
        this.timeElapsed = 0;
        this.pauseTime = 0;
        this.firstRun = true;
        this.useStagger = true;
        this.fpsInLoading = false;

        /**
        This value lives from user call ( goTo etc..) until next call
         **/
        this.ease =
            'ease' in data
                ? getTweenFn(data.ease)
                : getTweenFn(handleSetUp.get('tween').ease);

        this.duration =
            'duration' in data
                ? data.duration
                : handleSetUp.get('tween').duration;

        this.relative =
            'relative' in data
                ? data.relative
                : handleSetUp.get('tween').relative;

        /**
        This value is the base value merged with new value in custom prop
        passed form user in goTo etc..
         **/
        this.defaultProps = {
            duration: this.duration,
            ease: 'ease' in data ? data.ease : handleSetUp.get('tween').ease,
            relative: this.relative,
            reverse: false,
            immediate: false,
        };

        /**
        Stagger value
         **/
        this.stagger = getStaggerFromProps(data);
        this.slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;
        this.fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.data ? data.data : null;
        if (props) this.setData(props);
    }

    onReuqestAnim(time, fps, res) {
        this.startTime = time;

        let o = {};

        const draw = (time) => {
            this.isActive = true;

            if (this.pauseStatus) {
                this.pauseTime = time - this.startTime - this.timeElapsed;
            }
            this.timeElapsed = time - this.startTime - this.pauseTime;

            if (this.isRunning && parseInt(this.timeElapsed) >= this.duration) {
                this.timeElapsed = this.duration;
            }

            this.values.forEach((item) => {
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

            defaultCallback({
                stagger: this.stagger,
                callback: this.callback,
                callbackCache: this.callbackCache,
                cbObject: o.cbObject,
                useStagger: this.useStagger,
            });

            this.isRunning = true;

            if (!o.isSettled) {
                handleFrame.add(() => {
                    handleNextTick.add(({ time }) => {
                        if (this.isActive) draw(time);
                    });
                });
            } else {
                const onComplete = () => {
                    this.isActive = false;
                    this.isRunning = false;
                    this.pauseTime = 0;

                    // End of animation
                    // Set fromValue with ended value
                    // At the next call fromValue become the start value
                    this.values.forEach((item) => {
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
                    callbackCache: this.callbackCache,
                    callbackOnComplete: this.callbackOnComplete,
                    cbObject: o.cbObject,
                    stagger: this.stagger,
                    slowlestStagger: this.slowlestStagger,
                    fastestStagger: this.fastestStagger,
                    useStagger: this.useStagger,
                });
            }
        };

        draw(time);
    }

    inzializeStagger() {
        const getStagger = () => {
            const cb = getStaggerArray(this.callbackCache, this.callback);

            if (this.stagger.grid.col > cb.length) {
                staggerIsOutOfRangeWarning(cb.length);
                this.firstRun = false;
                return;
            }

            const { cbNow, cbCompleteNow, fastestStagger, slowlestStagger } =
                setStagger({
                    cb,
                    endCb: this.callbackOnComplete,
                    stagger: this.stagger,
                    slowlestStagger: this.slowlestStagger,
                    fastestStagger: this.fastestStagger,
                });

            if (this.callbackCache.length > this.callback.length) {
                this.callbackCache = cbNow;
            } else {
                this.callback = cbNow;
            }
            this.callbackOnComplete = cbCompleteNow;
            this.slowlestStagger = slowlestStagger;
            this.fastestStagger = fastestStagger;
            this.firstRun = false;
        };

        /**
         * First time il there is a stagger load fps then go next step
         * next time no need to calcaulte stagger and jump directly next step
         *
         **/
        if (
            shouldInizializzeStagger(
                this.stagger.each,
                this.firstRun,
                this.callbackCache,
                this.callback
            )
        ) {
            return new Promise((resolve) => {
                loadFps().then(({ averageFPS }) => {
                    fpsLoadedLog('tween', averageFPS);
                    getStagger();
                    resolve();
                });
            });
        } else {
            return new Promise((resolve) => {
                resolve();
            });
        }
    }

    startRaf(res, reject) {
        if (this.fpsInLoading) return;
        this.currentResolve = res;
        this.currentReject = reject;

        const cb = () =>
            initRaf(
                this.callbackStartInPause,
                this.onReuqestAnim.bind(this),
                this.pause.bind(this),
                res
            );

        if (this.firstRun) {
            this.fpsInLoading = true;
            this.inzializeStagger().then(() => {
                cb();
                this.fpsInLoading = false;
            });
        } else {
            cb();
            this.firstRun = false;
        }
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
        this.values = setFromToByCurrent(this.values);
        this.callbackCache.forEach(({ cb }) => handleCache.clean(cb));

        // Abort promise
        if (this.currentReject) {
            this.currentReject();
            this.promise = null;
            this.currentReject = null;
            this.currentResolve = null;
        }

        // Reset RAF
        if (this.isActive) this.isActive = false;
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
     * save the original dato to reset when needed
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
                fromFn: () => {},
                fromIsFn: false,
                toFn: () => {},
                toIsFn: false,
                settled: false, // not used, only for uniformity with lerp and spring
            };
        });

        this.initialData = this.values.map((item) => {
            return {
                prop: item.prop,
                toValue: item.toValue,
                fromValue: item.fromValue,
                currentValue: item.currentValue,
                shouldUpdate: false,
                fromFn: () => {},
                fromIsFn: false,
                toFn: () => {},
                toIsFn: false,
                settled: false, // not used, only for uniformity with lerp and spring
            };
        });
    }

    /*
     * Reset data value with initial
     */
    resetData() {
        this.values = mergeDeep(this.values, this.initialData);
    }

    /**
     * updateDataWhileRunning - Cancel RAF when event fire while is isRunning
     * update form value
     *
     * @return {void}
     */
    updateDataWhileRunning() {
        this.isActive = false;

        // Abort promise
        if (this.currentReject) {
            this.currentReject();
            this.promise = null;
        }

        this.values.forEach((item) => {
            if (item.shouldUpdate) {
                item.fromValue = item.currentValue;
            }
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
        const { ease, duration, relative } = newProps;
        this.ease = getTweenFn(ease);
        this.relative = relative;

        /*
         * Chek if duration is a function
         */
        const durationIsFn = storeType.isFunction(duration);
        this.duration = durationIsFn ? duration() : duration;
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
        this.useStagger = true;
        const data = goToUtils(obj);
        return this.doAction(data, props, obj);
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
        this.useStagger = true;
        const data = goFromUtils(obj);
        return this.doAction(data, props, obj);
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
        this.useStagger = true;
        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('tween goFromTo:', fromObj, toObj);
            return this.promise;
        }

        const data = goFromToUtils(fromObj, toObj);
        return this.doAction(data, props, fromObj);
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
        this.useStagger = false;
        const data = setUtils(obj);

        // In set mode duration is small as possible
        props.duration = 1;
        return this.doAction(data, props, obj);
    }

    /**
     * Commen oparation for set/goTo/goFrom/goFromTo
     */
    doAction(data, props, obj) {
        this.values = mergeArrayTween(data, this.values);
        if (this.isActive) this.updateDataWhileRunning();
        const { reverse, immediate } = this.mergeProps(props);
        if (reverse) this.value = setReverseValues(obj, this.values);
        this.values = setRelativeTween(this.values, this.relative);

        if (immediate) {
            this.isActive = false;
            this.values = setFromCurrentByTo(this.values);
            return new Promise((res) => res());
        }

        if (!this.isActive) {
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
     * get - get initial value
     *
     * @return {Object} current value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.getIntialData();
     */
    getInitialData() {
        return getValueObj(this.initialData, 'currentValue');
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

    /**
     * getFrom - get fromValue value
     *
     * @return {Object} fromValue value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    getFromNativeType() {
        return getValueObjFromNative(this.values);
    }

    /**
     * getFrom - get toValue value
     *
     * @return {Object} toValue value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    getToNativeType() {
        return getValueObjToNative(this.values);
    }

    /**
     * getType - get tween type
     *
     * @return {string} tween type
     *
     * @example
     * const type = mySpring.getType();
     */
    getType() {
        return 'TWEEN';
    }

    /**
     * Get uniqueId
     */
    getId() {
        return this.uniqueId;
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
     * subscribe - add callback to stack
     *
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    subscribe(cb) {
        const unsubscribeCb = setCallBack(cb, this.callback);
        return () => (this.callback = unsubscribeCb(this.callback));
    }

    /**
     * subscribe - add callback to start in pause to stack
     *
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    onStartInPause(cb) {
        setCallBack(cb, this.callbackStartInPause);
        return () => (this.callbackStartInPause = []);
    }

    /**
     * subscribe - add callback Complete
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    onComplete(cb) {
        const unsubscribeCb = setCallBack(cb, this.callbackOnComplete);
        return () =>
            (this.callbackOnComplete = unsubscribeCb(this.callbackOnComplete));
    }

    /**
     * subscribeCache - add callback to stack
     *
     * @param  {item} htmlElement
     * @return {function}
     *
     */
    subscribeCache(item, fn) {
        const { unsubscribeCb, unsubscribeCache } = setCallBackCache(
            item,
            fn,
            this.callbackCache,
            this.unsubscribeCache
        );

        this.unsubscribeCache = unsubscribeCache;
        return () => (this.callbackCache = unsubscribeCb(this.callbackCache));
    }

    /**
     * Remove all reference from tween
     */
    destroy() {
        if (this.promise) this.stop();
        this.callbackOnComplete = [];
        this.callbackStartInPause = [];
        this.callback = [];
        this.callbackCache = [];
        this.values = [];
        this.promise = null;
        this.unsubscribeCache.forEach((unsubscribe) => unsubscribe());
        this.unsubscribeCache = [];
    }
}
