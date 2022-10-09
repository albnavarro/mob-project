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
    const btnPlayFrom = document.querySelector('.syncTimeline .playFrom');
    const btnPlayFromReverse = document.querySelector(
        '.syncTimeline .playFromReverse'
    );
    const btnMoreRotation = document.querySelector(
        '.syncTimeline .moreRotation'
    );
    const btnLessRotation = document.querySelector(
        '.syncTimeline .lessRotation'
    );
    const btnStartReverse = document.querySelector(
        '.syncTimeline .startReverse'
    );
    const btnUnsubscribe = document.querySelector(
        '.syncTimeline .unsubscribeStagger'
    );
    const btnActiveStatus = document.querySelector(
        '.syncTimeline .activeStatus'
    );
    const btnPauseStatus = document.querySelector('.syncTimeline .pauseStatus');
    const btnGetDirection = document.querySelector(
        '.syncTimeline .getDirection'
    );
    const btnGetTime = document.querySelector('.syncTimeline .getTime');

    let rotation = 720;

    // SINGLE
    const seq1 = mobbu
        .createSequencer({
            ease: 'easeInOutCubic',
            data: { x: 0, y: 0, rotate: 0, scale: 1 },
        })
        .goTo({ x: 800 }, { start: 0, end: 2.5, ease: 'easeInOutBack' })
        .goTo({ y: 450 }, { start: 2.5, end: 5, ease: 'easeInOutBack' })
        .goTo({ x: 0 }, { start: 5, end: 7.5, ease: 'easeInOutBack' })
        .goTo({ y: 0 }, { start: 7.5, end: 10, ease: 'easeInOutBack' })
        .goTo(
            { rotate: () => rotation },
            { start: 0, end: 10, ease: 'easeLinear' }
        )
        .goTo({ scale: 2 }, { start: 3.5, end: 5, ease: 'easeInOutBack' })
        .goTo({ scale: 1 }, { start: 5, end: 6.5, ease: 'easeInOutBack' })
        .label('label1', 5)
        .add(({ direction, value, isForced }) => {
            if (isForced) return;
            console.log(`add fired at ${value} in ${direction} direction`);
        }, 2);

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
        .createSequencer({
            stagger: { each: 10, from: 'end' },
            data: { x: 0, scale: 1 },
        })
        .goTo({ x: 800 }, { start: 3, end: 5, ease: 'easeInOutBack' })
        .goTo({ x: 0 }, { start: 5, end: 7, ease: 'easeInOutBack' })
        .goTo({ scale: 2 }, { start: 3.5, end: 5, ease: 'easeOutCubic' })
        .goTo({ scale: 1 }, { start: 5, end: 6, ease: 'easeOutCubic' })
        .label('label2', 7);

    const unsubscribeStagger = [...starger].map((item) => {
        return seqStagger.subscribeCache(item, ({ x, scale }) => {
            item.style.transform = `translate3D(0,0,0) translate(${x}px, 0px) scale(${scale})`;
        });
    });

    const unsubscribeStaggerOnStop = [...starger].map((item) => {
        return seqStagger.onStop(({ x, scale }) => {
            item.style.transform = `translate(${x}px, 0px) scale(${scale})`;
        });
    });

    const syncTimeline = mobbu
        .createSyncTimeline({
            repeat: 2,
            yoyo: false,
            duration: 10000,
        })
        .add(seq1)
        .add(seqStagger);

    const updatePropTest = () => {
        btnActiveStatus.innerHTML = `is running: ${syncTimeline.isActive()}`;
        btnPauseStatus.innerHTML = `is paused: ${syncTimeline.isPaused()}`;
        btnGetDirection.innerHTML = `direction: ${syncTimeline.getDirection()}`;
        btnGetTime.innerHTML = `currentTime: ${syncTimeline.getTime()}`;
    };

    // callback
    syncTimeline.onLoopEnd(({ direction, loop }) => {
        console.log(`direction: ${direction}, loop index: ${loop}`);
    });

    syncTimeline.onComplete(() => {
        console.log(`complete`);
    });

    syncTimeline.onUpdate(() => {
        updatePropTest();
    });

    btnStart.addEventListener('click', () => {
        mobbu.use('frame', () => {
            syncTimeline.stop();
            syncTimeline.play();
            btnGetTime.innerHTML = `currentTime: ${syncTimeline.getTime()}`;
            updatePropTest();
        });
    });

    btnStop.addEventListener('click', () => {
        syncTimeline.stop();
        updatePropTest();
    });

    btnPause.addEventListener('click', () => {
        syncTimeline.pause();
        updatePropTest();
    });

    btnResume.addEventListener('click', () => {
        syncTimeline.resume();
        updatePropTest();
    });

    btnReverse.addEventListener('click', () => {
        syncTimeline.reverse();
        updatePropTest();
    });

    btnStartReverse.addEventListener('click', () => {
        syncTimeline.stop();
        syncTimeline.playReverse();
        updatePropTest();
    });

    btnPlayFrom.addEventListener('click', () => {
        syncTimeline.stop();
        syncTimeline.playFrom('label1');
        updatePropTest();
    });

    btnPlayFromReverse.addEventListener('click', () => {
        syncTimeline.stop();
        syncTimeline.playFromReverse('label2');
        updatePropTest();
    });

    btnMoreRotation.addEventListener('click', () => {
        rotation = 2880;
    });

    btnLessRotation.addEventListener('click', () => {
        rotation = 720;
    });

    btnUnsubscribe.addEventListener('click', () => {
        const u1 = unsubscribeStagger[2];
        u1();
        const u2 = unsubscribeStaggerOnStop[2];
        u2();
    });
}
