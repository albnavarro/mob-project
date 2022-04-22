import { springConfig } from './springConfig.js';
import { getValueObj, mergeArray } from '../utils/animationUtils.js';
import {
    handleFrame,
    handleNextFrame,
    handleFrameIndex,
} from '../../events/rafutils/rafUtils.js';
import { mergeDeep } from '../../utils/mergeDeep.js';
import { getStaggerIndex, getRandomChoice } from '../utils/getStaggerIndex.js';

export class handleSpring {
    constructor(config = 'default') {
        this.uniqueId = '_' + Math.random().toString(36).substr(2, 9);
        this.config = springConfig[config];
        this.req = false;
        this.currentResolve = null;
        this.currentReject = null;
        this.promise = null;
        this.values = [];
        this.id = 0;
        this.callback = [];
        this.callbackOnComplete = [];
        this.callbackStartInPause = [];
        this.lostFrameTresold = 64;
        this.pauseStatus = false;
        this.firstRun = true;
        this.defaultProps = {
            reverse: false,
            config: this.config,
            immediate: false,
            stagger: {
                each: 0,
                waitComplete: false,
                from: 'start',
            },
        };

        this.stagger = { each: 0, waitComplete: false, from: 'start' };
        this.slowlestStagger = {
            index: 0,
            frame: 0,
        };
        this.fastestStagger = {
            index: 0,
            frame: 0,
        };
    }

    onReuqestAnim(timestamp, fps, res) {
        let animationLastTime = 0;

        this.values.forEach((item, i) => {
            item.velocity = parseFloat(this.config.velocity);
            item.currentValue = parseFloat(item.fromValue);

            // Normalize toValue in case is a string
            item.toValue = parseFloat(item.toValue);
        });

        // Normalize spring config props
        const tension = parseFloat(this.config.tension);
        const friction = parseFloat(this.config.friction);
        const mass = parseFloat(this.config.mass);
        const precision = parseFloat(this.config.precision);

        const o = {};

        const draw = (timestamp, fps) => {
            this.req = true;

            // lastTime is set to now the first time.
            // then check the difference from now and last time to check if we lost frame
            o.lastTime =
                animationLastTime !== 0 ? animationLastTime : timestamp;

            // If we lost a lot of frames just jump to the end.
            if (timestamp > o.lastTime + this.lostFrameTresold)
                o.lastTime = timestamp;

            // http://gafferongames.com/game-physics/fix-your-timestep/
            o.numSteps = Math.floor(timestamp - o.lastTime);

            for (let i = 0; i < o.numSteps; ++i) {
                this.values.forEach((item, i) => {
                    o.tensionForce =
                        -tension * (item.currentValue - item.toValue);
                    o.dampingForce = -friction * item.velocity;
                    o.acceleration = (o.tensionForce + o.dampingForce) / mass;

                    item.velocity = item.velocity + (o.acceleration * 1) / 1000;
                    item.currentValue =
                        item.currentValue + (item.velocity * 1) / 1000;

                    o.isVelocity = Math.abs(item.velocity) <= precision;

                    o.isDisplacement =
                        tension !== 0
                            ? Math.abs(item.toValue - item.currentValue) <=
                              precision
                            : true;

                    item.settled = o.isVelocity && o.isDisplacement;
                });
            }

            // Prepare an obj to pass to the callback
            const cbObject = getValueObj(this.values, 'currentValue');

            if (this.stagger.each === 0) {
                // No stagger, run immediatly
                this.callback.forEach(({ cb }) => {
                    cb(cbObject);
                });
            } else {
                // Stagger
                this.callback.forEach(({ cb, index, frame }, i) => {
                    handleFrameIndex(() => {
                        cb(cbObject);
                    }, frame);
                });
            }

            // Update last time
            animationLastTime = timestamp;

            // Check if all values is completed
            o.allSettled = this.values.every((item) => item.settled === true);

            if (!o.allSettled) {
                handleNextFrame.add((timestamp, fps) => {
                    if (this.req) draw(timestamp, fps);
                });
            } else {
                const onComplete = () => {
                    this.req = false;

                    // End of animation
                    // Set fromValue with ended value
                    // At the next call fromValue become the start value
                    this.values.forEach((item, i) => {
                        item.fromValue = item.toValue;
                    });

                    // On complete
                    if (!this.pauseStatus) {
                        res();

                        // Set promise reference to null once resolved
                        this.promise = null;
                        this.currentReject = null;
                        this.currentResolve = null;
                    }
                };

                // Prepare an obj to pass to the callback with rounded value ( end user value)
                const cbObjectSettled = getValueObj(this.values, 'toValue');

                if (this.stagger.each === 0) {
                    onComplete();

                    handleNextFrame.add(() => {
                        // Fire callback with exact end value
                        this.callback.forEach(({ cb }) => {
                            cb(cbObjectSettled);
                        });

                        this.callbackOnComplete.forEach(({ cb }) => {
                            cb(cbObjectSettled);
                        });
                    });
                } else {
                    this.callback.forEach(({ cb, index, frame }, i) => {
                        handleFrameIndex(() => {
                            cb(cbObjectSettled);

                            if (this.stagger.waitComplete) {
                                if (i === this.slowlestStagger.index) {
                                    onComplete();
                                }
                            } else {
                                if (i === this.fastestStagger.index) {
                                    onComplete();
                                }
                            }
                        }, frame);
                    });

                    this.callbackOnComplete.forEach(
                        ({ cb, index, frame }, i) => {
                            handleFrameIndex(() => {
                                cb(cbObjectSettled);
                            }, frame);
                        }
                    );
                }
            }
        };

        draw(timestamp, fps);
    }

