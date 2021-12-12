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
        let lastTime = 0;
        let animationLastTime = 0;

        const draw = () => {
            // https://github.com/pmndrs/react-spring/blob/cd5548a987383b8023efd620f3726a981f9e18ea/src/animated/FrameLoop.ts
            const time = getTime();
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

            cb(parseFloat(currentValue));

            // Set last time
            animationLastTime = time;

            if (Math.abs(currentValue - toValue) > config.precision) {
                req = requestAnimationFrame(draw);
            } else {
                // End of animation
                lastValue = toValue;
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
