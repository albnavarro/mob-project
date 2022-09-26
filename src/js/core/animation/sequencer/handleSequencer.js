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
 * @prop {Object.<string, number>} data Initial data Object es: { x: 0, rotate: 0 }
 * @prop {number} [ duration=10] Defines the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed. The default value is 10
 **/

export class HandleSequencer {
    /**
     * @param { sequencerTypes & import('../utils/stagger/setStagger.js').staggerTypes & import('../tween/tweenConfig.js').easeTypes} data
     *
     * @description
     * {
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
     * }
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

    draw({ partial, isLastDraw, useFrame, direction }) {
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
            if (!this.firstRun && !direction) {
                this.direction =
                    partial >= this.lastPartial
                        ? directionConstant.FORWARD
                        : directionConstant.BACKWARD;
            }

            if (!this.firstRun && direction) {
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
     * Methods call by timeline, everty time user use play, playFrom etcc.. or loop end.
     * Reset the data that control add callback to have a new clean state
     */
    resetLastValue() {
        this.firstRun = true;
        this.lastPartial = null;
        this.lastDirection = null;
    }

    /**
     * Fire addCallback first time without check the previous position.
     * becouse first time we can start from any position and we doasn't a have previous position
     * So we fir the callback once
     * To skip this callback, check isForce prop in callback
     */
    actionAtFirstRender(time) {
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

    fireAddCallBack(time) {
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
     * Set factor between timeline duration and sequencer getDuration
     * So start and end propierties will be proportionate to the duration of the timeline
     * This methods is called by SyncTimeline
     */
    setStretchFactor(duration) {
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
     * setData - Set initial data structure
     *
     * @return {Object}  this
     *
     * @example
     * myTween.setData({ val: 100 });
     */
    setData(obj) {
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

    orderByStart(arr) {
        return arr.sort((a, b) => {
            return a.start - b.start;
        });
    }

    /**
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
     * @typedef {Object} sequencerGoToSpecialProps
     * @prop {number} [ start=0 ] Defines the start of the transformation of the timeline in use, from 0 to the maximum surat set. The default is 0
     * @prop {number} [ end=duration ] Defines the start of the transformation of the timeline in use, from 0 to the maximum surat set. The default value is the set duration
     **/

    /**
     * @param {Object.<string, number|function>} obj Destination value of Object propierties
     * @param {sequencerGoToSpecialProps & import('../tween/tweenConfig.js').easeTypes} props special properties
     *
     * @description
     * <br/>
     * mySequencer.goTo({ string: number|function, ... }, { start: number, end: number, ease: string });
     * <br/>
     * Transform x optionally properties of the object from the current value to the indicated value, the transformation will start from the value associated with start and will end in the value associated with end.
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
     * goFrom - go from new goFrom from last toValue
     *
     * @param  {obj} obj new toValue Object
     *
     * @example
     * myTween.goFrom({ val: 100 }, { start: 2, end: 5, ease: 'easeInBack' });
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
     * goFrom - go from new fromValue to new toValue
     *
     * @param  {obj} fromObj new fromObj Object
     * @param  {obj} toObj new toValue Object
     *
     * @example
     * myTween.goFrom({ val: 100 }, { start: 2, end: 5, ease: 'easeInBack' });
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
     * Set label
     */
    label(name, time = 0) {
        this.labels.push({ name, time });
        return this;
    }

    /**
     * Get labels array
     */
    getLabels() {
        return this.labels;
    }

    /**
     * add to fire at x time
     */
    add(fn, time = 0) {
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
     * subscribe - add callback to stack
     *
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    subscribe(cb) {
        const unsubscribeCb = setCallBack(cb, this.callback);
        return () => (this.callback = unsubscribeCb(this.callback));
    }

    /**
     * subscribe - add callback onStop
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    onStop(cb) {
        const unsubscribeCb = setCallBack(cb, this.callbackOnStop);
        return () => (this.callbackOnStop = unsubscribeCb(this.callbackOnStop));
    }

    /**
     * subscribeCache - add callback to stack
     *
     * @param  {item} htmlElement
     * @return {function}
     *
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

    getDuration() {
        return this.duration;
    }

    setDuration(val) {
        this.duration = val;
    }

    getType() {
        return this.type;
    }

    cleanCachedId() {
        this.callbackCache.forEach(({ cb }) => handleCache.clean(cb));
    }

    /**
     * Disable stagger for one run
     * To place object immediatly without "delay"
     **/
    disableStagger() {
        this.useStagger = false;
    }

    /**
     * Remove all reference from tween
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
