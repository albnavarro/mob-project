import { horizontalCustomClass } from '../../component/horizontalCustom/js/horizontalCustom.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';

export const noGsap = () => {
    const title = document.querySelector('.js-scroll-item');
    const scroller = document.querySelector(
        '.test-custom-scroller .scroller__row'
    );

    // Create first scroll to have css for parallax test
    const horizontalCustom = new horizontalCustomClass({
        rootEl: '.test-custom-scroller',
        forceTranspond: true, // Tryying to massimize performance, move scroll to body on pin
        addCss: true,
    });

    // Create child parallax
    const parallaxTest = new ParallaxItemClass({
        item: title,
        scroller: scroller,
        direction: 'horizontal',
        computationType: 'fixed',
        propierties: 'y',
        pin: true,
        forceTranspond: true,
        marker: 'pin',
        dynamicStart: {
            position: 'right',
            value: () => {
                return window.innerWidth / 2;
            },
        },
        dynamicEnd: {
            position: 'left',
            value: () => {
                return 0;
            },
        },
        dynamicRange: () => {
            return -300;
        },
    });

    // Move parallax child
    horizontalCustom.onTick((scrollVal) => {
        parallaxTest.move(scrollVal);
    });

    // Rtefresh parallax child
    horizontalCustom.onRefresh((scrollVal) => {
        parallaxTest.refresh();
    });

    // Init all
    horizontalCustom.init();
    parallaxTest.init();

    const horizontalCustom2 = new horizontalCustomClass({
        rootEl: '.test-custom-scroller2',
        forceTranspond: true, // Tryying to massimize performance, move scroll to body on pin
        addCss: true,
    });
    horizontalCustom2.init();
};
