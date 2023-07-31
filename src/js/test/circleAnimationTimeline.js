import { timeline, tween } from '../mobbu';

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

    const tween1 = tween.createTween({
        ease: 'easeLinear',
        stagger: { each: 3 },
        data: { x: 0 },
    });

    // 0 to 1
    const distance = 100;
    // stepNumber: 1 -> half loop
    // stepNumber: 2 -> full loop
    // multiply * 1000 so we have 1000 rotation per step
    // so we avoid frame glitch when tween repeat
    const stepNumber = 2 * 1000;
    const step = distance / Math.PI / stepNumber;
    const xRadius = 300;
    const yRadius = 200;
    const duration = 1000 * stepNumber;

    stagger.forEach((item) => {
        tween1.subscribe(({ x }) => {
            const xr = Math.sin(x / step) * xRadius;
            const yr = Math.cos(x / step) * yRadius;
            item.style.transform = `translate3D(0px,0px,0px) translate(${xr}px, ${yr}px)`;
        });
    });

    tween1.set({ x: 0 });

    const timeline1 = timeline.createAsyncTimeline({ repeat: -1 });
    timeline1.goFromTo(
        tween1,
        { x: 0 },
        { x: distance },
        {
            duration,
        }
    );

    play.addEventListener('click', () => {
        timeline1.play();
    });

    stop.addEventListener('click', () => {
        timeline1.stop();
    });

    pause.addEventListener('click', () => {
        timeline1.pause();
    });

    resume.addEventListener('click', () => {
        timeline1.resume();
    });
};
