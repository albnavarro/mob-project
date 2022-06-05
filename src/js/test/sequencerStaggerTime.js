import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';
import { HandleSyncTimeline } from '../core/animation/syncTimeline/handleSyncTimeline.js';
import { HandleMasterSequencer } from '../core/animation/sequencer/handleMasterSequencer.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { outerHeight } from '../core/utils/vanillaFunction.js';
import { handleResize } from '../core/events/resizeUtils/handleResize.js';
import { createStaggers } from '../core/animation/sequencer/sequencerUtils.js';

export const sequencerStaggerTime = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const play = document.querySelector('.animation-play');
    const reverse = document.querySelector('.animation-reverse');
    const playReverse = document.querySelector('.animation-play-reverse');
    const stop = document.querySelector('.animation-stop');
    const pause = document.querySelector('.animation-pause');
    const resume = document.querySelector('.animation-resume');

    let masterSequencer = new HandleMasterSequencer();
    const duration = 2000;

    const staggers = createStaggers({
        items,
        stagger: {
            each: 30,
        },
        duration,
    });

    // Create sequencer
    const createSequencer = () => {
        staggers.forEach(({ item, start, end }) => {
            const sequencer = new HandleSequencer();
            sequencer.setDuration(duration);

            sequencer
                .setData({ y: 0 })
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
    const timeline = new HandleSyncTimeline({ repeat: -1, yoyo: true });
    timeline.add(masterSequencer);
    timeline.setDuration(duration);

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
