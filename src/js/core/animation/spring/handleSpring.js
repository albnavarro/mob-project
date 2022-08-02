import {
    getUnivoqueId,
    getValueObj,
    mergeArray,
    compareKeys,
    getRoundedValue,
} from '../utils/animationUtils.js';
import {
    loadFps,
    handleCache,
    handleFrame,
    handleNextTick,
} from '../../events/rafutils/rafUtils.js';
import { mergeDeep } from '../../utils/mergeDeep.js';
import { handleSetUp } from '../../setup.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import { STAGGER_DEFAULT_INDEX_OBJ } from '../utils/stagger/staggerCostant.js';
import { getStaggerFromProps } from '../utils/stagger/staggerUtils.js';
import {
    defaultCallbackOnComplete,
    defaultCallback,
} from '../utils/callbacks/defaultCallback.js';

export class HandleSpring {
    constructor(data = {}) {
        this.uniqueId = getUnivoqueId();
        this.req = false;
        this.currentResolve = null;
        this.currentReject = null;
        this.promise = null;
        this.values = [];
        this.id = 0;
        this.callback = [];
        this.callbackCache = [];
        this.callbackOnComplete = [];
        this.callbackStartInPause = [];
        this.unsubscribeCache = [];
        this.pauseStatus = false;
        this.firstRun = true;
        this.useStagger = true;
        this.fpsInLoading = false;

        /**
        This value lives from user call ( goTo etc..) until next call
         **/
        this.config =
            'config' in data
                ? this.springValidator(data.config)
                : handleSetUp.get('spring').default;

        this.relative =
            'relative' in data
                ? data.relative
                : handleSetUp.get('spring').relative;

        /**
        This value is the base value merged with new value in custom prop
        passed form user in goTo etc..
         **/
        this.defaultProps = {
            reverse: false,
            config: this.config,
            relative: this.relative,
            immediate: false,
        };

        /**
        Stagger value
         **/
        this.stagger = getStaggerFromProps(data);
        this.slowlestStagger = STAGGER_DEFAULT_INDEX_OBJ;
        this.fastestStagger = STAGGER_DEFAULT_INDEX_OBJ;

        /**
         * Set initial store data if defined in constructor props
         * If not use setData methods
         */
        const props = data?.data ? data.data : null;
        if (props) this.setData(props);
    }

    springValidator(config) {
        if (config in handleSetUp.get('spring')) {
            return handleSetUp.get('spring')[config];
        } else {
            console.warn(
                `${config} doasn't exist in spring configuration list`
            );
            return handleSetUp.get('spring').default;
        }
    }

