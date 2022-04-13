import { handleSpring } from '../core/animation/spring/handleSpring.js';
import {
    handleFrame,
    handleNextFrame,
} from '../core/events/rafutils/rafUtils.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export const circleAnimation = () => {
    const stagger = document.querySelectorAll('.circle-tween .shape__target');
    const play = document.querySelector('.circle-tween .anim-play');
    const stop = document.querySelector('.circle-tween .anim-stop');

    const tween = new handleSpring();
    tween.setData({ x: 0 });
    tween.set({ x: 0 });

    const distance = window.innerWidth / 2;
    const velocity = 10;
    const step = distance / Math.PI / velocity;
    const radius = 200;
    const duration = 1000 * velocity;

    stagger.forEach((item, i) => {
        tween.subscribe(({ x }) => {
            const xr = Math.sin(x / step) * radius;
            const yr = Math.cos(x / step) * radius;
            item.style.transform = `translate3D(0px,0px,0px) translate(${xr}px, ${yr}px)`;
        });
    });

    let counter = 0;
    let isRunning = false;
    const loop = () => {
        counter++;
        tween.goTo({ x: counter }, { stagger: { each: 3 } });
        if (isRunning) handleNextFrame.add(() => loop());
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
