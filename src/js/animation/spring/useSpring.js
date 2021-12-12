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

    function onReuqestAnim(cb) {
        let velocity = config.velocity
        let currentValue = lastValue

        const draw = () => {
            const tensionForce = -config.tension * (currentValue - toValue)
            const dampingForce = -config.friction * velocity
            const acceleration = (tensionForce + dampingForce) / config.mass
            velocity = velocity + (acceleration * 1) / 100
            currentValue = currentValue + (velocity * 1) / 100

            console.log('draw');

            cb(parseFloat(currentValue));

            if (Math.abs(currentValue - toValue) > config.precision) {
                req = requestAnimationFrame(draw);
            } else {
                lastValue = toValue
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
        set
    }
}
