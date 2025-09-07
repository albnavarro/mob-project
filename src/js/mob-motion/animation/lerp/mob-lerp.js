import { compareKeys } from '../utils/animation-utils.js';
import {
    setFromByCurrent,
    setFromCurrentByTo,
    setFromToByCurrent,
    setReverseValues,
    setRelative,
} from '../utils/tween-action/set-values.js';
import { mergeDeep } from '../../utils/merge-deep.js';
import { setStagger } from '../utils/stagger/set-stagger.js';
import { STAGGER_DEFAULT_INDEX_OBJ } from '../utils/stagger/stagger-costant.js';
import {
    getStaggerFromProps,
    getStaggerArray,
} from '../utils/stagger/stagger-utils.js';
import {
    defaultCallbackOnComplete,
    defaultCallback,
} from '../utils/callbacks/default-callback.js';
import {
    updateSubScribers,
    updateSubscribersCache,
} from '../utils/callbacks/set-callback.js';
import {
    parseGoToObject,
    parseGoFromObject,
    parseGoFromToObject,
    parseSetObject,
} from '../utils/tween-action/actions.js';
import { initRaf } from '../utils/init-raf.js';
import {
    compareKeysWarning,
    staggerIsOutOfRangeWarning,
} from '../utils/warning.js';
import { fpsLoadedLog } from '../utils/fps-log-inizialization.js';
import {
    lerpPrecisionIsValid,
    lerpVelocityIsValid,
    relativeIsValid,
    valueIsBooleanAndTrue,
} from '../utils/tween-action/tween-validation.js';
import { MobCore } from '../../../mob-core/index.js';
import { shouldInizializzeStagger } from '../utils/stagger/should-inizialize.js';
import { resume } from '../utils/resume-tween.js';
import {
    getValueObj,
    getValueObjFromNative,
    getValueObjToNative,
} from '../utils/tween-action/get-values.js';
import { mergeArray } from '../utils/tween-action/merge-array.js';
import { lerpGetValuesOnDraw } from './get-values-on-draw.js';

export default class MobLerp {
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
    #isRunning;

    /**
     * @type{((value:any) => void)|undefined }
     */
    #currentResolve;

    /**
     * @type{((value:any) => void)|undefined}
     */
    #currentReject;

    /**
     * @type {Promise<void> | undefined}
     */
    #currentPromise;

    /**
     * @type {import('./type.js').LerpValues[] | []}
     */
    #values;

    /**
     * @type {import('./type.js').LerpInitialData[]}
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
     * @type {{ validation: () => boolean; callback: () => void }[]}
     */
    #externalValidations;

    /**
     * @type {(() => void)[]}
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
    #staggerIsFreezed;

    /**
     * @type {boolean}
     */
    #fpsInLoading;

    /**
     * This value is the base value merged with new value in custom prop passed form user in goTo etc..
     *
     * @type {import('./type.js').LerpDefault}
     */
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
     * Available methods:
     *
     * ```javascript
     * myLerp.set();
     * myLerp.goTo();
     * myLerp.goFrom();
     * myLerp.goFromTo();
     * myLerp.subscribe();
     * myLerp.subscribeCache();
     * myLerp.onComplete();
     * myLerp.updateVelocity();
     * myLerp.updatePrecision();
     * myLerp.getId();
     * myLerp.get();
     * myLerp.getTo();
     * myLerp.getFrom();
     * myLerp.getToNativeType();
     * myLerp.getFromNativeType();
     * ```
     *
     * @example
     *     ```javascript
     *     const myLerp = new MobLerp({
     *       data: Object.<string, number>,
     *       precision: Number,
     *       velocity: Number,
     *       relative: Boolean
     *       stagger:{
     *          each: Number,
     *          from: Number|String|{x:number,y:number},
     *          grid: {
     *              col: Number,
     *              row: Number,
     *              direction: String,
     *          },
     *          waitComplete: Boolean,
     *       },
     *     })
     *
     *
     *     ```;
     *
     * @param {import('./type.js').LerpTweenProps} [data]
     */
    constructor(data) {
        this.#stagger = getStaggerFromProps(data ?? {});
        this.#relative = relativeIsValid(data?.relative, 'lerp');
        this.#velocity = lerpVelocityIsValid(data?.velocity);
        this.#precision = lerpPrecisionIsValid(data?.precision);
        this.#uniqueId = MobCore.getUnivoqueId();
        this.#isRunning = false;
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
        this.#currentPromise = undefined;
        this.#values = [];
        this.#initialData = [];
        this.#callback = [];
        this.#callbackCache = [];
        this.#callbackOnComplete = [];
        this.#externalValidations = [];
        this.#unsubscribeCache = [];
        this.#pauseStatus = false;
        this.#firstRun = true;
        this.#useStagger = true;
        this.#staggerIsFreezed = false;
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
         * Set initial store data if defined in constructor props If not use setData methods
         */
        const props = data?.data;
        if (props) this.setData(props);
    }

