import { HandleSyncTimeline } from '../core/animation/syncTimeline/handleSyncTimeline.js';
import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';

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
    const duration = 3000;
    const friction = duration / 2 / Math.PI;

    const infinite = new HandleSequencer({ stagger: { each: 5 } });
    infinite
        .setData({ x: duration / 4, opacity: 1 }) // duration / 4 => start from center
        .goTo(
            { x: duration + duration / 4 },
            { start: 0, end: duration, ease: 'easeLinear' }
        )
        .goTo({ opacity: 0 }, { start: 0, end: 750, ease: 'easeOutQuad' })
        .goTo({ opacity: 1 }, { start: 750, end: 1500, ease: 'easeInQuad' })
        .goTo({ opacity: 0 }, { start: 1500, end: 2250, ease: 'easeOutQuad' })
        .goTo({ opacity: 1 }, { start: 2250, end: 3000, ease: 'easeInQuad' });

    stagger.forEach((item, i) => {
        infinite.subscribe(({ x, opacity }) => {
            const val = x / friction;
            const factor = 2 / (3 - Math.cos(2 * val));
            const xr = factor * Math.cos(val) * xAmplitude;
            const yr = ((factor * Math.sin(2 * val)) / 2) * yAmplitude;
            item.style.transform = `translate3D(0px,0px,0px) translate(${xr}px, ${yr}px)`;
            item.style.opacity = opacity;
        });
    });

    const syncTimeline = new HandleSyncTimeline({ repeat: -1, yoyo: false });
    syncTimeline.add(infinite);
    syncTimeline.setDuration(duration);
    syncTimeline.onComplete(({ direction, loop }) => {
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
