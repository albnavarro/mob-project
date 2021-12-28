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

    const parallaxIn = new ParallaxItemClass({
        item: document.querySelector('.parallax-via-js-in'),
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'horizontal',
        computationType: 'fixed',
        start: 'right +halfWidth',
        end: 'right +width',
        range: '100w',
        ease: true,
        propierties: 'x',
    });
    parallaxIn.init();
    parallax.add(parallaxIn);

    let parallaxOut = new ParallaxItemClass({
        item: document.querySelector('.parallax-via-js-out'),
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'horizontal',
        computationType: 'fixed',
        start: 'left -width',
        end: 'left',
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
