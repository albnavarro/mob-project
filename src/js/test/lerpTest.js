import { timeline, tween } from '../mobbu';

export function lerpTest() {
    const btnStart = document.querySelector('.lerp-btn-start');
    const btnBack = document.querySelector('.lerp-btn-back');
    const btnStop = document.querySelector('.lerp-btn-stop');
    const btnPause = document.querySelector('.lerp-btn-pause');
    const btnPlay = document.querySelector('.lerp-btn-play');
    const btnFrom = document.querySelector('.lerp-playFrom');
    const btnFromReverse = document.querySelector('.lerp-playFromReverse');
    const btnReverseNext = document.querySelector('.lerp-reverseNext');
    const btnReverse = document.querySelector('.lerp-btn-reverse');
    const target = document.querySelector('.lerp-target');

    // DEFINE SPRING
    const mylerp = tween.createLerp({
        data: { x: 0, y: 0, rotate: 0 },
    });
    mylerp.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // BACK TWEEN
    function lerpBack() {
        timeline.stop();
        return mylerp.goTo({ x: 0, y: 0, rotate: 180 }, { velocity: 0.065 });
    }

    // DEFINE TIMELINE
    const timeline1 = timeline
        .createAsyncTimeline({ repeat: 2, yoyo: true, freeMode: true })
        .set(mylerp, { x: 0, y: 0, rotate: 0 })
        .goTo(mylerp, { x: -200 }, { velocity: 0.02, precision: 1 })
        .goFromTo(mylerp, { x: -200 }, { x: 400 })
        .add(({ loop, direction }) => {
            console.log('custom function:', loop, direction);
        })
        .addAsync(({ loop, direction, resolve }) => {
            console.log('start async function');
            setTimeout(() => {
                console.log('end async function:', loop, direction);
                resolve();
            }, 2000);
        })
        .goTo(mylerp, { y: 400 }, { velocity: 0.05, precision: 1 })
        .add(({ loop, direction }) => {
            console.log('custom function:', loop, direction);
        })
        .label({ name: 'label1' })
        .goTo(mylerp, { x: -100, rotate: 90 }, { velocity: 0.09, precision: 1 })
        .goTo(
            mylerp,
            { x: 0, y: 0, rotate: 0 },
            { velocity: 0.1, precision: 1 }
        );

    const unsubscribe = timeline1.onComplete(() => {
        console.log('complete');
    });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline1.play();
    });

    btnBack.addEventListener('click', () => {
        lerpBack();
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
