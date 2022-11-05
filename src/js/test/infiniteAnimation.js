import { mobbu } from '../core';

export const infiniteAnimation = () => {
    const stagger = document.querySelectorAll('.infinite-tween .shape__target');
    const play = document.querySelector('.infinite-tween .anim-play');
    const stop = document.querySelector('.infinite-tween .anim-stop');

    const tween = mobbu.createSpring({
        stagger: { each: 3 },
        data: { x: 0 },
    });

    tween.set({ x: 0 });

    const xAmplitude = 500;
    const yAmplitude = 400;
    const friction = 30;

    stagger.forEach((item, i) => {
        tween.subscribe(({ x }) => {
            const scale = 2 / (3 - Math.cos(2 * (x / friction)));
            const xr = scale * Math.cos(x / friction) * xAmplitude;
            const yr =
                ((scale * Math.sin(2 * (x / friction))) / 2) * yAmplitude;
            item.style.transform = `translate3D(0px,0px,0px) translate(${xr}px, ${yr}px)`;
        });
    });

    let counter = 0;
    let isRunning = false;
    const loop = () => {
        counter++;
        tween.goTo({ x: counter });
        if (isRunning) mobbu.use('nextFrame', () => loop());
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
