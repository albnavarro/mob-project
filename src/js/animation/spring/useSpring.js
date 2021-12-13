const defaultSpringConfig = {
    tension: 20,
    mass: 1,
    friction: 5,
    velocity: 0,
    precision: 0.01,
};

export function useSpring(customConfig) {
    const config = customConfig ? customConfig : defaultSpringConfig;
    let toValue = 0;
    let lastValue = 0;
    let req = null;
    let previousReject = null;
    let promise = null;

    const getTime = () => {
        return typeof window !== 'undefined'
            ? window.performance.now()
            : Date.now();
    };

    function onReuqestAnim(cb, res) {
        let velocity = config.velocity;
        let currentValue = lastValue;
        let animationLastTime = 0;

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
                const tensionForce = -config.tension * (currentValue - toValue);
                const dampingForce = -config.friction * velocity;
                const acceleration =
                    (tensionForce + dampingForce) / config.mass;
                velocity = velocity + (acceleration * 1) / 1000;
                currentValue = currentValue + (velocity * 1) / 1000;
            }

            console.log('draw');

            // Fire callback
            cb(parseFloat(currentValue));

            // Update last time
            animationLastTime = time;

            // If tension == 0 linear movement
            const isDisplacement =
                config.tension !== 0
                    ? Math.abs(currentValue - toValue) > config.precision
                    : false;

            if (isDisplacement) {
                req = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(req);
                req = null;

                // End of animation
                lastValue = toValue;

                // Fire callback with exact end value
                cb(parseFloat(currentValue));

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

    /**
     * goTo - go from lastValue stored to new toValue
     * If force reject previous primise use .catch((err) => {});
     *
     * @param  {number} to new toValue
     * @param  {number} cb callback
     * @param  {boolean} force force cancel FAR and restart
     * @return {promise}  onComplete promise
     */
    function goTo(to, cb, force = false) {
        if (force) cancelRaf();

        toValue = to;

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
     */
    function goFrom(from, cb, force = false) {
        if (force) cancelRaf();

        lastValue = from;

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
     */
    function goFromTo(from, to, cb, force = false) {
        if (force) cancelRaf();

        lastValue = from;
        toValue = to;

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
     */
    function set(value, cb, force = false) {
        if (force) cancelRaf();

        lastValue = value;
        toValue = value;

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
    };
}
