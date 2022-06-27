import { mobbu, offset, outerHeight } from '../core';

export const scrollStagger = () => {
    const items = document.querySelectorAll('rect');
    const trigger = document.querySelector('.scrollStagger');

    const myParallaxTween = mobbu
        .create('parallaxTween', {
            stagger: { each: 3, from: 'center' },
            ease: 'easeLinear',
            data: { rotate: 70 },
        })
        .goTo({ rotate: 800 });

    const unit = 1.4;

    items.forEach((item, i) => {
        const unitInverse = items.length - i;

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

    items.forEach((item, i) => {
        const unitInverse = items.length - i;

        myParallaxTween.subscribe(({ rotate }) => {
            item.style.transform = `translate3D(0,0,0) translate(${
                50 - unitInverse * unit
            }px, ${50 - unitInverse * unit}px) rotate(${rotate}deg)`;
        });
    });

    const parallaxIn = mobbu.create('scrolltrigger', {
        item: trigger,
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