    /**
     * compareKeys - Compare fromObj, toObj in goFromTo methods
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

    startRaf(res, reject) {
        this.currentReject = reject;
        this.currentResolve = res;

        handleFrame.add((timestamp, fps) => {
            const prevent = this.callbackStartInPause
                .map(({ cb }) => cb())
                .some((item) => item === true);

            this.onReuqestAnim(timestamp, fps, res);
            if (prevent) this.pause();
        });
    }

    /**
     * stop - Stop animatona and force return reject form promise
     *
     * @return {void}  description
     */
    stop() {
        if (this.pauseStatus) this.pauseStatus = false;

        // Update local values with last
        this.values.forEach((item, i) => {
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

        this.values.forEach((item, i) => {
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
            handleFrame.add((timestamp, fps) => {
                this.onReuqestAnim(timestamp, fps, this.currentResolve);
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

        this.values.forEach((item, i) => {
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

        // Merge news config prop if there is some
        const config = props?.config ? props.config : {};
        this.config = { ...this.config, ...config };

        const { stagger } = newProps;
        this.stagger.each = stagger.each;
        this.stagger.waitComplete = stagger.waitComplete;
        this.stagger.from = stagger.from;

        if (this.stagger.each > 0 && this.firstRun) {
            this.callback.forEach((item, i) => {
                const { index, frame } = getStaggerIndex(
                    i,
                    this.callback.length,
                    this.stagger,
                    getRandomChoice(this.callback, this.stagger.each, i)
                );

                item.index = index;
                item.frame = frame;

                if (this.callbackOnComplete.length > 0) {
                    this.callbackOnComplete[i].index = index;
                    this.callbackOnComplete[i].frame = frame;
                }

                if (frame >= this.slowlestStagger.frame)
                    this.slowlestStagger = {
                        index,
                        frame,
                    };

                if (frame <= this.fastestStagger.frame)
                    this.fastestStagger = {
                        index,
                        frame,
                    };
            });

            this.firstRun = false;
        }

        return newProps;
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

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(obj);

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

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(obj);

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

        // Check if fromObj has the same keys of toObj
        const dataIsValid = this.compareKeys(fromObj, toObj);
        if (!dataIsValid) return this.promise;

        const data = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                fromValue: fromObj[item],
                currentValue: fromObj[item],
                toValue: toObj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(fromObj);

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

        const data = Object.keys(obj).map((item) => {
            return {
                prop: item,
                fromValue: obj[item],
                currentValue: obj[item],
                toValue: obj[item],
                settled: false,
            };
        });

        this.values = mergeArray(data, this.values);
        const { reverse, immediate } = this.mergeProps(props);

        if (reverse) this.reverse(obj);

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
     * updateConfig - Update config object
     *
     * @param  {Object} config udate single prop of config object
     * @return {void}
     *
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * reverse - sitch fromValue and ToValue for specific input value
     *
     * @return {void}
     *
     */
    reverse(obj) {
        const keysTorevert = Object.keys(obj);

        this.values.forEach((item, i) => {
            if (keysTorevert.includes(item.prop)) {
                const fromValue = item.fromValue;
                const toValue = item.toValue;
                item.fromValue = toValue;
                item.toValue = fromValue;
            }
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
        if (preset in springConfig) {
            this.config = springConfig[preset];
        }
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
}
