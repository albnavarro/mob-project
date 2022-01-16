import { handleSpring } from '../core/animation/spring/handleSpring.js';
import { handleTween } from '../core/animation/tween/handleTween.js';
import { HandleTimeline } from '../core/animation/timeline/handleTimeline.js';

export function timlineMixTest() {
    const btnStart = document.querySelector('.mix-btn-start');
    const btnBack = document.querySelector('.mix-btn-back');
    const btnStop = document.querySelector('.mix-btn-stop');
    const btnPause = document.querySelector('.mix-btn-pause');
    const btnPlay = document.querySelector('.mix-btn-play');
    const target = document.querySelector('.mix-target');

    // DEFINE SPRING
    const mySpring = new handleSpring();
    mySpring.setData({ x: 0, y: 0, rotate: 0 });
    mySpring.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // DEFINE TWEEN
    const myTween = new handleTween();
    myTween.setData({ x: 0, y: 0, rotate: 0 });
    myTween.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // BACK TWEEN
    function motionBack() {
        const currentTween = timeline.get();
        if (!currentTween)
            return new Promise((res, reject) => {
                res();
            });

        timeline.stop();
        return currentTween.goTo({ x: 0, y: 0, rotate: 180 });
    }

    // DEFINE TIMELINE
    const timeline = new HandleTimeline({ repeat: 2 })
        .add(() => mySpring.updatePreset('wobbly'))
        .set(mySpring, { x: 0, y: 0, rotate: 0 })
        .goTo(mySpring, { x: -200 })
        .add(() => mySpring.updatePreset('default'))
        .goFromTo(mySpring, { x: -200 }, { x: 400 }, { config: { mass: 2 } })
        .sync({ from: mySpring, to: myTween })
        .goTo(myTween, { y: 400 }, { duration: 350 })
        .goTo(myTween, { x: -100, rotate: 90 }, { ease: 'easeInQuint' })
        .sync({ from: myTween, to: mySpring })
        .add(() => mySpring.updatePreset('gentle'))
        .goTo(mySpring, { x: 0, y: 0, rotate: 0 });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline.play();
    });

    btnBack.addEventListener('click', () => {
        motionBack().catch(() => {});
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
