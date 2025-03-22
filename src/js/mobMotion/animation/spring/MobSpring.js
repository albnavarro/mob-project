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
    relativeIsValid,
    springConfigIsValid,
    springConfigIsValidAndGetNew,
    springConfigPropIsValid,
    valueIsBooleanAndTrue,
} from '../utils/tweenAction/tweenValidation.js';
import { handleSetUp } from '../../setup.js';
import { MobCore } from '../../../mobCore/index.js';
import { shouldInizializzeStagger } from '../utils/stagger/shouldInizialize.js';
import { resume } from '../utils/resumeTween.js';
import {
    getValueObj,
    getValueObjFromNative,
    getValueObjToNative,
} from '../utils/tweenAction/getValues.js';
import { mergeArray } from '../utils/tweenAction/mergeArray.js';
import { springGetValuesOndraw } from './getValuesOndraw.js';
import { springPresetConfig } from './springConfig.js';

export default class MobSpring {
    /**
     * @type {import('../utils/stagger/type.js').StaggerObject}
     */
    #stagger;

    /**
     * @type {boolean}
     */
    #relative;

    /**
     * @type {import('./type.js').SpringProps}
     *
     * This value lives from user call ( goTo etc..) until next call
     **/
    #configProps;

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
     * @type{((value:any) => void)|undefined }
     */
    #currentReject;

    /**
     * @type{Promise<void>|undefined}
     */
    #promise;

    /**
     * @type {import('./type.js').SpringValues[]|[]}
     */
    #values;

    /**
     * @type {import('./type.js').SpringInitialData[]}
     */
    #initialData;

    /**
     * @type {import('../utils/callbacks/type.js').CallbackDefault}
     */
    #callback;

    /**
     * @type {import('../utils/callbacks/type.js').CallbackCache}
     */
    #callbackCache;

    /**
     * @type {import('../utils/callbacks/type.js').CallbackDefault}
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
     * @type {import('./type.js').SpringDefault}
     **/
    #defaultProps;

    /**
     * @type {import('../utils/stagger/type.js').StaggerFrameIndexObject}
     */
    #slowlestStagger;

    /**
     * @type {import('../utils/stagger/type.js').StaggerFrameIndexObject}
     */
    #fastestStagger;

    /**
     * @param {import('./type.js').SpringTweenProps} [ data ]
     *
     * @example
     * ```javascript
     * const mySpring = new HandleSpring({
     *   data: Object.<string, number>,
     *   config: String,
     *   configProps: {
     *      tension: Number,
     *      mass: Number,
     *      friction: Number,
     *      velocity: Number,
     *      precision: Number,
     *   },
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
     * mySpring.set()
     * mySpring.goTo()
     * mySpring.goFrom()
     * mySpring.goFromTo()
     * mySpring.subscribe()
     * mySpring.subscribeCache()
     * mySpring.onComplete()
     * mySpring.updateConfigProp()
     * mySpring.updateConfig()
     * mySpring.getId()
     * mySpring.get()
     * mySpring.getTo()
     * mySpring.getFrom()
     * mySpring.getToNativeType()
     * mySpring.getFromNativeType()
     *
     * ```
     */
    constructor(data) {
        this.#stagger = getStaggerFromProps(data ?? {});
        this.#relative = relativeIsValid(data?.relative, 'spring');
        this.#configProps = springConfigIsValidAndGetNew(data?.config);
        this.updateConfigProp(data?.configProps ?? {});
        this.#uniqueId = MobCore.getUnivoqueId();
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
            configProps: this.#configProps,
            relative: this.#relative,
            immediate: false,
        };
        this.#slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;
        this.#fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;

        /**
         * @private
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.data;
        if (props) this.setData(props);
    }

    /**
     * @param {number} _time
     * @param {number} fps
     * @param {Function} res
     * @param {number} tension
     * @param {number} friction
     * @param {number} mass
     * @param {number} precision
     *
     * @returns {void}
     */
    #draw(_time, fps, res = () => {}, tension, friction, mass, precision) {
        this.#isActive = true;

