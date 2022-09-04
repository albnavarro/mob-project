import { mobbu } from '../core';

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
    const myTween = mobbu.create('spring', { data: { x: 0, y: 0 } });

    myTween.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
    });

    const myStagger = mobbu.create('spring', {
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
    const timeline = mobbu
        .create('asyncTimeline', { repeat: -1, yoyo: true })
        // At the start fix position ( useful to reverse while running)
        .set(myTween, { x: 0, y: 0 })
        .set(myStagger, { x: 0 })
        //
        .goTo(myTween, { x: 500 }, { config: { precision: 1 } })
        .goTo(myTween, { y: 500 }, { config: { precision: 1 } })
        .createGroup({ waitComplete: false })
        .goTo(myTween, { x: 0 }, { config: { precision: 1 } })
        .goTo(myStagger, { x: 500 })
        .closeGroup()
        .goTo(myTween, { y: 0 }, { config: { precision: 1 } })

        // At the end fix position ( useful to reverse while running)
        .set(myTween, { x: 0, y: 0 })
        .set(myStagger, { x: 500 });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline.play();
    });

    btnStop.addEventListener('click', () => {
        timeline.stop();
    });

    btnPause.addEventListener('click', () => {
        timeline.pause();
    });

    btnPlay.addEventListener('click', () => {
        timeline.resume();
    });

    btnReverseNext.addEventListener('click', () => {
        timeline.reverseNext();
    });

    btnReverse.addEventListener('click', () => {
        timeline.reverse();
    });
}
