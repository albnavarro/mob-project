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
        stagger: { each: 1, from: 'center' },
        ease: 'easeLinear',
    })
        .setData({ rotate: 0, scaleX: 1 })
        .goTo({ rotate: 720, scaleX: 0.2 });

    const unit = 0.5;

    items.forEach((item, i) => {
        const unitInverse = items.length - i;

        handleFrame.add(() => {
            const style = {
                width: `${unitInverse * unit * 2}px`,
                height: `${unitInverse * unit * 2}px`,

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

        items.forEach((item, i) => {
            const unitInverse = items.length - i;

            myParallaxTween.onStop(({ rotate, scaleX }) => {
                item.style.transform = `translate(${
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
