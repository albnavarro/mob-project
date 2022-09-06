import { mobbu } from '../core';

export function timlineMixTest() {
    const btnStart = document.querySelector('.mix-btn-start');
    const btnStop = document.querySelector('.mix-btn-stop');
    const btnPause = document.querySelector('.mix-btn-pause');
    const btnPlay = document.querySelector('.mix-btn-play');
    const btnFrom = document.querySelector('.mix-btn-playFrom');
    const btnFromReverse = document.querySelector('.mix-btn-playFromReverse');
    const btnReverseNext = document.querySelector('.mix-btn-reverseNext');
    const btnReverse = document.querySelector('.mix-btn-reverse');
    const target = document.querySelector('.mix-target');
    const target2 = document.querySelector('.mix-target2');

    // DEFINE SPRING
    const springBox1 = mobbu.create('spring', {
        data: { x: 0, y: 0, rotate: 0 },
        config: 'wobbly',
    });
    springBox1.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // DEFINE TWEEN
    const tweenBox1 = mobbu.create('tween', {
        data: { x: 0, y: 0, rotate: 0 },
    });

    tweenBox1.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // DEFINE TWEEN 2
    const tweenBox2 = mobbu.create('tween', { data: { rotate: 0 } });
    tweenBox2.subscribe(({ rotate }) => {
        target2.style.transform = `rotate(${rotate}deg)`;
    });

    // DEFINE TIMELINE
    const timeline = mobbu.create('asyncTimeline', { repeat: 4, yoyo: false });

    timeline.onComplete(() => {
        console.log('complete');
    });

    timeline.onLoopEnd(({ loop, direction }) => {
        console.log('onLoopEnd', loop, direction);
    });

    timeline
        .goTo(springBox1, { x: -200 })
        .goFromTo(
            springBox1,
            { x: -200 },
            { x: 400 },
            { config: { mass: 2, precision: 0.5 }, delay: 500 }
        )
        .sync({ from: springBox1, to: tweenBox1 })
        .createGroup({ waitComplete: false })
        .goTo(tweenBox1, { y: 400 }, { duration: 850 })
        .goTo(tweenBox2, { rotate: 360 }, { duration: 2000, delay: 1000 })
        .closeGroup()
        .label({ name: 'label1' })
        .goTo(tweenBox1, { x: -100, rotate: 180 }, { ease: 'easeInElastic' })
        // .add(() => timeline.reverseNext())
        .sync({ from: tweenBox1, to: springBox1 })
        .createGroup({ waitComplete: false })
        .goTo(
            springBox1,
            { x: 0, y: 0, rotate: 0 },
            { config: { precision: 0.5 } }
        )
        .goTo(tweenBox2, { rotate: -180 }, { duration: 5000 })
        .closeGroup()
        .goTo(springBox1, { x: -400 });

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
        /*
         * tweenBox2 hanve a delay so rended position immediatly
         * If we manipulate tween out side timeline call stop()
         * for added security in timeline promise chain
         */
        timeline.stop();
        tweenBox2.set({ rotate: 180 }).then(() => {
            timeline.playFrom('label1');
        });
    });

    btnFromReverse.addEventListener('click', () => {
        /*
         * tweenBox2 hanve a delay so rended position immediatly
         * If we manipulate tween out side timeline call stop()
         * for added security in timeline promise chain
         */
        timeline.stop();
        tweenBox2.set({ rotate: 180 }).then(() => {
            timeline.playFromReverse('label1');
        });
    });

    btnReverseNext.addEventListener('click', () => {
        timeline.reverseNext();
    });

    btnReverse.addEventListener('click', () => {
        /*
         * tweenBox2 hanve a delay so rended position immediatly
         * If we manipulate tween out side timeline call stop()
         * for added security in timeline promise chain
         */
        timeline.stop();
        tweenBox2.set({ rotate: -180 }).then(() => {
            timeline.reverse();
        });
    });
}
