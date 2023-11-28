// @ts-check

import { getTweenFn } from '../tween/tweenConfig.js';
import { compareKeys, getRoundedValue } from '../utils/animationUtils.js';
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
import {
    compareKeysWarning,
    staggerIsOutOfRangeWarning,
    syncTimelineAddFnWarning,
    syncTimelineAddTimeWarning,
} from '../utils/warning.js';
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
import {
    durationIsValid,
    easeIsValid,
    initialDataPropValidate,
    sequencerRangeValidate,
} from '../utils/tweenAction/tweenValidation.js';
import { handleSetUp } from '../../setup.js';
import { mobCore } from '../../../mobCore/index.js';
import { directionConstant } from '../utils/timeline/timelineConstant.js';
import { getValueObj } from '../utils/tweenAction/getValues.js';
import { STAGGER_DEFAULT_INDEX_OBJ } from '../utils/stagger/staggerCostant.js';

export default class HandleSequencer {
    /**
     * @param {import('./type.js').sequencerProps} data
     *
     * @example
     * ```javascript
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
     *
     *
     * ```
     *
     * @description
     * Available methods:
     * ```javascript
     * mySequencer.goTo()
     * mySequencer.goFrom()
     * mySequencer.goFromTo()
     * mySequencer.add()
     * mySequencer.label()
     * mySequencer.subscribe()
     * mySequencer.subscribeCache()
     * mySequencer.onStop()
     *
     * ```
     */
    constructor(data) {
        /**
         * Basic array with all the propierties, is created in setData methods
         * in draw methods currentValue and settled will be updated for each prop
         *
         * it is used as a mock to create the array to add to the timeline
         * @private
         * @type {import('./type.js').sequencerValue[]}
         */
        this.values = [];

        /**
         * Timeline array
         *
         * @private
         * @type {import('./type.js').sequencerRow[]}
         */
        this.timeline = [];

        /**
         * @private
         * @type {import('./type.js').labelType[]}
         */
        this.labels = [];

        /**
         * @private
         * @type {import('../utils/callbacks/type.js').callbackObject[]}
         */
        this.callback = [];

        /**
         * @private
         * @type {import('../utils/callbacks/type.js').callbackObject[]}
         */
        this.callbackCache = [];

        /**
         * @private
         * @type {import('../utils/callbacks/type.js').callbackObject[]}
         */
        this.callbackOnStop = [];

        /**
         * @private
         * @type {import('./type.js').addType[]}
         */
        this.callbackAdd = [];

        /**
         * @private
         * @type {Array<function>}
         */
        this.unsubscribeCache = [];

        /**
         * @private
         * @type {number}
         */
        this.duration = durationIsValid(data?.duration);

        /**
         * @private
         * @type {string}
         */
        this.type = 'sequencer';

        /**
         * @private
         * @type {import('./type.js').sequencerDefault}
         */
        this.defaultProp = {
            start: 0,
            end: this.duration,
            ease: easeIsValid(data?.ease),
        };

        /**
         * @private
         */
        this.firstRun = true;

        /**
         * @private
         */
        this.forceAddFnAtFirstRun = true;

        /**
         * @private
         * @type {string|undefined}
         */
        this.direction = undefined;

        /**
         * @private
         * @type {number}
         */
        this.lastPartial = 0;

        /**
         * @private
         * @type {string|undefined}
         */
        this.lastDirection = undefined;

        /**
         * @private
         * @type {import('../utils/stagger/type.js').staggerObject}
         */
        this.stagger = getStaggerFromProps(data);

        /**
         * @private
         * @type {boolean}
         */
        this.useStagger = true;

        /**
         * @private
         * @type {boolean}
         */
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

        this.staggerIsReady = true;
    }

