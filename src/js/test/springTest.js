import { handleSpring } from '../core/animation/spring/handleSpring.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export function springTest() {
    const btnStart = document.querySelector('.spring-btn-start');
    const btnBack = document.querySelector('.spring-btn-back');
    const btnStop = document.querySelector('.spring-btn-stop');
    const btnPause = document.querySelector('.spring-btn-pause');
    const btnPlay = document.querySelector('.spring-btn-play');
    const btnFrom = document.querySelector('.spring-playFrom');
    const btnReverseNext = document.querySelector('.spring-reverseNext');
    const btnReverse = document.querySelector('.spring-btn-reverse');
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
    const timeline = new HandleAsyncTimeline({ repeat: 2, yoyo: true })
        .add(() => mySpring.updatePreset('wobbly'))
        .set(
            mySpring,
            { x: 0, y: 0, rotate: 0 },
            { config: { precision: 0.5 } }
        )
        .goTo(mySpring, { x: -200 }, { config: { precision: 0.5 } })
        .goFromTo(
            mySpring,
            { x: -200 },
            { x: 400 },
            { config: { precision: 0.5 } }
        )
        .add(() => mySpring.updatePreset('default'))
        .goTo(mySpring, { y: 400 }, { config: { mass: 2, precision: 0.5 } })
        .add(() => mySpring.updatePreset('bounce'))
        .label({ name: 'label1' })
        .goTo(mySpring, { x: -100, rotate: 90 }, { config: { precision: 0.5 } })
        .add(() => mySpring.updatePreset('gentle'))
        .goTo(
            mySpring,
            { x: 0, y: 0, rotate: 0 },
            { config: { precision: 0.5 } }
        );

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

    btnReverse.addEventListener('click', () => {
        timeline.reverse();
    });

    btnFrom.addEventListener('click', () => {
        timeline.playFrom('label1');
    });

    btnReverseNext.addEventListener('click', () => {
        timeline.reverseNext();
    });
}
