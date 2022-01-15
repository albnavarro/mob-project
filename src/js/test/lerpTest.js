import { handleLerp } from '../core/animation/lerp/handleLerp.js';

export function lerpTest() {
    const btnStart = document.querySelector('.lerp-btn-start');
    const btnBack = document.querySelector('.lerp-btn-back');
    const btnStop = document.querySelector('.lerp-btn-stop');
    const btnPause = document.querySelector('.lerp-btn-pause');
    const btnPlay = document.querySelector('.lerp-btn-play');
    const target = document.querySelector('.lerp-target');

    const myLerp = new handleLerp();
    myLerp.setData({ x: 0, y: 0, rotate: 0 });
    myLerp.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    function tweenback() {
        return myLerp.goTo({ x: 0, y: 0, rotate: 180 }, { velocity: 150 });
    }

    function intialTween() {
        myLerp.stop();
        return myLerp.set({ x: 0, y: 0, rotate: 0 }, { velocity: 250 });
    }

    function tween1() {
        return myLerp.goTo({ x: 400 });
    }

    function tween2() {
        return myLerp.goTo({ y: 400 }, { velocity: 50 });
    }

    function tween3() {
        return myLerp.goTo({ x: -100, rotate: 90 }, { velocity: 200 });
    }

    function tween4() {
        return myLerp.goTo({ x: 0, y: 0, rotate: 0 }, { velocity: 80 });
    }

    btnStart.addEventListener('click', () => {
        intialTween()
            .then(() => tween1())
            .then(() => tween2())
            .then(() => tween3())
            .then(() => tween4())
            .catch(() => {});
    });

    btnBack.addEventListener('click', () => {
        tweenback().catch(() => {});
    });

    btnStop.addEventListener('click', () => {
        myLerp.stop();
    });

    btnPause.addEventListener('click', () => {
        myLerp.pause();
    });

    btnPlay.addEventListener('click', () => {
        myLerp.resume();
    });
}
