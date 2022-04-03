import { handleLerp } from '../core/animation/lerp/handleLerp.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export function lerpTest() {
    const btnStart = document.querySelector('.lerp-btn-start');
    const btnBack = document.querySelector('.lerp-btn-back');
    const btnStop = document.querySelector('.lerp-btn-stop');
    const btnPause = document.querySelector('.lerp-btn-pause');
    const btnPlay = document.querySelector('.lerp-btn-play');
    const btnFrom = document.querySelector('.lerp-playFrom');
    const btnReverseImmediate = document.querySelector(
        '.lerp-reverseImmediate'
    );
    const btnReverseNext = document.querySelector('.lerp-reverseNext');
    const btnReverse = document.querySelector('.lerp-btn-reverse');
    const target = document.querySelector('.lerp-target');

    // DEFINE SPRING
    const mylerp = new handleLerp();
    mylerp.setData({ x: 0, y: 0, rotate: 0 });
    mylerp.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // BACK TWEEN
    function lerpBack() {
        timeline.stop();
        return mylerp.goTo({ x: 0, y: 0, rotate: 180 }, { velocity: 0.065 });
    }

    // DEFINE TIMELINE
    const timeline = new HandleAsyncTimeline({ repeat: 2, yoyo: true })
        .set(mylerp, { x: 0, y: 0, rotate: 0 })
        .goTo(mylerp, { x: -200 }, { velocity: 0.02, precision: 1 })
        .goFromTo(mylerp, { x: -200 }, { x: 400 })
        .add(() => console.log('custom function'))
        .goTo(mylerp, { y: 400 }, { velocity: 0.05, precision: 1 })
        .add(() => console.log('custom function'))
        .label({ name: 'label1' })
        .goTo(mylerp, { x: -100, rotate: 90 }, { velocity: 0.09, precision: 1 })
        .goTo(
            mylerp,
            { x: 0, y: 0, rotate: 0 },
            { velocity: 0.1, precision: 1 }
        );

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline.play();
    });

    btnBack.addEventListener('click', () => {
        lerpBack().catch(() => {});
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

    btnReverse.addEventListener('click', () => {
        timeline.reverse();
    });

    btnFrom.addEventListener('click', () => {
        timeline.playFrom('label1');
    });

    btnReverseImmediate.addEventListener('click', () => {
        timeline.reverseImmediate();
    });

    btnReverseNext.addEventListener('click', () => {
        timeline.reverseNext();
    });
}
