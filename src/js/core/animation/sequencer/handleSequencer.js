import { tweenConfig } from '../tween/tweenConfig.js';
import { clamp, getValueObj } from '../utils/animationUtils.js';

export class HandleSequencer {
    constructor() {
        this.values = [];
        this.timeline = [];
        this.id = 0;
        this.callback = [];
        this.duration = 10;
        this.type = 'sequencer';
        this.defaultProp = { start: 0, end: 10, ease: 'easeLinear' };
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

                const isLastUsableProp = this.timeline
                    .slice(i + 1, this.timeline.length)
                    .reduce((p, { start: nextStart, values: nextValues }) => {
                        const activeItem = nextValues.find((nextItem) => {
                            return (
                                nextItem.prop === item.prop && nextItem.active
                            );
                        });
                        if (activeItem && nextStart <= partial) {
                            return false;
                        } else {
                            return p;
                        }
                    }, true);

                if (isLastUsableProp && item.active && !currentEl.settled) {
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

                    currentEl.currentValue = item.currentValue;
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
     * @return {void}  description
     *
     * @example
     * myTween.setData({ val: 100 });
     */
    setData(obj) {
        const valToArray = Object.entries(obj);

        this.values = valToArray.map((item) => {
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
     * @param  {Array} newData description
     * @return {void}         description
     */
    getNewValues(newData) {
        // Return the new array maeged with main array created in setData
        return this.values.map((item, i) => {
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

    setFromValue() {
        this.timeline.forEach(({ values }, iTimeline) => {
            values.forEach(({ prop, active }, iValues) => {
                if (!active) return;

                const prevToValue = this.timeline
                    .slice(0, iTimeline)
                    .reduceRight((p, { values: valuesForward }) => {
                        // Find active prop if exist
                        const result = valuesForward.find(
                            ({ prop: propForward, active: activeForward }) => {
                                return activeForward && propForward === prop;
                            }
                        );
                        // Return only first valid value then skip ( p === null)
                        return result && p === null ? result.toValue : p;
                    }, null);

                if (prevToValue !== null) {
                    values[iValues].fromValue = prevToValue;
                }
            });
        });
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {number} to new toValue
     *
     * @example
     * myTween.goTo({ val: 100 });
     */
    goTo(obj, props) {
        const propMerged = { ...this.defaultProp, ...props };
        const { start, end, ease } = propMerged;

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                ease: tweenConfig[ease],
            };
        });

        const newValues = this.getNewValues(newDataArray);
        this.timeline.push({
            values: newValues,
            start,
            end,
        });

        this.timeline = this.orderByStart(this.timeline);
        this.setFromValue();

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
