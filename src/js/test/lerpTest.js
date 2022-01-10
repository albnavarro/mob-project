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
        myLerp.updateVelocity(150);
        return myLerp.goTo({ x: 0, y: 0, rotate: 180 });
    }

    function intialTween() {
        myLerp.stop();
        myLerp.updateVelocity(250);
        return myLerp.set({ x: 0, y: 0, rotate: 0 });
    }

    function tween1() {
        return myLerp.goTo({ x: 400 });
    }

    function tween2() {
        myLerp.updateVelocity(300);
        return myLerp.goTo({ y: 400 });
    }

    function tween3() {
        myLerp.updateVelocity(200);
        return myLerp.goTo({ x: -100, rotate: 90 });
    }

    function tween4() {
        myLerp.updateVelocity(80);
        return myLerp.goTo({ x: 0, y: 0, rotate: 0 });
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
