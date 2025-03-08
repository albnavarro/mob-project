// @ts-check

import { compareKeys } from '../utils/animationUtils.js';
import {
    setFromCurrentByTo,
    setFromToByCurrent,
    setReverseValues,
    setRelativeTween,
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
    durationIsNumberOrFunctionIsValid,
    easeTweenIsValid,
    easeTweenIsValidGetFunction,
    relativeIsValid,
    valueIsBooleanAndTrue,
} from '../utils/tweenAction/tweenValidation.js';
import { mobCore } from '../../../mobCore/index.js';
import { shouldInizializzeStagger } from '../utils/stagger/shouldInizialize.js';
import { mergeArrayTween } from '../utils/tweenAction/mergeArray.js';
import {
    getValueObj,
    getValueObjFromNative,
    getValueObjToNative,
} from '../utils/tweenAction/getValues.js';
import { tweenGetValueOnDraw } from './getValuesOnDraw.js';

export default class MobTween {
    /**
     * @type {Function}
     *  This value lives from user call ( goTo etc..) until next call
     */
    #ease;

    /**
     * @type {number}
     */
    #duration;

    /**
     * @type {boolean}
     */
    #relative;

    /**
     * @type {import('../utils/stagger/type').StaggerObject}
     */
    #stagger;

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
    #currentReject;

    /**
     * @type{Promise<void>|undefined}
     */
    #promise;

    /**
     * @type {import('./type').TweenStoreData[]}
     */
    #values;

    /**
     * @type {import('./type').TweenInitialData[]}
     */
    #initialData;

    /**
     * @type {import('../utils/callbacks/type').CallbackDefault}
     */
    #callback;

    /**
     * @type {import('../utils/callbacks/type').CallbackCache}
     */
    #callbackCache;

    /**
     * @type {import('../utils/callbacks/type').CallbackDefault}
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
    #comeFromResume;

    /**
     * @type {number}
     */
    #startTime;

    /**
     * @type {boolean}
     */
    #isRunning;

    /**
     * @type {number}
     */
    #timeElapsed;

    /**
     * @type {number}
     */
    #pauseTime;

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
     * @type{import('./type').TweenDefault}
     */
    #defaultProps;

    /**
     * @type {import('../utils/stagger/type').StaggerFrameIndexObject}
     */
    #slowlestStagger;

    /**
     * @type {import('../utils/stagger/type').StaggerFrameIndexObject}
     */
    #fastestStagger;

    /**
     * @param {import('./type').TweenProps} [ data ]
     *
     * @example
     * ```javascript
     * const myTween = new HandleTween({
     *   data: Object.<string, number>,
     *   duration: Number,
     *   ease: String,
     *   relative: Boolean
     *   stagger:{
     *      each: Number,
     *      from: Number|String|{x:number,y:number},
     *      grid: {
     *          col: Number,
     *          row: Number,
     *          direction: String
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
    constructor(data) {
        this.#ease = easeTweenIsValidGetFunction(data?.ease);
        this.#duration = durationIsNumberOrFunctionIsValid(data?.duration);
        this.#relative = relativeIsValid(data?.relative, 'tween');
        this.#stagger = getStaggerFromProps(data ?? {});
        this.#uniqueId = mobCore.getUnivoqueId();
        this.#isActive = false;
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
        this.#comeFromResume = false;
        this.#startTime = 0;
        this.#isRunning = false;
        this.#timeElapsed = 0;
        this.#pauseTime = 0;
        this.#firstRun = true;
        this.#useStagger = true;
        this.#fpsInLoading = false;
        this.#defaultProps = {
            duration: this.#duration,
            ease: easeTweenIsValid(data?.ease),
            relative: this.#relative,
            reverse: false,
            immediate: false,
        };
        this.#slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;
        this.#fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;

        const props = data?.data;
        if (props) this.setData(props);
    }

    /**
     * @param {number} time
     * @param {Function} res
     *
     * @returns {void}
     */
    #draw(time, res = () => {}) {
        this.#isActive = true;

        if (this.#pauseStatus) {
            this.#pauseTime = time - this.#startTime - this.#timeElapsed;
        }
        this.#timeElapsed = time - this.#startTime - this.#pauseTime;

