// https://github.com/bameyrick/js-easing-s/blob/master/src/index.ts
import { handleSetUp } from '../../setup.js';
import { easeReference } from '../utils/setUpValidation.js';
import { tweenEaseWarning } from '../utils/warning.js';

/**
 * @typedef {Object} easeTypes
 * @prop {('easeLinear'|'easeInQuad'|'easeOutQuad'|'easeInOutQuad'|'easeInCubic'|'easeOutCubic'|'easeInOutCubic'|'easeInQuart'|'easeOutQuart'|'easeInOutQuart'|'easeInQuint'|'easeOutQuint'|'easeInOutQuint'|'easeInSine'|'easeOutSine'|'easeInOutSine'|'easeInExpo'|'easeOutExpo'|'easeInOutExpo'|'easeInCirc'|'easeOutCirc'|'easeInOutCirc'|'easeInElastic'|'easeOutElastic'|'easeInOutElastic'|'easeInBack'|'easeOutBack'|'easeInOutBack'|'easeInBounce'|'easeOutBounce'|'easeInOutBounce')} [ ease ] Ease function
 **/

/**
 * @typedef {('easeLinear'|'easeInQuad'|'easeOutQuad'|'easeInOutQuad'|'easeInCubic'|'easeOutCubic'|'easeInOutCubic'|'easeInQuart'|'easeOutQuart'|'easeInOutQuart'|'easeInQuint'|'easeOutQuint'|'easeInOutQuint'|'easeInSine'|'easeOutSine'|'easeInOutSine'|'easeInExpo'|'easeOutExpo'|'easeInOutExpo'|'easeInCirc'|'easeOutCirc'|'easeInOutCirc'|'easeInElastic'|'easeOutElastic'|'easeInOutElastic'|'easeInBack'|'easeOutBack'|'easeInOutBack'|'easeInBounce'|'easeOutBounce'|'easeInOutBounce')} easeStringTypes
 **/
export const tweenConfig = {
    [easeReference.easeLinear]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (amountOfChange * elapsed) / duration + initialValue;
    },
    [easeReference.easeInQuad]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return amountOfChange * (elapsed /= duration) * elapsed + initialValue;
    },
    [easeReference.easeOutQuad]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            -amountOfChange * (elapsed /= duration) * (elapsed - 2) +
            initialValue
        );
    },
    [easeReference.easeInOutQuad]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            amountOfChange * (elapsed /= duration) * elapsed * elapsed +
            initialValue
        );
    },
    [easeReference.easeOutCubic]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            amountOfChange *
                ((elapsed = elapsed / duration - 1) * elapsed * elapsed + 1) +
            initialValue
        );
    },
    [easeReference.easeInOutCubic]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            -amountOfChange * Math.cos((elapsed / duration) * (Math.PI / 2)) +
            amountOfChange +
            initialValue
        );
    },
    [easeReference.easeOutSine]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            amountOfChange * Math.sin((elapsed / duration) * (Math.PI / 2)) +
            initialValue
        );
    },
    [easeReference.easeInOutSine]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            (-amountOfChange / 2) *
                (Math.cos((Math.PI * elapsed) / duration) - 1) +
            initialValue
        );
    },
    [easeReference.easeInExpo]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return elapsed === 0
            ? initialValue
            : amountOfChange * Math.pow(2, 10 * (elapsed / duration - 1)) +
                  initialValue;
    },
    [easeReference.easeOutExpo]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return elapsed === duration
            ? initialValue + amountOfChange
            : amountOfChange * (-Math.pow(2, (-10 * elapsed) / duration) + 1) +
                  initialValue;
    },
    [easeReference.easeInOutExpo]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            -amountOfChange *
                (Math.sqrt(1 - (elapsed /= duration) * elapsed) - 1) +
            initialValue
        );
    },
    [easeReference.easeOutCirc]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
    ) => {
        return (
            amountOfChange *
                Math.sqrt(1 - (elapsed = elapsed / duration - 1) * elapsed) +
            initialValue
        );
    },
    [easeReference.easeInOutCirc]: (
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration,
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
        elapsed,
        initialValue,
        amountOfChange,
        duration,
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
        elapsed,
        initialValue,
        amountOfChange,
        duration,
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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
        elapsed,
        initialValue,
        amountOfChange,
        duration
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

export const getTweenFn = (prop) => {
    if (prop in tweenConfig) {
        return tweenConfig[prop];
    } else {
        tweenEaseWarning(prop);
        return tweenConfig[handleSetUp.get('tween').ease];
    }
};
