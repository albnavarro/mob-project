import {
    getUnivoqueId,
    getValueObj,
    getValueObjToNative,
    getValueObjFromNative,
    mergeArray,
    compareKeys,
    getRoundedValue,
} from '../utils/animationUtils.js';
import {
    setFromByCurrent,
    setFromCurrentByTo,
    setFromToByCurrent,
    setReverseValues,
    setRelative,
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
import { goTo, goFrom, goFromTo, set } from '../utils/actions.js';
import { initRaf } from '../utils/initRaf.js';
import { resume } from '../utils/resume.js';
import {
    compareKeysWarning,
    staggerIsOutOfRangeWarning,
} from '../utils/warning.js';
import { fpsLoadedLog } from '../utils/log.js';
import { shouldInizializzeStagger } from '../utils/condition.js';
import { handleCache } from '../../events/rafutils/handleCache.js';

export class HandleSpring {
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
        this.firstRun = true;
        this.useStagger = true;
        this.fpsInLoading = false;

        /**
        This value lives from user call ( goTo etc..) until next call
         **/
        this.config =
            'config' in data
                ? this.springValidator(data.config)
                : handleSetUp.get('spring').default;

        this.relative =
            'relative' in data
                ? data.relative
                : handleSetUp.get('spring').relative;

        /**
        This value is the base value merged with new value in custom prop
        passed form user in goTo etc..
         **/
        this.defaultProps = {
            reverse: false,
            config: this.config,
            relative: this.relative,
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

    springValidator(config) {
        if (config in handleSetUp.get('spring')) {
            return handleSetUp.get('spring')[config];
        } else {
            console.warn(
                `${config} doasn't exist in spring configuration list`
            );
            return handleSetUp.get('spring').default;
        }
    }

    onReuqestAnim(time, fps, res) {
        this.values.forEach((item) => {
            item.velocity = parseFloat(this.config.velocity);
            item.currentValue = parseFloat(item.fromValue);

            // Normalize toValue in case is a string
            item.toValue = parseFloat(item.toValue);
        });

        // Normalize spring config props

        let o = {};
        o.tension = parseFloat(this.config.tension);
        o.friction = parseFloat(this.config.friction);
        o.mass = parseFloat(this.config.mass);
        o.precision = parseFloat(this.config.precision);

        const draw = (time, fps) => {
            this.isActive = true;

            this.values.forEach((item) => {
                o.tensionForce =
                    -o.tension * (item.currentValue - item.toValue);
                o.dampingForce = -o.friction * item.velocity;
                o.acceleration = (o.tensionForce + o.dampingForce) / o.mass;

                item.velocity = item.velocity + (o.acceleration * 1) / fps;
                item.currentValue =
                    item.currentValue + (item.velocity * 1) / fps;

                item.currentValue = getRoundedValue(item.currentValue);

                o.isVelocity = Math.abs(item.velocity) <= 0.1;

                o.isDisplacement =
                    o.tension !== 0
                        ? Math.abs(
                              parseFloat(
                                  item.toValue - item.currentValue
                              ).toFixed(4)
                          ) <= o.precision
                        : true;

                item.settled = o.isVelocity && o.isDisplacement;
            });

            // Prepare an obj to pass to the callback
            o.cbObject = getValueObj(this.values, 'currentValue');

            defaultCallback({
                stagger: this.stagger,
                callback: this.callback,
                callbackCache: this.callbackCache,
                cbObject: o.cbObject,
                useStagger: this.useStagger,
            });

            // Check if all values is completed
            o.allSettled = this.values.every((item) => item.settled === true);

            if (!o.allSettled) {
                handleFrame.add(() => {
                    handleNextTick.add(({ time, fps }) => {
                        if (this.isActive) draw(time, fps);
                    });
                });
            } else {
                const onComplete = () => {
                    this.isActive = false;

                    // End of animation
                    // Set fromValue with ended value
                    // At the next call fromValue become the start value
                    this.values.forEach((item) => {
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
                    callbackCache: this.callbackCache,
                    callbackOnComplete: this.callbackOnComplete,
                    cbObject: cbObjectSettled,
                    stagger: this.stagger,
                    slowlestStagger: this.slowlestStagger,
                    fastestStagger: this.fastestStagger,
                    useStagger: this.useStagger,
                });
            }
        };

        draw(time, fps);
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
                    fpsLoadedLog('spring', averageFPS);
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
        if (this.pauseStatus) this.pauseStatus = false;
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
        if (this.isActive) {
            this.isActive = false;
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
        if (this.isActive) this.isActive = false;
        this.values = setFromByCurrent(this.values);
    }

    /**
     * resume - resume animation if is in pause, use resolve of last promise
     *
     * @return {void}  description
     */
    resume() {
        if (!this.pauseStatus) return;
        this.pauseStatus = false;

        if (!this.isActive && this.currentResolve) {
            resume(this.onReuqestAnim.bind(this), this.currentResolve);
        }
    }

    /**
     * setData - Set initial data structure
     * save the original dato to reset when needed
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
                velocity: this.config.velocity,
                currentValue: value,
                fromFn: () => {},
                fromIsFn: false,
                toFn: () => {},
                toIsFn: false,
                settled: false,
            };
        });

        this.initialData = this.values.map((item) => {
            return {
                prop: item.prop,
                toValue: item.toValue,
                fromValue: item.fromValue,
                currentValue: item.currentValue,
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
     * mergeProps - Mege special props with default props
     *
     * @param  {Object} props { reverse: <>, config: <> , immediate <> }
     * @return {Object} props merged
     *
     */
    mergeProps(props) {
        const newProps = mergeDeep(this.defaultProps, props);
        const { config, relative } = newProps;
        this.config = config;
        this.relative = relative;

        return newProps;
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {object} obj new toValue
     * @param  {object} props : config: [object], reverse [boolean], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goTo({ val: 100 }, { config: { mass: 2 }, reverse: true }).catch((err) => {});
     */
    goTo(obj, props = {}) {
        if (this.pauseStatus) return;
        this.useStagger = true;
        const data = goTo(obj);
        return this.doAction(data, props, obj);
    }

    /**
     * goFrom - go from new fromValue ( manually update fromValue )  to toValue sored
     *
     * @param  {object} obj new fromValue
     * @param  {object} props : config: [object], reverse [boolean], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFrom({ val: 100 }, { config: { mass: 2 }, reverse: true }).catch((err) => {});
     */
    goFrom(obj, props = {}) {
        if (this.pauseStatus) return;
        this.useStagger = true;
        const data = goFrom(obj);
        return this.doAction(data, props, obj);
    }

    /**
     * goFromTo - Go From new fromValue to new toValue
     *
     * @param  {object} fromObj new fromValue
     * @param  {object} toObj new toValue
     * @param  {object} props : config: [object], reverse [boolean], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFromTo({ val: 0 },{ val: 100 }, { config: { mass: 2 }, reverse: true }).catch((err) => {});
     */
    goFromTo(fromObj, toObj, props = {}) {
        if (this.pauseStatus) return;
        this.useStagger = true;
        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('spring goFromTo:', fromObj, toObj);
            return this.promise;
        }

        const data = goFromTo(fromObj, toObj);
        return this.doAction(data, props, fromObj);
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
        this.useStagger = false;
        const data = set(obj);
        return this.doAction(data, props, obj);
    }

    /**
     * Commen oparation for set/goTo/goFrom/goFromTo
     */
    doAction(data, props, obj) {
        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.values = setReverseValues(obj, this.values);
        this.values = setRelative(this.values, this.relative);

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
        return 'SPRING';
    }

    /**
     * Get uniqueId
     */
    getId() {
        return this.uniqueId;
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
        this.defaultProps = mergeDeep(this.defaultProps, {
            config,
        });
    }

    /**
     * updatePreset - Update config object with new preset
     *
     * @param  {String} preset new preset
     * @return {void}
     *
     */
    updatePreset(preset) {
        if (preset in handleSetUp.get('spring')) {
            this.config = handleSetUp.get('spring')[preset];
        } else {
            console.warn(
                `${preset} doasn't exist in spring configuration list`
            );
        }

        this.defaultProps = mergeDeep(this.defaultProps, {
            config: this.config,
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
