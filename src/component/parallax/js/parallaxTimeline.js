import { tweenConfig } from '.../../../js/core/animation/tween/tweenConfig.js';
import { parallaxUtils } from './parallaxUtils.js';

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
                              item.toValue,
                              duration
                          ),
                          minVal,
                          maxVal
                      )
                    : item.toValue;
            });
        });

        // Get last active prop current value
        const cbObject = this.timeline.reduce((p, { values }) => {
            const activeVal = values.filter(({ active }) => active === true);
            const { prop, currentValue } = activeVal[activeVal.length - 1];
            return { ...p, ...{ [prop]: currentValue } };
        }, {});

        // If there is not active prop get default current value
        this.values.forEach(({ prop, currentValue }, i) => {
            if (!(prop in cbObject)) cbObject[prop] = currentValue;
        });

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
            };
        });
    }

    /**
     * mergeData - Update values array with new data form methods
     * Check if newData has new value for each prop
     * If yes merge new value
     *
     * @param  {Array} newData description
     * @return {void}         description
     */
    getNewValues(newData) {
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
