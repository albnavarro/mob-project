import { timeline, tween } from '../mobMotion';

export const sinAnimation = () => {
    const stagger = document.querySelectorAll('.sin .shape__target');
    const play = document.querySelector('.sin .anim-play');
    const stop = document.querySelector('.sin .anim-stop');
    const pause = document.querySelector('.sin .anim-pause');
    const resume = document.querySelector('.sin .anim-resume');

    const tween1 = tween.createTween({
        ease: 'easeInOutQuad',
        stagger: { each: 3 },
        data: { x: 0 },
    });

    const distance = window.innerWidth / 2;
    const stepNumber = 2;
    const step = distance / Math.PI / stepNumber;
    const amplitude = distance / 4;
    const duration = 1000 * stepNumber;

    stagger.forEach((item) => {
        tween1.subscribe(({ x }) => {
            const y = Math.sin(x / step) * amplitude;
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
        });
    });

    const timeline1 = timeline.createAsyncTimeline({ repeat: -1, yoyo: true });
    timeline1.goFromTo(
        tween1,
        { x: 0 },
        { x: distance },
        {
            duration,
        }
    );

    tween1.set({ x: 0 });

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
