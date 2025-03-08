// @ts-check

import { getTweenFn } from '../tween/tweenConfig.js';
import { compareKeys, getRoundedValue } from '../utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    getStaggerFromProps,
    getStaggerArray,
} from '../utils/stagger/staggerUtils.js';
import {
    updateSubScribers,
    updateSubscribersCache,
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
import { sequencerGetValusOnDraw } from './getValuesOnDraw.js';
import { setPropFromAncestor } from './setPropFromAncestor.js';
import { insertNewRow } from './insertNewRow.js';
import { mergeNewValues } from './mergeNewValues.js';

export default class MobSequencer {
    /**
     * Basic array with all the propierties, is created in setData methods
     * in draw methods currentValue and settled will be updated for each prop
     *
     * it is used as a mock to create the array to add to the timeline
     * @type {import('./type.js').SequencerValue[]}
     */
    #values;

    /**
     * Timeline array
     *
     * @type {import('./type.js').SequencerRow[]}
     */
    #timeline;

    /**
     * @type {import('./type.js').LabelType[]}
     */
    #labels;

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
    #callbackOnStop;

    /**
     * @type {import('./type.js').AddType[]}
     */
    #callbackAdd;

    /**
     * @type {Array<() => void>}
     */
    #unsubscribeCache;

    /**
     * @type {number}
     */
    #duration;

    /**
     * @type {string}
     */
    #type;

    /**
     * @type {import('./type.js').SequencerDefault}
     */
    #defaultProp;

    /**
     * @type {boolean}
     */
    #firstRun;

    /**
     * @type {boolean}
     */
    #forceAddFnAtFirstRun;

    /**
     * @type {import('../utils/timeline/type.js').DirectionType}
     */
    #direction;

    /**
     * @type {number}
     */
    #lastPartial;

    /**
     * @type {import('../utils/stagger/type.js').StaggerObject}
     */
    #stagger;

    /**
     * @type {boolean}
     */
    #useStagger;

    /**
     * @type {boolean}
     */
    #staggerIsReady;

    /**
     * @param {import('./type.js').SequencerProps} data
     *
     * @example
     * ```javascript
     * const mySequencer = new MobSequencer({
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
        this.#values = [];
        this.#timeline = [];
        this.#labels = [];
        this.#callback = [];
        this.#callbackCache = [];
        this.#callbackOnStop = [];
        this.#callbackAdd = [];
        this.#unsubscribeCache = [];
        this.#duration = durationIsValid(data?.duration);
        this.#type = 'sequencer';
        this.#defaultProp = {
            start: 0,
            end: this.#duration,
            ease: easeIsValid(data?.ease),
        };
        this.#firstRun = true;
        this.#forceAddFnAtFirstRun = true;
        this.#direction = 'none';
        this.#lastPartial = 0;
        this.#stagger = getStaggerFromProps(data);
        this.#useStagger = true;
        this.#staggerIsReady = false;

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
        if (this.#staggerIsReady) return;

        if (
            this.#stagger.each > 0 &&
            (this.#callbackCache.length > 0 || this.#callback.length > 0)
        ) {
            const cb = getStaggerArray(this.#callbackCache, this.#callback);

            if (this.#stagger.grid.col > cb.length) {
                staggerIsOutOfRangeWarning(cb.length);
                return;
            }

            const { staggerArray, staggerArrayOnComplete } = setStagger({
                arrayDefault: cb,
                arrayOnStop: this.#callbackOnStop,
                stagger: this.#stagger,
                slowlestStagger: STAGGER_DEFAULT_INDEX_OBJ, //sequencer doesn't support fastestStagger
                fastestStagger: STAGGER_DEFAULT_INDEX_OBJ, //sequencer doesn't support fastestStagger
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

            this.#callbackOnStop = staggerArrayOnComplete;
        }

        this.#staggerIsReady = true;
    }

    /**
     * @param {object} obj
     * @param {number} obj.partial
     * @param {boolean} obj.isLastDraw
     * @param {boolean} obj.useFrame
     * @param {import('../utils/timeline/type.js').DirectionType} [ obj.direction ]
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
        if (useFrame) {
            this.#onDraw({
                partial,
                isLastDraw,
                direction,
            });
            return;
        }

        mobCore.useNextTick(() =>
            this.#onDraw({
                partial,
                isLastDraw,
                direction,
            })
        );
    }

    /**
     * @param {object} obj
     * @param {number} obj.partial
     * @param {boolean} obj.isLastDraw
     * @param {import('../utils/timeline/type.js').DirectionType} [ obj.direction ]
     *
     */
    #onDraw({
        partial = 0,
        isLastDraw = false,
        direction = directionConstant.NONE,
    }) {
        /*
         * First time run or after reset lasValue
         * all the last value is null so get the current value
         */
        if (this.#firstRun) {
            this.#lastPartial = partial;
            this.#actionAtFirstRender(partial);
        }

        /**
         * Inside a timeline the direction is controlled by timeline and pass the value
         * because timeline know the loop state and direction is stable
         * Inside a parallax we have a fallback, but we don't have a loop
         *
         * On first run check is jumped
         */
        if (
            !this.#firstRun &&
            this.#lastPartial &&
            (!direction || direction === directionConstant.NONE)
        ) {
            this.#direction =
                partial >= this.#lastPartial
                    ? directionConstant.FORWARD
                    : directionConstant.BACKWARD;
        }

        if (
            !this.#firstRun &&
            (direction === directionConstant.BACKWARD ||
                direction === directionConstant.FORWARD)
        ) {
            this.#direction = direction;
        }

        /**
         * Reset settled status
         */
        this.#values = [...this.#values].map((item) => {
            return {
                ...item,
                settled: false,
            };
        });

        /**
         * Get new values
         */
        this.#values = sequencerGetValusOnDraw({
            timeline: this.#timeline,
            valuesState: this.#values,
            partial,
        });

        const callBackObject = getValueObj(this.#values, 'currentValue');

        syncCallback({
            each: this.#stagger.each,
            useStagger: this.#useStagger,
            isLastDraw,
            callBackObject,
            callback: this.#callback,
            callbackCache: this.#callbackCache,
            callbackOnStop: this.#callbackOnStop,
        });

        this.#fireAddCallBack(partial);

        this.#useStagger = true;
        this.#lastPartial = partial;
        this.#firstRun = false;
    }

    /**
     * @description
     * Methods call by syncTimeline, everty time user use play, playFrom etc.. or loop end.
     * Reset the data that control add callback to have a new clean state
     */
    resetLastValue() {
        this.#firstRun = true;
        this.#lastPartial = 0;
    }

    /**
     * @property {number} [ time=0 ]
     *
     * @description
     * Fire addCallback first time without check the previous position.
     * because first time we can start from any position and we doesn't a have previous position
     * So we fire the callback once
     * To skip this callback, check isForce prop in callback
     */
    #actionAtFirstRender(time = 0) {
        if (!this.#forceAddFnAtFirstRun) return;

        this.#callbackAdd.forEach(({ fn, time: fnTime }) => {
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

        this.#forceAddFnAtFirstRun = false;
    }

    /**
     * @property {number} [ time=0 ]
     *
     * @description
     * Fire callBack at specific time
     *
     */
    #fireAddCallBack(time = 0) {
        this.#callbackAdd.forEach(({ fn, time: fnTime }) => {
            /*
             * In forward mode current time must be greater or equal than fn time
             * and the last current time must be minor than fn time to prevent
             * the the fn is fired before fn time is reached
             */
            const mustFireForward =
                this.#direction === directionConstant.FORWARD &&
                time > fnTime &&
                this.#lastPartial <= fnTime;

            /*
             * In backward mode current time must be minor or equal than fn time
             * and the last current time must be greater than fn time to prevent
             * the the fn is fired before fn time is reached
             * time and fnTime cannot be the same, because fnTime
             * is equal max duration of timeline/parallax the previous value
             * can be equal max duration, so we avoid double firing of fn
             */
            const mustFireBackward =
                this.#direction === directionConstant.BACKWARD &&
                time < fnTime &&
                this.#lastPartial >= fnTime;

            // const mustFire =
            //     (mustFireForward || mustFireBackward) && shouldFired;
            const mustFire = mustFireForward || mustFireBackward;
            if (!mustFire) return;

            fn({ direction: this.#direction, value: time, isForced: false });
        });
    }

    /**
     * @type {import('./type.js').CequencerSetStretchFacor}
     *
     * @description
     * Set factor between timeline duration and sequencer getDuration
     * So start and end propierties will be proportionate to the duration of the timeline
     * This methods is called by SyncTimeline
     */
    setStretchFactor(duration = 0) {
        const stretchFactor = duration / this.#duration;

        this.#timeline = [...this.#timeline].map((item) => {
            const { start, end } = item;

            return {
                ...item,
                start: getRoundedValue(start * stretchFactor),
                end: getRoundedValue(end * stretchFactor),
            };
        });

        this.#labels = [...this.#labels].map((item) => {
            const { time } = item;

            return {
                ...item,
                time: getRoundedValue(time * stretchFactor),
            };
        });

        this.#callbackAdd = [...this.#callbackAdd].map((item) => {
            const { time } = item;

            return {
                ...item,
                time: getRoundedValue(time * stretchFactor),
            };
        });
    }

    /**
     * @type {import('./type.js').SequencerSetData}
     */
    setData(obj = {}) {
        this.#values = Object.entries(obj).map((item) => {
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

        /**
         * First time add a set with initial data.
         * We create a value for ancestor/reduce mechenism
         * This row has priority 0, so we are sure that is the first row of timeline array.
         */
        this.goTo(obj, { start: 0, end: 0 });
        return this;
    }

    /**
     * @type {import('./type.js').SequencerGoTo}
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
        const propMerged = { ...this.#defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        const data = goToSyncUtils(obj, ease);
        const newValues = mergeNewValues({ data, values: this.#values });
        const activeProp = Object.keys(obj);

        /**
         * Update timeline and order by start value and priority.
         */
        const newTimeline = insertNewRow({
            timeline: this.#timeline,
            values: newValues,
            start,
            end,
            duration: this.#duration,
            propToFind: 'fromValue',
        });

        /**
         * Update to formValue with fist usable formValue in previous row.is
         */
        this.#timeline = setPropFromAncestor({
            timeline: newTimeline,
            activeProp,
        });

        return this;
    }

    /**
     * @type {import('./type.js').SequencerGoFrom} obj  to values
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
        const propMerged = { ...this.#defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        const data = goFromSyncUtils(obj, ease);
        const newValues = mergeNewValues({ data, values: this.#values });
        const activeProp = Object.keys(obj);

        /**
         * Update timeline and order by start value and priority.
         */
        const newTimeline = insertNewRow({
            timeline: this.#timeline,
            values: newValues,
            start,
            end,
            duration: this.#duration,
            propToFind: 'toValue',
        });

        /**
         * Update to formValue with fist usable formValue in previous row.is
         */
        this.#timeline = setPropFromAncestor({
            timeline: newTimeline,
            activeProp,
        });

        return this;
    }

    /**
     * @type {import('./type.js').SequencerGoFromTo}
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
        const propMerged = { ...this.#defaultProp, ...props };
        const { start, end, ease } = propMerged;

        if (!sequencerRangeValidate({ start, end })) return this;

        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('sequencer goFromTo:', fromObj, toObj);
            return this;
        }

        const data = goFromToSyncUtils(fromObj, toObj, ease);
        const newValues = mergeNewValues({ data, values: this.#values });

        /**
         * Update timeline and order by start value and priority.
         */
        this.#timeline = insertNewRow({
            timeline: this.#timeline,
            values: newValues,
            start,
            end,
            duration: this.#duration,
            propToFind: '',
        });

        return this;
    }

    /**
     * @type {import('./type.js').SequencerLabel}
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
        this.#labels.push({ name, time });
        return this;
    }

    /**
     * Return the array of entered labels
     * @type {import('./type.js').SequencerGetLabels}
     */
    getLabels() {
        return this.#labels;
    }

    /**
     * @type {import('./type.js').SequencerAdd}
     *
     * @description
     * Fire a function at a step in a range greater the 0 and minor duration.
     * Both syncTimeline and scrollTrigger will take care of processing the value as needed.
     *
     * To interpect both end ( 0 and duration )
     * use the syncTimeline/scrollTrigger built in function:
     */
    add(fn = () => {}, time = 0) {
        const fnIsValid = mobCore.checkType(Function, fn);
        const timeIsValid = mobCore.checkType(Number, time);
        const addIsValid = fnIsValid && timeIsValid;

        if (!fnIsValid) syncTimelineAddFnWarning(fn);
        if (!timeIsValid) syncTimelineAddTimeWarning(time);
        if (!addIsValid) return this;

        this.#callbackAdd.push({ fn, time });
        return this;
    }

    /**
     * @type {import('./type.js').SequencerSubscribe}
     *
     * @description
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is advisable to use the subscribeCache method.
     */
    subscribe(cb = () => {}) {
        const { arrayOfCallbackUpdated, unsubscribeCb } = updateSubScribers(
            cb,
            this.#callback
        );
        this.#callback = arrayOfCallbackUpdated;

        return () => (this.#callback = unsubscribeCb(this.#callback));
    }

    /**
     * @type {import('./type.js').SequencerOnStop}
     *
     * @description
     *  Similar to subscribe this callBack is launched when the data calculation stops (when the timeline ends or the scroll trigger is inactive).
     *  Useful for applying a different style to an inactive element.
     *  A typical example is to remove the teansform3D property:
     */
    onStop(cb) {
        const { arrayOfCallbackUpdated, unsubscribeCb } = updateSubScribers(
            cb,
            this.#callbackOnStop
        );
        this.#callbackOnStop = arrayOfCallbackUpdated;

        return () =>
            (this.#callbackOnStop = unsubscribeCb(this.#callbackOnStop));
    }

    /**
     * @type {import('./type.js').SequencerSubscribeCache}
     *
     * @description
     * Callback that returns updated values ready to be usable, specific to manage large staggers.
     */
    subscribeCache(item, fn = () => {}) {
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
     * @description
     * Get duration
     * @type {import('./type.js').SequencerGetDuration}
     */
    getDuration() {
        return this.#duration;
    }

    /**
     * @description
     * Set duration
     * @type {import('./type.js').SequencerSetDuration}
     */
    setDuration(val = 0) {
        this.#duration = val;
    }

    /**
     * @type {import('./type.js').SequencerGetType}
     * @description
     * Get tween type - 'sequencer'
     */
    getType() {
        return this.#type;
    }

    /**
     * @description
     * Removes all references of staggers not yet started by the handleCache function, method used by HandleSyncTimeline when it is stopped
     */
    cleanCachedId() {
        this.#callbackCache.forEach(({ cb }) => mobCore.useCache.clean(cb));
    }

    /**
     * @description
     * Disable stagger for one run
     **/
    disableStagger() {
        this.#useStagger = false;
    }

    /**
     * @type {() => void}
     * @description
     * Destroy sequencer
     */
    destroy() {
        this.#values = [];
        this.#timeline = [];
        this.#callback = [];
        this.#callbackCache = [];
        this.#callbackOnStop = [];
        this.#callbackAdd = [];
        this.#unsubscribeCache.forEach((unsubscribe) => unsubscribe());
        this.#unsubscribeCache = [];
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
