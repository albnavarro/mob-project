import { tween } from '../mobMotion';

export const tweenRealtive = () => {
    // Tween
    const playTween = document.querySelector('.tween-play');
    const resetTween = document.querySelector('.tween-reset');
    const boxTween = document.querySelector('.tween-relative-item--tween');

    const tween1 = tween.createTween({
        ease: 'easeInOutQuad',
        data: { x: 0, rotate: 0 },
        duration: 500,
        relative: true,
    });

    tween1.subscribe(({ x, rotate }) => {
        boxTween.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    });

    playTween.addEventListener('click', () => {
        tween1.goTo({ x: 100, rotate: 45 });
    });

    resetTween.addEventListener('click', () => {
        tween1.goTo({ x: 0, rotate: 0 }, { relative: false, duration: 1000 });
    });

    // Spring
    const playSpring = document.querySelector('.spring-play');
    const resetSpring = document.querySelector('.spring-reset');
    const boxSpring = document.querySelector('.tween-relative-item--spring');

    const spring = tween.createSpring({
        data: { x: 0, rotate: 0 },
        relative: true,
    });

    spring.subscribe(({ x, rotate }) => {
        boxSpring.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    });

    playSpring.addEventListener('click', () => {
        spring.goTo({ x: 100, rotate: 45 });
    });

    resetSpring.addEventListener('click', () => {
        spring.goTo({ x: 0, rotate: 0 }, { relative: false });
    });

    // Lerp
    const playLerp = document.querySelector('.lerp-play');
    const resetLerp = document.querySelector('.lerp-reset');
    const boxLerp = document.querySelector('.tween-relative-item--lerp');

    const lerp = tween.createLerp({
        data: { x: 0, rotate: 0 },
        relative: true,
    });

    lerp.subscribe(({ x, rotate }) => {
        boxLerp.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    });

    playLerp.addEventListener('click', () => {
        lerp.goTo({ x: 100, rotate: 45 });
    });

    resetLerp.addEventListener('click', () => {
        lerp.goTo({ x: 0, rotate: 0 }, { relative: false });
    });
};
