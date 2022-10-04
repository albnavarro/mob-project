import { getTweenFn } from '../tween/tweenConfig.js';
import {
    getValueObj,
    compareKeys,
    getRoundedValue,
} from '../utils/animationUtils.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    getStaggerFromProps,
    getStaggerArray,
} from '../utils/stagger/staggerUtils.js';
import { handleSetUp } from '../../setup.js';
import {
    setCallBack,
    setCallBackCache,
} from '../utils/callbacks/setCallback.js';
import { syncCallback } from '../utils/callbacks/syncCallback.js';
import {
    compareKeysWarning,
    staggerIsOutOfRangeWarning,
    syncTimelineAddFnWarning,
    syncTimelineAddTimeWarning,
} from '../utils/warning.js';
import { storeType } from '../../store/storeType.js';
import {
    goToSyncUtils,
    goFromSyncUtils,
    goFromToSyncUtils,
} from './syncActions.js';
import {
    propToSet,
    getFirstValidValueBack,
    checkIsLastUsableProp,
} from './reduceFunction.js';
import { handleCache } from '../../events/rafutils/handleCache.js';
import { directionConstant } from '../utils/constant.js';
import { sequencerRangeValidate } from '../utils/tweenValidation.js';

/**
 * @typedef {Object} sequencerTypes
 * @prop {Object.<string, number>} data Initial data Object
 * @prop {number} [ duration=10] Defines the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed. The default value is 10
 **/

/**
 * @typedef {Object} sequencerSpecialProps
 * @prop {number} [ start=0 ] Defines the start of the transformation of the timeline in use, from 0 to the maximum surat set. The default is 0
 * @prop {number} [ end=duration ] Defines the start of the transformation of the timeline in use, from 0 to the maximum surat set. The default value is the set duration
 **/

export class HandleSequencer {
    /**
     * @param { sequencerTypes & import('../utils/stagger/setStagger.js').staggerTypes & import('../tween/tweenConfig.js').easeTypes} data
     *
     * @example
     * ```js
     * const mySequencer = new HandleSequencer({
     *   data: Object.<string, number>,
     *   duration: [ Number ],
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
     * ```
     */
    constructor(data = {}) {
        // Basic array with all the propierties, is creted in setData methods
        // in draw methods currentValue and settled will be updated for each prop
        // it is used as a mock to create the array to add to the timeline
        this.values = [];
        // Timeline array
        this.timeline = [];
        this.labels = [];
        this.callback = [];
        this.callbackCache = [];
        this.callbackOnStop = [];
        this.callbackAdd = [];
        this.unsubscribeCache = [];
        this.duration = data?.duration || handleSetUp.get('sequencer').duration;
        this.type = 'sequencer';
        this.defaultProp = {
            start: 0,
            end: this.duration,
            ease: data?.ease || handleSetUp.get('sequencer').ease,
        };
        this.firstRun = true;
        this.forceAddFnAtFirstRun = true;
        this.direction = null;
        this.lastPartial = null;
        this.lastDirection = null;

        // Stagger
        this.stagger = getStaggerFromProps(data);
        this.useStagger = true;
        this.staggerIsReady = false;

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.data || null;
        if (props) this.setData(props);
    }

    /**
     * @description
     * Inzialize stagger array
     */
    inzializeStagger() {
        if (this.staggerIsReady) return;

        if (
            this.stagger.each > 0 &&
            (this.callbackCache.length || this.callback.length)
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
                slowlestStagger: {}, //sequencer doasn't support slowlestStagger
                fastestStagger: {}, //sequencer doasn't support fastestStagger
            });

