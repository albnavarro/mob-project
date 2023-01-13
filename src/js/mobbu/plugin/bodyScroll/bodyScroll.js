import HandleTween from '../../animation/tween/handleTween.js';
import {
    easeTweenIsValid,
    valueIsBooleanAndReturnDefault,
    valueIsNumberAndReturnDefault,
} from '../../animation/utils/tweenValidation.js';
import { ANIMATION_STOP_REJECT } from '../../events/errorHandler/catchAnimationReject.js';
import {
    handleMouseDown,
    handleMouseWheel,
    handleTouchStart,
} from '../../events/mouseUtils/handleMouse.js';
import { checkType } from '../../store/storeType.js';
import { offset, isNode } from '../../utils/vanillaFunction.js';

/**
 * @typedef {Object} bodyScrollDataType
 * @prop {Number} duration
   Duration of scroll.
   The deafult valueis `500` ms.
   @prop {Boolean} overflow
   Set overflow:hidden to the body on scroll.
   The deafult value is `false`.
 */

/**
 * @description
 * Scroll body to values or element.
 */
export const bodyScroll = (() => {
    const defaultPreset = 'easeOutQuad';
    const tween = new HandleTween({ ease: defaultPreset, data: { val: 0 } });
    let isRunning = false;
    let overflow = false;
    let ease = defaultPreset;

    tween.subscribe(({ val }) => {
        window.scrollTo({
            top: val,
            left: 0,
            behavior: 'auto',
        });
    });

    /**
     * Restore settings
     */
    function onComplete() {
        if (overflow) document.body.style.overflow = '';
        if (ease) tween.updateEase(defaultPreset);
    }

    /**
     * Stop scrolling on mouseWheel, MouseDown, TouchStart.
     */
    handleMouseWheel(() => {
        if (!isRunning) return;

        tween.stop();
        onComplete();
    });

    handleMouseDown(() => {
        if (!isRunning) return;

        tween.stop();
        onComplete();
    });

    handleTouchStart(() => {
        if (!isRunning) return;

        tween.stop();
        onComplete();
    });

    /**
     * @description
     *
     * @example
     *```js
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
     *
     * @param {(Number|Element)} target
     * @param {bodyScrollDataType & import('../../animation/tween/tweenConfig.js').easeTypes} data
     */
    function to(target = null, data = {}) {
        if (typeof window !== 'undefined') {
            const targetParsed = (() => {
                if (!target) return 0;

                const isValid = isNode(target) || checkType(Number, target);

                if (!isValid) {
                    console.warn(
                        `bodyScroll ${target} is not valid target, must be a node or a number`
                    );
                    return 0;
                }

                return isNode(target) ? offset(target).top : target;
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

            ease = data?.ease ? easeTweenIsValid(data?.ease) : null;
            if (overflow) document.body.style.overflow = 'hidden';

            /**
             * Update easeType
             */
            if (ease) tween?.updateEase?.(ease);

            /**
             * Get current scroll value.
             */
            const scrollNow = window.pageYOffset;

            return new Promise((resolve, reject) => {
                isRunning = true;
                tween
                    .goFromTo(
                        { val: scrollNow },
                        { val: targetParsed },
                        { duration }
                    )
                    .then(() => {
                        onComplete();
                        isRunning = false;
                        resolve();
                    })
                    .catch(() => {
                        isRunning = false;
                        reject(ANIMATION_STOP_REJECT);
                    });
            });
        }
    }

    return {
        to,
    };
})();
