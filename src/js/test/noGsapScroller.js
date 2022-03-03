import { horizontalCustomClass } from '../../component/horizontalCustom/js/horizontalCustom.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';

export const noGsap = () => {
    const title = document.querySelector('.js-scroll-item');
    const scroller = document.querySelector(
        '.test-custom-scroller .scroller__row'
    );

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
                return -title.offsetWidth;
            },
        },
        dynamicEnd: {
            position: 'left',
            value: () => {
                return -title.offsetWidth;
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
    horizontalCustom.onTick((scrollVal) => {
        Promise.resolve().then(() => {
            parallaxIn.move(scrollVal);
        });
    });
    horizontalCustom.init();

    const horizontalCustom2 = new horizontalCustomClass({
        rootEl: '.test-custom-scroller2',
    });
    horizontalCustom2.init();
};