    onReuqestAnim(time, fps, res) {
        this.values.forEach((item) => {
            item.velocity = parseFloat(this.config.velocity);
            item.currentValue = parseFloat(item.fromValue);

            // Normalize toValue in case is a string
            item.toValue = parseFloat(item.toValue);
        });

        // Normalize spring config props

        let o = {};
        o.tension = parseFloat(this.config.tension);
        o.friction = parseFloat(this.config.friction);
        o.mass = parseFloat(this.config.mass);
        o.precision = parseFloat(this.config.precision);

        const draw = (time, fps) => {
            this.req = true;

            this.values.forEach((item) => {
                o.tensionForce =
                    -o.tension * (item.currentValue - item.toValue);
                o.dampingForce = -o.friction * item.velocity;
                o.acceleration = (o.tensionForce + o.dampingForce) / o.mass;

                item.velocity = item.velocity + (o.acceleration * 1) / fps;
                item.currentValue =
                    item.currentValue + (item.velocity * 1) / fps;

                item.currentValue = getRoundedValue(item.currentValue);

                o.isVelocity = Math.abs(item.velocity) <= 0.1;

                o.isDisplacement =
                    o.tension !== 0
                        ? Math.abs(
                              parseFloat(
                                  item.toValue - item.currentValue
                              ).toFixed(4)
                          ) <= o.precision
                        : true;

                item.settled = o.isVelocity && o.isDisplacement;
            });

            // Prepare an obj to pass to the callback
            o.cbObject = getValueObj(this.values, 'currentValue');

            defaultCallback({
                stagger: this.stagger,
                callback: this.callback,
                callbackCache: this.callbackCache,
                cbObject: o.cbObject,
                useStagger: this.useStagger,
            });

            // Check if all values is completed
            o.allSettled = this.values.every((item) => item.settled === true);

            if (!o.allSettled) {
                handleFrame.add(() => {
                    handleNextTick.add(({ time, fps }) => {
                        if (this.req) draw(time, fps);
                    });
                });
            } else {
                const onComplete = () => {
                    this.req = false;

                    // End of animation
                    // Set fromValue with ended value
                    // At the next call fromValue become the start value
                    this.values.forEach((item) => {
                        item.fromValue = item.toValue;
                    });

                    // On complete
                    if (!this.pauseStatus) {
                        // Remove reference to o Object
                        o = null;
                        //
                        res();

                        // Set promise reference to null once resolved
                        this.promise = null;
                        this.currentReject = null;
                        this.currentResolve = null;
                    }
                };

                // Prepare an obj to pass to the callback with rounded value ( end user value)
                const cbObjectSettled = getValueObj(this.values, 'toValue');

                defaultCallbackOnComplete({
                    onComplete,
                    callback: this.callback,
                    callbackCache: this.callbackCache,
                    callbackOnComplete: this.callbackOnComplete,
                    cbObject: cbObjectSettled,
                    stagger: this.stagger,
                    slowlestStagger: this.slowlestStagger,
                    fastestStagger: this.fastestStagger,
                    useStagger: this.useStagger,
                });
            }
        };

        draw(time, fps);
    }

    inzializeStagger() {
        const getStagger = () => {
            const cb =
                this.callbackCache.length > this.callback.length
                    ? this.callbackCache
                    : this.callback;

            if (this.stagger.grid.col > cb.length) {
                console.warn(
                    'stagger col of grid is out of range, it must be less than the number of staggers '
                );
                this.firstRun = false;
                return;
            }

            const { cbNow, cbCompleteNow, fastestStagger, slowlestStagger } =
                setStagger({
                    cb,
                    endCb: this.callbackOnComplete,
                    stagger: this.stagger,
                    slowlestStagger: this.slowlestStagger,
                    fastestStagger: this.fastestStagger,
                });

            if (this.callbackCache.length > this.callback.length) {
                this.callbackCache = [...cbNow];
            } else {
                this.callback = [...cbNow];
            }
            this.callbackOnComplete = [...cbCompleteNow];
            this.slowlestStagger = { ...slowlestStagger };
            this.fastestStagger = { ...fastestStagger };

            this.firstRun = false;
        };

        /**
         * First time il there is a stagger load fps then go next step
         * next time no need to calcaulte stagger and jump directly next step
         *
         **/
        if (
            this.stagger.each > 0 &&
            this.firstRun &&
            (this.callbackCache.length || this.callback.length)
        ) {
            return new Promise((resolve) => {
                loadFps().then(({ averageFPS }) => {
                    console.log(`stagger spring loaded at: ${averageFPS} fps`);
                    getStagger();
                    resolve();
                });
            });
        } else {
            return new Promise((resolve) => {
                resolve();
            });
        }
    }

    startRaf(res, reject) {
        if (this.fpsInLoading) return;

        this.currentReject = reject;
        this.currentResolve = res;

        const cb = () => {
            handleFrame.add(() => {
                handleNextTick.add(({ time, fps }) => {
                    const prevent = this.callbackStartInPause
                        .map(({ cb }) => cb())
                        .some((item) => item === true);

                    this.onReuqestAnim(time, fps, res);
                    if (prevent) this.pause();
                });
            });
        };

        if (this.firstRun) {
            this.fpsInLoading = true;
            this.inzializeStagger().then(() => {
                cb();
                this.fpsInLoading = false;
            });
        } else {
            cb();
            this.firstRun = false;
        }
    }

