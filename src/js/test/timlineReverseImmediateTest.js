import { mobCore } from '../mobCore';
import { timeline, tween } from '../mobMotion';

export function timlineReverseImmediateTest() {
    const btnStart = document.querySelector('.reverse-immediate-btn-start');
    const btnStop = document.querySelector('.reverse-immediate-btn-stop');
    const btnPause = document.querySelector('.reverse-immediate-btn-pause');
    const btnPlay = document.querySelector('.reverse-immediate-btn-play');
    const btnFrom = document.querySelector('.reverse-immediate-btn-playFrom');
    const btnFromReverse = document.querySelector(
        '.reverse-immediate-btn-playFromReverse'
    );
    const btnReverseNext = document.querySelector(
        '.reverse-immediate-btn-reverseNext'
    );
    const btnReverseImmediate = document.querySelector(
        '.reverse-immediate-btn-reverse-immediate'
    );
    const btnReverse = document.querySelector('.reverse-immediate-btn-reverse');
    const btnFast = document.querySelector('.reverse-immediate-btn-fast-step3');
    const btnSlow = document.querySelector('.reverse-immediate-btn-slow-step3');
    const btnToggleSuspend = document.querySelector(
        '.reverse-immediate-btn-toggle-suspend'
    );
    const btnActiveStatus = document.querySelector(
        '.reverse-immediate-btn-activeStatus'
    );
    const btnPauseStatus = document.querySelector(
        '.reverse-immediate-btn-pauseStatus'
    );
    const btnSuspensionStatus = document.querySelector(
        '.reverse-immediate-btn-suspensionStatus'
    );
    const btnGetDirection = document.querySelector(
        '.reverse-immediate-btn-getDirection'
    );
    const suspendLabel = btnToggleSuspend.querySelector('span');
    const target = document.querySelector('.reverse-immediate-target');
    const target2 = document.querySelector('.reverse-immediate-target2');
    let durationTest = 850;
    let toggleSuspend = false;
    suspendLabel.innerHTML = `: ${toggleSuspend}`;

    btnFast.addEventListener('click', () => {
        durationTest = 200;
    });

    btnSlow.addEventListener('click', () => {
        durationTest = 1000;
    });

    // DEFINE TWEEN
    const tweenBox1 = tween.createTween({
        data: { x: 0, y: 0, rotate: 0 },
    });

    tweenBox1.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // DEFINE TWEEN 2
    const tweenBox2 = tween.createTween({ data: { rotate: 0 } });
    tweenBox2.subscribe(({ rotate }) => {
        target2.style.transform = `rotate(${rotate}deg)`;
    });

    // DEFINE TIMELINE
    const timeline1 = timeline.createAsyncTimeline({
        repeat: 1,
        yoyo: false,
        autoSet: true,
    });

    timeline1.onComplete(() => {
        console.log('complete');
    });

    timeline1.onLoopEnd(({ loop, direction }) => {
        console.log('onLoopEnd', loop, direction);
    });

    timeline1
        .goTo(tweenBox1, { x: -200 })
        .goFromTo(
            tweenBox1,
            { x: -200 },
            { x: 400 },
            { configProp: { mass: 2, precision: 0.5 }, delay: 500 }
        )
        .createGroup({ waitComplete: false })
        .goTo(tweenBox1, { y: 400 }, { duration: () => durationTest })
        .goTo(tweenBox2, { rotate: 360 }, { duration: 2000, delay: 1000 })
        .closeGroup()
        .label({ name: 'label1' })
        .goTo(tweenBox1, { x: -100, rotate: 180 }, { ease: 'easeInElastic' })
        .suspend(() => toggleSuspend)
        // .add(() => timeline1.reverseNext())
        .createGroup({ waitComplete: false })
        .goTo(
            tweenBox1,
            { x: 0, y: 0, rotate: 0 },
            { configProp: { precision: 0.5 } }
        )
        .goTo(tweenBox2, { rotate: -180 }, { duration: 5000 })
        .closeGroup()
        .goTo(tweenBox1, { x: -400 });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline1.play().then(() => {
            console.log('resolve promise play');
        });
    });

    btnReverse.addEventListener('click', () => {
        timeline1.playReverse().then(() => {
            console.log('resolve promise reverse');
        });
    });

    btnStop.addEventListener('click', () => {
        timeline1.stop();
    });

    btnPause.addEventListener('click', () => {
        timeline1.pause();
    });

    btnPlay.addEventListener('click', () => {
        timeline1.resume();
    });

    btnReverseNext.addEventListener('click', () => {
        timeline1.reverseNext();
    });

    btnReverseImmediate.addEventListener('click', () => {
        timeline1.reverseImmediate();
    });

    btnFrom.addEventListener('click', () => {
        timeline1.setTween('label1', [tweenBox2, tweenBox1]).then(() => {
            timeline1.playFrom('label1').then(() => {
                console.log('resolve promise playFrom');
            });
        });
    });

    btnFromReverse.addEventListener('click', () => {
        timeline1.setTween('label1', [tweenBox2, tweenBox1]).then(() => {
            timeline1.playFromReverse('label1').then(() => {
                console.log('resolve promise playFromReverse');
            });
        });
    });

    btnToggleSuspend.addEventListener('click', () => {
        toggleSuspend = !toggleSuspend;
        suspendLabel.innerHTML = `: ${toggleSuspend}`;
    });

    const loop = () => {
        btnGetDirection.innerHTML = `direction: ${timeline1.getDirection()}`;
        btnSuspensionStatus.innerHTML = `is in suspension: ${timeline1.isSuspended()}`;
        btnPauseStatus.innerHTML = `is paused: ${timeline1.isPaused()}`;
        btnActiveStatus.innerHTML = `is running: ${timeline1.isActive()}`;
        mobCore.useNextFrame(() => loop());
    };

    loop();
}
