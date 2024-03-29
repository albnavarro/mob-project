import { timeline, tween } from '../mobbu';

export const infiniteAnimationSync = () => {
    const stagger = document.querySelectorAll('.infinite-tween .shape__target');
    const btnStart = document.querySelector('.infinite-tween .start');
    const btnStop = document.querySelector('.infinite-tween .stop');
    const btnPause = document.querySelector('.infinite-tween .pause');
    const btnResume = document.querySelector('.infinite-tween .resume');
    const btnReverse = document.querySelector('.infinite-tween .reverse');
    const btnStartReverse = document.querySelector(
        '.infinite-tween .startReverse'
    );

    const xAmplitude = 500;
    const yAmplitude = 400;
    const duration = 10;
    const friction = duration / 2 / Math.PI;

    const infinite = tween
        .createSequencer({
            stagger: { each: 5 },
            data: { x: duration / 4, opacity: 1 },
            duration,
        })
        .goTo(
            { x: duration + duration / 4 },
            { start: 0, end: duration, ease: 'easeLinear' }
        )
        .goTo({ opacity: 0 }, { start: 0, end: 2.5, ease: 'easeOutQuad' })
        .goTo({ opacity: 1 }, { start: 2.5, end: 5, ease: 'easeInQuad' })
        .goTo({ opacity: 0 }, { start: 5, end: 7.5, ease: 'easeOutQuad' })
        .goTo({ opacity: 1 }, { start: 7.5, end: 10, ease: 'easeInQuad' });

    stagger.forEach((item) => {
        infinite.subscribe(({ x, opacity }) => {
            const val = x / friction;
            const factor = 2 / (3 - Math.cos(2 * val));
            const xr = factor * Math.cos(val) * xAmplitude;
            const yr = ((factor * Math.sin(2 * val)) / 2) * yAmplitude;
            item.style.transform = `translate3D(0px,0px,0px) translate(${xr}px, ${yr}px)`;
            item.style.opacity = opacity;
        });
    });

    const syncTimeline = timeline
        .createSyncTimeline({
            repeat: -1,
            yoyo: false,
            duration: 3000,
        })
        .add(infinite);

    syncTimeline.onComplete(() => {
        console.log(`complete`);
    });

    syncTimeline.onLoopEnd(({ direction, loop }) => {
        console.log(`direction: ${direction}, loop index: ${loop}`);
    });

    btnStart.addEventListener('click', () => {
        syncTimeline.play();
    });

    btnStop.addEventListener('click', () => {
        syncTimeline.stop();
    });

    btnPause.addEventListener('click', () => {
        syncTimeline.pause();
    });

    btnResume.addEventListener('click', () => {
        syncTimeline.resume();
    });

    btnReverse.addEventListener('click', () => {
        syncTimeline.reverse();
    });

    btnStartReverse.addEventListener('click', () => {
        syncTimeline.playReverse();
    });
};
