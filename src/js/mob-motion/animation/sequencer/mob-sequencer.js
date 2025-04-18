// @ts-check

import { getTweenFn } from '../tween/tween-config.js';
import { compareKeys, getRoundedValue } from '../utils/animation-utils.js';
import { setStagger } from '../utils/stagger/set-stagger.js';
import {
    getStaggerFromProps,
    getStaggerArray,
} from '../utils/stagger/stagger-utils.js';
import {
    updateSubScribers,
    updateSubscribersCache,
} from '../utils/callbacks/set-callback.js';
import { syncCallback } from '../utils/callbacks/sync-callback.js';
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
} from './sync-actions.js';
import {
    durationIsValid,
    easeIsValid,
    initialDataPropValidate,
    sequencerRangeValidate,
} from '../utils/tween-action/tween-validation.js';
import { handleSetUp } from '../../setup.js';
import { MobCore } from '../../../mob-core/index.js';
import { directionConstant } from '../utils/timeline/timeline-constant.js';
import { getValueObj } from '../utils/tween-action/get-values.js';
import { STAGGER_DEFAULT_INDEX_OBJ } from '../utils/stagger/stagger-costant.js';
import { sequencerGetValusOnDraw } from './get-values-on-draw.js';
import { setPropFromAncestor } from './set-prop-from-ancestor.js';
import { insertNewRow } from './insert-new-row.js';
import { mergeNewValues } from './merge-new-values.js';

