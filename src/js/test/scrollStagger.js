import { ParallaxTween } from '../../component/parallax/js/parallaxTween.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { offset, outerHeight } from '../core/utils/vanillaFunction.js';

export const scrollStagger = () => {
    const items = document.querySelectorAll('.js-item');
    const trigger = document.querySelector('.scrollStagger');

    const myParallaxTween = new ParallaxTween({
        stagger: { each: 3, from: 'end' },
        ease: 'easeLinear',
    })
        .setData({ rotate: 0, scale: 1 })
        .goTo({ rotate: 360, scale: 0.7 });

    items.forEach((item, i) => {
        myParallaxTween.subscribe(({ rotate, scale }) => {
            item.style.transform = `translate3D(0,0,0) rotate(${rotate}deg) scale(${scale})`;
        });
    });

    items.forEach((item, i) => {
        myParallaxTween.onStop(({ rotate, scale }) => {
            item.style.transform = `rotate(${rotate}deg) scale(${scale})`;
        });
    });

    const parallaxIn = new ParallaxItemClass({
        item: trigger,
        computationType: 'fixed',
        propierties: 'tween',
        tween: myParallaxTween,
        dynamicStart: {
            position: 'bottom',
            value: () => window.innerHeight,
        },
        dynamicEnd: {
            position: 'bottom',
            value: () => outerHeight(trigger),
        },
        ease: true,
        // easeType: 'lerp',
    });
    parallaxIn.init();
};
