import { tweenConfig } from '../../../js/core/animation/tween/tweenConfig.js';
import {
    getValueObj,
    compareKeys,
} from '../../../js/core/animation/utils/animationUtils.js';
import { mergeDeep } from '../../../js/core/utils/mergeDeep.js';
import {
    getStaggerIndex,
    getRandomChoice,
    setStagger,
} from '.../../../js/core/animation/utils/getStaggerIndex.js';
import {
    handleFrame,
    handleNextTick,
    handleFrameIndex,
} from '../../../js/core/events/rafutils/rafUtils.js';

// Stagger and eade is defined at tween creation
export class ParallaxTween {
    constructor(data = {}) {
        this.ease = data?.ease
            ? tweenConfig[data.ease]
            : tweenConfig['easeLinear'];
        this.values = [];
        this.id = 0;
        this.callbackOnStop = [];
        this.callback = [];
        this.duration = 1000;
        this.type = 'tween';
        // Stagger

        this.DIRECTION_DEFAULT = null;
        this.DIRECTION_ROW = 'row';
        this.DIRECTION_COL = 'col';

        this.stagger = {
            each: data?.stagger?.each ? data.stagger.each : 0,
            from: data?.stagger?.from ? data.stagger.from : 'start',
            grid: {
                col: data?.stagger?.grid?.col ? data.stagger.grid.col : -1,
                row: data?.stagger?.grid?.row ? data.stagger.grid.row : -1,
                direction: data?.stagger?.grid?.direction
                    ? data.stagger.grid.direction
                    : this.DIRECTION_COL,
            },
        };

        this.firstRun = true;
    }

    setStagger() {
        if (this.stagger.each > 0) {
            const { cbNow, cbCompleteNow } = setStagger({
                cb: this.callback,
                endCb: this.callbackOnStop,
                stagger: this.stagger,
                slowlestStagger: {},
                fastestStagger: {},
                DIRECTION_ROW: this.DIRECTION_ROW,
            });

            this.callback = [...cbNow];
            this.callbackOnStop = [...cbCompleteNow];
        }
    }

    draw({ partial, isLastDraw }) {
        if (this.firstRun) this.setStagger();
        this.firstRun = false;

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
        if (this.stagger.each === 0) {
            // No stagger, run immediatly
            this.callback.forEach(({ cb }) => cb(cbObject));
        } else {
            // Stagger
            this.callback.forEach(({ cb, index, frame }, i) => {
                handleFrameIndex(() => cb(cbObject), frame);
            });
        }

        if (isLastDraw) {
            if (this.stagger.each === 0) {
                // No stagger, run immediatly
                this.callbackOnStop.forEach(({ cb }) => cb(cbObject));
            } else {
                // Stagger
                this.callbackOnStop.forEach(({ cb, index, frame }, i) => {
                    handleFrameIndex(() => cb(cbObject), frame + 1);
                });
            }
        }
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
