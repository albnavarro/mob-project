import { tweenConfig } from '../tween/tweenConfig.js';
import { clamp, getValueObj } from '../utils/animationUtils.js';

export class HandleSequencer {
    constructor() {
        // Basic array with all the propierties, is creted in setData methods
        // in draw methods currentValue and settled will be updated for each prop
        // it is used as a mock to create the array to add to the timeline
        this.values = [];

        // Timeline array
        this.timeline = [];

        this.id = 0;
        this.callback = [];
        this.duration = 10;
        this.type = 'sequencer';
        this.defaultProp = { start: 0, end: this.duration, ease: 'easeLinear' };
    }

    draw(partial) {
        this.values.forEach((item, i) => {
            item.settled = false;
        });

        this.timeline.forEach(({ start, end, values }, i) => {
            values.forEach((item) => {
                const currentEl = this.values.find(
                    ({ prop }) => prop === item.prop
                );

                // Id the prop is settled or is inactive skip
                if (currentEl.settled || !item.active) return;

                // Check if in the next step of timeline the same prop is active an start before partial
                const isLastUsableProp = this.timeline
                    .slice(i + 1, this.timeline.length)
                    .reduce((p, { start: nextStart, values: nextValues }) => {
                        const nextActiveItem = nextValues.find((nextItem) => {
                            return (
                                nextItem.prop === item.prop && nextItem.active
                            );
                        });
                        if (nextActiveItem && nextStart <= partial) {
                            return false;
                        } else {
                            return p;
                        }
                    }, true);

                // If in the next step the same props is active and start before partial skip
                if (!isLastUsableProp) return;

                // At least we get the current value
                const duration = end - start;
                const minVal =
                    item.toValue > item.fromValue
                        ? item.fromValue
                        : item.toValue;
                const maxVal =
                    item.toValue > item.fromValue
                        ? item.toValue
                        : item.fromValue;

                item.currentValue =
                    partial >= start && partial <= end
                        ? item.ease(
                              partial - start,
                              item.fromValue,
                              item.toValue - item.fromValue,
                              duration
                          )
                        : clamp(
                              item.ease(
                                  partial - start,
                                  item.fromValue,
                                  item.toValue - item.fromValue,
                                  duration
                              ),
                              minVal,
                              maxVal
                          );

                if (!Number.isNaN(item.currentValue)) {
                    currentEl.currentValue = item.currentValue.toFixed(4);
                    currentEl.settled = true;
                }
            });
        });

        const cbObject = getValueObj(this.values, 'currentValue');

        // Fire callback
        this.callback.forEach(({ cb }) => {
            cb(cbObject);
        });
    }

    /**
     * this.compareKeys - Compare fromObj, toObj in goFromTo methods
     * Check if has the same keys
     *
     * @param  {Object} a fromObj Object
     * @param  {Object} b toObj Object
     * @return {bollean} has thew same keys
     */
    compareKeys(a, b) {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
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
                ease: tweenConfig['easeLinear'],
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
        return data.map((item, i) => {
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
                ease: tweenConfig[ease],
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
                ease: tweenConfig[ease],
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

        const dataIsValid = this.compareKeys(fromObj, toObj);
        if (!dataIsValid) {
            console.warn('sequencer: fromValue and toValue is different');
            return;
        }

        const data = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                toValue: toObj[item],
                ease: tweenConfig[ease],
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

    getDuration() {
        return this.duration;
    }

    getType() {
        return this.type;
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
