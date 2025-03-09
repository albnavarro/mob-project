//@ts-check

import { MobCore } from '../../../mobCore/index.js';
import { outerHeight } from '../../../mobCore/utils/index.js';
import MobTimeTween from '../../animation/tween/MobTimeTween.js';

/** @type {Map<HTMLElement,import('./type').MobSlide>} */
const slideItems = new Map();

/**
 * @type {(target: HTMLElement) => boolean}
 */
const isNode = (target) => {
    const isValid = MobCore.checkType(Element, target);

    if (!isValid)
        console.warn(`slide utils ${target} is not a valid Dom element`);

    return isValid;
};

/**
 * @description
 * Subscribe element to internal store.
 *
 * @param {HTMLElement} target
 * @returns {import('./type').MobSlide} Unsubscribe function.
 */
const setSlideData = (target) => {
    const tween = new MobTimeTween({ ease: 'easeOutQuad', data: { val: 0 } });

    return {
        tween,
        unsubscribe: tween.subscribe(({ val }) => {
            target.style.height = `${val}px`;
        }),
    };
};

/**
 * @description
 * Slide up-down utils.
 * It is essentially a small store where you can subscribe to dom elements and manage them.
 *
 * @example
 *
 * ```javascript
 * Subscribe target in store:
 * const unsubscribe = slide.subscribe(target);
 *
 * Reset target:
 * slide.reset(target);
 *
 * Slide up-down:
 * slide.up(target).then(() => { ... });
 * slide.down(target).then(() => { ... });
 *
 * Remove item from store:
 * unsubscribe();
 * ```
 */
export const MobSlide = (() => {
    /**
     * @description
     * Subscribe element to internal store.
     *
     * @param {HTMLElement} target - Dom node.
     * @returns {() => void} Unsubscribe function.
     */
    const subscribe = (target) => {
        if (!isNode(target)) return () => {};

        /**
         * Check if target is already subscribed to slide utils
         */
        const alreadySubscribe = slideItems.has(target);
        if (alreadySubscribe) {
            console.warn(`slide utils ${target} is alredysubscribed`);
            return () => {};
        }

        /**
         * Update items Array
         */
        const data = setSlideData(target);
        slideItems.set(target, data);

        /**
         * Return unsubscribe
         */
        return () => {
            data.unsubscribe();
            const { tween } = data;
            tween.destroy();
            slideItems.delete(target);
        };
    };

    /**
     * @description
     * Reset target height ( 0px ) .
     * Set `overflow: hidden` to target.
     *
     * @param {HTMLElement} target - Dom node.
     */
    const reset = (target) => {
        if (!isNode(target)) return;

        target.style.height = '0';
        target.style.overflow = 'hidden';
    };

    /**
     * @description
     * Slide up target.
     * Return a promise.
     *
     * @example
     * ```javascript
     * slide.up(myELement)
     *      .then(() => { ... })
     *      .catch(() => { ... })
     * ```
     *
     * @param {HTMLElement} target - Dom node.
     * @returns {Promise<any>} Promise fired on animation ends.
     */
    const up = async (target) => {
        // @ts-ignore
        if (!isNode(target)) {
            return new Promise((resolve) => resolve(true));
        }

        // Reject of target not exist in store
        const currentItem = slideItems.get(target);
        if (!currentItem) {
            console.warn('slide element not exist in slide store');
            return new Promise((resolve) => resolve(true));
        }

        // height of item may be change once opened outside tween control
        // use fromTo in this case
        // @ts-ignore
        const { tween } = currentItem;
        const currentHeight = outerHeight(target);

        await tween.goFromTo(
            { val: currentHeight },
            { val: 0 },
            { duration: 500 }
        );
    };

    /**
     * @description
     * Slide down target.
     * Return a promise.
     *
     * @example
     * ```javascript
     * slide.down(myELement)
     *      .then(() => { ... })
     *      .catch(() => { ... })
     * ```
     *
     * @param {HTMLElement} target - Dom node.
     * @returns {Promise<any>} Promise fired on animation ends.
     */
    const down = async (target) => {
        if (!isNode(target)) {
            return new Promise((resolve) => resolve(true));
        }

        // Reject of target not exist in store
        const currentItem = slideItems.get(target);
        if (!currentItem) {
            console.warn('slide element not exist in slide store');
            return new Promise((resolve) => resolve(true));
        }

        // @ts-ignore
        const { tween } = currentItem;
        const { val: currentHeight } = tween.get();
        target.style.height = `auto`;
        const height = outerHeight(target);
        target.style.height = `${currentHeight}px`;

        await tween.goTo({ val: height }, { duration: 500 });
        MobCore.useNextTick(() => {
            target.style.height = `auto`;
        });
    };

    return { subscribe, reset, up, down };
})();
