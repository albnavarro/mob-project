import { parallax } from '../../component/parallax/js/parallax.js';
import { ParallaxTween } from '../../component/parallax/js/parallaxTween.js';
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

    const target = document.querySelector('.parallax-via-js-in');
    const pluto = document.querySelector('.pluto3');
    pluto.style.webkitTransition = 'background-color .35s';

    const myParallaxTween = new ParallaxTween();
    myParallaxTween.setData({ x: 0, y: 0 });
    myParallaxTween.goTo({ x: pluto.offsetWidth, y: pluto.offsetHeight });
    myParallaxTween.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });

    const parallaxIn = new ParallaxItemClass({
        item: target,
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'horizontal',
        computationType: 'fixed',
        ease: true,
        propierties: 'tween',
        tween: myParallaxTween,
        // marker: 'parallax',
        dynamicStart: {
            position: 'right',
            value: () => {
                return pluto.offsetWidth;
            },
        },
        dynamicEnd: {
            position: 'right',
            value: () => {
                return pluto.offsetWidth * 2;
            },
        },
        // dynamicRange: () => {
        //     return pluto.offsetWidth;
        // },
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

    const target2 = document.querySelector('.parallax-via-js-out');
    const myParallaxTween2 = new ParallaxTween();
    myParallaxTween2.setData({ x: 0, y: 0 });
    myParallaxTween2.goTo({ x: -pluto.offsetWidth, y: -pluto.offsetHeight });
    myParallaxTween2.subscribe(({ x, y }) => {
        target2.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });
    let parallaxOut = new ParallaxItemClass({
        item: target2,
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'tween',
        computationType: 'fixed',
        dynamicStart: {
            position: 'left',
            value: () => {
                return pluto.offsetWidth;
            },
        },
        dynamicEnd: {
            position: 'left',
            value: () => {
                return pluto.offsetWidth * 2;
            },
        },
        fromTo: true,
        propierties: 'tween',
        tween: myParallaxTween2,
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
