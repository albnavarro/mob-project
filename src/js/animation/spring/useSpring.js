const defaultSpringConfig = {
    tension: 250,
    mass: 3,
    friction: 26,
    velocity: 2,
    precision: 0.01,
};

export function useSpring(customConfig) {
    const config = customConfig ? customConfig : defaultSpringConfig;
    let toValue = 0;
    let lastValue = 0;
    let req = null;

    const getTime = () => {
        return typeof window !== 'undefined'
            ? window.performance.now()
            : Date.now();
    };

    function onReuqestAnim(cb) {
        let velocity = config.velocity;
        let currentValue = lastValue;
        let animationLastTime = 0;
        let animationVelocity = 0;

        const draw = () => {
            // Reset velocity if new value come form set methods
            // Use confog value when set methods os invoked quickly, then use calculated value
            velocity = animationVelocity !== 0 ? animationVelocity : config.velocity;

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

            // Update velocity
            animationVelocity = velocity

            if (Math.abs(currentValue - toValue) > config.precision) {
                req = requestAnimationFrame(draw);
            } else {
                // End of animation
                lastValue = toValue;

                // Fire callback with exact end value
                cb(parseFloat(currentValue));
                cancelAnimationFrame(req);
                req = null;
            }
        };

        draw();
    }

    function set(_toValue, cb) {
        toValue = _toValue;

        if (!req) {
            req = requestAnimationFrame(() => onReuqestAnim(cb));
        }
    }

    return {
        set,
    };
}
