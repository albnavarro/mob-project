import { handleSpring } from '../core/animation/spring/handleSpring.js';
import { handleTween } from '../core/animation/tween/handleTween.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export function timlineMixTest() {
    const btnStart = document.querySelector('.mix-btn-start');
    const btnBack = document.querySelector('.mix-btn-back');
    const btnStop = document.querySelector('.mix-btn-stop');
    const btnPause = document.querySelector('.mix-btn-pause');
    const btnPlay = document.querySelector('.mix-btn-play');
    const btnFrom = document.querySelector('.mix-btn-playFrom');
    const btnReverseImmediate = document.querySelector(
        '.mix-btn-reverseImmediate'
    );
    const btnReverseNext = document.querySelector('.mix-btn-reverseNext');
    const btnReverse = document.querySelector('.mix-btn-reverse');
    const target = document.querySelector('.mix-target');
    const target2 = document.querySelector('.mix-target2');

    // DEFINE SPRING
    const springBox1 = new handleSpring();
    springBox1.setData({ x: 0, y: 0, rotate: 0 });
    springBox1.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // DEFINE TWEEN
    const tweenBox1 = new handleTween();
    tweenBox1.setData({ x: 0, y: 0, rotate: 0 });
    tweenBox1.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // DEFINE TWEEN 2
    const tweenBox2 = new handleTween();
    tweenBox2.setData({ rotate: 0 });
    tweenBox2.subscribe(({ rotate }) => {
        target2.style.transform = `rotate(${rotate}deg)`;
    });

    // DEFINE TIMELINE
    const timeline = new HandleAsyncTimeline({ repeat: -1, yoyo: true });

    timeline
        .add(() => springBox1.updatePreset('wobbly'))
        .set(
            springBox1,
            { x: 0, y: 0, rotate: 0 },
            { config: { precision: 0.5 } }
        )
        .set(tweenBox2, { rotate: 0 }, { config: { precision: 0.5 } })
        .goTo(springBox1, { x: -200 })
        .add(() => springBox1.updatePreset('default'))
        .goFromTo(
            springBox1,
            { x: -200 },
            { x: 400 },
            { config: { mass: 2, precision: 0.5 }, delay: 500 }
        )
        .sync({ from: springBox1, to: tweenBox1 })
        .createGroup({ waitComplete: true })
        .goTo(tweenBox1, { y: 400 }, { duration: 850 })
        .goTo(tweenBox2, { rotate: 360 }, { duration: 2000, delay: 1000 })
        .closeGroup()
        .label({ name: 'label1' })
        .goTo(tweenBox1, { x: -100, rotate: 180 }, { ease: 'easeInElastic' })
        .sync({ from: tweenBox1, to: springBox1 })
        .add(() => springBox1.updatePreset('gentle'))
        .createGroup({ waitComplete: false })
        .goTo(
            springBox1,
            { x: 0, y: 0, rotate: 0 },
            { config: { precision: 0.5 } }
        )
        .goTo(tweenBox2, { rotate: -180 }, { duration: 5000 })
        .closeGroup();
    // .suspend();

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline.play();
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

    btnFrom.addEventListener('click', () => {
        timeline.playFrom('label1');
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
