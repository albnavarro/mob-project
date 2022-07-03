import { mobbu } from '../core';

export const tweenRealtive = () => {
    const play = document.querySelector('.tween-relative-play');
    const reset = document.querySelector('.tween-relative-reset');
    const box = document.querySelector('.tween-relative-item');

    const tween = mobbu.create('tween', {
        ease: 'easeInOutQuad',
        data: { x: 0, rotate: 0 },
        duration: 500,
        relative: true,
    });

    tween.subscribe(({ x, rotate }) => {
        box.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    });

    play.addEventListener('click', () => {
        tween.goTo({ x: 100, rotate: 45 }).catch(() => {});
    });

    reset.addEventListener('click', () => {
        tween
            .goTo({ x: 0, rotate: 0 }, { relative: false, duration: 1000 })
            .catch(() => {});
    });
};
