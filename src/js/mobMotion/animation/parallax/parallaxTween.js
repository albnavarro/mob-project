// @ts-check

import { getRoundedValue } from '../../animation/utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    getStaggerFromProps,
    getStaggerArray,
} from '../utils/stagger/staggerUtils.js';
import {
    setCallBack,
    setCallBackCache,
} from '../utils/callbacks/setCallback.js';
import { syncCallback } from '../utils/callbacks/syncCallback.js';
import { goToUtils } from '../utils/tweenAction/actions.js';
import { staggerIsOutOfRangeWarning } from '../utils/warning.js';
import {
    durationIsValid,
    easeParallaxTweenIsValid,
} from '../utils/tweenAction/tweenValidation.js';
import { mobCore } from '../../../mobCore/index.js';
import { getValueObj } from '../utils/tweenAction/getValues.js';
import { STAGGER_DEFAULT_INDEX_OBJ } from '../utils/stagger/staggerCostant.js';

export default class ParallaxTween {
    /**
     * @param {import('./type.js').parallaxTweenType} data
     *
     * @example
     * ```js
     * const myParallaxTween = new ParallaxTween({
     *   from: Object.<string, number>,
     *   to: Object.<string, number>,
     *   ease: [ String ],
     *   stagger:{
     *      each: [ Number ],
     *      from: [ Number|String|{x:number,y:number} ],
     *      grid: {
     *          col: [ Number ],
     *          row: [ Number ],
     *          direction: [ String ]
     *      },
     *   },
     * })
     *
     *
     * ```
     *
     * @description
     * Simplified tween specific to be used with scrollTrigger as an alternative to the more complex sequencer, ParallaxTween requires only one mutation step (from / to).
     *
     * Available methods:
     * ```js
     * myParallaxTween.subscribe()
     * myParallaxTween.subscribeCache()
     * myParallaxTween.onStop()
     *
     * ```
     */
    constructor(data) {
        /**
         * @private
         * @type {function}
         */
        this.ease = easeParallaxTweenIsValid(data?.ease);

        /**
         * @private
         * @type {number}
         */
        this.duration = durationIsValid(data?.duration);

        /**
         * @private
         * @type {import('../utils/stagger/type.js').staggerObject}
         */
        this.stagger = getStaggerFromProps(data);

        /**
         * @private
         * @type {import('./type.js').parallaxTweenValue[]}
         */
        this.values = [];

        /**
         * @private
         * @type{import('../utils/callbacks/type.js').callbackObject[]}
         */
        this.callbackOnStop = [];

        /**
         * @private
         * @type{import('../utils/callbacks/type.js').callbackObject[]}
         */
        this.callback = [];

        /**
         * @private
         * @type{import('../utils/callbacks/type.js').callbackObject[]}
         */
        this.callbackCache = [];

        /**
         * @private
         * @type {Array<function>}
         */
        this.unsubscribeCache = [];

        /**
         * @private
         * @type {string}
         */
        this.type = 'parallaxTween';

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.from || null;
        if (props) this.setData(props);

        if (data?.to) {
            this.goTo(data.to);
        }
    }

    /**
     * @description
     * Inzialize stagger array
     *
     * @returns {void}
     */
    inzializeStagger() {
        if (
            this.stagger.each > 0 &&
            (this.callbackCache.length > 0 || this.callback.length > 0)
        ) {
            const cb = getStaggerArray(this.callbackCache, this.callback);

            if (this.stagger.grid.col > cb.length) {
                staggerIsOutOfRangeWarning(cb.length);
                return;
            }

            const { staggerArray, staggerArrayOnComplete } = setStagger({
                arr: cb,
                endArr: this.callbackOnStop,
                stagger: this.stagger,
                slowlestStagger: STAGGER_DEFAULT_INDEX_OBJ, //sequencer doesn't support fastestStagger
                fastestStagger: STAGGER_DEFAULT_INDEX_OBJ, //sequencer doesn't support fastestStagger
            });

            if (this.callbackCache.length > this.callback.length) {
                this.callbackCache = staggerArray;
            } else {
                this.callback = staggerArray;
            }
            this.callbackOnStop = staggerArrayOnComplete;
        }
    }

    /**
     * @param {object} obj
     * @param {Number} obj.partial - render at specific partial between 0 and duration
     * @param {Boolean} obj.isLastDraw - use the callback defined by the onStop method
     *
     * @example
     * ```js
     * myParallaxTween.draw(
     *      partial: 200,
     *      isLastDraw: true,
     * );
     *
     *
     * ```
     * @description
     */
    draw({ partial, isLastDraw }) {
        const mainFn = () => {
            this.values.forEach((item) => {
                const toValue = item.toIsFn ? item.toFn() : item.toValue;
                const fromValue = item.fromIsFn
                    ? item.fromFn()
                    : item.fromValue;
                const toValProcessed = toValue - fromValue;

                item.currentValue = this.ease(
                    partial,
                    fromValue,
                    toValProcessed,
                    this.duration
                );
                item.currentValue = getRoundedValue(item.currentValue);
            });

            // Prepare an obj to pass to the callback
            const callBackObject = getValueObj(this.values, 'currentValue');

            // Fire callback
            syncCallback({
                each: this.stagger.each,
                useStagger: true,
                isLastDraw,
                callBackObject,
                callback: this.callback,
                callbackCache: this.callbackCache,
                callbackOnStop: this.callbackOnStop,
            });
        };

        mobCore.useNextTick(() => mainFn());
    }

