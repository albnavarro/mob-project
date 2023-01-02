import { mobbu } from '../core';

export function indexParallax() {
    /**
     * Sequencer
     */
    const item = document.querySelector('.index-parallax-1');
    const trigger = document.querySelector('.index-timeline');

    const myParallaxTimeline = mobbu
        .createSequencer({
            duration: 10,
            data: {
                x: 0,
                rotate: 0,
                scale: 1,
                opacity: 1,
                y: 0,
            },
        })
        .goFrom({ y: -100, opacity: 0 }, { start: 0, end: 3 })
        .goTo({ rotate: 90, scale: 1.5 }, { start: 2, end: 8 })
        .goTo({ y: 100, opacity: 0 }, { start: 7, end: 10 })
        .add(({ direction, value, isForced }) => {
            console.log(
                `add fired at ${value} in ${direction} direction, isForced:${isForced}`
            );
        }, 5);

    myParallaxTimeline.subscribe(({ scale, rotate, opacity, y, x }) => {
        const xW = (x * window.innerWidth) / 100;
        item.style.transform = `translate3D(0,0,0) scale(${scale}) translate(${xW}px, ${y}px) rotate(${rotate}deg)`;
        item.style.opacity = opacity;
    });

    myParallaxTimeline.onStop(({ scale, rotate, opacity, y, x }) => {
        const xW = (x * window.innerWidth) / 100;
        item.style.transform = `scale(${scale}) translate(${xW}px, ${y}px) rotate(${rotate}deg)`;
        item.style.opacity = opacity;
    });

    const parallaxIn = mobbu.createScrollTrigger({
        trigger: trigger,
        propierties: 'tween',
        tween: myParallaxTimeline,
        breackpoint: 'medium',
        start: 'bottom',
        end: 'top -height',
        ease: true,
        marker: 'parallax-timeline',
    });
    parallaxIn.init();

    /**
     * Parallax
     */
    const parallaxItem = document.querySelector('.js-parallax-scale');
    const tweenScale = mobbu.createParallaxTween({
        from: { x: 0, scale: 1 },
        to: { x: -50, scale: 1.2 },
    });
    tweenScale.subscribe(({ scale, x }) => {
        parallaxItem.style.transform = `translate3D(0,0,0) translateX(${x}px) scale(${scale})`;
    });
    tweenScale.onStop(({ scale, x }) => {
        parallaxItem.style.transform = `translateX(${x}px) scale(${scale})`;
    });

    const parallaxScale = mobbu.createParallax({
        trigger: parallaxItem,
        easeType: 'spring',
        propierties: 'tween',
        tween: tweenScale,
        onSwitch: 'in-stop',
        ease: true,
        // disableForce3D: true,
    });
    parallaxScale.init();

    /**
     * Various parallax
     */

    const parallax1 = mobbu.createParallax({
        item: '.js-index-parallax-1',
        align: 'start',
        propierties: 'opacity',
    });
    parallax1.init();

    const parallax2 = mobbu.createParallax({
        item: '.js-index-parallax-2',
        range: 8.5,
        align: 'center',
        ease: true,
    });
    parallax2.init();

    const parallax3 = mobbu.createParallax({
        item: '.js-index-parallax-3',
        propierties: 'opacity',
        opacityStart: 110,
        opacityEnd: 50,
        ease: true,
    });
    parallax3.init();

    const scrollTrigger1 = mobbu.createScrollTrigger({
        item: '.js-index-scrolltrigger-1',
        propierties: 'rotate',
        range: '45deg',
        start: 'bottom 50vh -halfHeight',
        end: 'top +20vh',
        pin: true,
        marker: 'side-tween-from-top',
    });
    scrollTrigger1.init();

    const parallax4 = mobbu.createParallax({
        item: '.js-index-parallax-4',
        perspective: 400,
        propierties: 'rotateX',
        reverse: true,
        range: 6,
    });
    parallax4.init();

    const parallax5 = mobbu.createParallax({
        item: '.js-index-parallax-5',
        reverse: true,
        ease: true,
        range: 6,
    });
    parallax5.init();

    const parallax6 = mobbu.createParallax({
        item: '.js-index-parallax-6',
        ease: true,
        easeType: 'spring',
        propierties: 'opacity',
        opacityStart: 100,
        opacityEnd: 45,
    });
    parallax6.init();

    // const parallax6 = mobbu.createScrollTrigger({
    //     item: '.js-index-parallax-6',
    //     ease: true,
    //     easeType: 'spring',
    //     start: 'bottom +height',
    //     end: 'bottom +45vh',
    //     propierties: 'opacity',
    //     range: '-1',
    // });
    // parallax6.init();

    const parallax7 = mobbu.createParallax({
        item: '.js-index-parallax-7',
        range: 9,
        align: 90,
        onSwitch: 'in-back',
        reverse: true,
        propierties: 'x',
    });
    parallax7.init();

    const parallax8 = mobbu.createParallax({
        item: '.js-index-parallax-8',
        range: 6,
        onSwitch: 'in-stop',
        ease: true,
    });
    parallax8.init();

    const parallax9 = mobbu.createParallax({
        item: '.js-index-parallax-9',
        range: 4.5,
        onSwitch: 'out-stop',
        easeType: 'spring',
        ease: true,
    });
    parallax9.init();

    const parallax10 = mobbu.createParallax({
        item: '.js-index-parallax-10',
        range: 9,
        align: 'bottom',
        ease: true,
        disableForce3D: true,
        easeType: 'spring',
        propierties: 'rotate',
    });
    parallax10.init();

    const parallax11 = mobbu.createParallax({
        item: '.js-index-parallax-11',
        range: 2,
        align: 'end',
        propierties: 'x',
    });
    parallax11.init();
}
