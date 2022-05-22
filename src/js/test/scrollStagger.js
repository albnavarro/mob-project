import { ParallaxTween } from '../../component/parallax/js/parallaxTween.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { offset, outerHeight } from '../core/utils/vanillaFunction.js';
import {
    handleFrame,
    handleNextTick,
} from '../core/events/rafutils/rafUtils.js';

export const scrollStagger = () => {
    const items = document.querySelectorAll('rect');
    const trigger = document.querySelector('.scrollStagger');

    const myParallaxTween = new ParallaxTween({
        stagger: { each: 3, from: 'center' },
        ease: 'easeLinear',
    })
        .setData({ rotate: 70, scaleX: 1 })
        .goTo({ rotate: 800, scaleX: 1 });

    const unit = 1.4;

    items.forEach((item, i) => {
        const unitInverse = items.length - i;

        handleFrame.add(() => {
            const style = {
                width: `${unitInverse * unit * (i / 10)}px`,
                height: `${unitInverse * unit * (i / 5)}px`,

                // Sfalsato
                transformOrigin: `${unitInverse * unit}px ${i * unit}px`,

                // Center
                // transformOrigin: `${unitInverse * unit}px ${
                //     unitInverse * unit
                // }px`,
            };

            Object.assign(item.style, style);
        });
    });

    handleNextTick.add(() => {
        items.forEach((item, i) => {
            const unitInverse = items.length - i;

            myParallaxTween.subscribe(({ rotate, scaleX }) => {
                item.style.transform = `translate3D(0,0,0) translate(${
                    50 - unitInverse * unit
                }px, ${
                    50 - unitInverse * unit
                }px) rotate(${rotate}deg) scaleX(${scaleX})`;
            });
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
        easeType: 'lerp',
    });
    parallaxIn.init();
};
