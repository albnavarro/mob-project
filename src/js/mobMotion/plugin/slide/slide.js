import { mobCore } from '../../../mobCore/index.js';
import { outerHeight } from '../../../mobCore/utils/index.js';
import HandleTween from '../../animation/tween/handleTween.js';

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
export const slide = (() => {
    let slideItems = [];
    let slideId = 0;

    /**
     * @private
     */
    function isNode(target) {
        const isValid = mobCore.checkType(Element, target);

        if (!isValid)
            console.warn(`slide utils ${target} is not a valid Dom element`);

        return isValid;
    }

    /**
     * @private
     */
    function setSlideData(target) {
        const data = {};
        data.item = target;
        data.id = slideId;
        data.tween = new HandleTween({ ease: 'easeOutQuad' });
        data.unsubscribe = data.tween.subscribe(({ val }) => {
            data.item.style.height = `${val}px`;
        });

        data.tween.setData({ val: 0 });
        return data;
    }

    /**
     * @description
     * Subscribe element to internal store.
     *
     * @param {Element} target - Dom node.
     * @returns {Function} Unsubscribe function.
     */
    function subscribe(target) {
        if (!isNode(target)) return;
        /**
         * Check if target is already subscribed to slide utils
         */
        const alreadySubscribe = slideItems.find(({ item }) => item === target);
        if (alreadySubscribe) {
            console.warn(`slide utils ${target} is alredysubscribed`);
            return;
        }

        /**
         * Update items Array
         */
        const data = setSlideData(target);
        slideItems.push(data);

        const prevId = slideId;
        slideId++;
        slideItems.push(data);

        /**
         * Return unsubscribe
         */
        return () => {
            data.unsubscribe();
            data.tween = null;
            data.item = null;
            slideItems = slideItems.filter(({ id }) => id !== prevId);
        };
    }

    /**
     * @description
     * Reset target height ( 0px ) .
     * Set `overflow: hidden` to target.
     *
     * @param {Element} target - Dom node.
     */
    function reset(target) {
        if (!isNode(target)) return;

        target.style.height = 0;
        target.style.overflow = 'hidden';
    }

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
     * @param {Element} target - Dom node.
     * @returns {Promise} Promise fired on animation ends.
     */
    function up(target) {
        return new Promise((res, reject) => {
            if (!isNode(target)) {
                res();
                return;
            }

            // Reject of target not exist in store
            const currentItem = slideItems.find(({ item }) => item === target);
            if (!currentItem)
                reject(new Error('slide element not exist in slide store'));

            // height of item may be chenge once opened outside tween control
            // use fromTo in this case
            const { item, tween } = currentItem;
            const currentHeight = outerHeight(item);

            tween
                .goFromTo({ val: currentHeight }, { val: 0 }, { duration: 500 })
                .then(() => {
                    res();
                });
        });
    }

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
     * @param {Element} target - Dom node.
     * @returns {Promise} Promise fired on animation ends.
     */
    function down(target) {
        return new Promise((res, reject) => {
            if (!isNode(target)) {
                res();
                return;
            }

            // Reject of target not exist in store
            const currentItem = slideItems.find(({ item }) => item === target);
            if (!currentItem)
                reject(new Error('slide element not exist in slide store'));

            const { item, tween } = currentItem;
            const { val: currentHeight } = tween.get();
            item.style.height = `auto`;
            const height = outerHeight(item);
            item.style.height = `${currentHeight}px`;

            tween.goTo({ val: height }, { duration: 500 }).then(() => {
                item.style.height = `auto`;
                res();
            });
        });
    }

    return { subscribe, reset, up, down };
})();