    /**
     *
     * @param {import('../utils/tweenAction/type.js').valueToparseType} obj Initial data Object
     * @returns {this} The instance on which this method was called.
     */
    setData(obj) {
        const valToArray = Object.entries(obj);

        this.values = valToArray.map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                toValProcessed: value,
                fromValue: value,
                currentValue: value,
                settled: false,
            };
        });

        return this;
    }

    /**
     * @private
     *
     * Return the new array maeged with main array created in setData
     *
     * @param  {import('./type.js').parallaxTweenValue[]} newData new datato merge
     * @return {void}
     */
    mergeData(newData) {
        this.values = this.values.map((item) => {
            const itemToMerge = newData.find((newItem) => {
                return newItem.prop === item.prop;
            });

            // If exist merge
            return itemToMerge ? { ...item, ...itemToMerge } : { ...item };
        });
    }

    /**
     * @private
     *
     * @param {import('../utils/tweenAction/type.js').valueToparseType} obj to values
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```js
     * myParallaxTween.goTo(
     *     { string: number|function, ... }
     * );
     *
     *
     * ```
     * @description
     * Transform some properties of your choice from the `current value` to the `entered value`.
     * The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change in real time as the result of the function changes
     */
    goTo(obj) {
        const data = goToUtils(obj);
        this.mergeData(data);
        return this;
    }

    /**
     * @param {function(any):void} cb - callback function.
     * @return {Function} unsubscribe callback.
     *
     * @example
     * ```js
     * //Single DOM element
     * const unsubscribe = myParallaxTween.subscribe(({ x,y... }) => {
     *      domEl.style.prop = `...`
     * })
     * unsubscribe()
     *
     *
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return myParallaxTween.subscribe(({ x, y... }) => {
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
        const { arrayOfCallbackUpdated, unsubscribeCb } = setCallBack(
            cb,
            this.callback
        );

        this.callback = arrayOfCallbackUpdated;
        return () => (this.callback = unsubscribeCb(this.callback));
    }

    /**
     * @param {function(any):void} cb - callback function.
     * @return {Function} unsubscribe callback.
     *
     * @example
     * ```js
     * //Single DOM element
     * const unsubscribe = myParallaxTween.onStop(({ x,y... }) => {
     *      domEl.style.prop = `...`
     * })
     * unsubscribe()
     *
     *
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return myParallaxTween.onStop(({ x, y... }) => {
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
     * mySequencer.subscribe(({x}) => {
     *      domEl.style.transform = ` transform3D(0,0,0) translateX(${x}px)`
     * })
     *
     * // Remove transform3D when item is inactive
     * mySequencer.onStop(({x}) => {
     *      domEl.style.transform = `translateX(${x}px)`
     * })
     * ```
     */
    onStop(cb) {
        const { arrayOfCallbackUpdated, unsubscribeCb } = setCallBack(
            cb,
            this.callbackOnStop
        );
        this.callbackOnStop = arrayOfCallbackUpdated;

        return () => (this.callbackOnStop = unsubscribeCb(this.callbackOnStop));
    }

    /**
     * @param {('Object'|'HTMLElement')} item
     * @param {function(any):void} fn - callback function.
     * @return {Function} unsubscribe callback
     *
     * @example
     *```js
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return myParallaxTween.subscribeCache(item, ({ x, y... }) => {
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
        const { arrayOfCallbackUpdated, unsubscribeCb, unsubscribeCache } =
            setCallBackCache(
                item,
                fn,
                this.callbackCache,
                this.unsubscribeCache
            );

        this.callbackCache = arrayOfCallbackUpdated;
        this.unsubscribeCache = unsubscribeCache;
        return () => (this.callbackCache = unsubscribeCb(this.callbackCache));
    }

    /**
     * @description
     * Get duration
     * @return {Number}
     */
    getDuration() {
        return this.duration;
    }

    /**
     * @description
     * Get tween type - 'parallaxTween'
     */
    getType() {
        return this.type;
    }

    /**
     * @description
     * Destroy sequencer
     */
    destroy() {
        this.values = [];
        this.callbackOnStop = [];
        this.callback = [];
        this.callbackCache = [];
        this.unsubscribeCache.forEach((unsubscribe) => unsubscribe());
        this.unsubscribeCache = [];
    }
}