    /**
     * @param {number} _time
     * @param {number} fps
     * @returns {void}
     */
    #draw(_time, fps) {
        this.#isRunning = true;

        // Update values.
        this.#values = lerpGetValuesOnDraw({
            values: this.#values,
            fps,
            velocity: this.#velocity,
            precision: this.#precision,
        });

        // Prepare an obj to pass to the callback.
        const callBackObject = getValueObj(this.#values, 'currentValue');

        if (!this.#pauseStatus) {
            defaultCallback({
                stagger: this.#stagger,
                callback: this.#callback,
                callbackCache: this.#callbackCache,
                callBackObject: callBackObject,
                useStagger: this.#useStagger,
            });
        }

        // Check if all values is completed.
        const allSettled = this.#values.every((item) => item.settled === true);

        if (allSettled) {
            const onComplete = () => {
                this.#isRunning = false;

                /**
                 * End of animation Set fromValue with ended value At the next call fromValue become the start value
                 */
                this.#values = [...this.#values].map((item) => {
                    return { ...item, fromValue: item.toValue };
                });

                /**
                 * On complete
                 */
                this.#currentResolve?.(true);
                this.#currentPromise = undefined;
                this.#currentReject = undefined;
                this.#currentResolve = undefined;

                /**
                 * TODO: should be removed, problem should be fixed.
                 *
                 * - Can happen that with fat pause/resume settled is resolve in pause. In this case consider pause ended.
                 */
                this.#pauseStatus = false;

                this.#isRunning = false;
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

        MobCore.useFrame(() => {
            MobCore.useNextTick(({ time, fps }) => {
                if (this.#isRunning) this.#draw(time, fps);
            });
        });
    }

    /**
     * @param {number} time Current global time
     * @param {number} fps Current FPS
     */
    #onReuqestAnim(time, fps) {
        this.#draw(time, fps);
    }

    /**
     * Inzialize stagger array
     *
     * @returns {Promise<any>}
     */
    async #inzializeStagger() {
        /**
         * First time il there is a stagger load fps then go next step next time no need to calculate stagger and jump
         * directly next step
         */
        if (
            shouldInizializzeStagger(
                this.#stagger.each,
                this.#firstRun,
                this.#callbackCache,
                this.#callback
            )
        ) {
            const { averageFPS } = await MobCore.useFps();

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
                    /** @type {import('../utils/callbacks/type.js').CallbackCache} */ (
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
     * @param {(arg0: any) => void} resolve
     * @param {(value: any) => void} reject
     * @returns {Promise<any>}
     */
    async #startRaf(resolve, reject) {
        if (this.#fpsInLoading) return;
        this.#currentResolve = resolve;
        this.#currentReject = reject;

        if (this.#firstRun) {
            this.#fpsInLoading = true;
            await this.#inzializeStagger();
            this.#fpsInLoading = false;
        }

        /**
         * - Check if tween should run.
         * - External toll like async-timeline should use this method for avoid a tween that should be in pause run
         *   accidentally.
         */
        initRaf({
            validationFunction: this.#externalValidations,
            defaultRafInit: (time, fps) => this.#onReuqestAnim(time, fps),
        });
    }

    /**
     * AsyncTimeline utils.
     *
     * - We perform a Promise.reject() of the tween. We are sure that the tween can start with a new promise to resolve.
     *   If in a Promise.race(), a tween continues because it is slower and risks not resolving its promise, we force
     *   manual cleanup. Importantly, this must not happen when the tween is paused—forcing the this.#isRunning
     *   parameter could interfere with the pause mechanism.
     *
     * @returns {void}
     */
    clearCurretPromise() {
        if (!this.#pauseStatus) {
            this.#currentReject?.(MobCore.ANIMATION_STOP_REJECT);
            this.#currentPromise = undefined;
            this.#currentReject = undefined;
            this.#currentResolve = undefined;
            this.#isRunning = false;
        }
    }

    /**
     * @type {import('./type.js').LerpStop}
     */
    stop({ clearCache = true, updateValues = true } = {}) {
        if (this.#pauseStatus) this.#pauseStatus = false;
        if (updateValues) this.#values = setFromToByCurrent(this.#values);

        this.unFreezeStagger();

        /**
         * Clear stagger cache if needed.
         */
        if (clearCache)
            this.#callbackCache.forEach(({ cb }) => MobCore.useCache.clean(cb));

        // Reject promise
        if (this.#currentReject) {
            this.#currentReject(MobCore.ANIMATION_STOP_REJECT);
            this.#currentPromise = undefined;
            this.#currentReject = undefined;
            this.#currentResolve = undefined;
        }

        this.#isRunning = false;
    }

    /**
     * @returns {void}
     */
    freezeStagger() {
        if (this.#staggerIsFreezed) return;

        this.#callbackCache.forEach(({ cb }) => MobCore.useCache.freeze(cb));
        this.#staggerIsFreezed = true;
    }

    /**
     * @param {object} [params]
     * @param {boolean} [params.updateFrame]
     * @returns {void}
     */
    unFreezeStagger({ updateFrame = true } = {}) {
        if (!this.#staggerIsFreezed) return;

        this.#callbackCache.forEach(({ cb }) =>
            MobCore.useCache.unFreeze({ id: cb, update: updateFrame })
        );

        this.#staggerIsFreezed = false;
    }

    /**
     * @type {import('./type.js').LerpPause}
     */
    pause() {
        if (this.#pauseStatus) return;
        this.#pauseStatus = true;
        this.#isRunning = false;
        this.#values = setFromByCurrent(this.#values);
        this.freezeStagger();
    }

    /**
     * @type {import('./type.js').LerpResume}
     */
    resume() {
        if (!this.#pauseStatus) return;
        this.#pauseStatus = false;
        this.unFreezeStagger();

        if (!this.#isRunning && this.#currentResolve) {
            resume((time, fps) => this.#onReuqestAnim(time, fps));
        }
    }

    /**
     * Set initial data structure, the method is call by data prop in constructor. In case of need it can be called
     * after creating the instance
     *
     * @type {import('../../utils/type.js').SetData}
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
                fromFn: () => 0,
                fromIsFn: false,
                toFn: () => 0,
                toIsFn: false,
                settled: false,
            };
        });
    }

    /**
     * @type {import('./type.js').LerpResetData}
     */
    resetData() {
        this.#values = mergeDeep(this.#values, this.#initialData);
    }

    /**
     * @type {import('./type.js').LerpMergeProps}
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
     * @type {import('../../utils/type.js').GoTo<import('./type.js').LerpActions>} obj To Values
     */
    goTo(toObject, spacialProps = {}) {
        /**
         * Skip if is in pause
         */
        if (this.#pauseStatus)
            return Promise.reject(MobCore.ANIMATION_STOP_REJECT);

        /**
         * Enable stagger.
         */
        this.#useStagger = true;

        /**
         * Normalize data
         */
        const toObjectparsed = parseGoToObject(toObject);

        /**
         * Fire action
         */
        return this.#doAction(toObjectparsed, toObject, spacialProps);
    }

    /**
     * @type {import('../../utils/type.js').GoFrom<import('./type.js').LerpActions>} obj To Values
     */
    goFrom(fromObject, specialProps = {}) {
        /**
         * Skip if is in pause
         */
        if (this.#pauseStatus)
            return Promise.reject(MobCore.ANIMATION_STOP_REJECT);

        /**
         * Enable stagger.
         */
        this.#useStagger = true;

        /**
         * Normalize data
         */
        const fromObjectParsed = parseGoFromObject(fromObject);

        /**
         * Fire action
         */
        return this.#doAction(fromObjectParsed, fromObject, specialProps);
    }

    /**
     * @type {import('../../utils/type.js').GoFromTo<import('./type.js').LerpActions>} obj To Values
     */
    goFromTo(fromObject, toObject, specialProps = {}) {
        /**
         * Skip if is in pause
         */
        if (this.#pauseStatus)
            return Promise.reject(MobCore.ANIMATION_STOP_REJECT);

        /**
         * Set does not need stagger.
         */
        this.#useStagger = true;

        /**
         * Check if keys from/to is equal.
         */
        if (!compareKeys(fromObject, toObject)) {
            compareKeysWarning('lerp goFromTo:', fromObject, toObject);
            return new Promise((resolve) => resolve);
        }

        /**
         * Normalize data
         */
        const objectParsed = parseGoFromToObject(fromObject, toObject);

        /**
         * Fire action
         */
        return this.#doAction(objectParsed, fromObject, specialProps);
    }

    /**
     * @type {import('../../utils/type.js').Set<import('./type.js').LerpActions>} obj To Values
     */
    set(setObject, specialProps = {}) {
        /**
         * Skip if is in pause
         */
        if (this.#pauseStatus)
            return Promise.reject(MobCore.ANIMATION_STOP_REJECT);

        /**
         * Set does not need stagger.
         */
        this.#useStagger = false;

        /**
         * Normalize data
         */
        const setObjectParsed = parseSetObject(setObject);

        /**
         * Fire action
         */
        return this.#doAction(setObjectParsed, setObject, specialProps);
    }

    /**
     * @type {import('../../utils/type.js').SetImmediate<import('./type.js').LerpActions>} obj To Values
     */
    setImmediate(setObject, specialProps = {}) {
        /**
         * Secure check, stop tween if is running, TODO:should remove ?
         */
        if (this.#isRunning)
            this.stop({ clearCache: false, updateValues: false });

        /**
         * Skip if is in pause
         */
        if (this.#pauseStatus) return;

        /**
         * Immediate does not need stagger.
         */
        this.#useStagger = false;

        /**
         * Normalize data
         */
        const setObjectParsed = parseSetObject(setObject);

        /**
         * Update values
         */
        this.#values = mergeArray(setObjectParsed, this.#values);

        /**
         * Check and update reverse.
         */
        const { reverse } = this.#mergeProps(specialProps ?? {});
        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(setObject, this.#values);

        /**
         * Check and update relative.
         */
        this.#values = setRelative(this.#values, this.#relative);

        /**
         * Finally update current value.
         */
        this.#values = setFromCurrentByTo(this.#values);
        return;
    }

    /**
     * @type {import('../../utils/type.js').DoAction<import('./type.js').LerpActions>} obj To Values
     */
    #doAction(newObjectparsed, newObjectRaw, spacialProps = {}) {
        this.#values = mergeArray(newObjectparsed, this.#values);

        const { reverse, immediate } = this.#mergeProps(spacialProps ?? {});

        /**
         * Check reverse.
         */
        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(newObjectRaw, this.#values);

        /**
         * Update relative.
         */
        this.#values = setRelative(this.#values, this.#relative);

        /**
         * Execute immediate if settled and exit.
         */
        if (valueIsBooleanAndTrue(immediate, 'immediate ')) {
            if (this.#isRunning) this.stop({ updateValues: false });
            this.#values = setFromCurrentByTo(this.#values);
            return Promise.resolve();
        }

        /**
         * Condition to create promise. Promise is created first time. If is calling when isRunning reject, so only one
         * promise is resolved. this.#currentPromise is necessary to avoid wrong fps calculation ( async stagger
         * function ).
         */
        const shouldInitializeRAF = !this.#isRunning && !this.#currentPromise;

        /**
         * Avery time is called while is running return the previous promise.
         */
        if (shouldInitializeRAF) {
            this.#currentPromise = new Promise((resolve, reject) => {
                this.#startRaf(resolve, reject);
            });
        }

        return shouldInitializeRAF && this.#currentPromise
            ? this.#currentPromise
            : Promise.reject(MobCore.ANIMATION_STOP_REJECT);
    }

    /**
     * Get current values, If the single value is a function it returns the result of the function.
     *
     * @example
     *     ```javascript
     *
     *
     *     const { prop } = myLerp.get();
     *     ```;
     *
     * @type {import('./type.js').LerpGetValue}
     */
    get() {
        return getValueObj(this.#values, 'currentValue');
    }

    /**
     * Get initial values, If the single value is a function it returns the result of the function.
     *
     * @example
     *     ```javascript
     *
     *
     *     const { prop } = myLerp.getIntialData();
     *     ```;
     *
     * @type {import('./type.js').LerpGetValue}
     */
    getInitialData() {
        return getValueObj(this.#initialData, 'currentValue');
    }

    /**
     * Get from values, If the single value is a function it returns the result of the function.
     *
     * @example
     *     ```javascript
     *
     *
     *     const { prop } = myLerp.getFrom();
     *     ```;
     *
     * @type {import('./type.js').LerpGetValue}
     */
    getFrom() {
        return getValueObj(this.#values, 'fromValue');
    }

    /**
     * Get to values, If the single value is a function it returns the result of the function.
     *
     * @example
     *     ```javascript
     *
     *
     *     const { prop } = myLerp.getTo();
     *     ```;
     *
     * @type {import('./type.js').LerpGetValue}
     */
    getTo() {
        return getValueObj(this.#values, 'toValue');
    }

    /**
     * Get From values, if the single value is a function it returns the same function.
     *
     * @example
     *     ```javascript
     *
     *
     *     const { prop } = myLerp.getFromNativeType();
     *     ```;
     *
     * @type {import('./type.js').LerpGetValueNative}
     */
    getFromNativeType() {
        return getValueObjFromNative(this.#values);
    }

    /**
     * Get To values, if the single value is a function it returns the same function.
     *
     * @example
     *     ```javascript
     *
     *
     *     const { prop } = myLerp.getToNativeType();
     *     ```;
     *
     * @type {import('./type.js').LerpGetValueNative}
     */
    getToNativeType() {
        return getValueObjToNative(this.#values);
    }

    /**
     * Get tween type
     *
     * @example
     *     ```javascript
     *
     *
     *     const type = myLerp.getType();
     *     ```;
     *
     * @type {import('./type.js').LerpGetType} tween Type
     */
    getType() {
        return 'LERP';
    }

    /**
     * Get univoque Id
     *
     * @example
     *     ```javascript
     *
     *
     *     const type = myLerp.getId();
     *     ```;
     *
     * @type {import('./type.js').LerpGetId}
     */
    getId() {
        return this.#uniqueId;
    }

    /**
     * Return active state.
     *
     * @returns {boolean}
     */
    isActive() {
        return this.#isRunning;
    }

    /**
     * Update velocity value. `default value is 0.06`,the closer the value is to 1, the faster the transition will be.
     * The change will be persistent
     *
     * @example
     *     ```javascript
     *     myLerp.updateVelocity(0.1)
     *
     *
     *     ```;
     *
     * @type {import('./type.js').LerpUpdateVelocity}
     */
    updateVelocity(velocity) {
        this.#velocity = lerpVelocityIsValid(velocity);
        this.#defaultProps = mergeDeep(this.#defaultProps, {
            velocity: this.#velocity,
        });
    }

    /**
     * Update precision value. When the calculated value is less than this number, the transition will be considered
     * completed, the smaller the value, the greater the precision of the calculation, the `default value is 0.01`. The
     * change will be persistent
     *
     * @example
     *     ```javascript
     *     myLerp.updatePrecision(0.5)
     *
     *
     *     ```;
     *
     * @type {import('./type.js').LerpUpdatePrecision}
     */
    updatePrecision(precision) {
        this.#velocity = lerpPrecisionIsValid(precision);
        this.#defaultProps = mergeDeep(this.#defaultProps, {
            precision: this.#precision,
        });
    }

    /**
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although
     * it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is
     * advisable to use the subscribeCache method .
     *
     * @type {import('./type.js').LerpSubscribe}
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
     * Callback that returns updated values ready to be usable, specific to manage large staggers.
     *
     * @type {import('./type.js').LerpSubscribeCache}
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
     * Support callback to asyncTimeline. Callback to manage the departure of tweens in a timeline. If a delay is
     * applied to the tween and before the delay ends the timeline pauses the tween at the end of the delay will
     * automatically pause. Add callback to start in pause to stack
     *
     * @param {object} params
     * @param {() => boolean} params.validation
     * @param {() => void} params.callback
     * @returns {() => void}
     */
    validateInitialization({ validation, callback }) {
        const valuesUpdated = [
            ...this.#externalValidations,
            { validation, callback },
        ];

        this.#externalValidations = valuesUpdated;

        return () => (this.#externalValidations = []);
    }

    /**
     * Similar to subscribe this callBack is launched when the data calculation stops (when the timeline ends or the
     * scroll trigger is inactive). Useful for applying a different style to an inactive element. A typical example is
     * to remove the teansform3D property:
     *
     * @type {import('./type.js').LerpOnComplete}
     */
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
     * Destroy tween
     */
    destroy() {
        if (this.#currentPromise) this.stop();
        this.#callbackOnComplete = [];
        this.#externalValidations = [];
        this.#callback = [];
        this.#callbackCache = [];
        this.#values = [];
        this.#currentPromise = undefined;
        this.#unsubscribeCache.forEach((unsubscribe) => unsubscribe());
        this.#unsubscribeCache = [];
    }
}
