// @ts-check

import { compareKeys } from '../utils/animationUtils.js';
import {
    setFromByCurrent,
    setFromCurrentByTo,
    setFromToByCurrent,
    setReverseValues,
    setRelative,
} from '../utils/tweenAction/setValues.js';
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
    updateSubScribers,
    updateSubscribersCache,
} from '../utils/callbacks/setCallback.js';
import {
    goToUtils,
    goFromUtils,
    goFromToUtils,
    setUtils,
} from '../utils/tweenAction/actions.js';
import { initRaf } from '../utils/initRaf.js';
import {
    compareKeysWarning,
    staggerIsOutOfRangeWarning,
} from '../utils/warning.js';
import { fpsLoadedLog } from '../utils/fpsLogInizialization.js';
import {
    lerpPrecisionIsValid,
    lerpVelocityIsValid,
    relativeIsValid,
    valueIsBooleanAndTrue,
} from '../utils/tweenAction/tweenValidation.js';
import { mobCore } from '../../../mobCore/index.js';
import { shouldInizializzeStagger } from '../utils/stagger/shouldInizialize.js';
import { resume } from '../utils/resumeTween.js';
import {
    getValueObj,
    getValueObjFromNative,
    getValueObjToNative,
} from '../utils/tweenAction/getValues.js';
import { mergeArray } from '../utils/tweenAction/mergeArray.js';
import { lerpGetValuesOnDraw } from './getValuesOnDraw.js';

export default class HandleLerp {
    /**
     * @type {import('../utils/stagger/type.js').StaggerObject}
     */
    #stagger;

    /**
     * @type {boolean}
     */
    #relative;

    /**
     * @type {number}
     */
    #velocity;

    /**
     * @type {number}
     */
    #precision;

    /**
     * @type {string}
     */
    #uniqueId;

    /**
     * @type {boolean}
     */
    #isActive;

    /**
     * @type{((value:any) => void)|undefined }
     */
    #currentResolve;

    /**
     * @type{((value:any) => void)|undefined}
     */
    #currentReject;

    /**
     * @type{Promise<void>|undefined}
     */
    #promise;

    /**
     * @type {import('./type.js').lerpValues[]|[]}
     */
    #values;

    /**
     * @type {import('./type.js').lerpInitialData[]}
     */
    #initialData;

    /**
     * @type {import('../utils/callbacks/type.js').CallbackObject<(arg0:Record<string, number>) => void>[]}
     */
    #callback;

    /**
     * @type {import('../utils/callbacks/type.js').CallbackObject<string>[]}
     */
    #callbackCache;

    /**
     * @type {import('../utils/callbacks/type.js').CallbackObject<(arg0:Record<string, number>) => void>[]}
     */
    #callbackOnComplete;

    /**
     * @type {{ cb: () => boolean }[]}
     */
    #callbackStartInPause;

    /**
     * @type {Array<() => void>}
     */
    #unsubscribeCache;

    /**
     * @type {boolean}
     */
    #pauseStatus;

    /**
     * @type {boolean}
     */
    #firstRun;

    /**
     * @type {boolean}
     */
    #useStagger;

    /**
     * @type {boolean}
     */
    #fpsInLoading;

    /**
     * @description
     * This value is the base value merged with new value in custom prop
     * passed form user in goTo etc..
     *
     * @type {import('./type.js').lerpDefault}
     **/
    #defaultProps;

    /**
     * @type {import('../utils/stagger/type.js').StaggerFrameIndexObject}
     **/
    #slowlestStagger;

    /**
     * @type {import('../utils/stagger/type.js').StaggerFrameIndexObject}
     */
    #fastestStagger;

