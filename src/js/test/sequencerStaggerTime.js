import { mobbu, outerHeight } from '../core';

export const sequencerStaggerTime = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const play = document.querySelector('.animation-play');
    const reverse = document.querySelector('.animation-reverse');
    const playReverse = document.querySelector('.animation-play-reverse');
    const stop = document.querySelector('.animation-stop');
    const pause = document.querySelector('.animation-pause');
    const resume = document.querySelector('.animation-resume');

    let masterSequencer = mobbu.create('masterSequencer');
    const duration = 10;

    const staggers = mobbu.create('stagger', {
        items,
        stagger: {
            each: 30,
        },
        duration,
    });

    // Create sequencer
    const createSequencer = () => {
        staggers.forEach(({ item, start, end }) => {
            const sequencer = mobbu
                .create('sequencer', { data: { y: 0 }, duration })
                .goTo({ y: 300 }, { start, end, ease: 'easeInOutBack' });

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
    const timeline = mobbu
        .create('syncTimeline', {
            repeat: -1,
            yoyo: true,
            duration: 2000,
        })
        .add(masterSequencer);

    play.addEventListener('click', () => {
        timeline.play();
    });

    reverse.addEventListener('click', () => {
        timeline.reverse();
    });

    playReverse.addEventListener('click', () => {
        timeline.playReverse();
    });

    stop.addEventListener('click', () => {
        timeline.stop();
    });

    pause.addEventListener('click', () => {
        timeline.pause();
    });

    resume.addEventListener('click', () => {
        timeline.resume();
    });
};
