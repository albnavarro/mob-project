import { parallax } from '../../component/parallax/js/parallax.js';
import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';
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

    const myParallaxTimeline = new HandleSequencer();
    myParallaxTimeline
        .setData({ x: 0, y: 0 })
        .goTo({ x: pluto.offsetWidth / 2 }, { start: 0, end: 2 })
        .goTo({ y: pluto.offsetHeight }, { start: 2.5, end: 5 })
        .goTo({ x: pluto.offsetWidth }, { start: 5, end: 7.5 })
        .goTo({ y: 0 }, { start: 7.5, end: 10 });

    myParallaxTimeline.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });

    const parallaxIn = new ParallaxItemClass({
        item: target,
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'horizontal',
        computationType: 'fixed',
        propierties: 'tween',
        tween: myParallaxTimeline,
        marker: 'parallax',
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
    const myParallaxTween = new ParallaxTween();
    myParallaxTween.setData({ x: 0, y: 0 });
    myParallaxTween.goTo({ x: -pluto.offsetWidth, y: pluto.offsetHeight });
    myParallaxTween.subscribe(({ x, y }) => {
        target2.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });
    let parallaxOut = new ParallaxItemClass({
        item: target2,
        scroller: '.scrollerH-container .scrollerH',
        scrollTrigger: '.pluto3',
        direction: 'tween',
        computationType: 'fixed',
        ease: true,
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
        tween: myParallaxTween,
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
