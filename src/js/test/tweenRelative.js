import { mobbu } from '../core';

export const tweenRealtive = () => {
    // Tween
    const playTween = document.querySelector('.tween-play');
    const resetTween = document.querySelector('.tween-reset');
    const boxTween = document.querySelector('.tween-relative-item--tween');

    const tween = mobbu.create('tween', {
        ease: 'easeInOutQuad',
        data: { x: 0, rotate: 0 },
        duration: 500,
        relative: true,
    });

    tween.subscribe(({ x, rotate }) => {
        boxTween.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    });

    playTween.addEventListener('click', () => {
        tween.goTo({ x: 100, rotate: 45 }).catch(() => {});
    });

    resetTween.addEventListener('click', () => {
        tween
            .goTo({ x: 0, rotate: 0 }, { relative: false, duration: 1000 })
            .catch(() => {});
    });

    // Spring
    const playSpring = document.querySelector('.spring-play');
    const resetSpring = document.querySelector('.spring-reset');
    const boxSpring = document.querySelector('.tween-relative-item--spring');

    const spring = mobbu.create('spring', {
        data: { x: 0, rotate: 0 },
        duration: 500,
        relative: true,
    });

    spring.subscribe(({ x, rotate }) => {
        boxSpring.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    });

    playSpring.addEventListener('click', () => {
        spring.goTo({ x: 100, rotate: 45 }).catch(() => {});
    });

    resetSpring.addEventListener('click', () => {
        spring.goTo({ x: 0, rotate: 0 }, { relative: false }).catch(() => {});
    });

    // Lerp
    const playLerp = document.querySelector('.lerp-play');
    const resetLerp = document.querySelector('.lerp-reset');
    const boxLerp = document.querySelector('.tween-relative-item--lerp');

    const lerp = mobbu.create('lerp', {
        data: { x: 0, rotate: 0 },
        duration: 500,
        relative: true,
    });

    lerp.subscribe(({ x, rotate }) => {
        boxLerp.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    });

    playLerp.addEventListener('click', () => {
        lerp.goTo({ x: 100, rotate: 45 }).catch(() => {});
    });

    resetLerp.addEventListener('click', () => {
        lerp.goTo({ x: 0, rotate: 0 }, { relative: false }).catch(() => {});
    });
};
