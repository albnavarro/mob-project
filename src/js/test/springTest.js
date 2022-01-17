import { handleSpring } from '../core/animation/spring/handleSpring.js';
import { HandleTimeline } from '../core/animation/timeline/handleTimeline.js';

export function springTest() {
    const btnStart = document.querySelector('.spring-btn-start');
    const btnBack = document.querySelector('.spring-btn-back');
    const btnStop = document.querySelector('.spring-btn-stop');
    const btnPause = document.querySelector('.spring-btn-pause');
    const btnPlay = document.querySelector('.spring-btn-play');
    const target = document.querySelector('.spring-target');

    // DEFINE SPRING
    const mySpring = new handleSpring();
    mySpring.setData({ x: 0, y: 0, rotate: 0 });
    mySpring.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // BACK TWEEN
    function springBack() {
        timeline.stop();
        mySpring.updatePreset('gentle');
        return mySpring.goTo(
            { x: 0, y: 0, rotate: 180 },
            { ease: 'easeOutBack' }
        );
    }

    // DEFINE TIMELINE
    const timeline = new HandleTimeline({ repeat: 2, yoyo: true })
        .add(() => mySpring.updatePreset('wobbly'))
        .set(mySpring, { x: 0, y: 0, rotate: 0 })
        .goTo(mySpring, { x: -200 })
        .goFromTo(mySpring, { x: -200 }, { x: 400 })
        .add(() => mySpring.updatePreset('default'))
        .goTo(mySpring, { y: 400 }, { config: { mass: 2 } })
        .add(() => mySpring.updatePreset('bounce'))
        .goTo(mySpring, { x: -100, rotate: 90 })
        .add(() => mySpring.updatePreset('gentle'))
        .goTo(mySpring, { x: 0, y: 0, rotate: 0 });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline.play();
    });

    btnBack.addEventListener('click', () => {
        springBack().catch(() => {});
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