    /**
     * stop - Stop animatona and force return reject form promise
     *
     * @return {void}  description
     */
    stop() {
        if (this.pauseStatus) this.pauseStatus = false;

        // Update local values with last
        this.values.forEach((item) => {
            item.toValue = item.currentValue;
            item.fromValue = item.toValue;
        });

        // Abort promise
        if (this.currentReject) {
            this.currentReject();
            this.promise = null;
            this.currentReject = null;
            this.currentResolve = null;
        }

        // Reset RAF
        if (this.req) {
            this.req = false;
        }
    }

    /**
     * pause - Pause animation
     * @param  {Number} decay px amout to decay animation
     *
     * @return {void}  description
     */
    pause() {
        if (this.pauseStatus) return;
        this.pauseStatus = true;

        // Reset RAF
        if (this.req) {
            this.req = false;
        }

        this.values.forEach((item) => {
            if (!item.settled) {
                item.fromValue = item.currentValue;
            }
        });
    }

    /**
     * resume - resume animation if is in pause, use resolve of last promise
     *
     * @return {void}  description
     */
    resume() {
        if (!this.pauseStatus) return;
        this.pauseStatus = false;

        if (!this.req && this.currentResolve) {
            handleFrame.add(() => {
                handleNextTick.add(({ time, fps }) => {
                    this.onReuqestAnim(time, fps, this.currentResolve);
                });
            });
        }
    }

    /**
     * setData - Set initial data structure
     *
     * @return {void}  description
     *
     * @example
     * mySpring.setData({ val: 100 });
     */
    setData(obj) {
        this.values = Object.entries(obj).map((item) => {
            const [prop, value] = item;
            return {
                prop: prop,
                toValue: value,
                fromValue: value,
                velocity: this.config.velocity,
                currentValue: value,
                settled: false,
            };
        });
    }

    /**
     * immediate - Jump immaediate to the end of tween
     *
     */
    immediate() {
        this.req = false;

        this.values.forEach((item) => {
            item.fromValue = item.toValue;
            item.currentValue = item.toValue;
        });
    }

    /**
     * mergeProps - Mege special props with default props
     *
     * @param  {Object} props { reverse: <>, config: <> , immediate <> }
     * @return {Object} props merged
     *
     */
    mergeProps(props) {
        const newProps = mergeDeep(this.defaultProps, props);
        const { config, relative } = newProps;
        this.config = config;
        this.relative = relative;

        return newProps;
    }

    /**
     * Realtive toValue from current position
     */
    setToValProcessed() {
        this.values.forEach((item) => {
            item.toValue = this.relative
                ? item.toValue + item.currentValue
                : item.toValue;
        });
    }

