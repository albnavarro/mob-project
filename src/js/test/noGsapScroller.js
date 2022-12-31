import { mobbu } from '../core';
import { HorizontalCustomClass } from '../core/plugin';

export const noGsap = () => {
    const title = document.querySelector('.js-scroll-item');
    const scroller = document.querySelector(
        '.test-custom-scroller .scroller__row'
    );

    const horizontalCustom = new HorizontalCustomClass({
        root: '.test-custom-scroller',
        container: '.scroller',
        row: '.scroller__row',
        column: '.scroller__section',
        trigger: '.scroller__triggerT',
        shadow: '.shadowClass1',
        forceTranspond: true, // Tryying to massimize performance, move scroll to body on pin
        animateAtStart: false,
        ease: true,
        // easeType: 'spring',
        addCss: true,
    });

    // Create child parallax
    const parallaxTest = mobbu.createScrollTrigger({
        item: title,
        scroller: scroller,
        direction: 'horizontal',
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
    horizontalCustom.onRefresh(() => {
        parallaxTest.refresh();
    });

    // Init all
    horizontalCustom.init();
    parallaxTest.init();

    const horizontalCustom2 = new HorizontalCustomClass({
        root: '.test-custom-scroller2',
        container: '.scroller',
        row: '.scroller__row2',
        column: '.scroller__section2',
        trigger: '.scroller__triggerT2',
        shadow: '.shadowClass2',
        forceTranspond: true, // Tryying to massimize performance, move scroll to body on pin
        ease: true,
        addCss: true,
    });

    horizontalCustom2.init();

    // document.body.addEventListener('click', () => {
    //     horizontalCustom.destrory();
    //     parallaxTest.destroy();
    //     horizontalCustom2.refresh();
    // });
};
