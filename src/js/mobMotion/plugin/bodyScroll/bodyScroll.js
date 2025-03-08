//@ts-check

import { mobCore } from '../../../mobCore/index.js';
import MobTween from '../../animation/tween/MobTween.js';
import {
    easeTweenIsValid,
    valueIsBooleanAndReturnDefault,
    valueIsNumberAndReturnDefault,
} from '../../animation/utils/tweenAction/tweenValidation.js';
import { offset, isNode } from '../../../mobCore/utils/index.js';
import {
    FreezeMobPageScroll,
    UnFreezeAndUPdateMobPageScroll,
    UpdateMobPageScroll,
} from '../pageScroll/pageScroller.js';

/** @type {import('../../animation/tween/type').EaseTypes} */
const defaultPreset = 'easeOutQuad';

/** @type {MobTween} */
const tween = new MobTween({ ease: defaultPreset, data: { val: 0 } });

/** @type{boolean} */
let isRunning = false;

/** @type{boolean} */
let overflow = false;

/**
 * @description
 * Init tween
 */
tween.subscribe(({ val }) => {
    window.scrollTo({
        top: val,
        left: 0,
        behavior: 'auto',
    });

    UpdateMobPageScroll();
});

/** @type{() => void} */
const onComplete = () => {
    if (overflow) document.body.style.overflow = '';
    tween?.updateEase?.(defaultPreset);
    UnFreezeAndUPdateMobPageScroll();
};

/** @type{() => void} */
const stopTween = () => {
    if (!isRunning) return;

    tween.stop();
    onComplete();
};

/**
 * Stop scrolling on mouseWheel, MouseDown, TouchStart.
 */
mobCore.useMouseWheel(() => {
    stopTween();
});

mobCore.useMouseDown(() => {
    stopTween();
});

mobCore.useTouchStart(() => {
    stopTween();
});

/**
 * @description
 * Scroll body to values or element.
 */
export const MobBodyScroll = (() => {
    /**
     * @description
     *
     * @example
     *```javascript
       bodyScroll.to(0, {
           duration: 1000,
           overflow: true,
           ease: 'easeInExpo',
       });

       bodyScroll.to(myDomElement, {
           duration: 1000,
           overflow: true,
           ease: 'easeInExpo',
       });

     *```
     * @param {(Number|Element)} target
     * @param {import('./type').MobBodyScroll} [ data ]
     */
    const to = (target, data) => {
        if (typeof globalThis === 'undefined') return;

        const targetParsed = (() => {
            if (!target) return 0;

            // @ts-ignore
            const isValid = isNode(target) || mobCore.checkType(Number, target);

            if (!isValid) {
                console.warn(
                    `bodyScroll ${target} is not valid target, must be a node or a number`
                );
                return 0;
            }

            return isNode(target)
                ? offset(/** @type{HTMLElement} */ (target)).top
                : /** @type{number} */ (target);
        })();

        /**
         * Props
         */
        const duration = valueIsNumberAndReturnDefault(
            data?.duration,
            'bodyScroll: duration',
            500
        );

        overflow = valueIsBooleanAndReturnDefault(
            data?.overflow,
            'bodyScroll: overflow',
            false
        );

        if (easeTweenIsValid(data?.ease)) {
            tween?.updateEase?.(
                /** @type{import('../../animation/tween/type').EaseTypes} */ (
                    data?.ease
                )
            );
        }

        if (overflow) document.body.style.overflow = 'hidden';

        return new Promise((resolve) => {
            isRunning = true;
            FreezeMobPageScroll();

            tween
                .goFromTo(
                    { val: window.scrollY },
                    { val: targetParsed },
                    { duration }
                )
                .then(() => {
                    onComplete();
                    isRunning = false;
                    resolve(true);
                })
                .catch(() => {
                    onComplete();
                    isRunning = false;
                    resolve(true);
                });
        });
    };

    return {
        to,
    };
})();
