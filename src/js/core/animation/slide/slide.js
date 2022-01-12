import { handleTween } from '../tween/handleTween.js';
import { outerHeight } from '../../utils/vanillaFunction.js';

/**  slide.subscribe(el);
 *   slide.reset(el);
 *   slide.up(el).then(() => { ... });
 *   slide.down(el).then(() => { ... });
 */
export const slide = (() => {
    let slideItems = [];
    let slideId = 0;

    function setSlideData(el) {
        const data = {};
        data.item = el;
        data.id = slideId;
        data.tween = new handleTween('easeOutQuad');
        data.unsubscribe = data.tween.subscribe(({ val }) => {
            data.item.style.height = `${val}px`;
        });

        data.tween.setData({ val: 0 });
        return data;
    }

    function subscribe(el) {
        // Check if el is already subscribed to slide utils
        const alreadySubscribe = slideItems.find(({ item }) => item === el);
        if (alreadySubscribe) {
            console.warn(`slide utils ${el} is alredysubscribed`);
            return;
        }

        // Update items Array
        const data = setSlideData(el);
        slideItems.push(data);

        const prevId = slideId;
        slideId++;
        slideItems.push(data);

        // Return unsubscribe
        return () => {
            data.unsubcribe;
            data.tween = null;
            data.item = null;
            slideItems = slideItems.filter(({ id }) => id !== prevId);
        };
    }

    function reset(target) {
        target.style.height = 0;
        target.style.overflow = 'hidden';
    }

    function up(target) {
        return new Promise((res, reject) => {
            // Reject of target not exist in store
            const currentItem = slideItems.find(({ item }) => item === target);
            if (!currentItem)
                reject(new Error('slide element not exist in slide store'));

            // height of item may be chenge once opened outside tween control
            // use fromTo in this case
            const { item, tween } = currentItem;
            const currentHeight = outerHeight(item);

            tween
                .goFromTo({ val: currentHeight }, { val: 0 }, 500)
                .then((value) => {
                    res();
                })
                .catch((err) => {});
        });
    }

    function down(target) {
        return new Promise((res, reject) => {
            // Reject of target not exist in store
            const currentItem = slideItems.find(({ item }) => item === target);
            if (!currentItem)
                reject(new Error('slide element not exist in slide store'));

            const { item, tween } = currentItem;
            const { val: currentHeight } = tween.get();
            item.style.height = `auto`;
            const height = outerHeight(item);
            item.style.height = `${currentHeight}px`;

            tween
                .goTo({ val: height }, 500)
                .then((value) => {
                    item.style.height = `auto`;
                    res();
                })
                .catch((err) => {});
        });
    }

    return { subscribe, reset, up, down };
})();
