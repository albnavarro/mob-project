import { parallax } from '../../component/parallax/js/parallax.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { SmoothScrollClass } from '../../component/smoothScroll/js/smoothScroll.js';

export const hScroller = () => {
    const parallaxOpacity = new ParallaxItemClass({
        item: document.querySelector('.parallax-via-js-opacity'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        ease: true,
        propierties: 'opacity',
        opacityStart: 100,
        opacityEnd: 50,
    });
    parallaxOpacity.init();
    parallax.add(parallaxOpacity);

    const pluto = document.querySelector('.pluto3');
    pluto.style.webkitTransition = 'background-color .35s';
    const parallaxIn = new ParallaxItemClass({
        item: document.querySelector('.parallax-via-js-in'),
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'horizontal',
        computationType: 'fixed',
        // marker: 't',
        ease: true,
        propierties: 'x',
        // start: 'right +halfWidth',
        // end: 'right +width',
        // range: '100w',
        dynamicStart: {
            position: 'right',
            value: () => {
                return pluto.offsetWidth / 2;
            },
        },
        dynamicEnd: {
            position: 'right',
            value: () => {
                return pluto.offsetWidth;
            },
        },
        dynamicRange: () => {
            return pluto.offsetWidth;
        },
        onEnter: () => {
            console.log('onEnter');
        },
        onEnterBack: () => {
            console.log('onEnterBack');
        },
        onLeave: () => {
            console.log('onLeave');
            return (pluto.style['background-color'] = 'red');
        },
        onLeaveBack: () => {
            console.log('onLeaveBack');
            return (pluto.style['background-color'] = 'white');
        },
    });
    parallaxIn.init();
    parallax.add(parallaxIn);

    let parallaxOut = new ParallaxItemClass({
        item: document.querySelector('.parallax-via-js-out'),
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'horizontal',
        computationType: 'fixed',
        start: 'left',
        end: 'left +width',
        range: '-100w',
        fromTo: true,
        propierties: 'x',
    });
    parallaxOut.init();
    const unsubscribe = parallax.add(parallaxOut);
    // unsubscribe();
    // parallaxOut = null;

    const smoothScrollFull = new SmoothScrollClass({
        target: '.scrollerH',
        direction: 'HORIZONTAL',
        speed: 40,
        ease: 20,
        drag: true,
        // motionType: 'spring',
    });
    smoothScrollFull.init();
    smoothScrollFull.onTick(() => {
        parallax.move();
    });

    const smoothScrollContiner = new SmoothScrollClass({
        target: '.scrollerH2',
        container: '.scrollerH-container2',
        direction: 'HORIZONTAL',
        speed: 120,
        ease: 20,
        drag: true,
    });
    smoothScrollContiner.init();
    smoothScrollContiner.onTick(() => parallax.move());

    const smoothScrollContiner2 = new SmoothScrollClass({
        target: '.scrollerH3',
        container: '.scrollerH-container3',
        direction: 'VERTICAL',
        speed: 120,
        ease: 20,
        drag: true,
    });
    smoothScrollContiner2.init();
    smoothScrollContiner2.onTick(() => parallax.move());
};
