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
import {
    durationIsNumberOrFunctionIsValid,
    easeTweenIsValid,
    easeTweenIsValidGetFunction,
    relativeIsValid,
    valueIsBooleanAndTrue,
} from '../utils/tweenValidation.js';
import { ANIMATION_STOP_REJECT } from '../../events/errorHandler/catchAnimationReject.js';

/**
 * @typedef {Object} tweenCommonSpecialProps
 * @prop {Boolean} [ reverse=false ] Revert tween values
 * @prop {Boolean} [ relative=false ] If set to true each value will be calculated starting from the last used value, by default each value is calculated starting from the value defined in the constructor.
 * @prop {Boolean} [ immediate=false ] (internal use) If set to true the current value is aligned to the target value without launching the rendering callbacks.
 * @prop {Boolean} [ immediateNoPromise=false ] (internal use) If set to true the current value is aligned to the target value without launching the rendering callbacks and without resolve any promise.
 **/

/**
 * @typedef {Object} tweenCommonStopProps
 * @prop {Boolean} clearCache 
    Stop all stagger implemented with subscribeCache methods.
 */

/**
 * @typedef {Object} tweenSpecialProps
 * @prop {(Number|Function)} [ duration=false ] Defines the default duration of the tween, If a function is used, the value is recalculated every time the method is called, especially useful within a timeline, every time a specific step is performed, the duration of the step is recalculated.
 **/

/**
 * @typedef {Object} tweenTypes
 * @prop {Object.<string, number>} data Initial data Object.
 * @prop {Number} [ duration=1000 ] defines the default duration of the tween, the value can be momentarily changed if necessary every time the goTo, goFrom, goFromTo methods are invoked.
 * @prop {Boolean} [ relative=false ] It defines the initial value of the relative properties, the value can be momentarily changed whenever the goTo, goFrom, goFromTo methods are invoked, the default value is false. If set to true each value will be calculated starting from the last used value, by default each value is calculated starting from the value defined in the constructor.
 **/
export default class HandleTween {
    /**
     * @param { tweenTypes & import('../utils/stagger/staggerCostant.js').staggerTypes & import('../tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * const myTween = new HandleTween({
     *   data: Object.<string, number>,
     *   duration: [ Number ],
     *   ease: [ String ],
     *   relative: [ Boolean ]
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *      waitComplete: [ Boolean ],
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```js
     * myTween.set()
     * myTween.goTo()
     * myTween.goFrom()
     * myTween.goFromTo()
     * myTween.subscribe()
     * myTween.subscribeCache()
     * myTween.onComplete()
     * myTween.updateEase()
     * myTween.getId()
     * myTween.get()
     * myTween.getTo()
     * myTween.getFrom()
     * myTween.getToNativeType()
     * myTween.getFromNativeType()
     *
     * ```
     */
    constructor(data = {}) {
        /**
         *  This value lives from user call ( goTo etc..) until next call
         **/

        /**
         * @private
         */
        this.ease = easeTweenIsValidGetFunction(data?.ease);

        /**
         * @private
         */
        this.duration = durationIsNumberOrFunctionIsValid(data?.duration);

        /**
         * @private
         */
        this.relative = relativeIsValid(data?.relative, 'tween');

        /**
         *  end
         **/

        /**
         * @private
         */
        this.stagger = getStaggerFromProps(data);

        /**
         * @private
         */
        this.uniqueId = getUnivoqueId();

        /**
         * @private
         */
        this.isActive = false;

        /**
         * @private
         */
        this.currentResolve = null;

        /**
         * @private
         */
        this.currentReject = null;

        /**
         * @private
         */
        this.promise = null;

        /**
         * @private
         */
        this.values = [];

        /**
         * @private
         */
        this.initialData = [];

        /**
         * @private
         */
        this.callback = [];

        /**
         * @private
         */
        this.callbackCache = [];

        /**
         * @private
         */
        this.callbackOnComplete = [];

        /**
         * @private
         */
        this.callbackStartInPause = [];

        /**
         * @private
         */
        this.unsubscribeCache = [];

        /**
         * @private
         */
        this.pauseStatus = false;

        /**
         * @private
         */
        this.comeFromResume = false;

        /**
         * @private
         */
        this.startTime = null;

        /**
         * @private
         */
        this.isRunning = false;

        /**
         * @private
         */
        this.timeElapsed = 0;

        /**
         * @private
         */
        this.pauseTime = 0;

        /**
         * @private
         */
        this.firstRun = true;

        /**
         * @private
         */
        this.useStagger = true;

        /**
         * @private
         */
        this.fpsInLoading = false;

        /**
        This value is the base value merged with new value in custom prop
        passed form user in goTo etc..
         **/

        /**
         * @private
         */
        this.defaultProps = {
            duration: this.duration,
            ease: easeTweenIsValid(data?.ease),
            relative: this.relative,
            reverse: false,
            immediate: false,
            immediateNoPromise: false,
        };

        /**
        Stagger value
         **/

        /**
         * @private
         */
        this.slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;

        /**
         * @private
         */
        this.fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */

        /**
         * @private
         */
        const props = data?.data || null;
        if (props) this.setData(props);
    }

