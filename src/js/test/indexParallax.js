import { parallax } from '../../component/parallax/js/parallax.js';
import { ParallaxTimeline } from '../../component/parallax/js/parallaxTimeline.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';

export function indexParallax() {
    const item = document.querySelector('.index-parallax-1');
    const trigger = document.querySelector('.index-timeline');

    const myParallaxTimeline = new ParallaxTimeline();
    myParallaxTimeline.setData({ rotate: 0, scale: 1, opacity: 1, y: 0 });
    myParallaxTimeline.goTo({ rotate: 180 }, { start: 0, end: 5 });
    myParallaxTimeline.goTo({ scale: 2 }, { start: 3, end: 7 });
    myParallaxTimeline.goTo({ rotate: 0, scale: 1.5 }, { start: 7, end: 10 });
    myParallaxTimeline.goTo({ y: -100, opacity: 0 }, { start: 8, end: 10 });
    myParallaxTimeline.subscribe(({ scale, rotate, opacity, y }) => {
        item.style.transform = `translate3D(0,0,0) scale(${scale}) translateY(${y}px) rotate(${rotate}deg)`;
        item.style.opacity = opacity;
    });

    const parallaxIn = new ParallaxItemClass({
        item: item,
        scrollTrigger: trigger,
        computationType: 'fixed',
        propierties: 'tween',
        tween: myParallaxTimeline,
        marker: 'parallax',
        start: 'bottom 30vh',
        end: 'top +50px',
        ease: true,
        easeType: 'lerp',
        pin: true,
        animatepin: true,
        marker: 'parallax-timeline',
        lerpConfig: '100',
    });
    parallaxIn.init();
    parallax.add(parallaxIn);
}
