const defaultSpringConfig = {
    tension: 20,
    mass: 1,
    friction: 5,
    velocity: 0,
    precision: 0.01,
};

export function useSpring(customConfig) {
    const config = customConfig ? customConfig : defaultSpringConfig;
    let req = null;
    let previousReject = null;
    let promise = null;
    let values = [];

    const getTime = () => {
        return typeof window !== 'undefined'
            ? window.performance.now()
            : Date.now();
    };

    function onReuqestAnim(cb, res) {
        let animationLastTime = 0;
        let cbObject = {};

        values.forEach((item, i) => {
            item.velocity = config.velocity;
            item.currentValue = item.lastValue;
        });

        const draw = () => {
            // Get current time
            const time = getTime();

            // lastTime is set to now the first time.
            // then check the difference from now and last time to check if we lost frame
            let lastTime = animationLastTime !== 0 ? animationLastTime : time;

            // If we lost a lot of frames just jump to the end.
            if (time > lastTime + 64) lastTime = time;

            // http://gafferongames.com/game-physics/fix-your-timestep/
            let numSteps = Math.floor(time - lastTime);

            // Get lost frame, update vales until time is now
            for (let i = 0; i < numSteps; ++i) {
                values.forEach((item, i) => {
                    const tensionForce =
                        -config.tension * (item.currentValue - item.toValue);
                    const dampingForce = -config.friction * item.velocity;
                    const acceleration =
                        (tensionForce + dampingForce) / config.mass;
                    item.velocity = item.velocity + (acceleration * 1) / 1000;
                    item.currentValue =
                        item.currentValue + (item.velocity * 1) / 1000;

                    // If tension == 0 linear movement
                    const isRunning =
                        config.tension !== 0
                            ? Math.abs(item.currentValue - item.toValue) >
                              config.precision
                            : false;

                    item.settled = !isRunning;
                });
            }

            // Prepare an obj to pass to the callback
            // 1- Seta an array of object: [{prop: value},{prop2: value2} ...
            // 1- Reduce to a Object: { prop: value, prop2: value2 } ...
            cbObject = values
                .map((item) => {
                    return {
                        [item.prop]: parseFloat(item.currentValue),
                    };
                })
                .reduce((p, c) => {
                    return { ...p, ...c };
                }, {});

            // Fire callback
            cb(cbObject);

            // Update last time
            animationLastTime = time;

            // Check if all values is completed
            const allSettled = values.every((item) => item.settled === true);

            console.log('draw');

            if (!allSettled) {
                req = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(req);
                req = null;

                // End of animation
                // Set lastValue with ended value
                // At the next call lastValue become the start value
                values.forEach((item, i) => {
                    item.lastValue = item.toValue;
                });

                // Fire callback with exact end value
                cb(cbObject);

                // On complete
                res();

                // Set promise reference to null once resolved
                promise = null;
            }
        };

        draw();
    }

    /**
     * cancelRaf - Clear raf id force option is true
     *
     * @return {void}  description
     */
    function cancelRaf() {
        // Abort promise
        if (previousReject) {
            previousReject();
            promise = null;
        }

        // Reset RAF
        if (req) {
            cancelAnimationFrame(req);
            req = null;
        }
    }

    // Set initial data
    function seData(obj) {
        const valToArray = Object.keys(obj);

        values = valToArray.map((item) => {
            return {
                prop: item,
                toValue: 0,
                lastValue: 0,
                velocity: config.velocity,
                currentValue: 0,
                settled: false,
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
    function mergeData(newData) {
        values = values.map((item) => {
            const itemToMerge = newData.find((item2) => {
                return item2.prop === item.prop;
            });

            // If exist merge
            return itemToMerge ? { ...item, ...itemToMerge } : item;
        });
    }

    /**
     * compareKeys - Compare fromObj, toObj in goFromTo methods
     * Check if has the same keys
     *
     * @param  {Object} a fromObj Object
     * @param  {Object} b toObj Object
     * @return {bollean} has thew same keys
     */
    function compareKeys(a, b) {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    /**
     * goTo - go from lastValue stored to new toValue
     * If force reject previous primise use .catch((err) => {});
     *
     * @param  {number} to new toValue
     * @param  {number} cb callback
     * @param  {boolean} force force cancel FAR and restart
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goTo({ val: 100 }, ({ val }) => {
     *   console.log(val)
     * });
     */
    function goTo(obj, cb, force = false) {
        if (force) cancelRaf();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                toValue: obj[item],
                settled: false,
            };
        });

        mergeData(newDataArray);

        if (!req) {
            promise = new Promise((res, reject) => {
                previousReject = reject;
                req = requestAnimationFrame(() => onReuqestAnim(cb, res));
            });
        }

        return promise;
    }

    /**
     * goFrom - go from new lastValue ( manually update lastValue )  to toValue sored
     * If force reject previous primise use .catch((err) => {});
     *
     * @param  {number} from new lastValue
     * @param  {number} cb callback
     * @param  {boolean} force force cancel FAR and restart
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFrom({ val: 100 }, ({ val }) => {
     *   console.log(val)
     * });
     */
    function goFrom(obj, cb, force = false) {
        if (force) cancelRaf();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                lastValue: obj[item],
                settled: false,
            };
        });

        mergeData(newDataArray);

        if (!req) {
            promise = new Promise((res, reject) => {
                previousReject = reject;
                req = requestAnimationFrame(() => onReuqestAnim(cb, res));
            });
        }

        return promise;
    }

    /**
     * goFromTo - Go From new lastValue to new toValue
     * If force reject previous primise use .catch((err) => {});
     *
     * @param  {number} from new lastValue
     * @param  {number} to new toValue
     * @param  {number} cb callback
     * @param  {boolean} force force cancel FAR and restart
     * @return {promise}  onComplete promise
     *
     * @example
     * mySpring.goFromTo({ val: 0 },{ val: 100 }, ({ val }) => {
     *   console.log(val)
     * });
     */
    function goFromTo(fromObj, toObj, cb, force = false) {
        if (force) cancelRaf();

        // Check if fromObj has the same keys of toObj
        const dataIsValid = compareKeys(fromObj, toObj);
        if (!dataIsValid) return promise;

        const newDataArray = Object.keys(fromObj).map((item) => {
            return {
                prop: item,
                lastValue: fromObj[item],
                toValue: toObj[item],
                settled: false,
            };
        });

        mergeData(newDataArray);

        if (!req) {
            promise = new Promise((res, reject) => {
                previousReject = reject;
                req = requestAnimationFrame(() => onReuqestAnim(cb, res));
            });
        }

        return promise;
    }

    /**
     * set - set a a vlue without animation ( teleport )
     * If force reject previous primise use .catch((err) => {});
     *
     * @param  {number} value new lastValue and new toValue
     * @param  {number} cb callback
     * @param  {boolean} force force cancel FAR and restart
     * @return {promise}  onComplete promise
     *
     *
     * @example
     * mySpring.set({ val: 100 }, ({ val }) => {
     *   console.log(val)
     * });
     */
    function set(obj, cb, force = false) {
        if (force) cancelRaf();

        const newDataArray = Object.keys(obj).map((item) => {
            return {
                prop: item,
                lastValue: obj[item],
                toValue: obj[item],
                settled: false,
            };
        });

        mergeData(newDataArray);

        if (!req) {
            promise = new Promise((res, reject) => {
                previousReject = reject;
                req = requestAnimationFrame(() => onReuqestAnim(cb, res));
            });
        }

        return promise;
    }

    // Public methods
    return {
        goTo,
        goFrom,
        goFromTo,
        set,
        seData,
    };
}
