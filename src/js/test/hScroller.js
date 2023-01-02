import { mobbu } from '../core';
import { SmoothScrollClass } from '../core/plugin';

export const hScroller = () => {
    // FIRST

    /**
     *
     */
    const parallaxOpacity = mobbu.createParallax({
        item: document.querySelector('.parallax-via-js-opacity'),
        scroller: document.querySelector('.scrollerH-container .scrollerH'),
        direction: 'horizontal',
        ease: true,
        propierties: 'opacity',
        opacityStart: 100,
        opacityEnd: 50,
    });
    parallaxOpacity.init();

    /**
     *
     */
    const parallax0 = mobbu.createParallax({
        item: document.querySelector('.parallax-js-0'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        ease: true,
        propierties: 'x',
        align: 'start',
    });
    parallax0.init();

    /**
     *
     */
    const parallaxItemTween = document.querySelector('.parallax-js-1');
    const parallaxTween = mobbu.createParallaxTween({
        from: { x: 0, rotate: 0, opacity: 1 },
        to: { x: 50, rotate: 50, opacity: 1.2 },
    });
    parallaxTween.subscribe(({ x, rotate, opacity }) => {
        parallaxItemTween.style.transform = `translate3D(0,0,0) translateX(${x}px) rotate(${rotate}deg)`;
        parallaxItemTween.style.opacity = opacity;
    });
    parallaxTween.onStop(({ x, rotate, opacity }) => {
        parallaxItemTween.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
        parallaxItemTween.style.opacity = opacity;
    });
    const parallax1 = mobbu.createParallax({
        item: document.querySelector('.parallax-js-1'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        ease: false,
        propierties: 'tween',
        tween: parallaxTween,
        onSwitch: 'in-stop',
        align: 'center',
        // easeType: 'spring',
        // springConfig: 'bounce',
    });
    parallax1.init();
    /**
     *
     */

    const parallax2 = mobbu.createParallax({
        item: document.querySelector('.parallax-js-2'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        propierties: 'x',
        range: 7,
        reverse: true,
        onSwitch: 'in-stop',
    });
    parallax2.init();

    /**
     *
     */
    const parallaxPin = mobbu.createScrollTrigger({
        item: document.querySelector('.parallax-js-pin'),
        scroller: '.scrollerH-container .scrollerH',
        direction: 'horizontal',
        trigger: '.pluto',
        propierties: 'x',
        pin: true,
        marker: 'pin-marker',
        range: '0px',
        start: 'right 10vw +width',
        end: 'right 50vw +halfWidth',
    });
    parallaxPin.init();

    /**
     *
     */
    const target = document.querySelector('.parallax-via-js-in');
    const pluto = document.querySelector('.pluto3');
    pluto.style.webkitTransition = 'background-color .35s';

    const myParallaxTimeline = mobbu
        .createSequencer({
            data: { x: 0, y: 0 },
        })
        .goTo({ x: pluto.offsetWidth / 2 }, { start: 0, end: 2 })
        .goTo({ y: pluto.offsetHeight }, { start: 2.5, end: 5 })
        .goTo({ x: pluto.offsetWidth }, { start: 5, end: 7.5 })
        .goTo({ y: 0 }, { start: 7.5, end: 10 });

    myParallaxTimeline.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });

    const parallaxIn = mobbu.createScrollTrigger({
        item: target,
        scroller: '.scrollerH-container .scrollerH',
        trigger: '.pluto3',
        direction: 'horizontal',
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

    /**
     *
     */
    const target2 = document.querySelector('.parallax-via-js-out');
    const myParallaxTween = mobbu.createParallaxTween({
        from: { x: 0, y: 0 },
        to: { x: -pluto.offsetWidth, y: pluto.offsetHeight },
    });

    myParallaxTween.subscribe(({ x, y }) => {
        target2.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });

    myParallaxTween.onStop(({ x, y }) => {
        target2.style.transform = `translate(${x}px, ${y}px)`;
    });

    let parallaxOut = mobbu.createScrollTrigger({
        item: target2,
        scroller: '.scrollerH-container .scrollerH',
        trigger: '.pluto3',
        direction: 'horizontal',
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

    /**
     *
     */
    const inputRange = document.querySelector('.scrollerInput');
    const smoothScrollFull = new SmoothScrollClass({
        target: '.scrollerH',
        direction: 'HORIZONTAL',
        speed: 40,
        ease: 20,
        drag: true,
    });
    smoothScrollFull.init();
    smoothScrollFull.onTick(({ scrollValue, percent }) => {
        // console.log(percent);
        mobbu.useNextTick(() => {
            parallax0.move({ value: scrollValue });
            parallax1.move({ value: scrollValue });
            parallax2.move({ value: scrollValue });
            parallaxOpacity.move({ value: scrollValue });
            parallaxPin.move({ value: scrollValue });
            parallaxIn.move({ value: scrollValue });
            parallaxOut.move({ value: scrollValue });
        });
    });

    smoothScrollFull.updateScrollbar(({ percent }) => {
        inputRange.value = percent;
    });

    inputRange.addEventListener('input', () => {
        const range = inputRange.value;
        smoothScrollFull.move(range);
    });
    // END FIRST

    // SECOND
    /**
     *
     */
    const parallaxb1 = mobbu.createParallax({
        item: document.querySelector('.parallax-js-b1'),
        direction: 'horizontal',
        scroller: '.scrollerH-container2 .scrollerH2',
        screen: '.scrollerH-container2',
        reverse: true,
        onSwitch: 'in-stop',
        propierties: 'x',
    });
    parallaxb1.init();

    /**
     *
     */
    const parallaxb2 = mobbu.createScrollTrigger({
        item: document.querySelector('.parallax-js-b2'),
        direction: 'horizontal',
        scroller: '.scrollerH-container2 .scrollerH2',
        screen: '.scrollerH-container2',
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

    /**
     *
     */
    const smoothScrollContiner = new SmoothScrollClass({
        target: '.scrollerH2',
        container: '.scrollerH-container2',
        direction: 'HORIZONTAL',
        speed: 120,
        ease: 20,
        drag: true,
    });
    smoothScrollContiner.init();
    smoothScrollContiner.onTick(({ scrollValue }) => {
        mobbu.useNextTick(() => {
            parallaxb1.move({ value: scrollValue });
            parallaxb2.move({ value: scrollValue });
        });
    });

    // THIRD
    /**
     *
     */
    const parallaxC1 = mobbu.createScrollTrigger({
        item: document.querySelector('.parallax-js-c1'),
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        trigger: '.pluto5',
        start: 'bottom',
        end: 'bottom +height',
        propierties: 'x',
        range: '100w',
    });
    parallaxC1.init();

    /**
     *
     */
    const parallaxC2 = mobbu.createScrollTrigger({
        item: document.querySelector('.parallax-js-c2'),
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        propierties: 'x',
        trigger: '.pluto6',
        start: 'top',
        end: 'top +height',
        fromTo: true,
        range: '-100w',
    });
    parallaxC2.init();

    /**
     *
     */
    const parallaxC3 = mobbu.createScrollTrigger({
        item: document.querySelector('.parallax-js-c3'),
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        marker: 'pin2',
        pin: true,
        start: 'bottom 100px',
        end: 'bottom 300px',
        range: '0px',
        propierties: 'x',
        smoothType: 'linear',
    });
    parallaxC3.init();

    /**
     *
     */
    const parallaxC4 = mobbu.createParallax({
        item: document.querySelector('.parallax-js-c4'),
        conponent: 'm-comp--parallax',
        scroller: '.scrollerH-container3 .scrollerH3',
        screen: '.scrollerH-container3',
        onSwitch: 'out-stop',
        propierties: 'x',
    });
    parallaxC4.init();

    /**
     *
     */
    const smoothScrollContiner2 = new SmoothScrollClass({
        target: '.scrollerH3',
        container: '.scrollerH-container3',
        direction: 'VERTICAL',
        speed: 120,
        ease: 20,
        drag: true,
    });
    smoothScrollContiner2.init();
    smoothScrollContiner2.onTick(({ scrollValue }) => {
        mobbu.useNextTick(() => {
            parallaxC1.move({ value: scrollValue });
            parallaxC2.move({ value: scrollValue });
            parallaxC3.move({ value: scrollValue });
            parallaxC4.move({ value: scrollValue });
        });
    });
};