    /**
     * @param {object} obj
     * @param {number} obj.partial
     * @param {boolean} obj.isLastDraw
     * @param {boolean} obj.useFrame
     * @param {string} obj.direction
     *
     * @example
     * ```javascript
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
             * because timeline know the loop state and direction is stable
             * Inside a parallax we have a fallback, but we don't have a loop
             *
             * On first run check is jumped
             */
            if (
                !this.firstRun &&
                this.lastPartial &&
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

            this.values.forEach((item) => {
                item.settled = false;
            });

            this.timeline.forEach(({ start, end, values }, i) => {
                values.forEach((item) => {
                    const currentEl = this.values.find(
                        ({ prop }) => prop === item.prop
                    );

                    if (!currentEl) return;

                    /**
                     * Id the prop is settled or is inactive skip
                     */
                    if (currentEl.settled || !item.active) return;

                    /**
                     * Check if in the next step of timeline the same prop is active an start before partial
                     */
                    const isLastUsableProp = checkIsLastUsableProp(
                        this.timeline,
                        i,
                        item.prop,
                        partial
                    );

                    /**
                     * If in the next step the same props is active and start before partial skip
                     */
                    if (!isLastUsableProp) return;

                    const toValue = mobCore.checkType(Number, item.toValue)
                        ? item.toValue
                        : // @ts-ignore
                          item.toValue();

                    const fromValue = mobCore.checkType(Number, item.fromValue)
                        ? item.fromValue
                        : // @ts-ignore
                          item.fromValue();

                    /**
                     * At least we get the current value
                     */
                    const duration = end - start;
                    const inactivePosition =
                        partial < end ? fromValue : toValue;

                    item.currentValue =
                        partial >= start && partial <= end
                            ? item.ease(
                                  partial - start,
                                  fromValue,
                                  toValue - fromValue,
                                  duration
                              )
                            : inactivePosition;

                    item.currentValue = getRoundedValue(item.currentValue);
                    currentEl.currentValue = item.currentValue;
                    currentEl.settled = true;
                });
            });

            const callBackObject = getValueObj(this.values, 'currentValue');

            syncCallback({
                each: this.stagger.each,
                useStagger: this.useStagger,
                isLastDraw,
                callBackObject,
                callback: this.callback,
                callbackCache: this.callbackCache,
                callbackOnStop: this.callbackOnStop,
            });

            this.fireAddCallBack(partial);

            this.useStagger = true;
            this.lastPartial = partial;
            this.lastDirection = this.direction;
            this.firstRun = false;
        };

