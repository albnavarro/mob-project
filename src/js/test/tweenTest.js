import { handleTween } from '../core/animation/tween/handleTween.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export function tweenTest() {
    const btnStart = document.querySelector('.tween-btn-start');
    const btnBack = document.querySelector('.tween-btn-back');
    const btnStop = document.querySelector('.tween-btn-stop');
    const btnPause = document.querySelector('.tween-btn-pause');
    const btnPlay = document.querySelector('.tween-btn-play');
    const btnReverseImmediate = document.querySelector(
        '.tween-reverseImmediate'
    );
    const btnReverseNext = document.querySelector('.tween-reverseNext');
    const btnReverse = document.querySelector('.tween-btn-reverse');
    const target = document.querySelector('.tween-target');

    // DEFINE SPRING
    const myTween = new handleTween();
    myTween.setData({ x: 0, y: 0, rotate: 0 });
    myTween.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // BACK TWEEN
    function tweenback() {
        return myTween.goTo(
            { x: 0, y: 0, rotate: 180 },
            { ease: 'easeOutBack' }
        );
    }

    // DEFINE TIMELINE
    const timeline = new HandleAsyncTimeline({ repeat: -1, yoyo: true })
        .set(myTween, { x: 0, y: 0, rotate: 0 })
        .goTo(myTween, { x: -200 })
        .goFromTo(myTween, { x: -200 }, { x: 400 }, { duration: 800 })
        .add(() => console.log('custom function'))
        .goTo(myTween, { y: 400 }, { duration: 350 })
        .goTo(myTween, { x: -100, rotate: 90 }, { ease: 'easeInQuint' })
        .add(() => console.log('custom function'))
        .goTo(myTween, { x: 0, y: 0, rotate: 0 }, { duration: 2000 });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline.play();
    });

    btnBack.addEventListener('click', () => {
        tweenback().catch(() => {});
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

    btnReverseImmediate.addEventListener('click', () => {
        timeline.reverseImmediate();
    });

    btnReverseNext.addEventListener('click', () => {
        timeline.reverseNext();
    });

    btnReverse.addEventListener('click', () => {
        timeline.reverse();
    });
}
