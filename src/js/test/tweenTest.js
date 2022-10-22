import { mobbu } from '../core';

export function tweenTest() {
    const btnStart = document.querySelector('.tween-btn-start');
    const btnBack = document.querySelector('.tween-btn-back');
    const btnStop = document.querySelector('.tween-btn-stop');
    const btnPause = document.querySelector('.tween-btn-pause');
    const btnPlay = document.querySelector('.tween-btn-play');
    const btnFrom = document.querySelector('.tween-playFrom');
    const btnFromReverse = document.querySelector('.tween-playFromReverse');
    const btnReverseNext = document.querySelector('.tween-reverseNext');
    const btnReverse = document.querySelector('.tween-btn-reverse');
    const target = document.querySelector('.tween-target');

    // DEFINE SPRING
    const myTween = mobbu.createTween({ data: { x: 0, y: 0, rotate: 0 } });
    myTween.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    // BACK TWEEN
    function tweenback() {
        return myTween.goTo(
            { x: 0, y: 0, rotate: 180 },
            { ease: 'easeOutBack' }
        );
    }

    // DEFINE TIMELINE
    const timeline = mobbu
        .create('asyncTimeline', { repeat: -1, yoyo: false, freeMode: true })
        .set(myTween, { x: 0, y: 0, rotate: 0 })
        .goTo(myTween, { x: -200 })
        .goFromTo(myTween, { x: -200 }, { x: 400 }, { duration: 800 })
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
        .goTo(myTween, { y: 400 }, { duration: 350 })
        .label({ name: 'label1' })
        .goTo(myTween, { x: -100, rotate: 90 }, { ease: 'easeInQuint' })
        .add(({ loop, direction }) => {
            console.log('custom function:', loop, direction);
        })
        .goTo(myTween, { x: 0, y: 0, rotate: 0 }, { duration: 2000 });

    const unsubscribe = timeline.onComplete(() => {
        console.log('complete');
    });

    // LISTNER
    btnStart.addEventListener('click', () => {
        timeline.play();
    });

    btnBack.addEventListener('click', () => {
        tweenback().catch(() => {});
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

    btnFromReverse.addEventListener('click', () => {
        timeline.playFromReverse('label1');
    });

    btnReverseNext.addEventListener('click', () => {
        timeline.reverseNext();
    });

    btnReverse.addEventListener('click', () => {
        timeline.reverse();
    });
}
