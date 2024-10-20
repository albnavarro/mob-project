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
         * @type {Function}
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
         * @type {import('../utils/callbacks/type.js').callbackObject<(arg0:Record<string, number>) => void>[]}
         */
        this.callbackOnStop = [];

        /**
         * @private
         * @type {import('../utils/callbacks/type.js').callbackObject<(arg0:Record<string, number>) => void>[]}
         */
        this.callback = [];

        /**
         * @private
         * @type{import('../utils/callbacks/type.js').callbackObject<string>[]}
         */
        this.callbackCache = [];

        /**
         * @private
         * @type {Array<() => void>}
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
                arrayDefault: cb,
                arrayOnStop: this.callbackOnStop,
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
     * @param {number} obj.partial - render at specific partial between 0 and duration
     * @param {boolean} obj.isLastDraw - use the callback defined by the onStop method
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
        this.values = [...this.values].map((item) => {
            const { toIsFn, toFn, toValue, fromIsFn, fromFn, fromValue } = item;

            const toValueParsed = toIsFn ? toFn() : toValue;
            const fromValueParsed = fromIsFn ? fromFn() : fromValue;
            const toValFinal = toValueParsed - fromValueParsed;

            const currentValue = this.ease(
                partial,
                fromValueParsed,
                toValFinal,
                this.duration
            );

            return {
                ...item,
                currentValue: getRoundedValue(currentValue),
            };
        });

        // Prepare an obj to pass to the callback
        const callBackObject = getValueObj(this.values, 'currentValue');

        mobCore.useNextTick(() => {
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
        });
    }

    /**
     *
     * @type {import('./type.js').parallaxTweenSetData}
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

                /**
                 * Only for type check.
                 */
                fromFn: () => 0,
                toFn: () => 0,
            };
        });

        return this;
    }

    /**
     * @private
     *
     * Return the new array maeged with main array created in setData
     *
     * @param  {import('../utils/tweenAction/type.js').goToParamsType[]} newData new datato merge
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
     * @type {import('./type.js').parallaxTweenGoTo}
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
     * @type {import('./type.js').parallaxTweenSubscribe}
     *
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
     * @type {import('./type.js').parallaxTweenOnStop}
     *
     * @description
     * Similar to subscribe this callBack is launched when the data calculation stops (when the timeline ends or the scroll trigger is inactive).
     * Useful for applying a different style to an inactive element.
     * A typical example is to remove the teansform3D property:
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
     * @type {import('./type.js').parallaxTweenSubscribeCache}
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
     * @type {import('./type.js').parallaxTweenGetDuration}
     */
    getDuration() {
        return this.duration;
    }

    /**
     * @description
     * Get tween type - 'parallaxTween'
     * @type {import('./type.js').parallaxTweenGetType}
     */
    getType() {
        return this.type;
    }

    /**
     * @description
     * Destroy sequencer
     * @type {() => void}
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
