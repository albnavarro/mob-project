import { HorizontalScroller } from '../mobbu/plugin/horizontalScroller/js/horizontalScroller';
import { scroller, core, tween } from '../mobbu';

const createScroller = ({ bottomScroller }) => {
    const title = document.querySelector('.js-scroll-item');
    const scroller1 = document.querySelector(
        '.test-custom-scroller .scroller__row'
    );

    // const tweetTest = tween.createScrollerTween({
    //     from: { y: 0, scale: 1 },
    //     to: { y: -300, scale: 1.2 },
    // });
    //
    // tweetTest.subscribe(({ scale, y }) => {
    //     title.style.transform = `translate3D(0,0,0) translateY(${y}px) scale(${scale})`;
    // });
    //
    // tweetTest.onStop(({ scale, y }) => {
    //     title.style.transform = `translateY(${y}px) scale(${scale})`;
    // });

    let parallaxTest = scroller.createScrollTrigger({
        item: title,
        pin: true,
        // marker: 'pin',
        propierties: 'y',
        animateAtStart: false,
        // useWillChange: true,
        // disableForce3D: true,
        // ease: true,
        // scroller: scroller,
        // direction: 'horizontal',
        // tween: tweetTest,
        // forceTranspond: true,
        dynamicRange: () => {
            return -300;
        },
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
    });

    const parallaxTest2 = document.querySelectorAll('.js-parallax-test');
    const parallaxArray = [...parallaxTest2].map((item) => {
        return scroller.createParallax({
            item,
            propierties: 'x',
            reverse: true,
            ease: false,
        });
    });

    const horizontalCustom = new HorizontalScroller({
        root: '.test-custom-scroller',
        container: '.scroller',
        row: '.scroller__row',
        column: '.scroller__section',
        trigger: '.scroller__triggerT',
        shadowClass: '.shadowClass1',
        useWillChange: true,
        useDrag: true,
        // forceTranspond: true,
        useSticky: true,
        useThrottle: true,
        animateAtStart: false,
        ease: true,
        // easeType: 'spring',
        addCss: true,
        columnHeight: 80,
        columnWidth: 50,
        columnAlign: 'center',
        children: [parallaxTest, ...parallaxArray],
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
            console.log('after init');
            bottomScroller.refresh();
        },
        onTick: ({ percent }) => {
            core.useFrame(() => {
                scroller1.style.setProperty('--percent', `${percent}%`);
            });
        },
        afterRefresh: () => {
            console.log('after refresh');
        },
        afterDestroy: () => {
            console.log('after destroy');
            bottomScroller.refresh();
        },
    });

    // Init all
    horizontalCustom.init();
    // parallaxTest.init();

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
        // forceTranspond: true,
        reverse: true,
        animateAtStart: false,
        useWillChange: true,
        useDrag: true,
        // reverse: true,
        // useSticky: true,
        // animatePin: true,
        useThrottle: true,
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