    /**
     * @private
     * @param {Number} time current global time
     * @param {Boolean} fps current FPS
     * @param {Boolean} res current promise resolve
     **/
    onReuqestAnim(time, _fps, res) {
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

    /**
     * @description
     * Inzialize stagger array
     */
    inzializeStagger() {
        const getStagger = () => {
            const cb = getStaggerArray(this.callbackCache, this.callback);

            if (this.stagger.grid.col > cb.length) {
                staggerIsOutOfRangeWarning(cb.length);
                this.firstRun = false;
                return;
            }

            const {
                staggerArray,
                staggerArrayOnComplete,
                fastestStagger,
                slowlestStagger,
            } = setStagger({
                arr: cb,
                endArr: this.callbackOnComplete,
                stagger: this.stagger,
                slowlestStagger: this.slowlestStagger,
                fastestStagger: this.fastestStagger,
            });

            if (this.callbackCache.length > this.callback.length) {
                this.callbackCache = staggerArray;
            } else {
                this.callback = staggerArray;
            }
            this.callbackOnComplete = staggerArrayOnComplete;
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

    /**
     * @private
     */
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
     * @param {tweenCommonStopProps} Stop props
     *
     * @description
     *
     * Stop tween and fire reject of current promise.
     */
    stop({ clearCache = true } = {}) {
        this.pauseTime = 0;
        this.pauseStatus = false;
        this.comeFromResume = false;
        this.values = setFromToByCurrent(this.values);

        /**
         * If isRunning clear all funture stagger.
         * If tween is ended and the lst stagger is running, let it reach end position.
         */
        if (this.isActive && clearCache)
            this.callbackCache.forEach(({ cb }) => handleCache.clean(cb));

        // Abort promise
        if (this.currentReject) {
            this.currentReject(ANIMATION_STOP_REJECT);
            this.promise = null;
            this.currentReject = null;
            this.currentResolve = null;
        }

        this.isActive = false;
    }

    /**
     * @description
     *
     * Pause the tween
     */
    pause() {
        if (this.pauseStatus) return;
        this.pauseStatus = true;
    }

    /**
     * @description
     *
     * Resume tween in pause
     */
    resume() {
        if (!this.pauseStatus) return;
        this.pauseStatus = false;
        this.comeFromResume = true;
    }

    /**
     * @param {Object.<string, number|function>} obj Initial data structure
     *
     * @description
     * Set initial data structure, the method is call by data prop in constructor. In case of need it can be called after creating the instance
     *
     *
     * @example
     * ```js
     *
     *
     * myTween.setData({ val: 100 });
     * ```
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
     * @description
     * Reset data value with initial
     */
    resetData() {
        this.values = mergeDeep(this.values, this.initialData);
    }

    /**
     * @private
     *
     * @description
     * Reject promise and update form value with current
     *
     */
    updateDataWhileRunning() {
        this.isActive = false;

        // Reject promise
        if (this.currentReject) {
            this.currentReject(ANIMATION_STOP_REJECT);
            this.promise = null;
        }

        this.values.forEach((item) => {
            if (item.shouldUpdate) {
                item.fromValue = item.currentValue;
            }
        });
    }

    /**
     * @private
     *
     * @description
     * Mege special props with default props
     *
     * @param  {Object} props
     * @return {Object} props merged
     *
     */
    mergeProps(props) {
        const newProps = { ...this.defaultProps, ...props };
        const { ease, duration, relative } = newProps;
        this.ease = easeTweenIsValidGetFunction(ease);
        this.relative = relativeIsValid(relative);
        this.duration = durationIsNumberOrFunctionIsValid(duration);
        return newProps;
    }

    /**
     * @param {Object.<string, number|function>} obj to Values
     * @param {tweenSpecialProps & tweenCommonSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special props
     * @returns {Promise} Return a promise which is resolved when tween is over
     *
     * @example
     * ```js
     *
     *
     * myTween.goTo(
     *     { string: ( Number|Function ) },
     *     {
     *         reverse: [ Boolean ],
     *         duration: [ ( Number|Function ) ],
     *         ease: [ String ],
     *         relative: [ Boolean ],
     *         immediate [ Boolean ],
     *         immediateNoPromise: [ Boolean ]
     *     }
     * ).then(() => { ... }).catch(() => { ... });
     *
     *
     * ```
     * @description
       Transform some properties of your choice from the `current value` to the `entered value`.
       The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
       It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
        - duration
        - ease
        - relative
        - reverse
        - immediate (internal use)
        - immediateNoPromise (internal use)
     */
    goTo(obj, props = {}) {
        if (this.pauseStatus || this.comeFromResume) this.stop();
        this.useStagger = true;
        const data = goToUtils(obj);
        return this.doAction(data, props, obj);
    }

    /**
     * @param {Object.<string, number|function>} obj from Values
     * @param {tweenSpecialProps & tweenCommonSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special props
     * @returns {Promise} Return a promise which is resolved when tween is over
     *
     * @example
     * ```js
     *
     *
     * myTween.goFrom(
     *     { string: ( Number|Function ) },
     *     {
     *         reverse: [ Boolean ],
     *         duration: [ ( Number|Function ) ],
     *         ease: [ String ],
     *         relative: [ Boolean ],
     *         immediate [ Boolean ],
     *         immediateNoPromise: [ Boolean ]
     *     }
     * ).then(() => { ... }).catch(() => { ... });
     *
     *
     * ```
     * @description
       Transform some properties of your choice from the `entered value` to the `current value`.
       The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
       It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
        - duration
        - ease
        - relative
        - reverse
        - immediate (internal use)
        - immediateNoPromise (internal use)
     */
    goFrom(obj, props = {}) {
        if (this.pauseStatus || this.comeFromResume) this.stop();
        this.useStagger = true;
        const data = goFromUtils(obj);
        return this.doAction(data, props, obj);
    }

    /**
     * @param {Object.<string, number|function>} fromObj from Values
     * @param {Object.<string, number|function>} toObj to Values
     * @param {tweenSpecialProps & tweenCommonSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special props
     * @returns {Promise} Return a promise which is resolved when tween is over
     *
     * @example
     * ```js
     *
     *
     * myTween.goFromTo(
     *     { string: ( Number|Function ) },
     *     { string: ( Number|Function ) },
     *     {
     *         reverse: [ Boolean ],
     *         duration: [ ( Number|Function ) ],
     *         ease: [ String ],
     *         relative: [ Boolean ],
     *         immediate [ Boolean ],
     *         immediateNoPromise: [ Boolean ]
     *     }
     * ).then(() => { ... }).catch(() => { ... });
     *
     *
     * ```
     * @description
       Transform some properties of your choice from the `first entered value` to the `second entered value`.
       The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
       It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
        - duration
        - ease
        - relative
        - reverse
        - immediate (internal use)
        - immediateNoPromise (internal use)
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
     * @param {Object.<string, number|function>} obj to Values
     * @param {tweenCommonSpecialProps } props special props
     * @returns {Promise} Return a promise which is resolved when tween is over
     *
     * @example
     * ```js
     *
     *
     * myTween.set(
     *     { string: ( Number|Function ) },
     *     {
     *         immediate [ Boolean ],
     *         immediateNoPromise: [ Boolean ]
     *     }
     * ).then(() => { ... }).catch(() => { ... });
     *
     *
     * ```
       Transform some properties of your choice from the `current value` to the `entered value` immediately.
       The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change every time this transformation is called.
       It is possible to associate the special pros to the current transformation, these properties will be valid only in the current transformation.
        - immediate (internal use)
        - immediateNoPromise (internal use)
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
     * @private
     *
     * @param {Object.<string, number|function>} data Updated data
     * @param {tweenSpecialProps & tweenCommonSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special props
     * @param {Object.<string, number|function>} obj new data obj come from set/goTo/goFrom/goFromTo
     * @returns {Promise} Return a promise which is resolved when tween is over
     *
     * @description
     * Common oparation for set/goTo/goFrom/goFromTo methods.
     * It is the method that updates the internal store
     */
    doAction(data, props, obj) {
        this.values = mergeArrayTween(data, this.values);
        if (this.isActive) this.updateDataWhileRunning();

        const { reverse, immediate, immediateNoPromise } =
            this.mergeProps(props);

        if (valueIsBooleanAndTrue(reverse))
            this.value = setReverseValues(obj, this.values);

        this.values = setRelativeTween(this.values, this.relative);

        if (valueIsBooleanAndTrue(immediate)) {
            this.isActive = false;
            this.values = setFromCurrentByTo(this.values);
            return new Promise((res) => res());
        }

        if (valueIsBooleanAndTrue(immediateNoPromise)) {
            this.isActive = false;
            this.values = setFromCurrentByTo(this.values);
            return;
        }

        if (!this.isActive) {
            this.promise = new Promise((res, reject) => {
                this.startRaf(res, reject);
            });
        }

        return this.promise;
    }

    /**
     * @description
     * Get current values, If the single value is a function it returns the result of the function.
     *
     * @return {Object} current value obj.
     *
     * @example
     * ```js
     *
     *
     * const { prop } = myTween.get();
     * ```
     */
    get() {
        return getValueObj(this.values, 'currentValue');
    }

    /**
     * @description
     * Get initial values, If the single value is a function it returns the result of the function.
     *
     * @return {Object} initial value obj.
     *
     * @example
     * ```js
     *
     *
     * const { prop } = myTween.getIntialData();
     * ```
     */
    getInitialData() {
        return getValueObj(this.initialData, 'currentValue');
    }

    /**
     * @description
     * Get from values, If the single value is a function it returns the result of the function.
     *
     * @return {Object} from value obj.
     *
     * @example
     * ```js
     *
     *
     * const { prop } = myTween.getFrom();
     * ```
     */
    getFrom() {
        return getValueObj(this.values, 'fromValue');
    }

    /**
     * @description
     * Get to values, If the single value is a function it returns the result of the function.
     *
     * @return {Object} to value obj.
     *
     * @example
     * ```js
     *
     *
     * const { prop } = myTween.getTo();
     * ```
     */
    getTo() {
        return getValueObj(this.values, 'toValue');
    }

    /**
     * @description
     * Get From values, if the single value is a function it returns the same function.
     *
     * @return {Object} from value obj.
     *
     * @example
     * ```js
     *
     *
     * const { prop } = myTween.getFromNativeType();
     * ```
     */
    getFromNativeType() {
        return getValueObjFromNative(this.values);
    }

    /**
     * @description
     * Get To values, if the single value is a function it returns the same function.
     *
     * @return {Object} to value obj.
     *
     * @example
     * ```js
     *
     *
     * const { prop } = myTween.getToNativeType();
     * ```
     */
    getToNativeType() {
        return getValueObjToNative(this.values);
    }

    /**
     * @description
     * Get tween type
     *
     * @return {string} tween type
     *
     * @example
     * ```js
     *
     *
     * const type = myTween.getType();
     * ```
     */
    getType() {
        return 'TWEEN';
    }

    /**
     * @description
     * Get univoque Id
     *
     * @return {string} Univoque Id
     *
     * @example
     * ```js
     *
     *
     * const type = myTween.getId();
     * ```
     */
    getId() {
        return this.uniqueId;
    }

    /**
     * Update ease with new preset
     *
     * @param { import('../tween/tweenConfig.js').easeStringTypes } ease
     *
     */
    updateEase(ease) {
        this.ease = easeTweenIsValidGetFunction(ease);
        this.defaultProps = mergeDeep(this.defaultProps, {
            ease,
        });
    }

    /**
     * @param {import('../utils/callbacks/setCallback.js').subscribeCallbackType} cb - callback function.
     * @return {Function} unsubscribe callback.
     *
     * @example
     * ```js
     * //Single DOM element
     * const unsubscribe = myTween.subscribe(({ x,y... }) => {
     *      domEl.style.prop = `...`
     * })
     * unsubscribe()
     *
     *
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return myTween.subscribe(({ x, y... }) => {
     *       item.style.prop = ...
     *   });
     * });
     * unsubscribeStagger.forEach((item) => item());
     *
     *
     * ```
     * @description
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is advisable to use the subscribeCache method .
     */
    subscribe(cb) {
        const unsubscribeCb = setCallBack(cb, this.callback);
        return () => (this.callback = unsubscribeCb(this.callback));
    }

    /**
     * Support callback to asyncTimeline.
     * Callback to manage the departure of tweens in a timeline. If a delay is applied to the tween and before the delay ends the timeline pauses the tween at the end of the delay will automatically pause.
     * Add callback to start in pause to stack
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
     * @param {import('../utils/callbacks/setCallback.js').subscribeCallbackType} cb - callback function.
     * @return {Function} unsubscribe callback.
     *
     * @example
     * ```js
     * //Single DOM element
     * const unsubscribe = myTween.onComplete(({ x,y... }) => {
     *      domEl.style.prop = `...`
     * })
     * unsubscribe()
     *
     *
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return myTween.onComplete(({ x, y... }) => {
     *       item.style.prop = ...
     *   });
     * });
     * unsubscribeStagger.forEach((item) => item());
     *
     *
     * ```
     * @description
     * Similar to subscribe this callBack is launched when the data calculation stops (when the timeline ends or the scroll trigger is inactive).
     * Useful for applying a different style to an inactive element.
     * A typical example is to remove the teansform3D property:
     *
     * @example
     * ```js
     * // Use transform3D while item is active
     * myTween.subscribe(({x}) => {
     *      domEl.style.transform = ` transform3D(0,0,0) translateX(${x}px)`
     * })
     *
     * // Remove transform3D when item is inactive
     * myTween.onComplete(({x}) => {
     *      domEl.style.transform = `translateX(${x}px)`
     * })
     * ```
     */
    onComplete(cb) {
        const unsubscribeCb = setCallBack(cb, this.callbackOnComplete);
        return () =>
            (this.callbackOnComplete = unsubscribeCb(this.callbackOnComplete));
    }

    /**
     * @param {('Object'|'HTMLElement')} item
     * @param {import('../utils/callbacks/setCallback.js').subscribeCallbackType} fn - callback function.
     * @return {Function} unsubscribe callback
     *
     * @example
     *```js
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return myTween.subscribeCache(item, ({ x, y... }) => {
     *       item.style.prop = ...
     *   });
     * });
     * unsubscribeStagger.forEach((item) => item());
     *
     *
     * ```
     * @description
     * Callback that returns updated values ready to be usable, specific to manage large staggers.
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
     * @description
     * Destroy tween
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
