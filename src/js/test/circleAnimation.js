import { mobbu } from '../core';

export const circleAnimation = () => {
    const stagger = document.querySelectorAll('.circle-tween .shape__target');
    const play = document.querySelector('.circle-tween .anim-play');
    const stop = document.querySelector('.circle-tween .anim-stop');

    const tween = mobbu.createSpring({
        stagger: { each: 3, from: 'start' },
        data: { x: 0 },
    });
    tween.set({ x: 0 });

    const step = 0.06;
    const radius = 200;

    stagger.forEach((item, i) => {
        tween.subscribe(({ x }) => {
            const xr = Math.sin(x * step) * radius;
            const yr = Math.cos(x * step) * radius;
            item.style.transform = `translate3D(0px,0px,0px) translate(${xr}px, ${yr}px)`;
        });
    });

    let counter = 0;
    let isRunning = false;
    const loop = () => {
        counter++;
        tween.goTo({ x: counter }).catch((err) => {});
        if (isRunning) mobbu.useNextFrame(() => loop());
    };

    play.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            loop();
        }
    });

    stop.addEventListener('click', () => {
        isRunning = false;
    });
};
