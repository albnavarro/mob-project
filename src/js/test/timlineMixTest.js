import { timeline, tween, core } from '../mobbu';

export function timlineMixTest() {
    const btnStart = document.querySelector('.mix-btn-start');
    const btnStop = document.querySelector('.mix-btn-stop');
    const btnPause = document.querySelector('.mix-btn-pause');
    const btnPlay = document.querySelector('.mix-btn-play');
    const btnFrom = document.querySelector('.mix-btn-playFrom');
    const btnFromReverse = document.querySelector('.mix-btn-playFromReverse');
    const btnReverseNext = document.querySelector('.mix-btn-reverseNext');
    const btnReverse = document.querySelector('.mix-btn-reverse');
    const btnFast = document.querySelector('.mix-btn-fast-step3');
    const btnSlow = document.querySelector('.mix-btn-slow-step3');
    const btnToggleSuspend = document.querySelector('.mix-btn-toggle-suspend');
    const btnActiveStatus = document.querySelector('.mix-btn-activeStatus');
    const btnPauseStatus = document.querySelector('.mix-btn-pauseStatus');
    const btnSuspensionStatus = document.querySelector(
        '.mix-btn-suspensionStatus'
    );
    const btnGetDirection = document.querySelector('.mix-btn-getDirection');
    const suspendLabel = btnToggleSuspend.querySelector('span');
    const target = document.querySelector('.mix-target');
    const target2 = document.querySelector('.mix-target2');
    let durationTest = 850;
    let toggleSuspend = false;
    suspendLabel.innerHTML = `: ${toggleSuspend}`;

    btnFast.addEventListener('click', () => {
        durationTest = 200;
    });

    btnSlow.addEventListener('click', () => {
        durationTest = 1000;
    });

    // DEFINE SPRING
    const springBox1 = tween.createSpring({
        data: { x: 0, y: 0, rotate: 0 },
        config: 'wobbly',
    });
    springBox1.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
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
        .goTo(springBox1, { x: -200 })
        .goFromTo(
            springBox1,
            { x: -200 },
            { x: 400 },
            { configProp: { mass: 2, precision: 0.5 }, delay: 500 }
        )
        .sync({ from: springBox1, to: tweenBox1 })
        .createGroup({ waitComplete: false })
        .goTo(tweenBox1, { y: 400 }, { duration: () => durationTest })
        .goTo(tweenBox2, { rotate: 360 }, { duration: 2000, delay: 1000 })
        .closeGroup()
        .label({ name: 'label1' })
        .goTo(tweenBox1, { x: -100, rotate: 180 }, { ease: 'easeInElastic' })
        .suspend(() => toggleSuspend)
        // .add(() => timeline1.reverseNext())
        .sync({ from: tweenBox1, to: springBox1 })
        .createGroup({ waitComplete: false })
        .goTo(
            springBox1,
            { x: 0, y: 0, rotate: 0 },
            { configProp: { precision: 0.5 } }
        )
        .goTo(tweenBox2, { rotate: -180 }, { duration: 5000 })
        .closeGroup()
        .goTo(springBox1, { x: -400 });

    // timeline1
    //     .goTo(tweenBox1, { x: -200 })
    //     .goFromTo(tweenBox1, { x: -200 }, { x: 400 })
    //     .label({ name: 'label1' })
    //     .createGroup({ waitComplete: false })
    //     .goTo(tweenBox1, { y: 400 }, { duration: 850 })
    //     .goTo(tweenBox2, { rotate: 360 }, { duration: 2000, delay: 1000 })
    //     .closeGroup()
    //     .goTo(tweenBox1, { x: -100, rotate: 180 }, { ease: 'easeInElastic' })
    //     .createGroup({ waitComplete: false })
    //     .goTo(tweenBox1, { x: 0, y: 0, rotate: 0 })
    //     .goTo(tweenBox2, { rotate: -180 }, { duration: 5000 })
    //     .closeGroup();

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

    btnFrom.addEventListener('click', () => {
        timeline1.setTween('label1', [tweenBox2, springBox1]).then(() => {
            timeline1.playFrom('label1').then(() => {
                console.log('resolve promise playFrom');
            });
        });
    });

    btnFromReverse.addEventListener('click', () => {
        timeline1.setTween('label1', [tweenBox2, springBox1]).then(() => {
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
        core.useNextFrame(() => loop());
    };

    loop();
}