    /**
     * goTo - go from fromValue stored to new toValue
     *
     * @param  {object} obj new toValue
     * @param  {object} props : config: [object], reverse [boolean], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goTo({ val: 100 }, { config: { mass: 2 }, reverse: true }).catch((err) => {});
     */
    goTo(obj, props = {}) {
        if (this.pauseStatus) return;

        this.useStagger = true;

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                settled: false,
            };
        });

        return this.doAction(data, props, obj);
    }

    /**
     * goFrom - go from new fromValue ( manually update fromValue )  to toValue sored
     *
     * @param  {object} obj new fromValue
     * @param  {object} props : config: [object], reverse [boolean], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFrom({ val: 100 }, { config: { mass: 2 }, reverse: true }).catch((err) => {});
     */
    goFrom(obj, props = {}) {
        if (this.pauseStatus) return;

        this.useStagger = true;

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                settled: false,
            };
        });

        return this.doAction(data, props, obj);
    }

    /**
     * goFromTo - Go From new fromValue to new toValue
     *
     * @param  {object} fromObj new fromValue
     * @param  {object} toObj new toValue
     * @param  {object} props : config: [object], reverse [boolean], immediate [boolean]
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFromTo({ val: 0 },{ val: 100 }, { config: { mass: 2 }, reverse: true }).catch((err) => {});
     */
    goFromTo(fromObj, toObj, props = {}) {
        if (this.pauseStatus) return;

        this.useStagger = true;

        // Check if fromObj has the same keys of toObj
        const dataIsValid = compareKeys(fromObj, toObj);
        if (!dataIsValid) {
            console.warn(
                `HandleSpring: ${JSON.stringify(
                    fromObj
                )} and to ${JSON.stringify(toObj)} is not equal`
            );
            return this.promise;
        }

        const data = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                currentValue: fromObj[item],
                toValue: toObj[item],
                settled: false,
            };
        });

        return this.doAction(data, props, fromObj);
    }

    /**
     * set - set a a vlue without animation ( teleport )
     *
     * @param  {number} value new fromValue and new toValue
     * @return {promise}  onComplete promise
     *
     *
     * @example
     * mySpring.set({ val: 100 }).catch((err) => {});
     */
    set(obj, props = {}) {
        if (this.pauseStatus) return;

        this.useStagger = false;

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                toValue: obj[item],
                settled: false,
            };
        });

        return this.doAction(data, props, obj);
    }

    /**
     * Commen oparation for set/goTo/goFrom/goFromTo
     */
    doAction(data, props, obj) {
        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(obj);

        this.setToValProcessed();

        if (immediate) {
            this.immediate();
            return new Promise((res) => res());
        }

        if (!this.req) {
            this.promise = new Promise((res, reject) => {
                this.startRaf(res, reject);
            });
        }

        return this.promise;
    }

    /**
     * get - get current value
     *
     * @return {Object} current value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    get() {
        return getValueObj(this.values, 'currentValue');
    }

    /**
     * getFrom - get fromValue value
     *
     * @return {Object} fromValue value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    getFrom() {
        return getValueObj(this.values, 'fromValue');
    }

    /**
     * getFrom - get toValue value
     *
     * @return {Object} toValue value obj { prop: value, prop2: value2 }
     *
     * @example
     * const { prop } = mySpring.get();
     */
    getTo() {
        return getValueObj(this.values, 'toValue');
    }

    getType() {
        return 'SPRING';
    }

    /**
     * reverse - sitch fromValue and ToValue for specific input value
     *
     * @return {void}
     *
     */
    reverse(obj) {
        const keysTorevert = Object.keys(obj);

        this.values.forEach((item) => {
            if (keysTorevert.includes(item.prop)) {
                const fromValue = item.fromValue;
                const toValue = item.toValue;
                item.fromValue = toValue;
                item.toValue = fromValue;
            }
        });
    }

    /**
     * updateConfig - Update config object
     *
     * @param  {Object} config udate single prop of config object
     * @return {void}
     *
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.defaultProps = mergeDeep(this.defaultProps, {
            config,
        });
    }

    /**
     * updatePreset - Update config object with new preset
     *
     * @param  {String} preset new preset
     * @return {void}
     *
     */
    updatePreset(preset) {
        if (preset in handleSetUp.get('spring')) {
            this.config = handleSetUp.get('spring')[preset];
        } else {
            console.warn(
                `${preset} doasn't exist in spring configuration list`
            );
        }

        this.defaultProps = mergeDeep(this.defaultProps, {
            config: this.config,
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

    /**
     * subscribe - add callback to start in pause to stack
     *
     * @param  {function} cb cal function
     * @return {function} unsubscribe callback
     *
     */
    onStartInPause(cb) {
        this.callbackStartInPause.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callbackStartInPause = this.callbackStartInPause.filter(
                (item) => item.id !== cbId
            );
        };
    }

    onComplete(cb) {
        this.callbackOnComplete.push({ cb, id: this.id });
        const cbId = this.id;
        this.id++;

        return () => {
            this.callbackOnComplete = this.callbackOnComplete.filter(
                (item) => item.id !== cbId
            );
        };
    }

    /**
     * Remove all reference from tween
     */
    destroy() {
        if (this.promise) this.stop();
        this.callbackOnComplete = [];
        this.callbackStartInPause = [];
        this.callback = [];
        this.callbackCache = [];
        this.values = [];
        this.promise = null;
        this.unsubscribeCache.forEach((unsubscribe) => unsubscribe());
    }
}