        this.#values = springGetValuesOndraw({
            values: this.#values,
            tension,
            friction,
            mass,
            precision,
            fps,
        });

        /**
         * Prepare an obj to pass to the callback
         */
        const callBackObject = getValueObj(this.#values, 'currentValue');

        defaultCallback({
            stagger: this.#stagger,
            callback: this.#callback,
            callbackCache: this.#callbackCache,
            callBackObject: callBackObject,
            useStagger: this.#useStagger,
        });

        /**
         * Check if all values is completed
         */
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
                    return {
                        ...item,
                        fromValue: item.toValue,
                    };
                });

                /**
                 * On complete
                 */
                if (!this.#pauseStatus) {
                    res();

                    /**
                     * Set promise reference to null once resolved
                     */
                    this.#promise = undefined;
                    this.#currentReject = undefined;
                    this.#currentResolve = undefined;
                }
            };

            /**
             * Prepare an obj to pass to the callback with rounded value ( end user value)
             */
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

        MobCore.useFrame(() => {
            MobCore.useNextTick(({ time, fps }) => {
                if (this.#isActive)
                    this.#draw(
                        time,
                        fps,
                        res,
                        tension,
                        friction,
                        mass,
                        precision
                    );
            });
        });
    }

    /**
     * @param {number} time current global time
     * @param {number} fps current FPS
     * @param {Function} res current promise resolve
     **/
    #onReuqestAnim(time, fps, res) {
        this.#values = [...this.#values].map((item) => {
            return {
                ...item,
                velocity: Math.trunc(this.#configProps.velocity),
            };
        });

        /**
         * Normalize spring config props
         */
        const tension = this.#configProps.tension;
        const friction = this.#configProps.friction;
        const mass = Math.max(1, this.#configProps.mass);
        const precision = this.#configProps.precision;

        this.#draw(time, fps, res, tension, friction, mass, precision);
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
            const { averageFPS } = await MobCore.useFps();

            fpsLoadedLog('spring', averageFPS);
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
                    /** @type{import('../utils/callbacks/type.js').CallbackCache} */ (
                        staggerArray
                    );
            } else {
                this.#callback =
                    /** @type {import('../utils/callbacks/type.js').CallbackDefault} */ (
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
     * @type {import('./type.js').SpringStop}
     */
    stop({ clearCache = true } = {}) {
        if (this.#pauseStatus) this.#pauseStatus = false;
        this.#values = setFromToByCurrent(this.#values);

        /**
         * If isRunning clear all funture stagger.
         * If tween is ended and the lst stagger is running, let it reach end position.
         */
        if (this.#isActive && clearCache)
            this.#callbackCache.forEach(({ cb }) => MobCore.useCache.clean(cb));

        // Reject promise
        if (this.#currentReject) {
            this.#currentReject(MobCore.ANIMATION_STOP_REJECT);
            this.#promise = undefined;
            this.#currentReject = undefined;
            this.#currentResolve = undefined;
        }

        this.#isActive = false;
    }

    /**
     * @type {import('./type.js').SpringPause}
     */
    pause() {
        if (this.#pauseStatus) return;
        this.#pauseStatus = true;
        if (this.#isActive) this.#isActive = false;
        this.#values = setFromByCurrent(this.#values);
    }

    /**
     * @type {import('./type.js').SpringResume}
     */
    resume() {
        if (!this.#pauseStatus) return;
        this.#pauseStatus = false;

        if (!this.#isActive && this.#currentResolve) {
            resume(this.#onReuqestAnim.bind(this), this.#currentResolve);
        }
    }

    /**
     * @type {import('../../utils/type.js').SetData} obj Initial data structure
     *
     * @description
     * Set initial data structure, the method is call by data prop in constructor. In case of need it can be called after creating the instance
     *
     *
     * @example
     * ```javascript
     *
     *
     * mySpring.setData({ val: 100 });
     * ```
     */
    setData(obj) {
        this.#values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                fromValue: value,
                velocity: this.#configProps.velocity,
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
     * @type {import('./type.js').SpringResetData}
     */
    resetData() {
        this.#values = mergeDeep(this.#values, this.#initialData);
    }

    /**
     * @type  {import('./type.js').SpringMergeProps}
     *
     * @description
     * Merge special props with default props
     */
    #mergeProps(props) {
        const springParams = handleSetUp.get('spring');

        /**
         * @description
         * Step 1
         * Get news confic props ( mass, friction etc... )
         * Get props from new config ( wobble etc.. ) or get each default prop.
         *
         * @type {import('./type.js').SpringPresentConfigType}
         */
        const allPresetConfig = springParams.config;
        const configPreset = springConfigIsValid(props?.config)
            ? (allPresetConfig?.[props?.config ?? 'default'] ??
              springPresetConfig.default)
            : this.#defaultProps.configProps;

        /*
         * Step 2
         * Modify previuos confic ( newConfigPreset ) single value ( mass ... )
         * Merge single prop or {}
         */
        const configPropsToMerge = springConfigPropIsValid(props?.configProps);
        const configProps = {
            ...configPreset,
            ...configPropsToMerge,
        };

        /*
         * Current config for spring for current cycle.
         */
        const newProps = {
            reverse: props?.reverse ?? this.#defaultProps.reverse,
            relative: props?.relative ?? this.#defaultProps.relative,
            immediate: props?.immediate ?? this.#defaultProps.immediate,
            configProps,
        };

        const { relative } = newProps;

        /**
         * Current spring config used in current cycle.
         * Current relative value used in current cycle.
         */
        this.#configProps = configProps;
        this.#relative = relative;

        return newProps;
    }

    /**
     * @type {import('../../utils/type.js').GoTo<import('./type.js').SpringActions>} obj to Values
     */
    goTo(obj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);

        this.#useStagger = true;
        const data = goToUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type.js').GoFrom<import('./type.js').SpringActions>} obj to Values
     */
    goFrom(obj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);

        this.#useStagger = true;
        const data = goFromUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type.js').GoFromTo<import('./type.js').SpringActions>} obj to Values
     */
    goFromTo(fromObj, toObj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);

        this.#useStagger = true;
        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('spring goFromTo:', fromObj, toObj);
            return new Promise((resolve) => resolve);
        }

        const data = goFromToUtils(fromObj, toObj);
        return this.#doAction(data, props, fromObj);
    }

    /**
     * @type {import('../../utils/type.js').Set<import('./type.js').SpringActions>} obj to Values
     */
    set(obj, props = {}) {
        if (this.#pauseStatus) return new Promise((resolve) => resolve);

        this.#useStagger = false;
        const data = setUtils(obj);
        return this.#doAction(data, props, obj);
    }

    /**
     * @type {import('../../utils/type.js').SetImmediate<import('./type.js').SpringActions>} obj to Values
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
     * @type {import('../../utils/type.js').DoAction<import('./type.js').SpringActions>} obj to Values
     */
    #doAction(data, props = {}, obj) {
        this.#values = mergeArray(data, this.#values);
        const { reverse, immediate } = this.#mergeProps(props);

        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(obj, this.#values);

        this.#values = setRelative(this.#values, this.#relative);

        if (valueIsBooleanAndTrue(immediate, 'immediate ')) {
            this.#isActive = false;
            this.#values = setFromCurrentByTo(this.#values);
            return Promise.resolve();
        }

        if (!this.#isActive && !this.#promise) {
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
     * @type {import('./type.js').SpringGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = mySpring.get();
     * ```
     */
    get() {
        return getValueObj(this.#values, 'currentValue');
    }

    /**
     * @description
     * Get initial values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type.js').SpringGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = mySpring.getIntialData();
     * ```
     */
    getInitialData() {
        return getValueObj(this.#initialData, 'currentValue');
    }

    /**
     * @description
     * Get from values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type.js').SpringGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = mySpring.getFrom();
     * ```
     */
    getFrom() {
        return getValueObj(this.#values, 'fromValue');
    }

    /**
     * @description
     * Get to values, If the single value is a function it returns the result of the function.
     *
     * @type {import('./type.js').SpringGetValue}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = mySpring.getTo();
     * ```
     */
    getTo() {
        return getValueObj(this.#values, 'toValue');
    }

    /**
     * @description
     * Get From values, if the single value is a function it returns the same function.
     *
     * @type {import('./type.js').SpringGetValueNative}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = mySpring.getFromNativeType();
     * ```
     */
    getFromNativeType() {
        return getValueObjFromNative(this.#values);
    }

    /**
     * @description
     * Get To values, if the single value is a function it returns the same function.
     *
     * @type {import('./type.js').SpringGetValueNative}
     *
     * @example
     * ```javascript
     *
     *
     * const { prop } = mySpring.getToNativeType();
     * ```
     */
    getToNativeType() {
        return getValueObjToNative(this.#values);
    }

    /**
     * @description
     * Get tween type
     *
     * @type {import('./type.js').SpringGetType} tween type
     *
     * @example
     * ```javascript
     *
     *
     * const type = mySpring.getType();
     * ```
     */
    getType() {
        return 'SPRING';
    }

    /**
     * @description
     * Get univoque Id
     *
     * @type {import('./type.js').SpringGetId}
     *
     * @example
     * ```javascript
     *
     *
     * const type = mySpring.getId();
     * ```
     */
    getId() {
        return this.#uniqueId;
    }

    /**
     * @type {import('./type.js').SpringUdateConfigProp}
     *
     *  @example
     *  ```javascript
     *  mySpring.updateConfigProp({
     *      mass: 2,
     *      friction: 5
     *  })
     *
     *
     *  ```
     *
     * @description
     * Update config object, every || some properties
     * The change will be persistent
     */
    updateConfigProp(configProps = {}) {
        const configToMerge = springConfigPropIsValid(configProps);
        this.#configProps = { ...this.#configProps, ...configToMerge };

        this.#defaultProps = mergeDeep(this.#defaultProps, {
            configProps: configToMerge,
        });
    }

    /**
     *
     * @description
     * updateConfig - Update config object with new preset
     *
     * @type {import('./type.js').SpringUdateConfig}
     *
     */
    updateConfig(config) {
        this.#configProps = springConfigIsValidAndGetNew(config);
        this.#defaultProps = mergeDeep(this.#defaultProps, {
            configProps: this.#configProps,
        });
    }

    /**
     * @type {import('./type.js').SpringSubscribe}
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
     * @type {import('./type.js').SpringSubscribeCache}
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
     * @type {import('./type.js').SpringOnComplete}
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
