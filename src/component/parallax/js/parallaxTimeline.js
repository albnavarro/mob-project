import { tweenConfig } from '.../../../js/core/animation/tween/tweenConfig.js';
import { parallaxUtils } from './parallaxUtils.js';
import { getValueObj } from '.../../../js/core/animation/utils/animationUtils.js';

export class ParallaxTimeline {
    constructor(ease = 'easeLinear') {
        this.ease = tweenConfig[ease];
        this.values = [];
        this.timeline = [];
        this.id = 0;
        this.callback = [];
        this.duration = 10;
        this.type = 'timeline';
    }

    draw(partial) {
        this.timeline.forEach(({ start, end, values }, i) => {
            const duration = end - start;

            values.forEach((item, i) => {
                const minVal =
                    item.toValue > item.fromValue
                        ? item.fromValue
                        : item.toValue;
                const maxVal =
                    item.toValue > item.fromValue
                        ? item.toValue
                        : item.fromValue;

                item.currentValue = item.active
                    ? parallaxUtils.clamp(
                          this.ease(
                              partial - start,
                              item.fromValue,
                              item.toValue - item.fromValue,
                              duration
                          ),
                          minVal,
                          maxVal
                      )
                    : item.toValue;

                // The right prop to check is the prop that canche theit current value
                if (
                    item.active &&
                    item.prevCurrent &&
                    item.prevCurrent !== item.currentValue
                ) {
                    const activeEl = this.values.find(
                        ({ prop }) => prop === item.prop
                    );

                    // Update last active value in main array
                    activeEl.currentValue = item.currentValue;
                }

                // Store last current
                item.prevCurrent = item.currentValue;

                // Reset prevCurrent outSide active range
                if (partial >= this.duration || partial <= 0)
                    item.prevCurrent = null;
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
                prevCurrent: null,
                active: false,
            };
        });
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

            // If exist merge
            return itemToMerge
                ? { ...item, ...itemToMerge, ...{ active: true } }
                : { ...item, ...{ active: false } };
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
                if (active) {
                    let continueLoop = true;

                    // TODO: find a better way to write this, use reduceRight()
                    // Go forward to match the first active prop and set fromValue from previous toValue
                    for (
                        var iForward = iTimeline - 1;
                        iForward >= 0;
                        iForward--
                    ) {
                        if (continueLoop) {
                            const valuesForward =
                                this.timeline[iForward].values;

                            valuesForward.forEach(
                                ({
                                    prop: propForward,
                                    active: activeForward,
                                    toValue,
                                }) => {
                                    if (activeForward && propForward === prop) {
                                        this.timeline[iTimeline].values[
                                            iValues
                                        ].fromValue = toValue;
                                        continueLoop = false;
                                    }
                                }
                            );
                        }
                    }
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
    goTo(obj, props = { start: 0, end: 10 }) {
        const { start, end } = props;

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
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

        console.log(this.timeline);
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
