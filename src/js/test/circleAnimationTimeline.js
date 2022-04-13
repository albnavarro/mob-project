import { handleTween } from '../core/animation/tween/handleTween.js';
import {
    handleFrame,
    handleNextFrame,
} from '../core/events/rafutils/rafUtils.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export const circleAnimationTimeline = () => {
    const stagger = document.querySelectorAll(
        '.circle-tween-timeline .shape__target'
    );
    const play = document.querySelector('.circle-tween-timeline .anim-play');
    const stop = document.querySelector('.circle-tween-timeline .anim-stop');
    const pause = document.querySelector('.circle-tween-timeline .anim-pause');
    const resume = document.querySelector(
        '.circle-tween-timeline .anim-resume'
    );

    const tween = new handleTween('easeLinear');
    tween.setData({ x: 0 });
    tween.set({ x: 0 });

    // 0 to 1
    const distance = 1;
    // stepNumber: 1 -> half loop
    // stepNumber: 2 -> full loop
    const stepNumber = 2;
    const step = distance / Math.PI / stepNumber;
    const xRadius = 300;
    const yRadius = 200;
    const duration = 1000 * stepNumber;

    stagger.forEach((item, i) => {
        tween.subscribe(({ x }) => {
            const xr = Math.sin(x / step) * xRadius;
            const yr = Math.cos(x / step) * yRadius;
            item.style.transform = `translate3D(0px,0px,0px) translate(${xr}px, ${yr}px)`;
        });
    });

    const timeline = new HandleAsyncTimeline({ repeat: -1 });
    timeline.goFromTo(
        tween,
        { x: 0 },
        { x: distance },
        {
            stagger: { each: 3 },
            duration,
        }
    );

    play.addEventListener('click', () => {
        timeline.play();
    });

    stop.addEventListener('click', () => {
        timeline.stop();
    });

    pause.addEventListener('click', () => {
        timeline.pause();
    });

    resume.addEventListener('click', () => {
        timeline.resume();
    });
};