        if (useFrame) {
            mainFn();
        } else {
            mobCore.useNextTick(() => mainFn());
        }
    }

    /**
     * @description
     * Methods call by syncTimeline, everty time user use play, playFrom etc.. or loop end.
     * Reset the data that control add callback to have a new clean state
     */
    resetLastValue() {
        this.firstRun = true;
        this.lastPartial = 0;
        this.lastDirection = undefined;
    }

    /**
     * @private
     *
     * @property {number} [ time=0 ]
     *
     * @description
     * Fire addCallback first time without check the previous position.
     * because first time we can start from any position and we doesn't a have previous position
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
             * In forward mode current time must be greater or equal than fn time
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
             * time and fnTime cannot be the same, because fnTime
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
     * @returns {this} The instance on which this method was called.
     */
    setData(obj = {}) {
        this.values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            const isValid = initialDataPropValidate(prop, value);
            const valueSanitized = isValid ? value : 0;

            return {
                prop: isValid ? prop : 'invalidProp',
                toValue: valueSanitized,
                fromValue: valueSanitized,
                currentValue: valueSanitized,
                active: false,
                settled: false,
                ease: getTweenFn(handleSetUp.get('sequencer').ease),
            };
        });

        return this;
    }

    /**
     * Return the new array maeged with main array created in setData
     *
     * @private
     *
     * @param  {Array} newData new datato merge
     * @param {import('./type.js').sequencerValue[]} data
     *
     * @return {import('./type.js').sequencerValue[]}
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
                ? { ...item, ...itemToMerge, active: true }
                : inactiveItem;
        });
    }

    /**
     * @private
     *
     * @param {import('./type.js').sequencerRow[]} arr
     * @returns {import('./type.js').sequencerRow[]} arr
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
     * @private
     *
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
     * @param {import('../utils/tweenAction/type.js').valueToparseType} obj  to values
     * @param {import('./type.js').sequencerAction} props special properties
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * mySequencer.goTo(
     *     { string: number|function, ... },
     *     { start: number, end: number, ease: string }
     * );
     *
     *
     * ```
     * @description
     * Transform some properties of your choice from the `current value` to the `entered value`, the transformation will start from the value associated with start and will end in the value associated with end.
     * The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change in real time as the result of the function changes
     * It is possible to associate an easing to the transformation, this easing will be applied only in this transformation.
     */
    goTo(obj, props) {
        const propMerged = { ...this.defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        const data = goToSyncUtils(obj, ease);
        const newValues = this.mergeArray(data, this.values);
        this.timeline.push({
            values: newValues,
            start: start ?? 0,
            end: end ?? this.duration,
        });

        this.timeline = this.orderByStart(this.timeline);
        this.setPropFromAncestor('fromValue');
        return this;
    }

    /**
     * @param {import('../utils/tweenAction/type.js').valueToparseType} obj from values
     * @param {import('./type.js').sequencerAction} props special properties
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * mySequencer.goFrom(
     *     { string: number|function, ... },
     *     { start: number, end: number, ease: string }
     * );
     *
     *
     * ```
     * @description
     * Transform some properties of your choice from the `entered value` to the `current value`, the transformation will start from the value associated with start and will end in the value associated with end.
     * The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change in real time as the result of the function changes
     * It is possible to associate an easing to the transformation, this easing will be applied only in this transformation.
     */
    goFrom(obj, props) {
        const propMerged = { ...this.defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        const data = goFromSyncUtils(obj, ease);
        const newValues = this.mergeArray(data, this.values);
        this.timeline.push({
            values: newValues,
            start: start ?? 0,
            end: end ?? this.duration,
        });

        this.timeline = this.orderByStart(this.timeline);
        this.setPropFromAncestor('toValue');
        return this;
    }

    /**
     * @param {import('../utils/tweenAction/type.js').valueToparseType} fromObj from values
     * @param {import('../utils/tweenAction/type.js').valueToparseType} toObj to values
     * @param {import('./type.js').sequencerAction} props special properties
     *
     * @example
     * ```javascript
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
     * The target value can be a number or a function that returns a number, when using a function the target value will become dynamic and will change in real time as the result of the function changes
     * It is possible to associate an easing to the transformation, this easing will be applied only in this transformation.
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
            start: start ?? 0,
            end: end ?? this.duration,
        });

        this.timeline = this.orderByStart(this.timeline);
        return this;
    }

    /**
     * @param {string} name
     * @param {number} [ time = 0 ] time
     * @returns {this} The instance on which this method was called.
     *
     * @example
     * ```javascript
     * mySequencer.label('mylabel',5);
     *
     *
     * ```
     * @description
     * Adds a label associated with a specific step in a range between 0 and duration (default: 10).
     * Both syncTimeline and scrollTrigger will take care of processing the value as needed
     */
    label(name = '', time = 0) {
        this.labels.push({ name, time });
        return this;
    }

    /**
     * Return the array of entered labels
     * @returns {import('./type.js').labelType[]} labels array
     */
    getLabels() {
        return this.labels;
    }

    /**
     * @param {function(import('../utils/timeline/type.js').directionTypeObjectSequencer ):void } fn - callback function
     * @param {number} time - Value grater than 0 and minor duration.
     * @returns {this} The instance on which this method was called.
     *
     * @description
     * Fire a function at a step in a range greater the 0 and minor duration.
     * Both syncTimeline and scrollTrigger will take care of processing the value as needed.
     *
     * To interpect both end ( 0 and duration )
     * use the syncTimeline/scrollTrigger built in function:
     *
     * ```javascript
     * // For syncTimeline:
     * myTimeline.onLoopEnd()
     *
     * // For scrollTrigger:
     * myScrolltrigger.onEnter();
     * myScrolltrigger.onEnterBack();
     * myScrolltrigger.onLeave();
     * myScrolltrigger.onLeaveBack();
     * ```
     *
     * @example
     * ```javascript
     * mySequencer.add(({direction: string, value: number, isForced: boolean}) => {
     *      //code
     * }, time:number);
     * ```
     */
    add(fn = () => {}, time = 0) {
        const fnIsValid = mobCore.checkType(Function, fn);
        const timeIsValid = mobCore.checkType(Number, time);
        const addIsValid = fnIsValid && timeIsValid;

        if (!fnIsValid) syncTimelineAddFnWarning(fn);
        if (!timeIsValid) syncTimelineAddTimeWarning(time);
        if (!addIsValid) return this;

        this.callbackAdd.push({ fn, time });
        return this;
    }

    /**
     * @param {function(any):void} cb - callback function.
     * @return {Function} unsubscribe callback.
     *
     * @example
     * ```javascript
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
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is advisable to use the subscribeCache method.
     */
    subscribe(cb = () => {}) {
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
     * ```javascript
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
     *  Similar to subscribe this callBack is launched when the data calculation stops (when the timeline ends or the scroll trigger is inactive).
     *  Useful for applying a different style to an inactive element.
     *  A typical example is to remove the teansform3D property:
     *
     * @example
     * ```javascript
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
     * @param {(Object|HTMLElement)} item
     * @param {function(any):void} fn - callback function.
     * @return {Function} unsubscribe callback
     *
     * @example
     *```javascript
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
     */
    subscribeCache(item, fn = () => {}) {
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
     * Set duration
     * @param {Number} val
     */
    setDuration(val = 0) {
        this.duration = val;
    }

    /**
     * @description
     * Get tween type - 'sequencer'
     */
    getType() {
        return this.type;
    }

    /**
     * @description
     * Removes all references of staggers not yet started by the handleCache function, method used by HandleSyncTimeline when it is stopped
     */
    cleanCachedId() {
        this.callbackCache.forEach(({ cb }) => mobCore.useCache.clean(cb));
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
