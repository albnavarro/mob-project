import { handleLerp } from '../core/animation/lerp/handleLerp.js';
import { HandleTimeline } from '../core/animation/timeline/handleTimeline.js';

export function lerpTest() {
    const btnStart = document.querySelector('.lerp-btn-start');
    const btnBack = document.querySelector('.lerp-btn-back');
    const btnStop = document.querySelector('.lerp-btn-stop');
    const btnPause = document.querySelector('.lerp-btn-pause');
    const btnPlay = document.querySelector('.lerp-btn-play');
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
        return mylerp.goTo({ x: 0, y: 0, rotate: 180 }, { velocity: 150 });
    }

    // DEFINE TIMELINE
    const timeline = new HandleTimeline({ repeat: 2 })
        .set(mylerp, { x: 0, y: 0, rotate: 0 })
        .goTo(mylerp, { x: -200 }, { velocity: 250 })
        .goFromTo(mylerp, { x: -200 }, { x: 400 })
        .add(() => console.log('custom function'))
        .goTo(mylerp, { y: 400 }, { velocity: 50 })
        .add(() => console.log('custom function'))
        .goTo(mylerp, { x: -100, rotate: 90 }, { velocity: 200 })
        .goTo(mylerp, { x: 0, y: 0, rotate: 0 }, { velocity: 80 });

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
}
