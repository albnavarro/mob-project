import { parallax } from '../../component/parallax/js/parallax.js';
import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';

export function indexParallax() {
    const item = document.querySelector('.index-parallax-1');
    const trigger = document.querySelector('.index-timeline');

    const myParallaxTimeline = new HandleSequencer();
    myParallaxTimeline
        .setData({
            x: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            y: 0,
        })
        .goFrom({ y: -100, opacity: 0 }, { start: 0, end: 3 })
        .goTo({ rotate: 90, scale: 1.5 }, { start: 2, end: 8 })
        .goTo({ y: 100, opacity: 0 }, { start: 7, end: 10 });

    myParallaxTimeline.subscribe(({ scale, rotate, opacity, y, x }) => {
        const xW = (x * window.innerWidth) / 100;
        item.style.transform = `translate3D(0,0,0) scale(${scale}) translate(${xW}px, ${y}px) rotate(${rotate}deg)`;
        item.style.opacity = opacity;
    });

    const parallaxIn = new ParallaxItemClass({
        item: item,
        scrollTrigger: trigger,
        computationType: 'fixed',
        propierties: 'tween',
        tween: myParallaxTimeline,
        start: 'bottom',
        end: 'top -height',
        ease: true,
        // pin: true,
        // animatePin: true,
        marker: 'parallax-timeline',
    });
    parallaxIn.init();
    parallax.add(parallaxIn);
}
