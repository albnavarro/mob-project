import { mobbu } from '../core';

export const freeMode = () => {
    const el1 = document.querySelector('.freemode-item--1');
    const el2 = document.querySelector('.freemode-item--2');
    const el3 = document.querySelector('.freemode-item--3');
    const go = document.querySelector('.freemode-go');
    const back = document.querySelector('.freemode-back');

    console.log(el1, el2, el3);

    /*
     * Tween
     */
    const tween1 = mobbu.create('tween', { data: { y: 0 } });
    const tween2 = mobbu.create('tween', { data: { y: 0 } });
    const tween3 = mobbu.create('tween', { data: { y: 0 } });

    tween1.subscribe(({ y }) => {
        el1.style.transform = `translateY(${y}px) `;
    });

    tween2.subscribe(({ y }) => {
        el2.style.transform = `translateY(${y}px)`;
    });

    tween3.subscribe(({ y }) => {
        el3.style.transform = `translateY(${y}px)`;
    });

    // tween2.goTo({ y: 300 });
    // tween3.goTo({ y: 600 });

    /*
     * Timeline
     */
    const goTimeline = mobbu.create('asyncTimeline');
    const backTimeline = mobbu.create('asyncTimeline');

    goTimeline
        .createGroup()
        .goTo(tween1, { y: 100 }, { duration: 500 })
        .goTo(tween2, { y: 200 }, { duration: 500 })
        .goTo(tween3, { y: 400 }, { duration: 500 })
        .closeGroup();

    backTimeline
        .createGroup()
        .goTo(tween1, { y: 0 })
        .goTo(tween2, { y: 0 })
        .goTo(tween3, { y: 0 })
        .closeGroup();
    /*
     * Listener
     */
    go.addEventListener('click', () => {
        goTimeline.play();
    });

    back.addEventListener('click', () => {
        backTimeline.play();
    });
};
