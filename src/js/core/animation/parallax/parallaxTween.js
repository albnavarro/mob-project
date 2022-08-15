import { getTweenFn, tweenConfig } from '../../animation/tween/tweenConfig.js';
import {
    getValueObj,
    compareKeys,
    getRoundedValue,
} from '../../animation/utils/animationUtils.js';
import { handleCache } from '../../events/rafutils/handleCache.js';
import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { handleFrameIndex } from '../../events/rafutils/handleFrameIndex.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import { getStaggerFromProps } from '../utils/stagger/staggerUtils.js';
import { handleSetUp } from '../../setup.js';
import {
    setCallBack,
    setCallBackCache,
} from '../utils/callbacks/setCallback.js';
import { goTo, goFrom, goFromTo } from '../utils/actions.js';
import {
    compareKeysWarning,
    staggerIsOutOfRangeWarning,
} from '../utils/warning.js';

// Stagger and eade is defined at tween creation
export class ParallaxTween {
    constructor(data = {}) {
        this.ease = data?.ease
            ? getTweenFn(data.ease)
            : getTweenFn(handleSetUp.get('parallaxTween').ease);
        this.values = [];
        this.callbackOnStop = [];
        this.callback = [];
        this.callbackCache = [];
        this.unsubscribeCache = [];
        this.duration = handleSetUp.get('parallaxTween').duration;
        this.type = 'tween';
        // Stagger

        this.stagger = getStaggerFromProps(data);

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.data ? data.data : null;
        if (props) this.setData(props);
    }

    inzializeStagger() {
        if (
            this.stagger.each > 0 &&
            (this.callbackCache.length || this.callback.length)
        ) {
            const cb =
                this.callbackCache.length > this.callback.length
                    ? this.callbackCache
                    : this.callback;

            if (this.stagger.grid.col > cb.length) {
                staggerIsOutOfRangeWarning(cb.length);
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
                this.callbackCache = cbNow;
            } else {
                this.callback = cbNow;
            }
            this.callbackOnStop = cbCompleteNow;
        }
    }

    draw({ partial, isLastDraw }) {
        const mainFn = () => {
            this.values.forEach((item) => {
                item.currentValue = this.ease(
                    partial,
                    item.fromValue,
                    item.toValProcessed,
                    this.duration
                );
                item.currentValue = getRoundedValue(item.currentValue);
            });

            // Prepare an obj to pass to the callback
            const cbObject = getValueObj(this.values, 'currentValue');

            // Fire callback
            if (this.stagger.each === 0) {
                // No stagger, run immediatly
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
                    handleFrameIndex.add(() => cb(cbObject), frame);
                });

                this.callbackCache.forEach(({ cb, frame }) => {
                    handleCache.update({ id: cb, cbObject, frame });
                });
            }

            if (isLastDraw) {
                if (this.stagger.each === 0) {
                    // No stagger, run immediatly
                    handleFrame.add(() => {
                        this.callbackOnStop.forEach(({ cb }) => cb(cbObject));
                    });
                } else {
                    // Stagger
                    this.callbackOnStop.forEach(({ cb, frame }) => {
                        handleFrameIndex.add(() => cb(cbObject), frame + 1);
                    });
                }
            }
        };

        handleNextTick.add(() => mainFn());
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
                settled: false,
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
        this.values.forEach((item) => {
            item.toValProcessed = item.toValue - item.fromValue;
        });
    }

    setEasingWhileRunning(props) {
        if (props?.ease && props?.ease in tweenConfig) {
            this.ease = tweenConfig[props.ease];
        }
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
        const data = goTo(obj);
        this.setEasingWhileRunning(props);
        this.mergeData(data);
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
        const data = goFrom(obj);
        this.setEasingWhileRunning(props);
        this.mergeData(data);
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
        if (!compareKeys(fromObj, toObj)) {
            compareKeysWarning('spring goFromTo:', fromObj, toObj);
            return;
        }

        this.setEasingWhileRunning(props);
        const data = goFromTo(fromObj, toObj);
        this.mergeData(data);
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
        const unsubscribeCb = setCallBack(cb, this.callback);
        return () => (this.callback = unsubscribeCb(this.callback));
    }

    /**
     * subscribe - add callback onStop
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    onStop(cb) {
        const unsubscribeCb = setCallBack(cb, this.callbackOnStop);
        return () => (this.callbackOnStop = unsubscribeCb(this.callbackOnStop));
    }

    /**
     * subscribeCache - add callback to stack
     *
     * @param  {item} htmlElement
     * @return {function}
     *
     */
    subscribeCache(item, fn) {
        const { unsubscribeCb, unsubscribeCache } = setCallBackCache(
            item,
            fn,
            this.callbackCache,
            this.unsubscribeCache
        );

        this.unsubscribeCache = unsubscribeCache;
        return () => (this.callbackCache = unsubscribeCb(this.callbackCache));
    }

    getDuration() {
        return this.duration;
    }

    getType() {
        return this.type;
    }

    /**
     * Remove all reference from tween
     */
    destroy() {
        this.values = [];
        this.callbackOnStop = [];
        this.callback = [];
        this.callbackCache = [];
        this.unsubscribeCache.forEach((unsubscribe) => unsubscribe());
        this.unsubscribeCache = [];
    }
}
