import { tweenConfig } from '../../../js/core/animation/tween/tweenConfig.js';
import {
    getValueObj,
    compareKeys,
} from '../../../js/core/animation/utils/animationUtils.js';
import { mergeDeep } from '../../../js/core/utils/mergeDeep.js';
import {
    getStaggerIndex,
    getRandomChoice,
} from '.../../../js/core/animation/utils/getStaggerIndex.js';
import {
    handleFrame,
    handleNextTick,
    handleFrameIndex,
} from '../../../js/core/events/rafutils/rafUtils.js';

export class ParallaxTween {
    constructor(ease = 'easeLinear') {
        this.ease = tweenConfig[ease];
        this.values = [];
        this.id = 0;
        this.callbackOnStop = [];
        this.callback = [];
        this.duration = 1000;
        this.type = 'tween';
        this.firstRun = true;
        this.newPros = {};
        this.defaultProps = {
            stagger: {
                each: 0,
                from: 'start',
            },
        };
        this.stagger = { each: 0, from: 'start' };
    }

    draw({ partial, isLastDraw }) {
        // At first run define props like stagger
        if (this.firstRun) this.mergeProps();

        this.values.forEach((item, i) => {
            item.currentValue = this.ease(
                partial,
                item.fromValue,
                item.toValProcessed,
                this.duration
            );
        });

        // Prepare an obj to pass to the callback
        const cbObject = getValueObj(this.values, 'currentValue');

        // Fire callback
        if (this.stagger.each === 0 || this.firstRun) {
            // No stagger, run immediatly
            this.callback.forEach(({ cb }) => cb(cbObject));
        } else {
            // Stagger
            this.callback.forEach(({ cb, index, frame }, i) => {
                handleFrameIndex(() => cb(cbObject), frame);
            });
        }

        if (isLastDraw) {
            if (this.stagger.each === 0 || this.firstRun) {
                // No stagger, run immediatly
                this.callbackOnStop.forEach(({ cb }) => cb(cbObject));
            } else {
                // Stagger
                this.callbackOnStop.forEach(({ cb, index, frame }, i) => {
                    handleFrameIndex(() => cb(cbObject), frame);
                });
            }
        }

        this.firstRun = false;
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
                toValProcessed: value,
                fromValue: value,
                currentValue: value,
            };
        });

        return this;
    }

    /**
     * mergeData - Update values array with new data form methods
     * Check if newData has new value for each prop
     * If yes merge new value
     *
     * @param  {Array} newData description
     * @return {void}         description
     */
    mergeData(newData) {
        this.values = this.values.map((item) => {
            const itemToMerge = newData.find((newItem) => {
                return newItem.prop === item.prop;
            });

            // If exist merge
            return itemToMerge ? { ...item, ...itemToMerge } : { ...item };
        });
    }

    /**
     * setToValProcessed - Update to value to match an absolute destination
     *
     * @return {void}  onComplete promise
     *
     */
    setToValProcessed() {
        this.values.forEach((item, i) => {
            item.toValProcessed = item.toValue - item.fromValue;
        });
    }

    /**
     * mergeProps - Mege special props with default props
     *
     * @param  {Object} props { reverse: <>, config: <> , immediate <> }
     * @return {Object} props merged
     *
     */
    mergeProps() {
        const newProps = mergeDeep(this.defaultProps, this.newPros);

        const { stagger } = newProps;
        this.stagger.each = stagger.each;
        this.stagger.from = stagger.from;

        if (this.stagger.each > 0) {
            this.callback.forEach((item, i) => {
                const { index, frame } = getStaggerIndex(
                    i,
                    this.callback.length,
                    this.stagger,
                    getRandomChoice(this.callback, this.stagger.each, i)
                );

                item.index = index;
                item.frame = frame;

                if (this.callbackOnStop.length > 0) {
                    this.callbackOnStop[i].index = index;
                    this.callbackOnStop[i].frame = frame;
                }
            });
        }

        return newProps;
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {number} to new toValue
     *
     * @example
     * myTween.goTo({ val: 100 });
     */
    goTo(obj, props = {}) {
        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
            };
        });

        // Store pros like stagger
        // Aplly it in subscribe
        this.newPros = { ...props };
        this.mergeData(newDataArray);
        this.setToValProcessed();
        return this;
    }

    /**
     * goFrom - go from new fromValue ( manually update fromValue )  to toValue sored
     *
     * @param  {number} from new fromValue
     *
     * @example
     * myTween.goFrom({ val: 100 });
     */
    goFrom(obj, props = {}) {
        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
            };
        });

        // Store pros like stagger
        // Aplly it in subscribe
        this.newPros = { ...props };
        //
        this.mergeData(newDataArray);
        this.setToValProcessed();
        return this;
    }

    /**
     * goFromTo - Go From new fromValue to new toValue
     *
     * @param  {number} from new fromValue
     * @param  {number} to new toValue
     *
     * @example
     * myTween.goFromTo({ val: 0 },{ val: 100 })
     */
    goFromTo(fromObj, toObj, props = {}) {
        // Check if fromObj has the same keys of toObj
        const dataIsValid = compareKeys(fromObj, toObj);
        if (!dataIsValid) {
            console.warn(
                `parallaxTween: ${JSON.stringify(
                    fromObj
                )} and to ${JSON.stringify(toObj)} is not equal`
            );
            return;
        }

        const newDataArray = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                toValue: toObj[item],
            };
        });

        // Store pros like stagger
        // Aplly it in subscribe
        this.newPros = { ...props };
        //
        this.mergeData(newDataArray);
        this.setToValProcessed();
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

    getType() {
        return this.type;
    }
}
