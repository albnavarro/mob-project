import { horizontalCustomClass } from '../../component/horizontalCustom/js/horizontalCustom.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';

export const noGsap = () => {
    const title = document.querySelector('.js-scroll-item');
    const scroller = document.querySelector('.scroller .scroller__row');

    const parallaxIn = new ParallaxItemClass({
        item: title,
        scroller: scroller,
        direction: 'horizontal',
        computationType: 'fixed',
        propierties: 'x',
        fromTo: true,
        dynamicStart: {
            position: 'right',
            value: () => {
                return 0;
            },
        },
        dynamicEnd: {
            position: 'right',
            value: () => {
                return window.innerWidth / 2;
            },
        },
        dynamicRange: () => {
            return 400;
        },
    });
    parallaxIn.init();

    const horizontalCustom = new horizontalCustomClass({
        rootEl: '.test-custom-scroller',
    });
    horizontalCustom.onTick(() => parallaxIn.move());
    horizontalCustom.onRefresh(() => parallaxIn.refresh());
    horizontalCustom.init();

    const horizontalCustom2 = new horizontalCustomClass({
        rootEl: '.test-custom-scroller2',
    });
    horizontalCustom2.init();
};
