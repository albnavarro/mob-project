import { getTweenFn } from '../tween/tweenConfig.js';
import {
    getValueObj,
    compareKeys,
    getRoundedValue,
} from '../utils/animationUtils.js';
import {
    handleCache,
    handleFrame,
    handleNextTick,
} from '../../events/rafutils/rafUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import { getStaggerFromProps } from '../utils/stagger/staggerUtils.js';
import { handleSetUp } from '../../setup.js';

export class HandleSequencer {
    constructor(data = {}) {
        // Basic array with all the propierties, is creted in setData methods
        // in draw methods currentValue and settled will be updated for each prop
        // it is used as a mock to create the array to add to the timeline
        this.values = [];

        // Timeline array
        this.timeline = [];

        this.id = 0;
        this.callback = [];
        this.callbackCache = [];
        this.callbackOnStop = [];
        this.unsubscribeCache = [];
        this.duration = data?.duration
            ? data.duration
            : handleSetUp.get('sequencer').duration;
        this.type = 'sequencer';
        this.defaultProp = {
            start: 0,
            end: this.duration,
            ease: data?.ease ? data.ease : handleSetUp.get('sequencer').ease,
        };

        // Stagger
        this.stagger = getStaggerFromProps(data);
        this.useStagger = true;
        this.staggerIsReady = false;

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.data ? data.data : null;
        if (props) this.setData(props);
    }

    inzializeStagger() {
        if (this.staggerIsReady) return;

        if (
            this.stagger.each > 0 &&
            (this.callbackCache.length || this.callback.length)
        ) {
            const cb =
                this.callbackCache.length > this.callback.length
                    ? this.callbackCache
                    : this.callback;

            if (this.stagger.grid.col > cb.length) {
                console.warn(
                    'stagger col of grid is out of range, it must be less than the number of staggers '
                );
                return;
            }

            const { cbNow, cbCompleteNow } = setStagger({
                cb,
                endCb: this.callbackOnStop,
                stagger: this.stagger,
                slowlestStagger: {},
                fastestStagger: {},
            });

            if (this.callbackCache.length > this.callback.length) {
                this.callbackCache = [...cbNow];
            } else {
                this.callback = [...cbNow];
            }
            this.callbackOnStop = [...cbCompleteNow];
        }

        this.staggerIsReady = true;
    }

