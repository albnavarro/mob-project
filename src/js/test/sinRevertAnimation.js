import { timeline, tween } from '../mobbu';

export const sinRevertAnimation = () => {
    const stagger = document.querySelectorAll('.sin-revert .shape__target');
    const play = document.querySelector('.sin-revert .anim-play');
    const stop = document.querySelector('.sin-revert .anim-stop');

    const tween1 = tween.createTween({
        ease: 'easeLinear',
        stagger: { each: 3 },
        data: { x: 0 },
    });

    const distance = window.innerWidth / 2;
    const stepNumber = 4;
    const step = distance / Math.PI / stepNumber;
    const amplitude = distance / 4;
    const duration = 1000 * stepNumber;

    stagger.forEach((item) => {
        let previousX = 0;

        tween1.subscribe(({ x }) => {
            let multiplier = x >= previousX ? 1 : -1;
            const y = Math.sin(x / step) * amplitude * multiplier;
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
            previousX = x;
        });
    });

    tween1.set({ x: 0 });

    const timeline1 = timeline.createAsyncTimeline({ repeat: -1, yoyo: true });
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
};
