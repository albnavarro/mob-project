//@ts-check

import { MobCore } from '../../../mob-core/index.js';
import MobTimeTween from '../../animation/tween/mob-time-tween.js';
import {
    easeTweenIsValid,
    valueIsBooleanAndReturnDefault,
    valueIsNumberAndReturnDefault,
} from '../../animation/utils/tween-action/tween-validation.js';
import { offset, isNode } from '../../../mob-core/utils/index.js';
import {
    FreezeMobPageScroll,
    UnFreezeAndUPdateMobPageScroll,
    UpdateMobPageScroll,
} from '../page-scroll/page-scroller.js';

/** @type {import('../../animation/tween/type.js').EaseTypes} */
const defaultPreset = 'easeOutQuad';

/** @type {MobTimeTween} */
const tween = new MobTimeTween({ ease: defaultPreset, data: { val: 0 } });

/** @type {boolean} */
let isRunning = false;

/** @type {boolean} */
let overflow = false;

/**
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
MobCore.useMouseWheel(() => {
    stopTween();
});

MobCore.useMouseDown(() => {
    stopTween();
});

MobCore.useTouchStart(() => {
    stopTween();
});

/**
 * Scroll body to values or element.
 */
export const MobBodyScroll = (() => {
    /**
     * @example
     *     ```javascript
     *            bodyScroll.to(0, {
     *                duration: 1000,
     *                overflow: true,
     *                ease: 'easeInExpo',
     *            });
     *
     *            bodyScroll.to(myDomElement, {
     *                duration: 1000,
     *                overflow: true,
     *                ease: 'easeInExpo',
     *            });
     *
     *     ```;
     *
     * @param {Number | Element} target
     * @param {import('./type.js').MobBodyScroll} [data]
     */
    const to = (target, data) => {
        if (typeof globalThis === 'undefined') return;

        const targetParsed = (() => {
            if (!target) return 0;

            // @ts-ignore
            const isValid = isNode(target) || MobCore.checkType(Number, target);

            if (!isValid) {
                console.warn(
                    `bodyScroll ${target} is not valid target, must be a node or a number`
                );
                return 0;
            }

            return isNode(target)
                ? offset(/** @type {HTMLElement} */ (target)).top
                : /** @type {number} */ (target);
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
                /** @type {import('../../animation/tween/type.js').EaseTypes} */ (
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
