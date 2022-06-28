import { mobbu } from '../core';
import { isIOS } from '../utility/isIOS.js';

export function syncTimelineTest() {
    const target = document.querySelector('.sync-target');
    const starger = document.querySelectorAll('.sync-stagger');
    const btnStart = document.querySelector('.syncTimeline .start');
    const btnStop = document.querySelector('.syncTimeline .stop');
    const btnPause = document.querySelector('.syncTimeline .pause');
    const btnResume = document.querySelector('.syncTimeline .resume');
    const btnReverse = document.querySelector('.syncTimeline .reverse');
    const btnStartReverse = document.querySelector(
        '.syncTimeline .startReverse'
    );

    // SINGLE
    const seq1 = mobbu
        .create('sequencer', {
            ease: 'easeInOutCubic',
            data: { x: 0, y: 0, rotate: 0, scale: 1 },
        })
        .goTo({ x: 800 }, { start: 0, end: 2500, ease: 'easeInOutBack' })
        .goTo({ y: 450 }, { start: 2500, end: 5000, ease: 'easeInOutBack' })
        .goTo({ x: 0 }, { start: 5000, end: 7500, ease: 'easeInOutBack' })
        .goTo({ y: 0 }, { start: 7500, end: 10000, ease: 'easeInOutBack' })
        .goTo({ rotate: 720 }, { start: 0, end: 10000 })
        .goTo({ scale: 2 }, { start: 3500, end: 5000, ease: 'easeInOutBack' })
        .goTo({ scale: 1 }, { start: 5000, end: 6500, ease: 'easeInOutBack' });

    seq1.subscribe(({ x, y, rotate, scale }) => {
        target.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`;
    });

    seq1.onStop(({ x, y, rotate, scale }) => {
        // If remove translate3D on ipad have a bug and the image still remaing on screen
        if (!isIOS())
            target.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`;
    });

    // STAGGER
    const seqStagger = mobbu
        .create('sequencer', {
            stagger: { each: 10, from: 'end' },
            data: { x: 0, scale: 1 },
        })
        .goTo({ x: 800 }, { start: 3000, end: 5000, ease: 'easeInOutBack' })
        .goTo({ x: 0 }, { start: 5000, end: 7000, ease: 'easeInOutBack' })
        .goTo({ scale: 2 }, { start: 3500, end: 5000, ease: 'easeOutCubic' })
        .goTo({ scale: 1 }, { start: 5000, end: 6000, ease: 'easeOutCubic' });

    starger.forEach((item, i) => {
        seqStagger.subscribe(({ x, scale }) => {
            item.style.transform = `translate3D(0,0,0) translate(${x}px, 0px) scale(${scale})`;
        });
    });

    starger.forEach((item, i) => {
        seqStagger.onStop(({ x, scale }) => {
            item.style.transform = `translate(${x}px, 0px) scale(${scale})`;
        });
    });

    const syncTimeline = mobbu
        .create('syncTimeline', {
            repeat: 4,
            yoyo: false,
            duration: 10000,
        })
        .add(seq1)
        .add(seqStagger);

    // callback
    syncTimeline.onLoopEnd(({ direction, loop }) => {
        console.log(`direction: ${direction}, loop index: ${loop}`);
    });
    syncTimeline.onComplete(() => {
        console.log(`complete`);
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
}
