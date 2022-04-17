import { HandleSyncTimeline } from '../core/animation/syncTimeline/handleSyncTimeline.js';
import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';

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
    const seq1 = new HandleSequencer();
    seq1.setData({ x: 0, y: 0, rotate: 0, scale: 1 })
        .goTo({ x: 800 }, { start: 0, end: 2500, ease: 'easeInOutBack' })
        .goTo({ y: 450 }, { start: 2500, end: 5000, ease: 'easeInOutBack' })
        .goTo({ x: 0 }, { start: 5000, end: 7500, ease: 'easeInOutBack' })
        .goTo({ y: 0 }, { start: 7500, end: 10000, ease: 'easeInOutBack' })
        .goTo({ rotate: 720 }, { start: 0, end: 10000 })
        .goTo({ scale: 2 }, { start: 3500, end: 5000 })
        .goTo({ scale: 1 }, { start: 5000, end: 6500 });

    seq1.subscribe(({ x, y, rotate, scale }) => {
        target.style.transform = `translate3D(0,0,0) translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`;
    });

    // STAGGER
    const seqStagger = new HandleSequencer({ stagger: { each: 10 } });
    seqStagger
        .setData({ x: 0, scale: 1 })
        .goTo({ x: 800 }, { start: 3000, end: 5000, ease: 'easeInOutBack' })
        .goTo({ x: 0 }, { start: 5000, end: 7000, ease: 'easeInOutBack' })
        .goTo({ scale: 2 }, { start: 3500, end: 5000, ease: 'easeOutCubic' })
        .goTo({ scale: 1 }, { start: 5000, end: 6000, ease: 'easeOutCubic' });

    starger.forEach((item, i) => {
        seqStagger.subscribe(({ x, scale }) => {
            item.style.transform = `translate3D(0,0,0) translate(${x}px, 0px) scale(${scale})`;
        });
    });

    const syncTimeline = new HandleSyncTimeline({ loop: -1, yoyo: true });
    syncTimeline.add(seq1);
    syncTimeline.add(seqStagger);
    syncTimeline.setDuration('10000');
    syncTimeline.onComplete(() => {
        console.log('complete');
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
