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

        this.stagger = {
            each: data?.stagger?.each ? data.stagger.each : 0,
            from: data?.stagger?.from ? data.stagger.from : 'start',
        };
    }

    setStagger() {
        if (this.stagger.each > 0) {
            this.callback.forEach((item, i) => {
                const { index, frame } = getStaggerIndex(
                    i,
                    this.callback.length,
                    this.stagger,
                    getRandomChoice(this.callback, this.stagger.each, i)
                );

                const frameNow = Math.round(
                    (frame * handleFrame.getFps()) / 60
                );

                item.index = index;
                item.frame = frameNow;
                item.maxFrame = frameNow;

                if (this.callbackOnStop[i]) {
                    this.callbackOnStop[i].index = index;
                    this.callbackOnStop[i].frame = frameNow;
                    this.callbackOnStop[i].maxFrame = frameNow;
                }
            });
        }
    }

    draw({ partial, isLastDraw }) {
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
            this.callback.forEach(({ cb, index, frame, maxFrame }, i) => {
                // Prevent overlapping frame if fps change, fix the value to the maximum fps
                // Update maxFrame only if there is a value bigger then previous
                // So we have a stable frame Index
                const frameNow = Math.round(
                    (frame * handleFrame.getFps()) / 60
                );
                const maxFrameNow = frameNow > maxFrame ? frameNow : maxFrame;
                this.callback[i].maxFrame = maxFrameNow;
                if (this.callbackOnStop.length > 0) {
                    this.callbackOnStop[i].maxFrame = maxFrameNow;
                }
                handleFrameIndex(() => cb(cbObject), maxFrameNow);
            });
        }

        if (isLastDraw) {
            if (this.stagger.each === 0) {
                // No stagger, run immediatly
                this.callbackOnStop.forEach(({ cb }) => cb(cbObject));
            } else {
                // Stagger
                this.callbackOnStop.forEach(({ cb, index, maxFrame }, i) => {
                    handleFrameIndex(() => cb(cbObject), maxFrame + 1);
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
        this.setStagger();

        return () => {
            this.callback = this.callback.filter((item) => item.id !== cbId);
        };
    }

    onStop(cb) {
        this.callbackOnStop.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;
        this.setStagger();

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
