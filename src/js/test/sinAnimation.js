import { HandleTween, HandleAsyncTimeline } from '../core';

export const sinAnimation = () => {
    const stagger = document.querySelectorAll('.sin .shape__target');
    const play = document.querySelector('.sin .anim-play');
    const stop = document.querySelector('.sin .anim-stop');
    const pause = document.querySelector('.sin .anim-pause');
    const resume = document.querySelector('.sin .anim-resume');

    const tween = new HandleTween('easeInOutQuad');
    tween.setData({ x: 0 });
    tween.set({ x: 0 });

    const distance = window.innerWidth / 2;
    const stepNumber = 2;
    const step = distance / Math.PI / stepNumber;
    const amplitude = distance / 4;
    const duration = 1000 * stepNumber;

    stagger.forEach((item, i) => {
        tween.subscribe(({ x }) => {
            const y = Math.sin(x / step) * amplitude;
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
        });
    });

    const timeline = new HandleAsyncTimeline({ repeat: -1, yoyo: true });
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
