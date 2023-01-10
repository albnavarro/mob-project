import { timeline, tween } from '../mobbu';

export function springTest() {
    const btnStart = document.querySelector('.spring-btn-start');
    const btnBack = document.querySelector('.spring-btn-back');
    const btnStop = document.querySelector('.spring-btn-stop');
    const btnPause = document.querySelector('.spring-btn-pause');
    const btnPlay = document.querySelector('.spring-btn-play');
    const btnFrom = document.querySelector('.spring-playFrom');
    const btnFromReverse = document.querySelector('.spring-playFromReverse');
    const btnReverseNext = document.querySelector('.spring-reverseNext');
    const btnReverse = document.querySelector('.spring-btn-reverse');
    const target = document.querySelector('.spring-target');

    // DEFINE SPRING
    const mySpring = tween.createSpring({
        data: { x: 0, y: 0, rotate: 0 },
        configProp: { mass: 0.2 },
        config: 'wobbly',
    });

    mySpring.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // BACK TWEEN
    function springBack() {
        timeline1.stop();
        mySpring.updateConfig('gentle');
        return mySpring.goTo({ x: 0, y: 0, rotate: 180 });
    }

    // DEFINE TIMELINE
    const timeline1 = timeline
        .createAsyncTimeline({ repeat: 2, yoyo: true, freeMode: true })
        .set(mySpring, { x: 0, y: 0, rotate: 0 })
        .goTo(mySpring, { x: -200 }, { configProp: { precision: 0.5 } })
        .goFromTo(
            mySpring,
            { x: -200 },
            { x: 400 },
            { configProp: { mass: 1, precision: 0.5 } }
        )
        .goTo(
            mySpring,
            { y: 400 },
            { config: 'bounce', configProp: { mass: 2, precision: 0.5 } }
        )
        .label({ name: 'label1' })
        .goTo(
            mySpring,
            { x: -100, rotate: 90 },
            { configProp: { precision: 0.5 } }
        )
        .goTo(
            mySpring,
            { x: 0, y: 0, rotate: 0 },
            { config: 'gentle', configProp: { precision: 0.5 } }
        );

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline1.play();
    });

    btnBack.addEventListener('click', () => {
        springBack().catch(() => {});
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

    btnReverse.addEventListener('click', () => {
        timeline1.playReverse();
    });

    btnFrom.addEventListener('click', () => {
        timeline1.playFrom('label1');
    });

    btnFromReverse.addEventListener('click', () => {
        timeline1.playFromReverse('label1');
    });

    btnReverseNext.addEventListener('click', () => {
        timeline1.reverseNext();
    });
}
