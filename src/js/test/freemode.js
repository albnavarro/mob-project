import { mobbu } from '../core';

export const freeMode = () => {
    const el1 = document.querySelector('.freemode-item--1');
    const el2 = document.querySelector('.freemode-item--2');
    const el3 = document.querySelector('.freemode-item--3');
    const stagger = document.querySelectorAll('.freemode-item--stagger');
    const go = document.querySelector('.freemode-go');
    const back = document.querySelector('.freemode-back');

    console.log(el1, el2, el3, stagger);

    /*
     * Tween
     */
    const tween1 = mobbu.create('tween', { data: { y: 0 } });
    const tween2 = mobbu.create('tween', { data: { y: 0 } });
    const tween3 = mobbu.create('tween', { data: { y: 0 } });
    const tweenStagger = mobbu.create('tween', {
        data: { rotate: 0 },
        stagger: { each: 10 },
    });

    tween1.subscribe(({ y }) => {
        el1.style.transform = `translateY(${y}px) `;
    });

    tween2.subscribe(({ y }) => {
        el2.style.transform = `translateY(${y}px)`;
    });

    tween3.subscribe(({ y }) => {
        el3.style.transform = `translateY(${y}px)`;
    });

    stagger.forEach((item) => {
        tweenStagger.subscribe(({ rotate }) => {
            item.style.transform = `rotate(${rotate}deg)`;
        });
    });

    /*
     * Timeline
     */
    const goTimeline = mobbu.create('asyncTimeline', { freeMode: true });
    const backTimeline = mobbu.create('asyncTimeline', { freeMode: true });

    goTimeline
        .createGroup()
        .goTo(tween1, { y: 100 }, { duration: 500 })
        .goTo(tween2, { y: 200 }, { duration: 500, delay: 500 })
        .goTo(tween3, { y: 400 }, { duration: 500, delay: 1000 })
        .goTo(tweenStagger, { rotate: 90 }, { duration: 500, delay: 1000 })
        .closeGroup()
        .goTo(tween1, { y: 800 }, { duration: 500 })
        .goTo(tween2, { y: 800 }, { duration: 500 })
        .goTo(tween3, { y: 800 }, { duration: 500 });

    backTimeline
        .createGroup({ waitComplete: true })
        .goTo(tween1, { y: 0 })
        .goTo(tween2, { y: 0 })
        .goTo(tween3, { y: 0 })
        .goTo(tweenStagger, { rotate: 0 }, { duration: 500 })
        .closeGroup();
    /*
     * Listener
     */
    go.addEventListener('click', () => {
        backTimeline.stop();
        goTimeline.play();
    });

    back.addEventListener('click', () => {
        goTimeline.stop();
        backTimeline.play();
    });
};