        if (
            this.#isRunning &&
            Math.round(this.#timeElapsed) >= this.#duration
        ) {
            this.#timeElapsed = this.#duration;
        }

        this.#values = tweenGetValueOnDraw({
            values: this.#values,
            timeElapsed: this.#timeElapsed,
            duration: this.#duration,
            ease: this.#ease,
        });

        const isSettled = Math.round(this.#timeElapsed) === this.#duration;

        // Prepare an obj to pass to the callback
        const callBackObject = getValueObj(this.#values, 'currentValue');

        defaultCallback({
            stagger: this.#stagger,
            callback: this.#callback,
            callbackCache: this.#callbackCache,
            callBackObject: callBackObject,
            useStagger: this.#useStagger,
        });

        this.#isRunning = true;

        if (isSettled) {
            const onComplete = () => {
                this.#isActive = false;
                this.#isRunning = false;
                this.#pauseTime = 0;

                /**
                 * End of animation
                 * Set fromValue with ended value
                 * At the next call fromValue become the start value
                 */
                this.#values = [...this.#values].map((item) => {
                    if (!item.shouldUpdate) return item;

                    return {
                        ...item,
                        toValue: item.currentValue,
                        fromValue: item.currentValue,
                    };
                });

                // On complete
                if (!this.#pauseStatus) {
                    res();

                    // Set promise reference to null once resolved
                    this.#promise = undefined;
                    this.#currentReject = undefined;
                }
            };

            defaultCallbackOnComplete({
                onComplete,
                callback: this.#callback,
                callbackCache: this.#callbackCache,
                callbackOnComplete: this.#callbackOnComplete,
                callBackObject: callBackObject,
                stagger: this.#stagger,
                slowlestStagger: this.#slowlestStagger,
                fastestStagger: this.#fastestStagger,
                useStagger: this.#useStagger,
            });

            return;
        }

        mobCore.useFrame(() => {
            mobCore.useNextTick(({ time }) => {
                if (this.#isActive) this.#draw(time, res);
            });
        });
    }

    /**
     * @param {number} time current global time
     * @param {number} fps current FPS
     * @param {Function} res current promise resolve
     *
     * @returns {void}
     **/
    #onReuqestAnim(time, fps, res) {
        this.#startTime = time;
        this.#draw(time, res);
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
         * next time no need to calculate stagger and jump directly next step
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

            fpsLoadedLog('tween', averageFPS);
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
                    /** @type{import('../utils/callbacks/type').CallbackCache} */ (
                        staggerArray
                    );
            } else {
                this.#callback =
                    /** @type {import('../utils/callbacks/type').CallbackDefault} */ (
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
     * @param {(value:any) => void} res
     * @param {(value:any) => void} reject
     *
     * @returns {Promise<any>}
     */
    async #startRaf(res, reject) {
        if (this.#fpsInLoading) return;
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
     * @type {import('./type').TweenStop}
     */
    stop({ clearCache = true } = {}) {
        this.#pauseTime = 0;
        this.#pauseStatus = false;
        this.#comeFromResume = false;
        this.#values = setFromToByCurrent(this.#values);

        /**
         * If isRunning clear all funture stagger.
         * If tween is ended and the lst stagger is running, let it reach end position.
         */
        if (this.#isActive && clearCache)
            this.#callbackCache.forEach(({ cb }) => mobCore.useCache.clean(cb));

        // Abort promise
        if (this.#currentReject) {
            this.#currentReject(mobCore.ANIMATION_STOP_REJECT);
            this.#promise = undefined;
            this.#currentReject = undefined;
        }

        this.#isActive = false;
    }

    /**
     * @type {import('./type').TweenPause}
     */
    pause() {
        if (this.#pauseStatus) return;
        this.#pauseStatus = true;
    }

    /**
     * @type {import('./type').TweenResume}
     */
    resume() {
        if (!this.#pauseStatus) return;
        this.#pauseStatus = false;
        this.#comeFromResume = true;
    }

    /**
     * @type {import('../../utils/type').SetData}
     */
    setData(obj) {
        this.#values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                toValueOnPause: value,
                toValProcessed: value,
                fromValue: value,
                currentValue: value,
                shouldUpdate: false,
                fromFn: () => 0,
                fromIsFn: false,
                toFn: () => 0,
                toIsFn: false,
                settled: false, // not used, only for uniformity with lerp and spring
            };
        });

        this.#initialData = this.#values.map((item) => {
            return {
                prop: item.prop,
                toValue: item.toValue,
                fromValue: item.fromValue,
                currentValue: item.currentValue,
                shouldUpdate: false,
                fromFn: () => 0,
                fromIsFn: false,
                toFn: () => 0,
                toIsFn: false,
                settled: false, // not used, only for uniformity with lerp and spring
            };
        });
    }

    /**
     * @type {import('./type').TweenResetData}
     */
    resetData() {
        this.#values = mergeDeep(this.#values, this.#initialData);
    }

    /**
     * @description
     * Reject promise and update form value with current
     *
     * @returns {void}
     */
    #updateDataWhileRunning() {
        this.#isActive = false;

        // Reject promise
        if (this.#currentReject) {
            this.#currentReject(mobCore.ANIMATION_STOP_REJECT);
            this.#promise = undefined;
        }

        this.#values = [...this.#values].map((item) => {
            if (!item.shouldUpdate) return item;

            return {
                ...item,
                fromValue: item.currentValue,
            };
        });
    }

    /**
     * @type  {import('./type').TweenMergeProps}
     *
     * @description
     * Merge special props with default props
     *
     */
    #mergeProps(props) {
        const newProps = { ...this.#defaultProps, ...props };
        const { ease, duration, relative } = newProps;
        this.#ease = easeTweenIsValidGetFunction(ease);
        this.#relative = relativeIsValid(relative, 'tween');
        this.#duration = durationIsNumberOrFunctionIsValid(duration);
        return newProps;
    }

    /**
     * @type {import('../../utils/type').GoTo<import('./type').TweenAction>} obj to Values
     */
    goTo(obj, props = {}) {
        if (this.#pauseStatus || this.#comeFromResume) this.stop();
        this.#useStagger = true;
        const data = goToUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type').GoFrom<import('./type').TweenAction>} obj to Values
     */
    goFrom(obj, props = {}) {
        if (this.#pauseStatus || this.#comeFromResume) this.stop();
        this.#useStagger = true;
        const data = goFromUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type').GoFromTo<import('./type').TweenAction>} obj to Values
     */
    goFromTo(fromObj, toObj, props = {}) {
        if (this.#pauseStatus || this.#comeFromResume) this.stop();
        this.#useStagger = true;

        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('tween goFromTo:', fromObj, toObj);
            return new Promise((resolve) => resolve);
        }

        const data = goFromToUtils(fromObj, toObj);
        return this.#doAction(data, props, fromObj);
    }

    /**
     * @type {import('../../utils/type').Set<import('./type').TweenAction>} obj to Values
     */
    set(obj, props = {}) {
        if (this.#pauseStatus || this.#comeFromResume) this.stop();
        this.#useStagger = false;
        const data = setUtils(obj);

        // In set mode duration is small as possible
        const propsParsed = props ? { ...props, duration: 1 } : { duration: 1 };
        return this.#doAction(data, propsParsed, obj);
    }

    /**
     * @type {import('../../utils/type').SetImmediate<import('./type').TweenAction>} obj to Values
     */
    setImmediate(obj, props = {}) {
        if (this.#pauseStatus || this.#comeFromResume) this.stop();
        this.#useStagger = false;

        const data = setUtils(obj);
        const propsParsed = props ? { ...props, duration: 1 } : { duration: 1 };
        this.#values = mergeArrayTween(data, this.#values);

        if (this.#isActive) this.#updateDataWhileRunning();

        const { reverse } = this.#mergeProps(propsParsed);
        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(obj, this.#values);

        this.#values = setRelativeTween(this.#values, this.#relative);
        this.#values = setFromCurrentByTo(this.#values);

        this.#isActive = false;
        return;
    }

    /**
     * @type {import('../../utils/type').DoAction<import('./type').TweenAction>} obj to Values
     */
    #doAction(data, props = {}, obj) {
        this.#values = mergeArrayTween(data, this.#values);
        if (this.#isActive) this.#updateDataWhileRunning();

        const { reverse, immediate } = this.#mergeProps(props);
        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(obj, this.#values);

        this.#values = setRelativeTween(this.#values, this.#relative);

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
     * @type {import('./type').TweenGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myTween.get();
     * ```
     */
    get() {
        return getValueObj(this.#values, 'currentValue');
    }

    /**
     * @description
     * Get initial values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type').TweenGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myTween.getIntialData();
     * ```
     */
    getInitialData() {
        return getValueObj(this.#initialData, 'currentValue');
    }

    /**
     * @description
     * Get from values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type').TweenGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myTween.getFrom();
     * ```
     */
    getFrom() {
        return getValueObj(this.#values, 'fromValue');
    }

    /**
     * @description
     * Get to values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type').TweenGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myTween.getTo();
     * ```
     */
    getTo() {
        return getValueObj(this.#values, 'toValue');
    }

    /**
     * @description
     * Get From values, if the single value is a function it returns the same function.
     *
     * @type {import('./type').TweenGetValueNative}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myTween.getFromNativeType();
     * ```
     */
    getFromNativeType() {
        return getValueObjFromNative(this.#values);
    }

    /**
     * @description
     * Get To values, if the single value is a function it returns the same function.
     *
     * @type {import('./type').TweenGetValueNative}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = myTween.getToNativeType();
     * ```
     */
    getToNativeType() {
        return getValueObjToNative(this.#values);
    }

    /**
     * @description
     * Get tween type
     *
     * @type {import('./type').TweenGetType} tween type
     *
     * @example
     * ```javascript
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
     * @type {import('./type').TweenGetId}
     *
     * @example
     * ```javascript
     *
     *
     * const type = myTween.getId();
     * ```
     */
    getId() {
        return this.#uniqueId;
    }

    /**
     * Update ease with new preset
     *
     * @type {import('./type').TweenUpdateEase}
     *
     */
    updateEase(ease) {
        this.#ease = easeTweenIsValidGetFunction(ease);
        this.#defaultProps = mergeDeep(this.#defaultProps, {
            ease,
        });
    }

    /**
     * @type {import('./type').TweenSubscribe}
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
     * @type {import('./type').TweenSubscribeCache}
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
     * @type {import('./type').TweenOnComplete}
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
     *
     * @returns {void}
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