    draw({ partial, isLastDraw, useFrame }) {
        const mainFn = () => {
            /*
            Obj utils to avoid new GC allocation during animation
            Try to reduce the GC timing
            Support caluculation in each frame
            */
            let GC = {
                currentEl: null,
                isLastUsableProp: null,
                nextActiveItem: null,
                duration: null,
                inactivePosition: null,
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
                    GC.isLastUsableProp = this.timeline
                        .slice(i + 1, this.timeline.length)
                        .reduce(
                            (p, { start: nextStart, values: nextValues }) => {
                                GC.nextActiveItem = nextValues.find(
                                    (nextItem) => {
                                        return (
                                            nextItem.prop === item.prop &&
                                            nextItem.active
                                        );
                                    }
                                );
                                if (GC.nextActiveItem && nextStart <= partial) {
                                    return false;
                                } else {
                                    return p;
                                }
                            },
                            true
                        );

                    // If in the next step the same props is active and start before partial skip
                    if (!GC.isLastUsableProp) return;

                    // At least we get the current value
                    GC.duration = end - start;
                    GC.inactivePosition =
                        partial < end ? item.fromValue : item.toValue;

                    item.currentValue =
                        partial >= start && partial <= end
                            ? item.ease(
                                  partial - start,
                                  item.fromValue,
                                  item.toValue - item.fromValue,
                                  GC.duration
                              )
                            : GC.inactivePosition;

                    item.currentValue = getRoundedValue(item.currentValue);
                    GC.currentEl.currentValue = item.currentValue;
                    GC.currentEl.settled = true;
                });
            });

            const cbObject = getValueObj(this.values, 'currentValue');

            if (this.stagger.each === 0 || this.useStagger === false) {
                handleFrame.add(() => {
                    this.callback.forEach(({ cb }) => cb(cbObject));
                });

                handleFrame.add(() => {
                    this.callbackCache.forEach(({ cb }) => {
                        handleCache.fireObject({ id: cb, obj: cbObject });
                    });
                });
            } else {
                // Stagger
                this.callback.forEach(({ cb, frame }) => {
                    handleFrame.addIndex(() => cb(cbObject), frame);
                });

                this.callbackCache.forEach(({ cb, frame }) => {
                    handleCache.update({ id: cb, cbObject, frame });
                });
            }

            if (isLastDraw) {
                if (this.stagger.each === 0 || this.useStagger === false) {
                    // No stagger, run immediatly
                    const fn = () =>
                        this.callbackOnStop.forEach(({ cb }) => cb(cbObject));

                    handleFrame.add(() => fn());
                } else {
                    // Stagger
                    this.callbackOnStop.forEach(({ cb, frame }) => {
                        handleFrame.addIndex(() => cb(cbObject), frame + 1);
                    });
                }
            }

            this.useStagger = true;
            // Remove reference to o Object
            GC = null;
        };

        if (useFrame) {
            mainFn();
        } else {
            handleNextTick.add(() => mainFn());
        }
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
     * setPropFormAncestor
     * - Example when we come from goTo methods:
     *
     *  When we define the toValue we have to associate the right fromValue value
     *  ( ease methods need fromValue and toValue to calculate current value)
     *  we search back into the array until we found an active item with the same prop ( for example: rotate )
     *  we take the the first usable toValue and use we it as current fromValue
     *
     * @param  {string} propToFind first ancestor prop <toValue> || <fromValue>
     */
    setPropFormAncestor(propToFind) {
        // If we need fromValue take previuse usable toValue and aplly as fromValue
        const pairing = {
            fromValue: {
                get: 'toValue',
                set: 'fromValue',
            },
            toValue: {
                get: 'fromValue',
                set: 'toValue',
            },
        };

        this.timeline.forEach(({ values }, iTimeline) => {
            values.forEach(({ prop, active }, iValues) => {
                if (!active) return;

                // Goback into the array
                const propToFindValue = this.timeline
                    .slice(0, iTimeline)
                    .reduceRight((p, { values: valuesForward }) => {
                        // Find active prop if exist
                        const result = valuesForward.find(
                            ({ prop: propForward, active: activeForward }) => {
                                return activeForward && propForward === prop;
                            }
                        );

                        // Return only first valid value then skip the successive
                        // we return the value only when the accumulatore is null, so the first time we fond a value
                        return result && p === null
                            ? result[pairing[propToFind].get]
                            : p;
                    }, null);

                // If we found a value apply it
                if (propToFindValue !== null) {
                    values[iValues][pairing[propToFind].set] = propToFindValue;
                }
            });
        });
    }

    /**
     * goTo - go from new toValue from last fromValue
     *
     * @param  {obj} obj new toValue Object
     *
     * @example
     * myTween.goTo({ val: 100 }, { start: 2, end: 5, ease: 'easeInBack' });
     */
    goTo(obj, props) {
        const propMerged = { ...this.defaultProp, ...props };
        const { start, end, ease } = propMerged;

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                ease: getTweenFn(ease),
            };
        });

        const newValues = this.mergeArray(data, this.values);
        this.timeline.push({
            values: newValues,
            start,
            end,
        });

        this.timeline = this.orderByStart(this.timeline);
        this.setPropFormAncestor('fromValue');

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

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                ease: getTweenFn(ease),
            };
        });

        const newValues = this.mergeArray(data, this.values);
        this.timeline.push({
            values: newValues,
            start,
            end,
        });

        this.timeline = this.orderByStart(this.timeline);
        this.setPropFormAncestor('toValue');

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

        const dataIsValid = compareKeys(fromObj, toObj);
        if (!dataIsValid) {
            console.warn('sequencer: fromValue and toValue is different');
            return;
        }

        const data = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                toValue: toObj[item],
                ease: getTweenFn(ease),
            };
        });

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
     * subscribe - add callback to stack
     *
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    subscribe(cb) {
        this.callback.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callback = this.callback.filter((item) => item.id !== cbId);
        };
    }

    /**
     * subscribeCache - add callback to stack
     *
     * @param  {item} htmlElement
     * @return {function}
     *
     */
    subscribeCache(item, fn) {
        const { id, unsubscribe } = handleCache.add(item, fn);
        this.callbackCache.push({ cb: id, id: this.id });
        this.unsubscribeCache.push(unsubscribe);

        const cbId = this.id;
        this.id++;

        return () => {
            unsubscribe();
            this.callbackCache = this.callbackCache.filter(
                (item) => item.id !== cbId
            );
        };
    }

    onStop(cb) {
        this.callbackOnStop.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callbackOnStop = this.callbackOnStop.filter(
                (item) => item.id !== cbId
            );
        };
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
        this.unsubscribeCache.forEach((unsubscribe) => unsubscribe());
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
