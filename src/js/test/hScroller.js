import { parallax } from '../../component/parallax/js/parallax.js';
import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';
import { ParallaxTween } from '../../component/parallax/js/parallaxTween.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { SmoothScrollClass } from '../../component/smoothScroll/js/smoothScroll.js';
import { handleNextTick } from '../core/events/rafutils/rafUtils.js';

export const hScroller = () => {
    // FIRST
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

    const parallax1 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-1'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        ease: true,
        propierties: 'x',
        align: 'start',
    });
    parallax1.init();

    const parallax2 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-2'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        propierties: 'x',
        range: 7,
        reverse: true,
        onSwitch: 'in-stop',
    });
    parallax2.init();

    const parallaxPin = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-pin'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        computationType: 'fixed',
        trigger: '.pluto',
        propierties: 'x',
        pin: true,
        range: '0px',
        start: 'right 10vw +width',
        end: 'right 50vw +halfWidth',
    });
    parallaxPin.init();

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
        trigger: '.pluto3',
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
        onEnter: () => {
            console.log('onEnter');
            return (pluto.style['background-color'] = 'red');
        },
        onEnterBack: () => {
            console.log('onEnterBack');
            return (pluto.style['background-color'] = 'red');
        },
        onLeave: () => {
            console.log('onLeave');
            return (pluto.style['background-color'] = '');
        },
        onLeaveBack: () => {
            console.log('onLeaveBack');
            return (pluto.style['background-color'] = '');
        },
    });
    parallaxIn.init();

    const target2 = document.querySelector('.parallax-via-js-out');
    const myParallaxTween = new ParallaxTween();
    myParallaxTween.setData({ x: 0, y: 0 });
    myParallaxTween.goTo({ x: -pluto.offsetWidth, y: pluto.offsetHeight });

    myParallaxTween.subscribe(({ x, y }) => {
        target2.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });

    myParallaxTween.onStop(({ x, y }) => {
        target2.style.transform = `translate(${x}px, ${y}px)`;
    });

    let parallaxOut = new ParallaxItemClass({
        item: target2,
        scroller: '.scrollerH-container .scrollerH',
        trigger: '.pluto3',
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

    const smoothScrollFull = new SmoothScrollClass({
        target: '.scrollerH',
        direction: 'HORIZONTAL',
        speed: 40,
        ease: 20,
        drag: true,
    });
    smoothScrollFull.init();
    smoothScrollFull.onTick((scrollVal) => {
        handleNextTick.add(() => {
            parallax1.move(scrollVal);
            parallax2.move(scrollVal);
            parallaxOpacity.move(scrollVal);
            parallaxPin.move(scrollVal);
            parallaxIn.move(scrollVal);
            parallaxOut.move(scrollVal);
        });
    });
    // END FIRST

    // SECOND
    const parallaxb1 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-b1'),
        direction: 'horizontal',
        scroller: '.scrollerH-container2 .scrollerH2',
        screen: '.scrollerH-container2',
        reverse: true,
        onSwitch: 'in-stop',
        propierties: 'x',
    });
    parallaxb1.init();

    const parallaxb2 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-b2'),
        direction: 'horizontal',
        scroller: '.scrollerH-container2 .scrollerH2',
        screen: '.scrollerH-container2',
        computationType: 'fixed',
        trigger: '.pluto2',
        start: 'right 100px',
        marker: 'pin',
        pin: true,
        end: 'right +100px +width',
        range: '0px',
        propierties: 'x',
        smoothType: 'linear',
    });
    parallaxb2.init();

    const smoothScrollContiner = new SmoothScrollClass({
        target: '.scrollerH2',
        container: '.scrollerH-container2',
        direction: 'HORIZONTAL',
        speed: 120,
        ease: 20,
        drag: true,
    });
    smoothScrollContiner.init();
    smoothScrollContiner.onTick((scrollVal) => {
        handleNextTick.add(() => {
            parallaxb1.move(scrollVal);
            parallaxb2.move(scrollVal);
        });
    });

    // THIRD
    const parallaxC1 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-c1'),
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        computationType: 'fixed',
        trigger: '.pluto5',
        start: 'bottom',
        end: 'bottom +height',
        propierties: 'x',
        range: '100w',
    });
    parallaxC1.init();

    const parallaxC2 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-c2'),
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        computationType: 'fixed',
        propierties: 'x',
        trigger: '.pluto6',
        start: 'top',
        end: 'top +height',
        fromTo: true,
        range: '-100w',
    });
    parallaxC2.init();

    const parallaxC3 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-c3'),
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        computationType: 'fixed',
        marker: 'pin2',
        pin: true,
        start: 'bottom 100px',
        end: 'bottom 300px',
        range: '0px',
        propierties: 'x',
        smoothType: 'linear',
    });
    parallaxC3.init();

    const parallaxC4 = new ParallaxItemClass({
        item: document.querySelector('.parallax-js-c4'),
        conponent: 'm-comp--parallax',
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        onSwitch: 'out-stop',
        propierties: 'x',
    });
    parallaxC4.init();

    const smoothScrollContiner2 = new SmoothScrollClass({
        target: '.scrollerH3',
        container: '.scrollerH-container3',
        direction: 'VERTICAL',
        speed: 120,
        ease: 20,
        drag: true,
    });
    smoothScrollContiner2.init();
    smoothScrollContiner2.onTick((scrollVal) => {
        handleNextTick.add(() => {
            parallaxC1.move(scrollVal);
            parallaxC2.move(scrollVal);
            parallaxC3.move(scrollVal);
            parallaxC4.move(scrollVal);
        });
    });
};
