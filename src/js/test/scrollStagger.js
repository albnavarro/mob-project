import { mobbu, outerHeight } from '../core';

export const scrollStagger = () => {
    const items = document.querySelectorAll('rect');
    const trigger = document.querySelector('.scrollStagger');
    const more = document.querySelector('.more');
    const less = document.querySelector('.less');
    const valEl = document.querySelector('.val');

    let val = 200;
    more.addEventListener('click', () => {
        val += 100;
        valEl.innerHTML = val;
    });
    less.addEventListener('click', () => {
        val -= 100;
        valEl.innerHTML = val;
    });

    const myParallaxTween = mobbu.createParallaxTween({
        stagger: { each: 3, from: 'center' },
        ease: 'easeLinear',
        from: { rotate: 0 },
        to: { rotate: () => val },
    });

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

        // myParallaxTween.subscribe(({ rotate }) => {
        //     item.style.transform = `translate3D(0,0,0) translate(${
        //         50 - unitInverse * unit
        //     }px, ${50 - unitInverse * unit}px) rotate(${rotate}deg)`;
        // });

        myParallaxTween.subscribeCache(item, ({ rotate }) => {
            item.style.transform = `translate3D(0,0,0) translate(${
                50 - unitInverse * unit
            }px, ${50 - unitInverse * unit}px) rotate(${rotate}deg)`;
        });
    });

    const parallaxIn = mobbu.createScrollTrigger({
        trigger,
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
