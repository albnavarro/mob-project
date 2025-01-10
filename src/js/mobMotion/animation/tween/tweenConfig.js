// https://github.com/bameyrick/js-easing-s/blob/master/src/index.ts
import { handleSetUp } from '../../setup.js';
import { easeReference } from '../utils/setUp/setUpValidation.js';
import { tweenEaseWarning } from '../utils/warning.js';

/** @type{Record<string, any>} */
export const tweenConfig = {
    [easeReference.easeLinear]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (amountOfChange * elapsed) / duration + initialValue;
    },
    [easeReference.easeInQuad]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return amountOfChange * (elapsed /= duration) * elapsed + initialValue;
    },
    [easeReference.easeOutQuad]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            -amountOfChange * (elapsed /= duration) * (elapsed - 2) +
            initialValue
        );
    },
    [easeReference.easeInOutQuad]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if ((elapsed /= duration / 2) < 1) {
            return (amountOfChange / 2) * elapsed * elapsed + initialValue;
        }
        return (
            (-amountOfChange / 2) * (--elapsed * (elapsed - 2) - 1) +
            initialValue
        );
    },
    [easeReference.easeInCubic]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange * (elapsed /= duration) * elapsed * elapsed +
            initialValue
        );
    },
    [easeReference.easeOutCubic]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange *
                ((elapsed = elapsed / duration - 1) * elapsed * elapsed + 1) +
            initialValue
        );
    },
    [easeReference.easeInOutCubic]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if ((elapsed /= duration / 2) < 1) {
            return (
                (amountOfChange / 2) * elapsed * elapsed * elapsed +
                initialValue
            );
        }
        return (
            (amountOfChange / 2) * ((elapsed -= 2) * elapsed * elapsed + 2) +
            initialValue
        );
    },
    [easeReference.easeInQuart]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange *
                (elapsed /= duration) *
                elapsed *
                elapsed *
                elapsed +
            initialValue
        );
    },
    [easeReference.easeOutQuart]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            -amountOfChange *
                ((elapsed = elapsed / duration - 1) *
                    elapsed *
                    elapsed *
                    elapsed -
                    1) +
            initialValue
        );
    },
    [easeReference.easeInOutQuart]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if ((elapsed /= duration / 2) < 1) {
            return (
                (amountOfChange / 2) * elapsed * elapsed * elapsed * elapsed +
                initialValue
            );
        }
        return (
            (-amountOfChange / 2) *
                ((elapsed -= 2) * elapsed * elapsed * elapsed - 2) +
            initialValue
        );
    },
    [easeReference.easeInQuint]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange *
                (elapsed /= duration) *
                elapsed *
                elapsed *
                elapsed *
                elapsed +
            initialValue
        );
    },
    [easeReference.easeOutQuint]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange *
                ((elapsed = elapsed / duration - 1) *
                    elapsed *
                    elapsed *
                    elapsed *
                    elapsed +
                    1) +
            initialValue
        );
    },
    [easeReference.easeInOutQuint]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if ((elapsed /= duration / 2) < 1) {
            return (
                (amountOfChange / 2) *
                    elapsed *
                    elapsed *
                    elapsed *
                    elapsed *
                    elapsed +
                initialValue
            );
        }
        return (
            (amountOfChange / 2) *
                ((elapsed -= 2) * elapsed * elapsed * elapsed * elapsed + 2) +
            initialValue
        );
    },
    [easeReference.easeInSine]: (
        /** @type {number} */ elapsed,
        /** @type {any} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            -amountOfChange * Math.cos((elapsed / duration) * (Math.PI / 2)) +
            amountOfChange +
            initialValue
        );
    },
    [easeReference.easeOutSine]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange * Math.sin((elapsed / duration) * (Math.PI / 2)) +
            initialValue
        );
    },
    [easeReference.easeInOutSine]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            (-amountOfChange / 2) *
                (Math.cos((Math.PI * elapsed) / duration) - 1) +
            initialValue
        );
    },
    [easeReference.easeInExpo]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return elapsed === 0
            ? initialValue
            : amountOfChange * Math.pow(2, 10 * (elapsed / duration - 1)) +
                  initialValue;
    },
    [easeReference.easeOutExpo]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return elapsed === duration
            ? initialValue + amountOfChange
            : amountOfChange * (-Math.pow(2, (-10 * elapsed) / duration) + 1) +
                  initialValue;
    },
    [easeReference.easeInOutExpo]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if (elapsed === 0) {
            return initialValue;
        }
        if (elapsed === duration) {
            return initialValue + amountOfChange;
        }
        if ((elapsed /= duration / 2) < 1) {
            return (
                (amountOfChange / 2) * Math.pow(2, 10 * (elapsed - 1)) +
                initialValue
            );
        }
        return (
            (amountOfChange / 2) * (-Math.pow(2, -10 * --elapsed) + 2) +
            initialValue
        );
    },
    [easeReference.easeInCirc]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            -amountOfChange *
                (Math.sqrt(1 - (elapsed /= duration) * elapsed) - 1) +
            initialValue
        );
    },
    [easeReference.easeOutCirc]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange *
                Math.sqrt(1 - (elapsed = elapsed / duration - 1) * elapsed) +
            initialValue
        );
    },
    [easeReference.easeInOutCirc]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if ((elapsed /= duration / 2) < 1) {
            return (
                (-amountOfChange / 2) * (Math.sqrt(1 - elapsed * elapsed) - 1) +
                initialValue
            );
        }
        return (
            (amountOfChange / 2) *
                (Math.sqrt(1 - (elapsed -= 2) * elapsed) + 1) +
            initialValue
        );
    },
    [easeReference.easeInElastic]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        let s = 1.701_58;
        let p = 0;
        let a = amountOfChange;
        if (elapsed === 0) {
            return initialValue;
        }
        if ((elapsed /= duration) === 1) {
            return initialValue + amountOfChange;
        }
        if (!p) {
            p = duration * 0.3;
        }
        if (a < Math.abs(amountOfChange)) {
            a = amountOfChange;
            s = p / 4;
        } else {
            s = (p / (2 * Math.PI)) * Math.asin(amountOfChange / a);
        }
        return (
            -(
                a *
                Math.pow(2, 10 * (elapsed -= 1)) *
                Math.sin(((elapsed * duration - s) * (2 * Math.PI)) / p)
            ) + initialValue
        );
    },
    [easeReference.easeOutElastic]: (
        /** @type {number} */ elapsed,
        /** @type {any} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        let s = 1.701_58;
        let p = 0;
        let a = amountOfChange;
        if (elapsed === 0) {
            return initialValue;
        }
        if ((elapsed /= duration) === 1) {
            return initialValue + amountOfChange;
        }
        if (!p) {
            p = duration * 0.3;
        }
        if (a < Math.abs(amountOfChange)) {
            a = amountOfChange;
            s = p / 4;
        } else {
            s = (p / (2 * Math.PI)) * Math.asin(amountOfChange / a);
        }
        return (
            a *
                Math.pow(2, -10 * elapsed) *
                Math.sin(((elapsed * duration - s) * (2 * Math.PI)) / p) +
            amountOfChange +
            initialValue
        );
    },
    [easeReference.easeInOutElastic]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        let s = 1.701_58;
        let p = 0;
        let a = amountOfChange;
        if (elapsed === 0) {
            return initialValue;
        }
        if ((elapsed /= duration / 2) === 2) {
            return initialValue + amountOfChange;
        }
        if (!p) {
            p = duration * (0.3 * 1.5);
        }
        if (a < Math.abs(amountOfChange)) {
            a = amountOfChange;
            s = p / 4;
        } else {
            s = (p / (2 * Math.PI)) * Math.asin(amountOfChange / a);
        }
        if (elapsed < 1) {
            return (
                -0.5 *
                    (a *
                        Math.pow(2, 10 * (elapsed -= 1)) *
                        Math.sin(
                            ((elapsed * duration - s) * (2 * Math.PI)) / p
                        )) +
                initialValue
            );
        }
        return (
            a *
                Math.pow(2, -10 * (elapsed -= 1)) *
                Math.sin(((elapsed * duration - s) * (2 * Math.PI)) / p) *
                0.5 +
            amountOfChange +
            initialValue
        );
    },
    [easeReference.easeInBack]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration,
        s = 1.701_58
    ) => {
        return (
            amountOfChange *
                (elapsed /= duration) *
                elapsed *
                ((s + 1) * elapsed - s) +
            initialValue
        );
    },
    [easeReference.easeOutBack]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration,
        s = 1.701_58
    ) => {
        return (
            amountOfChange *
                ((elapsed = elapsed / duration - 1) *
                    elapsed *
                    ((s + 1) * elapsed + s) +
                    1) +
            initialValue
        );
    },
    easeInOutBack: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration,
        s = 1.701_58
    ) => {
        if ((elapsed /= duration / 2) < 1) {
            return (
                (amountOfChange / 2) *
                    (elapsed * elapsed * (((s *= 1.525) + 1) * elapsed - s)) +
                initialValue
            );
        }
        return (
            (amountOfChange / 2) *
                ((elapsed -= 2) * elapsed * (((s *= 1.525) + 1) * elapsed + s) +
                    2) +
            initialValue
        );
    },
    [easeReference.easeInBounce]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        return (
            amountOfChange -
            tweenConfig[easeReference.easeOutBounce](
                duration - elapsed,
                0,
                amountOfChange,
                duration
            ) +
            initialValue
        );
    },
    [easeReference.easeOutBounce]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if ((elapsed /= duration) < 1 / 2.75) {
            return amountOfChange * (7.5625 * elapsed * elapsed) + initialValue;
        } else if (elapsed < 2 / 2.75) {
            return (
                amountOfChange *
                    (7.5625 * (elapsed -= 1.5 / 2.75) * elapsed + 0.75) +
                initialValue
            );
        } else if (elapsed < 2.5 / 2.75) {
            return (
                amountOfChange *
                    (7.5625 * (elapsed -= 2.25 / 2.75) * elapsed + 0.9375) +
                initialValue
            );
        } else {
            return (
                amountOfChange *
                    (7.5625 * (elapsed -= 2.625 / 2.75) * elapsed + 0.984_375) +
                initialValue
            );
        }
    },
    [easeReference.easeInOutBounce]: (
        /** @type {number} */ elapsed,
        /** @type {number} */ initialValue,
        /** @type {number} */ amountOfChange,
        /** @type {number} */ duration
    ) => {
        if (elapsed < duration / 2) {
            return (
                tweenConfig[easeReference.easeInBounce](
                    elapsed * 2,
                    0,
                    amountOfChange,
                    duration
                ) *
                    0.5 +
                initialValue
            );
        }
        return (
            tweenConfig[easeReference.easeOutBounce](
                elapsed * 2 - duration,
                0,
                amountOfChange,
                duration
            ) *
                0.5 +
            amountOfChange * 0.5 +
            initialValue
        );
    },
};

export const printEaseKey = () => {
    console.log('Easing:');
    console.log(Object.keys(tweenConfig));
};

/**
 * @type {(arg0: string) => () => void}
 */
export const getTweenFn = (prop) => {
    if (prop in tweenConfig) {
        return tweenConfig[prop];
    } else {
        tweenEaseWarning(prop);
        return tweenConfig[handleSetUp.get('tween').ease];
    }
};
