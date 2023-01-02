import { mobbu } from '../core';
import { HorizontalScroller } from '../core/plugin/horizontalScroller/js/horizontalScroller';

const createScroller = ({ bottomScroller }) => {
    const title = document.querySelector('.js-scroll-item');
    const scroller = document.querySelector(
        '.test-custom-scroller .scroller__row'
    );

    // Create child parallax
    let parallaxTest = mobbu.createScrollTrigger({
        item: title,
        scroller: scroller,
        direction: 'horizontal',
        propierties: 'y',
        pin: true,
        // forceTranspond: true,
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
        // ease: true,
        // disableForce3D: true,
    });

    const horizontalCustom = new HorizontalScroller({
        root: '.test-custom-scroller',
        container: '.scroller',
        row: '.scroller__row',
        column: '.scroller__section',
        trigger: '.scroller__triggerT',
        shadowClass: '.shadowClass1',
        // forceTranspond: true, // Tryying to massimize performance, move scroll to body on pin
        useSticky: true,
        animateAtStart: false,
        ease: true,
        // easeType: 'spring',
        addCss: true,
        columnHeight: 80,
        columnWidth: 50,
        columnAlign: 'center',
        onEnter: () => {
            console.log('horizontalScroller onEnter');
        },
        onEnterBack: () => {
            console.log('horizontalScroller onEnterBack');
        },
        onLeave: () => {
            console.log('horizontalScroller onLeave');
        },
        onLeaveBack: () => {
            console.log('horizontalScroller onLeaveBack');
        },
        afterInit: () => {
            parallaxTest.refresh();
            bottomScroller.refresh();
        },
        onTick: (props) => {
            parallaxTest.move(props);
        },
        afterRefresh: () => {
            parallaxTest.refresh();
        },
        afterDestroy: () => {
            parallaxTest.destroy();
            parallaxTest = null;
            bottomScroller.refresh();
        },
    });

    // Init all
    horizontalCustom.init();
    parallaxTest.init();

    return horizontalCustom;
};

export const noGsap = () => {
    const horizontalCustom2 = new HorizontalScroller({
        root: '.test-custom-scroller2',
        container: '.scroller',
        row: '.scroller__row2',
        column: '.scroller__section2',
        trigger: '.scroller__triggerT2',
        shadowClass: '.shadowClass2',
        forceTranspond: true, // Tryying to massimize performance, move scroll to body on pin
        ease: true,
        addCss: true,
    });

    horizontalCustom2.init();

    const destroyButton = document.querySelector('.destroy-scroller');
    const createButton = document.querySelector('.create-scroller');
    let horizontalCustom = createScroller({
        bottomScroller: horizontalCustom2,
    });

    destroyButton.addEventListener('click', () => {
        if (horizontalCustom) {
            horizontalCustom.destroy();
            horizontalCustom = null;
        }
    });

    createButton.addEventListener('click', () => {
        if (!horizontalCustom)
            horizontalCustom = createScroller({
                bottomScroller: horizontalCustom2,
            });
    });
};
