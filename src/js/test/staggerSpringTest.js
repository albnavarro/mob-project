import { timeline, tween } from '../mobbu';

export function staggerSpringTest() {
    const btnStart = document.querySelector('.spring .start');
    const btnStop = document.querySelector('.spring .stop');
    const btnPause = document.querySelector('.spring .pause');
    const btnPlay = document.querySelector('.spring .play');
    const btnReverseNext = document.querySelector('.spring .reverseNext');
    const btnReverse = document.querySelector('.spring .reverse');
    const target = document.querySelector('.spring .target');
    const stagger = document.querySelectorAll('.spring .target-stagger');

    // DEFINE SPRING
    const myTween = tween.createSpring({ data: { x: 0, y: 0 } });

    myTween.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
    });

    const myStagger = tween.createSpring({
        stagger: { each: 4, from: 'center' },
        data: { x: 0 },
    });

    stagger.forEach((item) => {
        myStagger.subscribeCache(item, ({ x }) => {
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, 0px)`;
        });
    });

    stagger.forEach((item) => {
        myStagger.onComplete(({ x }) => {
            item.style.transform = `translate(${x}px, 0px)`;
        });
    });

    // When use waitComplete: false all the stagger of same tween must have the same each value to syncronize
    // DEFINE TIMELINE
    const timeline1 = timeline
        .createAsyncTimeline({ repeat: -1, yoyo: true, autoSet: false })
        .goTo(myTween, { x: 500 }, { configProp: { precision: 1 } })
        .goTo(myTween, { y: 500 }, { configProp: { precision: 1 } })
        .createGroup({ waitComplete: false })
        .goTo(myTween, { x: 0 }, { configProp: { precision: 1 } })
        .goTo(myStagger, { x: 500 })
        .closeGroup()
        .goTo(myTween, { y: 0 }, { configProp: { precision: 1 } });

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

    btnPlay.addEventListener('click', () => {
        timeline1.resume();
    });

    btnReverseNext.addEventListener('click', () => {
        timeline1.reverseNext();
    });

    btnReverse.addEventListener('click', () => {
        timeline1.playReverse();
    });
}
