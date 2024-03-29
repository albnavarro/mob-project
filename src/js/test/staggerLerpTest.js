import { timeline, tween } from '../mobbu';
import { isIOS } from '../utility/isIOS.js';

export function staggerLerpTest() {
    const btnStart = document.querySelector('.lerp .start');
    const btnStop = document.querySelector('.lerp .stop');
    const btnPause = document.querySelector('.lerp .pause');
    const btnPlay = document.querySelector('.lerp .play');
    const btnReverseNext = document.querySelector('.lerp .reverseNext');
    const btnReverse = document.querySelector('.lerp .reverse');
    const target = document.querySelector('.lerp .target');
    const stagger = document.querySelectorAll('.lerp .target-stagger');

    // DEFINE SPRING
    const myTween = tween.createLerp({ data: { x: 0, y: 0 } });

    myTween.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
    });

    const myStagger = tween.createLerp({
        stagger: { each: 4, from: 'edges' },
        data: { x: 0 },
    });

    stagger.forEach((item) => {
        myStagger.subscribeCache(item, ({ x }) => {
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, 0px)`;
        });
    });

    stagger.forEach((item) => {
        myStagger.onComplete(({ x }) => {
            if (!isIOS()) item.style.transform = `translate(${x}px, 0px)`;
        });
    });

    // When use waitComplete: false all the stagger of same tween must have the same each value to syncronize
    // DEFINE TIMELINE
    const timeline1 = timeline
        .createAsyncTimeline({ repeat: -1, yoyo: true, autoSet: false })
        .goTo(myTween, { x: 500 }, { precision: 1 })
        .goTo(myTween, { y: 500 }, { precision: 1 })
        .createGroup({ waitComplete: false })
        .goTo(myTween, { x: 0 }, { precision: 1 })
        .goTo(myStagger, { x: 500 })
        .closeGroup()
        .goTo(myTween, { y: 0 }, { precision: 1 });

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
