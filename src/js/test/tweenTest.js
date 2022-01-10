import { mobTween } from '../core/animation/tween/mobTween.js';

export function tweenTest() {
    const btnStart = document.querySelector('.tween-btn-start');
    const btnBack = document.querySelector('.tween-btn-back');
    const btnStop = document.querySelector('.tween-btn-stop');
    const btnPause = document.querySelector('.tween-btn-pause');
    const btnPlay = document.querySelector('.tween-btn-play');
    const target = document.querySelector('.tween-target');

    const myTween = new mobTween();
    myTween.setData({ x: 0, y: 0, rotate: 0 });
    myTween.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    function tweenback() {
        myTween.updatePreset('easeOutBack');
        return myTween.goTo({ x: 0, y: 0, rotate: 180 });
    }

    function intialTween() {
        myTween.stop();
        myTween.updatePreset('easeInOutQuint');
        return myTween.set({ x: 0, y: 0, rotate: 0 }, 10);
    }

    function tween1() {
        return myTween.goTo({ x: 400 });
    }

    function tween2() {
        myTween.updatePreset('easeOutCubic');
        return myTween.goTo({ y: 400 }, 1500);
    }

    function tween3() {
        myTween.updatePreset('easeInQuint');
        return myTween.goTo({ x: -100, rotate: 90 });
    }

    function tween4() {
        myTween.updatePreset('easeInOutQuart');
        return myTween.goTo({ x: 0, y: 0, rotate: 0 });
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
        myTween.stop();
    });

    btnPause.addEventListener('click', () => {
        myTween.pause();
    });

    btnPlay.addEventListener('click', () => {
        myTween.resume();
    });
}