            if (this.callbackCache.length > this.callback.length) {
                this.callbackCache = staggerArray;
            } else {
                this.callback = staggerArray;
            }
            this.callbackOnStop = staggerArrayOnComplete;
        }

        this.staggerIsReady = true;
    }

    /**
     * @typedef {Object} sequencerDrawTypes
     * @prop {Number} [ partial = 0] render at specific partial between 0 and duration
     * @prop {Boolean} [ isLastDraw = false] use the callback defined by the onStop method
     * @prop {Boolean} [ useFrame = false ] when the method is used inside a requestAnimatioFrame the useFrame property must be set to true, otherwise it will be executed inside a nextTick
     **/

    /**
     * @param {sequencerDrawTypes & import('../utils/constant.js').directionTypes} props
     *
     * @example
     * ```js
     * mySequencer.draw(
     *      partial: 200,
     *      isLastDraw: true,
     *      useFrame: false,
     *      direction: ('backward'|'forward'|'none')
     * );
     *
     *
     * ```
     * @description
     */
    draw({
        partial = 0,
        isLastDraw = false,
        useFrame = false,
        direction = directionConstant.NONE,
    }) {
        const mainFn = () => {
            /*
             * First time run or atfer reset lasValue
             * all the last value is null so get the current value
             */
            if (this.firstRun) {
                this.lastPartial = partial;
                this.actionAtFirstRender(partial);
            }

            /**
             * Inside a timeline the direction is controlled by timeline and pass the value
             * becouse timeline konw the loop state and direction is stable
             * Inside a parallax we have a fallback, but we don't have a loop
             *
             * On first run check is jumped
             */
            if (
                !this.firstRun &&
                (!direction || direction === directionConstant.NONE)
            ) {
                this.direction =
                    partial >= this.lastPartial
                        ? directionConstant.FORWARD
                        : directionConstant.BACKWARD;
            }

            if (
                !this.firstRun &&
                (direction === directionConstant.BACKWARD ||
                    direction === directionConstant.FORWARD)
            ) {
                this.direction = direction;
            }

            /*
            Obj utils to avoid new GC allocation during animation
            Try to reduce the GC timing
            Support caluculation in each frame
            */
            let GC = {
                currentEl: null,
                isLastUsableProp: null,
                duration: null,
                inactivePosition: null,
                toValue: null,
                fromValue: null,
            };

            this.values.forEach((item) => {
                item.settled = false;
            });

            this.timeline.forEach(({ start, end, values }, i) => {
                values.forEach((item) => {
                    GC.currentEl = this.values.find(
                        ({ prop }) => prop === item.prop
                    );

                    // Id the prop is settled or is inactive skip
                    if (GC.currentEl.settled || !item.active) return;

                    // Check if in the next step of timeline the same prop is active an start before partial
                    GC.isLastUsableProp = checkIsLastUsableProp(
                        this.timeline,
                        i,
                        item.prop,
                        partial
                    );

                    // If in the next step the same props is active and start before partial skip
                    if (!GC.isLastUsableProp) return;

                    GC.toValue = storeType.isNumber(item.toValue)
                        ? item.toValue
                        : item.toValue();

                    GC.fromValue = storeType.isNumber(item.fromValue)
                        ? item.fromValue
                        : item.fromValue();

                    // At least we get the current value
                    GC.duration = end - start;
                    GC.inactivePosition =
                        partial < end ? GC.fromValue : GC.toValue;

                    item.currentValue =
                        partial >= start && partial <= end
                            ? item.ease(
                                  partial - start,
                                  GC.fromValue,
                                  GC.toValue - GC.fromValue,
                                  GC.duration
                              )
                            : GC.inactivePosition;

                    item.currentValue = getRoundedValue(item.currentValue);
                    GC.currentEl.currentValue = item.currentValue;
                    GC.currentEl.settled = true;
                });
            });

            const cbObject = getValueObj(this.values, 'currentValue');

            syncCallback({
                each: this.stagger.each,
                useStagger: this.useStagger,
                isLastDraw,
                cbObject,
                callback: this.callback,
                callbackCache: this.callbackCache,
                callbackOnStop: this.callbackOnStop,
            });

            this.fireAddCallBack(partial);

            this.useStagger = true;
            // Remove reference to o Object
            GC = null;
            this.lastPartial = partial;
            this.lastDirection = this.direction;
            this.firstRun = false;
        };

        if (useFrame) {
            mainFn();
        } else {
            handleNextTick.add(() => mainFn());
        }
    }

    /**
     * @description
     * Methods call by syncTimeline, everty time user use play, playFrom etcc.. or loop end.
     * Reset the data that control add callback to have a new clean state
     */
    resetLastValue() {
        this.firstRun = true;
        this.lastPartial = null;
        this.lastDirection = null;
    }

    /**
     * @private
     *
     * @property {number} [ time=0 ]
     *
     * @description
     * Fire addCallback first time without check the previous position.
     * becouse first time we can start from any position and we doasn't a have previous position
     * So we fire the callback once
     * To skip this callback, check isForce prop in callback
     */
    actionAtFirstRender(time = 0) {
        if (!this.forceAddFnAtFirstRun) return;

        this.callbackAdd.forEach(({ fn, time: fnTime }) => {
            const mustFireForward = {
                shouldFire: time >= fnTime,
                direction: directionConstant.FORWARD,
            };

            const mustFireBackward = {
                shouldFire: time <= fnTime,
                direction: directionConstant.BACKWARD,
            };

            const mustFire =
                mustFireForward.shouldFire || mustFireBackward.shouldFire;

            if (!mustFire) return;

            const direction = mustFireForward.shouldFire
                ? mustFireForward.direction
                : mustFireBackward.direction;

            fn({ direction, value: time, isForced: true });
        });

        this.forceAddFnAtFirstRun = false;
    }

    /**
     * @private
     *
     * @property {number} [ time=0 ]
     *
     * @description
     * Fire callBack at specific time
     *
     */
    fireAddCallBack(time = 0) {
        this.callbackAdd.forEach(({ fn, time: fnTime }) => {
            /*
             * In forward mode current time must be greater or equel than fn time
             * and the last current time must be minor than fn time to prevent
             * the the fn is fired before fn time is reached
             */
            const mustFireForward =
                this.direction === directionConstant.FORWARD &&
                time > fnTime &&
                this.lastPartial <= fnTime;

            /*
             * In backward mode current time must be minor or equal than fn time
             * and the last current time must be greater than fn time to prevent
             * the the fn is fired before fn time is reached
             * time and fnTime cannot be the same, becouse fnTime
             * is equal max duration of timeline/parallax the previous value
             * can be equal max duration, so we avoid double firing of fn
             */
            const mustFireBackward =
                this.direction === directionConstant.BACKWARD &&
                time < fnTime &&
                this.lastPartial >= fnTime;

            // const mustFire =
            //     (mustFireForward || mustFireBackward) && shouldFired;
            const mustFire = mustFireForward || mustFireBackward;
            if (!mustFire) return;

            fn({ direction: this.direction, value: time, isForced: false });
        });
    }

    /**
     * @description
     * Set factor between timeline duration and sequencer getDuration
     * So start and end propierties will be proportionate to the duration of the timeline
     * This methods is called by SyncTimeline
     */
    setStretchFactor(duration = 0) {
        const stretchFactor = duration / this.duration;

        this.timeline.forEach(({ start, end }, i) => {
            this.timeline[i].start = getRoundedValue(start * stretchFactor);
            this.timeline[i].end = getRoundedValue(end * stretchFactor);
        });

        this.labels.forEach(({ time }, i) => {
            this.labels[i].time = getRoundedValue(time * stretchFactor);
        });

        this.callbackAdd.forEach(({ time }, i) => {
            this.callbackAdd[i].time = getRoundedValue(time * stretchFactor);
        });
    }

    /**
     *
     * @prop {Object.<string, number>} obj Initial data Object
     * @returns {M} The instance on which this method was called.
     */
    setData(obj = {}) {
        this.values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                fromValue: value,
                currentValue: value,
                active: false,
                settled: false,
                ease: getTweenFn('easeLinear'),
            };
        });

        return this;
    }

    /**
     * Return the new array maeged with main array created in setData
     *
     * @private
     *
     * @param  {Array} data new datato merge
     * @return {Array} main store Array merged with new data
     */
    mergeArray(newData, data) {
        return data.map((item) => {
            const itemToMerge = newData.find((newItem) => {
                return newItem.prop === item.prop;
            });

            const inactiveItem = {
                prop: item.prop,
                active: false,
            };

            // If exist merge
            return itemToMerge
                ? { ...item, ...itemToMerge, ...{ active: true } }
                : inactiveItem;
        });
    }

    /**
     * @private
     *
     * @property {Array} arr
     *
     * @description
     * Sorts the array by the lowest start value
     */
    orderByStart(arr) {
        return arr.sort((a, b) => {
            return a.start - b.start;
        });
    }

    /**
     * @description
     * setPropFromAncestor
     * - Example when we come from goTo methods:
     *
     *  When we define the toValue we have to associate the right fromValue value
     *  ( ease methods need fromValue and toValue to calculate current value)
     *  we search back into the array until we found an active item with the same prop ( for example: rotate )
     *  we take the the first usable toValue and use we it as current fromValue
     *
     * @param  {string} propToFind first ancestor prop <toValue> || <fromValue>
     */
    setPropFromAncestor(propToFind) {
        this.timeline.forEach(({ values }, i) => {
            values.forEach(({ prop, active }, iValues) => {
                if (!active) return;

                // Goback into the array
                const previousValidValue = getFirstValidValueBack(
                    this.timeline,
                    i,
                    prop,
                    propToFind
                );

                // If we found a value apply it
                if (previousValidValue !== null) {
                    values[iValues][propToSet[propToFind].set] =
                        previousValidValue;
                }
            });
        });
    }

    /**
     * @param {Object.<string, number|function>} to values
     * @param {sequencerSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special properties
     * @returns {M} The instance on which this method was called.
     *
     * @example
     * ```js
     * mySequencer.goTo(
     *     { string: number|function, ... },
     *     { start: number, end: number, ease: string }
     * );
     *
     *
     * ```
     * @description
     * Transform some properties of your choice from the `current value` to the `entered value`, the transformation will start from the value associated with start and will end in the value associated with end.
     * <br/>
     * The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change in real time as the result of the function changes
     * <br/>
     * It is possible to associate an easing to the transformation, this easing will be applied only in this transformation.
     * <br/>
     */
    goTo(obj, props) {
        const propMerged = { ...this.defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        const data = goToSyncUtils(obj, ease);
        const newValues = this.mergeArray(data, this.values);
        this.timeline.push({
            values: newValues,
            start,
            end,
        });

        this.timeline = this.orderByStart(this.timeline);
        this.setPropFromAncestor('fromValue');
        return this;
    }

    /**
     * @param {Object.<string, number|function>} from values
     * @param {sequencerSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special properties
     * @returns {M} The instance on which this method was called.
     *
     * @example
     * ```js
     * mySequencer.goFrom(
     *     { string: number|function, ... },
     *     { start: number, end: number, ease: string }
     * );
     *
     *
     * ```
     * @description
     * Transform some properties of your choice from the `entered value` to the `current value`, the transformation will start from the value associated with start and will end in the value associated with end.
     * <br/>
     * The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change in real time as the result of the function changes
     * <br/>
     * It is possible to associate an easing to the transformation, this easing will be applied only in this transformation.
     * <br/>
     */
    goFrom(obj, props) {
        const propMerged = { ...this.defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        const data = goFromSyncUtils(obj, ease);
        const newValues = this.mergeArray(data, this.values);
        this.timeline.push({
            values: newValues,
            start,
            end,
        });

        this.timeline = this.orderByStart(this.timeline);
        this.setPropFromAncestor('toValue');
        return this;
    }

    /**
     * @param {Object.<string, number|function>} from values
     * @param {Object.<string, number|function>} to values
     * @param {sequencerSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special properties
     *
     * @example
     * ```js
     * mySequencer.goFromTo(
     *     { string: number|function, ... },
     *     { string: number|function, ... },
     *     { start: number, end: number, ease: string }
     * );
     *
     *
     * ```
     *
     * @description
     * Transform some properties of your choice from the `first entered value` to the `second entered value`, the transformation will start from the value associated with start and will end in the value associated with end.
     * <br/>
     * The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change in real time as the result of the function changes
     * <br/>
     * It is possible to associate an easing to the transformation, this easing will be applied only in this transformation.
     * <br/>
     */
    goFromTo(fromObj, toObj, props) {
        const propMerged = { ...this.defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('lerp goFromTo:', fromObj, toObj);
            return;
        }

        const data = goFromToSyncUtils(fromObj, toObj, ease);
        const newValues = this.mergeArray(data, this.values);
        this.timeline.push({
            values: newValues,
            start,
            end,
        });

        this.timeline = this.orderByStart(this.timeline);
        return this;
    }

    /**
     * @param {string} label name
     * @param {number} [ time = 0 ] time
     * @returns {M} The instance on which this method was called.
     *
     * @example
     * ```js
     * mySequencer.label('mylabel',5);
     *
     *
     * ```
     * @description
     * Adds a label associated with a specific step in a range between 0 and duration (default: 10).
     * Both syncTimeline and scrollTrigger will take care of processing the value as needed
     * <br/>
     */
    label(name = '', time = 0) {
        this.labels.push({ name, time });
        return this;
    }

    /**
     * Return the array of entered labels
     * @returns {Array<string>} labels array
     */
    getLabels() {
        return this.labels;
    }

    /**
     * @typedef {Object} sequencerAddProps
     * @prop {number} value  the time value where the caalback is launched
     * @prop {boolean} isForced Indicates that the callback was launched the first time without having exceeded the temporal value, e.g .: combined with a scrollTrigger it is launched the first time the page is loaded if it exceeds the set value even if this value has not been exceeded (as it is missing still the previous value)
     **/

    /**
     * @param {function(import('../utils/constant.js').directionTypes & sequencerAddProps):void } fn - callback function
     * @param {number} time - value between 0 and duration (default 0)
     * @returns {M} The instance on which this method was called.
     *
     * @example
     * ```js
     * mySequencer.add(({direction: string, value: number, isForced: boolean}) => {
     *      //code
     * }, time:number);
     *
     *
     * ```
     * @description
     * Fire a function at a step in a range between 0 and duration (default: 10)
     * Both syncTimeline and scrollTrigger will take care of processing the value as needed
     * <br/>
     */
    add(fn = () => {}, time = 0) {
        const fnIsValid = storeType.isFunction(fn);
        const timeIsValid = storeType.isNumber(time);
        const addIsValid = fnIsValid && timeIsValid;

        if (!fnIsValid) syncTimelineAddFnWarning(fn);
        if (!timeIsValid) syncTimelineAddTimeWarning(time);
        if (!addIsValid) return this;

        this.callbackAdd.push({ fn, time });
        return this;
    }

    /**
     * @param {import('../utils/callbacks/setCallback.js').subscribeCallbackType} cb - callback function.
     * @return {Function} unsubscribe callback.
     *
     * @example
     * ```js
     * //Single DOM element
     * const unsubscribe = mySequencer.subscribe(({ x,y... }) => {
     *      domEl.style.prop = `...`
     * })
     * unsubscribe()
     *
     *
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return mySequencer.subscribe(({ x, y... }) => {
     *       item.style.prop = ...
     *   });
     * });
     * unsubscribeStagger.forEach((item) => item());
     *
     *
     * ```
     * @description
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is advisable to use the subscribeCache method .
     * <br/>
     */
    subscribe(cb = () => {}) {
        const unsubscribeCb = setCallBack(cb, this.callback);
        return () => (this.callback = unsubscribeCb(this.callback));
    }

    /**
     * @param {import('../utils/callbacks/setCallback.js').subscribeCallbackType} cb - callback function.
     * @return {Function} unsubscribe callback.
     *
     * @example
     * ```js
     * //Single DOM element
     * const unsubscribe = mySequencer.onStop(({ x,y... }) => {
     *      domEl.style.prop = `...`
     * })
     * unsubscribe()
     *
     *
     * //Multiple DOM element ( stagger )
     * const unsubscribeStagger = [...elements].map((item) => {
     *   return mySequencer.onStop(({ x, y... }) => {
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
     * <br/>
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
        const unsubscribeCb = setCallBack(cb, this.callbackOnStop);
        return () => (this.callbackOnStop = unsubscribeCb(this.callbackOnStop));
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
     *   return mySequencer.subscribeCache(item, ({ x, y... }) => {
     *       item.style.prop = ...
     *   });
     * });
     * unsubscribeStagger.forEach((item) => item());
     *
     *
     * ```
     * @description
     * Callback that returns updated values ready to be usable, specific to manage large staggers.
     * <br/>
     */
    subscribeCache(item, fn = () => {}) {
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
     * Get duration
     * @return {Number}
     */
    getDuration() {
        return this.duration;
    }

    /**
     * @description
     * Set duration
     * @param {Number} val
     */
    setDuration(val = 0) {
        this.duration = val;
    }

    /**
     * @description
     * Get tween type - 'sequencer'
     * @param {Number} [ val = sequencer]
     */
    getType() {
        return this.type;
    }

    /**
     * @description
     * Removes all references of staggers not yet started by the handleCache function, method used by HandleSyncTimeline when it is stopped
     */
    cleanCachedId() {
        this.callbackCache.forEach(({ cb }) => handleCache.clean(cb));
    }

    /**
     * @description
     * Disable stagger for one run
     **/
    disableStagger() {
        this.useStagger = false;
    }

    /**
     * @description
     * Destroy sequencer
     * <br/>
     */
    destroy() {
        this.values = [];
        this.timeline = [];
        this.callback = [];
        this.callbackCache = [];
        this.callbackOnStop = [];
        this.callbackAdd = [];
        this.unsubscribeCache.forEach((unsubscribe) => unsubscribe());
        this.unsubscribeCache = [];
    }
}

// Timeline array example:
// [
//     {
//         "values": [
//             {
//                   "prop": "x",
//                   "active": false
//              },
//              {
//                   "prop": "y",
//                   "toValue": 0,
//                   "fromValue": -100,
//                   "currentValue": -100,
//                   "active": true,
//                   "settled": false
//              },
//              ...
//         ],
//         "start": 0,
//         "end": 3
//     },
//     {
//         "values": [
//             ...
//         ],
//         "start": 7,
//         "end": 10
//     }
// ]
