import { handleTween } from '../core/animation/tween/handleTween.js';

export function tweenTest() {
    const btnStart = document.querySelector('.tween-btn-start');
    const btnBack = document.querySelector('.tween-btn-back');
    const btnStop = document.querySelector('.tween-btn-stop');
    const btnPause = document.querySelector('.tween-btn-pause');
    const btnPlay = document.querySelector('.tween-btn-play');
    const target = document.querySelector('.tween-target');

    const myTween = new handleTween();
    myTween.setData({ x: 0, y: 0, rotate: 0 });
    myTween.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    function tweenback() {
        return myTween.goTo(
            { x: 0, y: 0, rotate: 180 },
            { ease: 'easeOutBack' }
        );
    }

    function intialTween() {
        myTween.stop();
        return myTween.set(
            { x: 0, y: 0, rotate: 0 },
            { ease: 'easeInOutQuint' }
        );
    }

    function tween1() {
        return myTween.goTo({ x: 400 });
    }

    function tween2() {
        return myTween.goTo(
            { y: 400 },
            { ease: 'easeOutCubic', duration: 350 }
        );
    }

    function tween3() {
        return myTween.goTo({ x: -100, rotate: 90 }, { ease: 'easeInQuint' });
    }

    function tween4() {
        return myTween.goTo(
            { x: 0, y: 0, rotate: 0 },
            { ease: 'easeInOutQuart', duration: 2000 }
        );
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