export default class MobSequencer {
    /**
     * Basic array with all the propierties, is created in setData methods in draw methods currentValue and settled will
     * be updated for each prop
     *
     * It is used as a mock to create the array to add to the timeline
     *
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
     * @type {(() => void)[]}
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
     * Available methods:
     *
     * ```javascript
     * mySequencer.goTo();
     * mySequencer.goFrom();
     * mySequencer.goFromTo();
     * mySequencer.add();
     * mySequencer.label();
     * mySequencer.subscribe();
     * mySequencer.subscribeCache();
     * mySequencer.onStop();
     * ```
     *
     * @example
     *     ```javascript
     *     const mySequencer = new MobSequencer({
     *       data: Object.<string, number>,
     *       duration: [ Number ],
     *       ease: [ String ],
     *       stagger:{
     *          each: [ Number ],
     *          from: [ Number|String|{x:number,y:number} ],
     *          grid: {
     *              col: [ Number ],
     *              row: [ Number ],
     *              direction: [ String ]
     *          },
     *       },
     *     })
     *
     *
     *     ```;
     *
     * @param {import('./type.js').SequencerProps} data
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
         * Set initial store data if defined in constructor props If not use setData methods
         */
        const props = data?.data || null;
        if (props) this.setData(props);
    }

    /**
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
                    /** @type {import('../utils/callbacks/type.js').CallbackCache} */ (
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
     * @example
     *     ```javascript
     *     mySequencer.draw(
     *          partial: 200,
     *          isLastDraw: true,
     *          useFrame: false,
     *          direction: ('backward'|'forward'|'none')
     *     );
     *
     *
     *     ```;
     *
     * @param {object} obj
     * @param {number} obj.partial
     * @param {boolean} obj.isLastDraw
     * @param {boolean} obj.useFrame
     * @param {import('../utils/timeline/type.js').DirectionType} [obj.direction]
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

        MobCore.useNextTick(() =>
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
     * @param {import('../utils/timeline/type.js').DirectionType} [obj.direction]
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
         * Inside a timeline the direction is controlled by timeline and pass the value because timeline know the loop
         * state and direction is stable Inside a parallax we have a fallback, but we don't have a loop
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
     * Methods call by syncTimeline, everty time user use play, playFrom etc.. or loop end. Reset the data that control
     * add callback to have a new clean state
     */
    resetLastValue() {
        this.#firstRun = true;
        this.#lastPartial = 0;
    }

    /**
     * Fire addCallback first time without check the previous position. because first time we can start from any
     * position and we doesn't a have previous position So we fire the callback once To skip this callback, check
     * isForce prop in callback
     *
     * @property {number} [time=0] Default is `0`
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
     * Fire callBack at specific time
     *
     * @property {number} [time=0] Default is `0`
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
     * Set factor between timeline duration and sequencer getDuration So start and end propierties will be proportionate
     * to the duration of the timeline This methods is called by SyncTimeline
     *
     * @type {import('./type.js').CequencerSetStretchFacor}
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
         * First time add a set with initial data. We create a value for ancestor/reduce mechenism This row has priority
         * 0, so we are sure that is the first row of timeline array.
         */
        this.goTo(obj, { start: 0, end: 0 });
        return this;
    }

    /**
     * Transform some properties of your choice from the `current value` to the `entered value`, the transformation will
     * start from the value associated with start and will end in the value associated with end. The target value can be
     * a number or a function that returns a number, when using a function the target value will become dynamic and will
     * change in real time as the result of the function changes It is possible to associate an easing to the
     * transformation, this easing will be applied only in this transformation.
     *
     * @example
     *     ```javascript
     *     mySequencer.goTo(
     *         { string: number|function, ... },
     *         { start: number, end: number, ease: string }
     *     );
     *
     *
     *     ```;
     *
     * @type {import('./type.js').SequencerGoTo}
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
     * Transform some properties of your choice from the `entered value` to the `current value`, the transformation will
     * start from the value associated with start and will end in the value associated with end. The target value can be
     * a number or a function that returns a number, when using a function the target value will become dynamic and will
     * change in real time as the result of the function changes It is possible to associate an easing to the
     * transformation, this easing will be applied only in this transformation.
     *
     * @example
     *     ```javascript
     *     mySequencer.goFrom(
     *         { string: number|function, ... },
     *         { start: number, end: number, ease: string }
     *     );
     *
     *
     *     ```;
     *
     * @type {import('./type.js').SequencerGoFrom} obj To values
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
     * Transform some properties of your choice from the `first entered value` to the `second entered value`, the
     * transformation will start from the value associated with start and will end in the value associated with end. The
     * target value can be a number or a function that returns a number, when using a function the target value will
     * become dynamic and will change in real time as the result of the function changes It is possible to associate an
     * easing to the transformation, this easing will be applied only in this transformation.
     *
     * @example
     *     ```javascript
     *     mySequencer.goFromTo(
     *         { string: number|function, ... },
     *         { string: number|function, ... },
     *         { start: number, end: number, ease: string }
     *     );
     *
     *
     *     ```;
     *
     * @type {import('./type.js').SequencerGoFromTo}
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
     * Adds a label associated with a specific step in a range between 0 and duration (default: 10). Both syncTimeline
     * and scrollTrigger will take care of processing the value as needed
     *
     * @example
     *     ```javascript
     *     mySequencer.label('mylabel',5);
     *
     *
     *     ```;
     *
     * @type {import('./type.js').SequencerLabel}
     */
    label(name = '', time = 0) {
        this.#labels.push({ name, time });
        return this;
    }

    /**
     * Return the array of entered labels
     *
     * @type {import('./type.js').SequencerGetLabels}
     */
    getLabels() {
        return this.#labels;
    }

    /**
     * Fire a function at a step in a range greater the 0 and minor duration. Both syncTimeline and scrollTrigger will
     * take care of processing the value as needed.
     *
     * To interpect both end ( 0 and duration ) use the syncTimeline/scrollTrigger built in function:
     *
     * @type {import('./type.js').SequencerAdd}
     */
    add(fn = () => {}, time = 0) {
        const fnIsValid = MobCore.checkType(Function, fn);
        const timeIsValid = MobCore.checkType(Number, time);
        const addIsValid = fnIsValid && timeIsValid;

        if (!fnIsValid) syncTimelineAddFnWarning(fn);
        if (!timeIsValid) syncTimelineAddTimeWarning(time);
        if (!addIsValid) return this;

        this.#callbackAdd.push({ fn, time });
        return this;
    }

    /**
     * Callback that returns updated values ready to be usable, it is advisable to use it for single elements, although
     * it works well on a not too large number of elements (approximately 100-200 elements) for large staggers it is
     * advisable to use the subscribeCache method.
     *
     * @type {import('./type.js').SequencerSubscribe}
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
     * Similar to subscribe this callBack is launched when the data calculation stops (when the timeline ends or the
     * scroll trigger is inactive). Useful for applying a different style to an inactive element. A typical example is
     * to remove the teansform3D property:
     *
     * @type {import('./type.js').SequencerOnStop}
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
     * Callback that returns updated values ready to be usable, specific to manage large staggers.
     *
     * @type {import('./type.js').SequencerSubscribeCache}
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
     * Get duration
     *
     * @type {import('./type.js').SequencerGetDuration}
     */
    getDuration() {
        return this.#duration;
    }

    /**
     * Set duration
     *
     * @type {import('./type.js').SequencerSetDuration}
     */
    setDuration(val = 0) {
        this.#duration = val;
    }

    /**
     * Get tween type - 'sequencer'
     *
     * @type {import('./type.js').SequencerGetType}
     */
    getType() {
        return this.#type;
    }

    /**
     * Removes all references of staggers not yet started by the handleCache function, method used by HandleSyncTimeline
     * when it is stopped
     */
    cleanCachedId() {
        this.#callbackCache.forEach(({ cb }) => MobCore.useCache.clean(cb));
    }

    /**
     * Disable stagger for one run
     */
    disableStagger() {
        this.#useStagger = false;
    }

    /**
     * Destroy sequencer
     *
     * @type {() => void}
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
