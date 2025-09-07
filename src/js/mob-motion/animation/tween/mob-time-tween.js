import { compareKeys } from '../utils/animation-utils.js';
import {
    setFromCurrentByTo,
    setFromToByCurrent,
    setReverseValues,
    setRelativeTween,
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
    durationIsNumberOrFunctionIsValid,
    easeTweenIsValid,
    easeTweenIsValidGetFunction,
    relativeIsValid,
    valueIsBooleanAndTrue,
} from '../utils/tween-action/tween-validation.js';
import { MobCore } from '../../../mob-core/index.js';
import { shouldInizializzeStagger } from '../utils/stagger/should-inizialize.js';
import { mergeArrayTween } from '../utils/tween-action/merge-array.js';
import {
    getValueObj,
    getValueObjFromNative,
    getValueObjToNative,
} from '../utils/tween-action/get-values.js';
import { tweenGetValueOnDraw } from './get-values-on-draw.js';

export default class MobTimeTween {
    /**
     * @type {Function} This Value lives from user call ( goTo etc..) until next call
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
     * @type {import('../utils/stagger/type.js').StaggerObject}
     */
    #stagger;

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
     * @type{((value:any) => void)|undefined }
     */
    #currentReject;

    /**
     * @type {Promise<void> | undefined}
     */
    #currentPromise;

    /**
     * @type {import('./type.js').TimeTweenStoreData[]}
     */
    #values;

    /**
     * @type {import('./type.js').TimeTweenInitialData[]}
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
     * @type {number}
     */
    #startTime;

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
    #staggerIsFreezed;

    /**
     * @type {boolean}
     */
    #fpsInLoading;