    /**
     * @param {import('./type.js').lerpTweenProps} [ data ]
     *
     * @example
     * ```javascript
     * const myLerp = new HandleLerp({
     *   data: Object.<string, number>,
     *   precision: Number,
     *   velocity: Number,
     *   relative: Boolean
     *   stagger:{
     *      each: Number,
     *      from: Number|String|{x:number,y:number},
     *      grid: {
     *          col: Number,
     *          row: Number,
     *          direction: String,
     *      },
     *      waitComplete: Boolean,
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```javascript
     * myLerp.set()
     * myLerp.goTo()
     * myLerp.goFrom()
     * myLerp.goFromTo()
     * myLerp.subscribe()
     * myLerp.subscribeCache()
     * myLerp.onComplete()
     * myLerp.updateVelocity()
     * myLerp.updatePrecision()
     * myLerp.getId()
     * myLerp.get()
     * myLerp.getTo()
     * myLerp.getFrom()
     * myLerp.getToNativeType()
     * myLerp.getFromNativeType()
     *
     * ```
     */
    constructor(data) {
        this.#stagger = getStaggerFromProps(data ?? {});
        this.#relative = relativeIsValid(data?.relative, 'lerp');
        this.#velocity = lerpVelocityIsValid(data?.velocity);
        this.#precision = lerpPrecisionIsValid(data?.precision);
        this.#uniqueId = mobCore.getUnivoqueId();
        this.#isActive = false;
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
        this.#promise = undefined;
        this.#values = [];
        this.#initialData = [];
        this.#callback = [];
        this.#callbackCache = [];
        this.#callbackOnComplete = [];
        this.#callbackStartInPause = [];
        this.#unsubscribeCache = [];
        this.#pauseStatus = false;
        this.#firstRun = true;
        this.#useStagger = true;
        this.#fpsInLoading = false;
        this.#defaultProps = {
            reverse: false,
            velocity: this.#velocity,
            precision: this.#precision,
            relative: this.#relative,
            immediate: false,
        };
        this.#slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;
        this.#fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.data;
        if (props) this.setData(props);
    }

    /**
     * @param {number} _time
     * @param {number} fps
     * @param {(value:any) => void} res
     *
     * @returns {void}
     */
    #draw(_time, fps, res = () => {}) {
        this.#isActive = true;

        // Update values.
        this.#values = lerpGetValuesOnDraw({
            values: this.#values,
            fps,
            velocity: this.#velocity,
            precision: this.#precision,
        });

        // Prepare an obj to pass to the callback.
        const callBackObject = getValueObj(this.#values, 'currentValue');

        defaultCallback({
            stagger: this.#stagger,
            callback: this.#callback,
            callbackCache: this.#callbackCache,
            callBackObject: callBackObject,
            useStagger: this.#useStagger,
        });

        // Check if all values is completed.
        const allSettled = this.#values.every((item) => item.settled === true);

        if (allSettled) {
            const onComplete = () => {
                this.#isActive = false;

                /**
                 * End of animation
                 * Set fromValue with ended value
                 * At the next call fromValue become the start value
                 */
                this.#values = [...this.#values].map((item) => {
                    return { ...item, fromValue: item.toValue };
                });

                // On complete
                if (!this.#pauseStatus) {
                    res(true);

                    // Set promise reference to null once resolved
                    this.#promise = undefined;
                    this.#currentReject = undefined;
                    this.#currentResolve = undefined;
                }
            };

            // Prepare an obj to pass to the callback with rounded value ( end user value)
            const cbObjectSettled = getValueObj(this.#values, 'toValue');

            defaultCallbackOnComplete({
                onComplete,
                callback: this.#callback,
                callbackCache: this.#callbackCache,
                callbackOnComplete: this.#callbackOnComplete,
                callBackObject: cbObjectSettled,
                stagger: this.#stagger,
                slowlestStagger: this.#slowlestStagger,
                fastestStagger: this.#fastestStagger,
                useStagger: this.#useStagger,
            });

            return;
        }

        mobCore.useFrame(() => {
            mobCore.useNextTick(({ time, fps }) => {
                if (this.#isActive) this.#draw(time, fps, res);
            });
        });
    }

    /**
     * @param {number} time current global time
     * @param {number} fps current FPS
     * @param {(value:any) => void} res current promise resolve
     **/
    #onReuqestAnim(time, fps, res) {
        this.#values = [...this.#values].map((item) => {
            return { ...item, currentValue: item.fromValue };
        });

        this.#draw(time, fps, res);
    }

    /**
     * @description
     * Inzialize stagger array
     *
     * @returns {Promise<any>}
     */
    async #inzializeStagger() {
        /**
         * First time il there is a stagger load fps then go next step
         * next time no need to calcaulte stagger and jump directly next step
         *
         **/
        if (
            shouldInizializzeStagger(
                this.#stagger.each,
                this.#firstRun,
                this.#callbackCache,
                this.#callback
            )
        ) {
            const { averageFPS } = await mobCore.useFps();

            fpsLoadedLog('lerp', averageFPS);
            const cb = getStaggerArray(this.#callbackCache, this.#callback);

            if (this.#stagger.grid.col > cb.length) {
                staggerIsOutOfRangeWarning(cb.length);
                this.#firstRun = false;
                return;
            }

            const {
                staggerArray,
                staggerArrayOnComplete,
                fastestStagger,
                slowlestStagger,
            } = setStagger({
                arrayDefault: cb,
                arrayOnStop: this.#callbackOnComplete,
                stagger: this.#stagger,
                slowlestStagger: this.#slowlestStagger,
                fastestStagger: this.#fastestStagger,
            });

            if (this.#callbackCache.length > this.#callback.length) {
                this.#callbackCache =
                    /** @type{import('../utils/callbacks/type.js').CallbackObject<string>[]} */ (
                        staggerArray
                    );
            } else {
                this.#callback =
                    /** @type {import('../utils/callbacks/type.js').CallbackObject<(arg0: Record<string, number>) => void>[]} */ (
                        staggerArray
                    );
            }

            this.#callbackOnComplete = staggerArrayOnComplete;
            this.#slowlestStagger = slowlestStagger;
            this.#fastestStagger = fastestStagger;
            this.#firstRun = false;
        }

        return { ready: true };
    }

    /**
     * @param {(arg0: any) => void} res
     * @param {(value: any) => void} reject
     *
     * @returns {Promise<any>}
     */
    async #startRaf(res, reject) {
        if (this.#fpsInLoading) return;
        this.#currentResolve = res;
        this.#currentReject = reject;

        if (this.#firstRun) {
            this.#fpsInLoading = true;
            await this.#inzializeStagger();
            this.#fpsInLoading = false;
        }

        initRaf(
            this.#callbackStartInPause,
            this.#onReuqestAnim.bind(this),
            this.pause.bind(this),
            res
        );
    }

    /**
     * @type {import('./type.js').lerpStop}
     */
    stop({ clearCache = true } = {}) {
        if (this.#pauseStatus) this.#pauseStatus = false;
        this.#values = setFromToByCurrent(this.#values);

        /**
         * If isRunning clear all funture stagger.
         * If tween is ended and the lst stagger is running, let it reach end position.
         */
        if (this.#isActive && clearCache)
            this.#callbackCache.forEach(({ cb }) => mobCore.useCache.clean(cb));

        // Reject promise
        if (this.#currentReject) {
            this.#currentReject(mobCore.ANIMATION_STOP_REJECT);
            this.#promise = undefined;
            this.#currentReject = undefined;
            this.#currentResolve = undefined;
        }

        // Reset RAF
        if (this.#isActive) this.#isActive = false;
    }

    /**
     * @type {import('./type.js').lerpPause}
     */
    pause() {
        if (this.#pauseStatus) return;
        this.#pauseStatus = true;
        if (this.#isActive) this.#isActive = false;
        this.#values = setFromByCurrent(this.#values);
    }

    /**
     * @type {import('./type.js').lerpResume}
     */
    resume() {
        if (!this.#pauseStatus) return;
        this.#pauseStatus = false;

        if (!this.#isActive && this.#currentResolve) {
            resume(this.#onReuqestAnim.bind(this), this.#currentResolve);
        }
    }

    /**
     * @type {import('../../utils/type.js').SetData}
     *
     * @description
     * Set initial data structure, the method is call by data prop in constructor. In case of need it can be called after creating the instance
     */
    setData(obj) {
        this.#values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                fromValue: value,
                currentValue: value,
                fromFn: () => 0,
                fromIsFn: false,
                toFn: () => 0,
                toIsFn: false,
                settled: false,
            };
        });

        this.#initialData = this.#values.map((item) => {
            return {
                prop: item.prop,
                toValue: item.toValue,
                fromValue: item.fromValue,
                currentValue: item.currentValue,
            };
        });
    }

    /**
     * @type {import('./type.js').lerpResetData}
     */
    resetData() {
        this.#values = mergeDeep(this.#values, this.#initialData);
    }

    /**
     * @type  {import('./type.js').lerpMergeProps}
     */
    #mergeProps(props) {
        const newProps = { ...this.#defaultProps, ...props };
        const { velocity, precision, relative } = newProps;
        this.#relative = relativeIsValid(relative, 'lerp');
        this.#velocity = lerpVelocityIsValid(velocity);
        this.#precision = lerpPrecisionIsValid(precision);

        return newProps;
    }

    /**
     * @type {import('../../utils/type.js').GoTo<import('./type.js').lerpActions>} obj to Values
     */
    goTo(obj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);

        this.#useStagger = true;
        const data = goToUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type.js').GoFrom<import('./type.js').lerpActions>} obj to Values
     */
    goFrom(obj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);

        this.#useStagger = true;
        const data = goFromUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type.js').GoFromTo<import('./type.js').lerpActions>} obj to Values
     */
    goFromTo(fromObj, toObj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);

        this.#useStagger = true;

        // Check if fromObj has the same keys of toObj
        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('lerp goFromTo:', fromObj, toObj);
            return new Promise((resolve) => resolve);
        }

        const data = goFromToUtils(fromObj, toObj);

        return this.#doAction(data, props, fromObj);
    }

    /**
     * @type {import('../../utils/type.js').Set<import('./type.js').lerpActions>} obj to Values
     */
    set(obj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);
        this.#useStagger = false;
        const data = setUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type.js').SetImmediate<import('./type.js').lerpActions>} obj to Values
     */
    setImmediate(obj, props = {}) {
        if (this.#pauseStatus) return;
        this.#useStagger = false;

        const data = setUtils(obj);
        this.#values = mergeArray(data, this.#values);

        const { reverse } = this.#mergeProps(props ?? {});
        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(obj, this.#values);

        this.#values = setRelative(this.#values, this.#relative);
        this.#values = setFromCurrentByTo(this.#values);

        this.#isActive = false;
        return;
    }

    /**
     * @type {import('../../utils/type.js').DoAction<import('./type.js').lerpActions>} obj to Values
     */
    #doAction(data, props, obj) {
        this.#values = mergeArray(data, this.#values);
        const { reverse, immediate } = this.#mergeProps(props ?? {});

        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(obj, this.#values);

        this.#values = setRelative(this.#values, this.#relative);

        if (valueIsBooleanAndTrue(immediate, 'immediate ')) {
            this.#isActive = false;
            this.#values = setFromCurrentByTo(this.#values);
            return Promise.resolve();
        }

        if (!this.#isActive) {
            this.#promise = new Promise((res, reject) => {
                this.#startRaf(res, reject);
            });
        }

        if (this.#promise) return this.#promise;

        // fallback
        return Promise.resolve();
    }

    /**
     * @description
     * Get current values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type.js').lerpGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myLerp.get();
     * ```
     */
    get() {
        return getValueObj(this.#values, 'currentValue');
    }

    /**
     * @description
     * Get initial values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type.js').lerpGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myLerp.getIntialData();
     * ```
     */
    getInitialData() {
        return getValueObj(this.#initialData, 'currentValue');
    }

    /**
     * @description
     * Get from values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type.js').lerpGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myLerp.getFrom();
     * ```
     */
    getFrom() {
        return getValueObj(this.#values, 'fromValue');
    }

    /**
     * @description
     * Get to values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type.js').lerpGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myLerp.getTo();
     * ```
     */
    getTo() {
        return getValueObj(this.#values, 'toValue');
    }

    /**
     * @description
     * Get From values, if the single value is a function it returns the same function.
     *
     * @type {import('./type.js').lerpGetValueNative}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myLerp.getFromNativeType();
     * ```
     */
    getFromNativeType() {
        return getValueObjFromNative(this.#values);
    }

    /**
     * @description
     * Get To values, if the single value is a function it returns the same function.
     *
     * @type {import('./type.js').lerpGetValueNative}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myLerp.getToNativeType();
     * ```
     */
    getToNativeType() {
        return getValueObjToNative(this.#values);
    }

    /**
     * @description
     * Get tween type
     *
     * @type {import('./type.js').lerpGetType} tween type
     *
     * @example
     * ```javascript
     *
     *
     * const type = myLerp.getType();
     * ```
     */
    getType() {
        return 'LERP';
    }

    /**
     * @description
     * Get univoque Id
     *
     * @type {import('./type.js').lerpGetId}
     *
     * @example
     * ```javascript
     *
     *
     * const type = myLerp.getId();
     * ```
     */
    getId() {
        return this.#uniqueId;
    }

    /**
     * @type  {import('./type.js').lerpUpdateVelocity} 
     *
     * @example
     * ```javascript
     * myLerp.updateVelocity(0.1)
     *
     *
     * ```
     *
     * @description
     * Update velocity value.
       `default value is 0.06`,the closer the value is to 1, the faster the transition will be.
        The change will be persistent
     */
    updateVelocity(velocity) {
        this.#velocity = lerpVelocityIsValid(velocity);
        this.#defaultProps = mergeDeep(this.#defaultProps, {
            velocity: this.#velocity,
        });
    }

    /**
     * @type  {import('./type.js').lerpUpdatePrecision} 
     *
     * @example
     * ```javascript
     * myLerp.updatePrecision(0.5)
     *
     *
     * ```
     *
     * @description
     * Update precision value.
       When the calculated value is less than this number, the transition will be considered completed, the smaller the value, the greater the precision of the calculation, the `default value is 0.01`.
       The change will be persistent
     */
    updatePrecision(precision) {
        this.#velocity = lerpPrecisionIsValid(precision);
        this.#defaultProps = mergeDeep(this.#defaultProps, {
            precision: this.#precision,
        });
    }

    /**
     * @type {import('./type.js').lerpSubscribe}
     *
     * ```
     * @description
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is advisable to use the subscribeCache method .
     */
    subscribe(cb) {
        const { arrayOfCallbackUpdated, unsubscribeCb } = updateSubScribers(
            cb,
            this.#callback
        );
        this.#callback = arrayOfCallbackUpdated;
        return () => (this.#callback = unsubscribeCb(this.#callback));
    }

    /**
     * @type {import('./type.js').lerpSubscribeCache}
     *
     * @description
     * Callback that returns updated values ready to be usable, specific to manage large staggers.
     */
    subscribeCache(item, fn) {
        const { arrayOfCallbackUpdated, unsubscribeCb, unsubscribeCache } =
            updateSubscribersCache(
                item,
                fn,
                this.#callbackCache,
                this.#unsubscribeCache
            );

        this.#callbackCache = arrayOfCallbackUpdated;
        this.#unsubscribeCache = unsubscribeCache;
        return () => (this.#callbackCache = unsubscribeCb(this.#callbackCache));
    }

    /**
     * Support callback to asyncTimeline.
     * Callback to manage the departure of tweens in a timeline. If a delay is applied to the tween and before the delay ends the timeline pauses the tween at the end of the delay will automatically pause.
     * Add callback to start in pause to stack
     *
     * @param  {() => boolean} cb cal function
     * @return {() => void} unsubscribe callback
     *
     */
    onStartInPause(cb) {
        const arrayOfCallbackUpdated = [...this.#callbackStartInPause, { cb }];
        this.#callbackStartInPause = arrayOfCallbackUpdated;

        return () => (this.#callbackStartInPause = []);
    }

    /**
     * @type {import('./type.js').lerpOnComplete}
     *
     *
     * @description
     *  Similar to subscribe this callBack is launched when the data calculation stops (when the timeline ends or the scroll trigger is inactive).
     *  Useful for applying a different style to an inactive element.
     *  A typical example is to remove the teansform3D property:
     **/
    onComplete(cb) {
        const { arrayOfCallbackUpdated, unsubscribeCb } = updateSubScribers(
            cb,
            this.#callbackOnComplete
        );
        this.#callbackOnComplete = arrayOfCallbackUpdated;

        return () =>
            (this.#callbackOnComplete = unsubscribeCb(
                this.#callbackOnComplete
            ));
    }

    /**
     * @description
     * Destroy tween
     */
    destroy() {
        if (this.#promise) this.stop();
        this.#callbackOnComplete = [];
        this.#callbackStartInPause = [];
        this.#callback = [];
        this.#callbackCache = [];
        this.#values = [];
        this.#promise = undefined;
        this.#unsubscribeCache.forEach((unsubscribe) => unsubscribe());
        this.#unsubscribeCache = [];
    }
}
