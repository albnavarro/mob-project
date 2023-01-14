import { timeline, tween } from '../mobbu';

export function staggerTweenTest() {
    const btnStart = document.querySelector('.tween .start');
    const btnStop = document.querySelector('.tween .stop');
    const btnPause = document.querySelector('.tween .pause');
    const btnPlay = document.querySelector('.tween .play');
    const btnReverseNext = document.querySelector('.tween .reverseNext');
    const btnReverseImmediate = document.querySelector(
        '.tween .reverseImmediate'
    );
    const btnUnsubscribeStagger = document.querySelector(
        '.tween .unsubscibeStagger'
    );
    const btnReverse = document.querySelector('.tween .reverse');
    const target = document.querySelector('.tween .target');
    const stagger = document.querySelectorAll('.tween .target-stagger');

    // DEFINE SPRING
    const myTween = tween.createTween({
        ease: 'easeOutSine',
        data: { x: 0, y: 0 },
    });

    myTween.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
    });

    const myStagger = tween.createTween({
        stagger: { each: 4, from: 'start' },
        ease: 'easeOutSine',
        data: { x: 0 },
    });

    const unsubscribeStagger = [...stagger].map((item) => {
        return myStagger.subscribeCache(item, ({ x }) => {
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, 0px)`;
        });
    });

    // const unsubscribeStagger = [...stagger].map((item) => {
    //     return myStagger.subscribe(({ x }) => {
    //         item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, 0px)`;
    //     });
    // });

    const unsubscribeStaggerOnComplete = [...stagger].map((item) => {
        return myStagger.onComplete(({ x }) => {
            item.style.transform = `translate(${x}px, 0px)`;
        });
    });

    // When use waitComplete: false all the stagger of same tween must have the same each value to syncronize
    // DEFINE TIMELINE
    const timeline1 = timeline
        .createAsyncTimeline({ repeat: -1, yoyo: false, autoSet: false })
        .goTo(myTween, { x: 500 })
        .goTo(myTween, { y: 500 })
        .createGroup({ waitComplete: false })
        .goTo(myTween, { x: 0 })
        .goTo(myStagger, { x: 500 }, { duration: 1500 })
        .closeGroup()
        .goTo(myTween, { y: 0 })
        .goTo(myStagger, { x: 0 }, { duration: 1500 });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline1.play();
    });

    btnStop.addEventListener('click', () => {
        timeline1.stop();
    });

    btnPause.addEventListener('click', () => {
        timeline1.pause();
    });

    btnUnsubscribeStagger.addEventListener('click', () => {
        const unsubscribe = unsubscribeStagger[2];
        unsubscribe();
        const unsubscribeComplete = unsubscribeStaggerOnComplete[2];
        unsubscribeComplete();
    });

    btnPlay.addEventListener('click', () => {
        timeline1.resume();
    });

    btnReverseNext.addEventListener('click', () => {
        timeline1.reverseNext();
    });

    btnReverseImmediate.addEventListener('click', () => {
        timeline1.reverseImmediate();
    });

    btnReverse.addEventListener('click', () => {
        timeline1.playReverse();
    });
}
