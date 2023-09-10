import { timeline, tween } from '../mobMotion';

export const sequencerStaggerTime = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const play = document.querySelector('.animation-play');
    const reverse = document.querySelector('.animation-reverse');
    const playReverse = document.querySelector('.animation-play-reverse');
    const stop = document.querySelector('.animation-stop');
    const pause = document.querySelector('.animation-pause');
    const resume = document.querySelector('.animation-resume');
    const playFrom = document.querySelector('.animation-playFrom');
    const playFromReverse = document.querySelector(
        '.animation-playFromReverse'
    );

    let masterSequencer = tween.createMasterSequencer();

    // Example , not necessary
    const duration = 3000;

    const staggers = tween.createStaggers({
        items,
        stagger: {
            type: 'equal',
            each: 5,
        },
        duration,
    });

    // Create sequencer
    const createSequencer = () => {
        staggers.forEach(({ item, start, end, index }) => {
            const sequencer = tween
                .createSequencer({ data: { y: 0 }, duration })
                .goTo({ y: 300 }, { start, end, ease: 'easeInOutBack' })
                .label(`label${index}`, start)
                .add(({ direction, value }) => {
                    console.log(
                        `add fired at ${value} in ${direction} direction`
                    );
                }, start);

            const unsubscribe = sequencer.subscribe(({ y }) => {
                item.style.transform = `translate3D(0px,0px,0px) translate(0, ${y}px)`;
            });

            sequencer.onStop(({ y }) => {
                item.style.transform = `translate(0, ${y}px)`;
            });

            masterSequencer.add(sequencer);
        });
    };

    createSequencer();

    /**
     *  Animation
     **/
    const timeline1 = timeline
        .createSyncTimeline({
            repeat: 3,
            yoyo: true,
            duration: 2000,
        })
        .add(masterSequencer);

    play.addEventListener('click', () => {
        timeline1.play();
    });

    reverse.addEventListener('click', () => {
        timeline1.reverse();
    });

    playReverse.addEventListener('click', () => {
        timeline1.playReverse();
    });

    stop.addEventListener('click', () => {
        timeline1.stop();
    });

    pause.addEventListener('click', () => {
        timeline1.pause();
    });

    resume.addEventListener('click', () => {
        timeline1.resume();
    });

    playFrom.addEventListener('click', () => {
        timeline1.playFrom('label4');
    });

    playFromReverse.addEventListener('click', () => {
        timeline1.playFromReverse('label4');
    });
};
