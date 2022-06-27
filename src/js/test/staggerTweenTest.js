import { mobbu } from '../core';

export function staggerTweenTest() {
    const btnStart = document.querySelector('.tween .start');
    const btnStop = document.querySelector('.tween .stop');
    const btnPause = document.querySelector('.tween .pause');
    const btnPlay = document.querySelector('.tween .play');
    const btnReverseNext = document.querySelector('.tween .reverseNext');
    const btnReverse = document.querySelector('.tween .reverse');
    const target = document.querySelector('.tween .target');
    const stagger = document.querySelectorAll('.tween .target-stagger');

    // DEFINE SPRING
    const myTween = mobbu.create('tween', {
        ease: 'easeInOutBack',
        data: { x: 0, y: 0 },
    });
    myTween.set({ x: 0, y: 0 });

    myTween.subscribe(({ x, y }) => {
        target.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
    });

    const myStagger = mobbu.create('tween', {
        stagger: { each: 4, from: 'start' },
        ease: 'easeInOutBack',
        data: { x: 0 },
    });

    myStagger.set({ x: 0 });

    stagger.forEach((item, i) => {
        myStagger.subscribe(({ x }) => {
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, 0px)`;
        });
    });

    stagger.forEach((item, i) => {
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
        .goTo(myTween, { x: 500 })
        .goTo(myTween, { y: 500 })
        .createGroup({ waitComplete: false })
        .goTo(myTween, { x: 0 })
        .goTo(myStagger, { x: 500 }, { duration: 1500 })
        .closeGroup()
        .goTo(myTween, { y: 0 })

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