    /**
     * This value is the base value merged with new value in custom prop passed form user in goTo etc..
     *
     * @type {import('./type.js').TimeTweenDefault}
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
     * myTween.set();
     * myTween.goTo();
     * myTween.goFrom();
     * myTween.goFromTo();
     * myTween.subscribe();
     * myTween.subscribeCache();
     * myTween.onComplete();
     * myTween.updateEase();
     * myTween.getId();
     * myTween.get();
     * myTween.getTo();
     * myTween.getFrom();
     * myTween.getToNativeType();
     * myTween.getFromNativeType();
     * ```
     *
     * @example
     *     ```javascript
     *     const myTween = new HandleTween({
     *       data: Object.<string, number>,
     *       duration: Number,
     *       ease: String,
     *       relative: Boolean
     *       stagger:{
     *          each: Number,
     *          from: Number|String|{x:number,y:number},
     *          grid: {
     *              col: Number,
     *              row: Number,
     *              direction: String
     *          },
     *          waitComplete: Boolean,
     *       },
     *     })
     *
     *
     *     ```;
     *
     * @param {import('./type.js').TimeTweenProps} [data]
     */
    constructor(data) {
        this.#ease = easeTweenIsValidGetFunction(data?.ease);
        this.#duration = durationIsNumberOrFunctionIsValid(data?.duration);
        this.#relative = relativeIsValid(data?.relative, 'tween');
        this.#stagger = getStaggerFromProps(data ?? {});
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
        this.#startTime = 0;
        this.#timeElapsed = 0;
        this.#pauseTime = 0;
        this.#firstRun = true;
        this.#useStagger = true;
        this.#staggerIsFreezed = false;
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
     * @returns {void}
     */
    #draw(time) {
        this.#isRunning = true;

        if (this.#pauseStatus) {
            this.#pauseTime = time - this.#startTime - this.#timeElapsed;
        }

        this.#timeElapsed = time - this.#startTime - this.#pauseTime;

        if (Math.round(this.#timeElapsed) >= this.#duration) {
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

        if (!this.#pauseStatus) {
            defaultCallback({
                stagger: this.#stagger,
                callback: this.#callback,
                callbackCache: this.#callbackCache,
                callBackObject: callBackObject,
                useStagger: this.#useStagger,
            });
        }

        if (isSettled) {
            const onComplete = () => {
                /**
                 * End of animation Set fromValue with ended value At the next call fromValue become the start value
                 */
                this.#values = [...this.#values].map((item) => {
                    if (!item.shouldUpdate) return item;

                    return {
                        ...item,
                        toValue: item.currentValue,
                        fromValue: item.currentValue,
                    };
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
                this.#pauseTime = 0;
                this.#pauseStatus = false;

                this.#isRunning = false;
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

        MobCore.useFrame(() => {
            MobCore.useNextTick(({ time }) => {
                if (this.#isRunning) this.#draw(time);
            });
        });
    }

    /**
     * @param {number} time Current global time
     * @returns {void}
     */
    #onReuqestAnim(time) {
        this.#startTime = time;
        this.#draw(time);
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
     * @param {(value: any) => void} resolve
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
            defaultRafInit: (time) => this.#onReuqestAnim(time),
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
     * @type {import('./type.js').TimeTweenStop}
     */
    stop({ clearCache = true, updateValues = true } = {}) {
        this.#pauseTime = 0;
        this.#pauseStatus = false;

        if (updateValues) this.#values = setFromToByCurrent(this.#values);

        this.unFreezeStagger();

        /**
         * Clear stagger cache if needed.
         */
        if (clearCache)
            this.#callbackCache.forEach(({ cb }) => MobCore.useCache.clean(cb));

        // Abort promise
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
     * @type {import('./type.js').TimeTweenPause}
     */
    pause() {
        if (this.#pauseStatus) return;
        this.#pauseStatus = true;
        this.freezeStagger();
    }

    /**
     * @type {import('./type.js').TimeTweenResume}
     */
    resume() {
        if (!this.#pauseStatus) return;
        this.#pauseStatus = false;
        this.unFreezeStagger();
    }

    /**
     * @type {import('../../utils/type.js').SetData}
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
     * @type {import('./type.js').TimeTweenResetData}
     */
    resetData() {
        this.#values = mergeDeep(this.#values, this.#initialData);
    }

    /**
     * Reject promise and update form value with current
     *
     * @returns {void}
     */
    #updateDataWhileRunning() {
        this.#values = [...this.#values].map((item) => {
            if (!item.shouldUpdate) return item;

            return {
                ...item,
                fromValue: item.currentValue,
            };
        });
    }

    /**
     * Merge special props with default props
     *
     * @type {import('./type.js').TimeTweenMergeProps}
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
     * @type {import('../../utils/type.js').GoTo<import('./type.js').TimeTweenAction>} obj To Values
     */
    goTo(toObject, specialProps = {}) {
        /**
         * Timeline tween need a clean restart, is not 'reactive' like spring or lerp.
         */
        this.stop({ clearCache: false, updateValues: true });

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
        return this.#doAction(toObjectparsed, toObject, specialProps);
    }

    /**
     * @type {import('../../utils/type.js').GoFrom<import('./type.js').TimeTweenAction>} obj To Values
     */
    goFrom(fromObject, specialProps = {}) {
        /**
         * Timeline tween need a clean restart, is not 'reactive' like spring or lerp.
         */
        this.stop({ clearCache: false, updateValues: true });

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
     * @type {import('../../utils/type.js').GoFromTo<import('./type.js').TimeTweenAction>} obj To Values
     */
    goFromTo(fromObject, toObject, specialProps = {}) {
        /**
         * Timeline tween need a clean restart, is not 'reactive' like spring or lerp.
         */
        this.stop({ clearCache: false, updateValues: true });

        /**
         * Set does not need stagger.
         */
        this.#useStagger = true;

        /**
         * Check if keys from/to is equal.
         */
        if (!compareKeys(fromObject, toObject)) {
            compareKeysWarning('tween goFromTo:', fromObject, toObject);
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
     * @type {import('../../utils/type.js').Set<import('./type.js').TimeTweenAction>} obj To Values
     */
    set(setObject, specialProps = {}) {
        /**
         * Timeline tween need a clean restart, is not 'reactive' like spring or lerp.
         */
        this.stop({ clearCache: false, updateValues: true });

        /**
         * Set does not need stagger.
         */
        this.#useStagger = false;

        /**
         * Normalize data
         */
        const setObjectParsed = parseSetObject(setObject);

        /**
         * Immediate is very fast, 1 ms
         */
        const propsParsed = specialProps
            ? { ...specialProps, duration: 1 }
            : { duration: 1 };

        /**
         * Fire action
         */
        return this.#doAction(setObjectParsed, setObject, propsParsed);
    }

    /**
     * @type {import('../../utils/type.js').SetImmediate<import('./type.js').TimeTweenAction>} obj To Values
     */
    setImmediate(setObject, specialProps = {}) {
        /**
         * Secure check, stop tween if is running, TODO:should remove ? updateValues in below
         */
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
         * Immediate is very fast, 1 ms
         */
        const propsParsed = specialProps
            ? { ...specialProps, duration: 1 }
            : { duration: 1 };

        /**
         * Update values
         */
        this.#values = mergeArrayTween(setObjectParsed, this.#values);

        /**
         * Check and update reverse.
         */
        const { reverse } = this.#mergeProps(propsParsed);
        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(setObject, this.#values);

        /**
         * Check and update relative.
         */
        this.#values = setRelativeTween(this.#values, this.#relative);

        /**
         * Finally update current value.
         */
        this.#values = setFromCurrentByTo(this.#values);
        return;
    }

    /**
     * @type {import('../../utils/type.js').DoAction<import('./type.js').TimeTweenAction>} obj To Values
     */
    #doAction(newObjectParsed, newObjectRaw, specialProps = {}) {
        this.#values = mergeArrayTween(newObjectParsed, this.#values);

        const { reverse, immediate } = this.#mergeProps(specialProps);

        /**
         * Check reverse.
         */
        if (valueIsBooleanAndTrue(reverse, 'reverse'))
            this.#values = setReverseValues(newObjectRaw, this.#values);

        /**
         * Update relative.
         */
        this.#values = setRelativeTween(this.#values, this.#relative);

        /**
         * Execute immediate if settled and exit.
         */
        if (valueIsBooleanAndTrue(immediate, 'immediate ')) {
            /**
             * Time tween need restart if called while running. this.#value is updated below At stop by default from/to
             * value is updated, for next if only set/goTo is used without define from value.
             */
            if (this.#isRunning) {
                this.stop({ clearCache: false, updateValues: false });
                this.#updateDataWhileRunning();
            }

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
     *     const { prop } = myTween.get();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetValue}
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
     *     const { prop } = myTween.getIntialData();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetValue}
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
     *     const { prop } = myTween.getFrom();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetValue}
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
     *     const { prop } = myTween.getTo();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetValue}
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
     *     const { prop } = myTween.getFromNativeType();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetValueNative}
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
     *     const { prop } = myTween.getToNativeType();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetValueNative}
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
     *     const type = myTween.getType();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetType} tween Type
     */
    getType() {
        return 'TWEEN';
    }

    /**
     * Get univoque Id
     *
     * @example
     *     ```javascript
     *
     *
     *     const type = myTween.getId();
     *     ```;
     *
     * @type {import('./type.js').TimeTweenGetId}
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
     * Update ease with new preset
     *
     * @type {import('./type.js').TimeTweenUpdateEase}
     */
    updateEase(ease) {
        this.#ease = easeTweenIsValidGetFunction(ease);
        this.#defaultProps = mergeDeep(this.#defaultProps, {
            ease,
        });
    }

    /**
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although
     * it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is
     * advisable to use the subscribeCache method .
     *
     * @type {import('./type.js').TimeTweenSubscribe}
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
     * @type {import('./type.js').TimeTweenSubscribeCache}
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
     * @type {import('./type.js').TimeTweenOnComplete}
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
     *
     * @returns {void}
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
