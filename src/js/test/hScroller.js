import { SmoothScroller } from '../mobMotion/plugin';
import { scroller, tween, motionCore } from '../mobMotion';

export const hScroller = () => {
    const btnPassiveTrue = document.querySelector('.btn-passive-true');
    const btnPassiveFalse = document.querySelector('.btn-passive-false');

    btnPassiveTrue.addEventListener('click', () => {
        motionCore.setDefault({
            usePassive: true,
        });
    });

    btnPassiveFalse.addEventListener('click', () => {
        motionCore.setDefault({
            usePassive: false,
        });
    });

    // FIRST

    /**
     *
     */
    const parallaxOpacity = scroller.createParallax({
        item: document.querySelector('.parallax-via-js-opacity'),
        ease: true,
        propierties: 'opacity',
        opacityStart: 100,
        opacityEnd: 50,
    });

    /**
     *
     */
    const parallax0 = scroller.createParallax({
        item: document.querySelector('.parallax-js-0'),
        ease: true,
        propierties: 'x',
        align: 'start',
    });

    /**
     *
     */
    const parallaxItemTween = document.querySelector('.parallax-js-1');
    const parallaxTween = tween.createScrollerTween({
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
    const parallax1 = scroller.createParallax({
        item: document.querySelector('.parallax-js-1'),
        ease: false,
        propierties: 'tween',
        tween: parallaxTween,
        onSwitch: 'in-stop',
        align: 'center',
        // easeType: 'spring',
        // springConfig: 'bounce',
    });
    /**
     *
     */

    const parallax2 = scroller.createParallax({
        item: document.querySelector('.parallax-js-2'),
        propierties: 'x',
        range: 7,
        reverse: true,
        onSwitch: 'in-stop',
        ease: true,
    });

    /**
     *
     */
    const parallaxPin = scroller.createScrollTrigger({
        item: document.querySelector('.parallax-js-pin'),
        trigger: '.pluto',
        propierties: 'x',
        pin: true,
        marker: 'pin-marker',
        range: '0px',
        start: 'right 10vw +width',
        end: 'right 50vw +halfWidth',
    });

    /**
     *
     */
    const target = document.querySelector('.parallax-via-js-in');
    const pluto = document.querySelector('.pluto3');
    pluto.style.webkitTransition = 'background-color .35s';

    const myParallaxTimeline = tween
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

    const parallaxIn = scroller.createScrollTrigger({
        item: target,
        trigger: '.pluto3',
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

    /**
     *
     */
    const target2 = document.querySelector('.parallax-via-js-out');
    const myParallaxTween = tween.createScrollerTween({
        from: { x: 0, y: 0 },
        to: { x: -pluto.offsetWidth, y: pluto.offsetHeight },
    });

    myParallaxTween.subscribe(({ x, y }) => {
        target2.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px)`;
    });

    myParallaxTween.onStop(({ x, y }) => {
        target2.style.transform = `translate(${x}px, ${y}px)`;
    });

    let parallaxOut = scroller.createScrollTrigger({
        item: target2,
        trigger: '.pluto3',
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

    /**
     *
     */
    const inputRange = document.querySelector('.scrollerInput');
    const smoothScrollFull = new SmoothScroller({
        scopedEvent: true,
        scroller: '.scrollerH',
        direction: 'horizontal',
        speed: 40,
        drag: true,
        easeType: 'spring',
        children: [
            parallax0,
            parallax1,
            parallax2,
            parallaxPin,
            parallaxIn,
            parallaxOut,
            parallaxOpacity,
        ],
        afterInit: () => {
            console.log('after init');
        },
        onTick: ({ percent }) => {
            inputRange.value = percent;
        },
        afterRefresh: () => {
            console.log('after refresh');
        },
        afterDestroy: () => {
            console.log('after destroy');
        },
    });
    smoothScrollFull.init();

    inputRange.addEventListener('input', () => {
        const range = inputRange.value;
        smoothScrollFull.move(range);
    });
    // END FIRST

    // SECOND
    /**
     *
     */
    const parallaxb1 = scroller.createParallax({
        item: document.querySelector('.parallax-js-b1'),
        reverse: true,
        onSwitch: 'in-stop',
        propierties: 'x',
    });

    /**
     *
     */
    const parallaxb2 = scroller.createScrollTrigger({
        item: document.querySelector('.parallax-js-b2'),
        trigger: '.pluto2',
        start: 'right 100px',
        marker: 'pin',
        pin: true,
        end: 'right +100px +width',
        range: '0px',
        propierties: 'x',
    });

    /**
     *
     */
    const smoothScrollContiner = new SmoothScroller({
        scroller: '.scrollerH2',
        screen: '.scrollerH-container2',
        direction: 'horizontal',
        speed: 120,
        drag: true,
        children: [parallaxb1, parallaxb2],
    });
    smoothScrollContiner.init();

    // THIRD
    /**
     *
     */
    const parallaxC1 = scroller.createScrollTrigger({
        item: document.querySelector('.parallax-js-c1'),
        trigger: '.pluto5',
        start: 'bottom',
        end: 'bottom +height',
        propierties: 'x',
        range: '100w',
    });

    /**
     *
     */
    const parallaxC2 = scroller.createScrollTrigger({
        item: document.querySelector('.parallax-js-c2'),
        propierties: 'x',
        trigger: '.pluto6',
        start: 'top',
        end: 'top +height',
        fromTo: true,
        range: '-100w',
    });

    /**
     *
     */
    const parallaxC3 = scroller.createScrollTrigger({
        item: document.querySelector('.parallax-js-c3'),
        marker: 'pin2',
        pin: true,
        start: 'bottom 100px',
        end: 'bottom 300px',
        range: '0px',
        propierties: 'x',
    });

    /**
     *
     */
    const parallaxC4 = scroller.createParallax({
        item: document.querySelector('.parallax-js-c4'),
        onSwitch: 'out-stop',
        propierties: 'x',
    });

    /**
     *
     */
    const smoothScrollContiner2 = new SmoothScroller({
        scroller: '.scrollerH3',
        screen: '.scrollerH-container3',
        direction: 'vertical',
        speed: 120,
        drag: true,
        children: [parallaxC1, parallaxC2, parallaxC3, parallaxC4],
    });
    smoothScrollContiner2.init();
};
