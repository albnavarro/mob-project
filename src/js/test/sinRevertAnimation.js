import { mobbu } from '../core';

export const sinRevertAnimation = () => {
    const stagger = document.querySelectorAll('.sin-revert .shape__target');
    const play = document.querySelector('.sin-revert .anim-play');
    const stop = document.querySelector('.sin-revert .anim-stop');

    const tween = mobbu.create('tween', {
        ease: 'easeLinear',
        stagger: { each: 3 },
        data: { x: 0 },
    });
    tween.set({ x: 0 });

    const distance = window.innerWidth / 2;
    const stepNumber = 4;
    const step = distance / Math.PI / stepNumber;
    const amplitude = distance / 4;
    const duration = 1000 * stepNumber;

    stagger.forEach((item, i) => {
        let previousX = 0;

        tween.subscribe(({ x }) => {
            let multiplier = x >= previousX ? 1 : -1;
            const y = Math.sin(x / step) * amplitude * multiplier;
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
            previousX = x;
        });
    });

    const timeline = mobbu.create('asyncTimeline', { repeat: -1, yoyo: true });
    timeline.goFromTo(
        tween,
        { x: 0 },
        { x: distance },
        {
            duration,
        }
    );

    play.addEventListener('click', () => {
        timeline.play();
    });

    stop.addEventListener('click', () => {
        timeline.stop();
    });
};
