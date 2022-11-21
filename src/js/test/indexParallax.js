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
        ease: true,
        easeType: 'spring',
        propierties: 'tween',
        tween: tweenScale,
        onSwitch: 'in-stop',
    });
    parallaxScale.init();
}
