import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';
import { HandleSyncTimeline } from '../core/animation/syncTimeline/handleSyncTimeline.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { outerHeight } from '../core/utils/vanillaFunction.js';
import { handleResize } from '../core/events/resizeUtils/handleResize.js';
import {
    sequencerDelay,
    sequencerEqual,
} from '../core/animation/sequencer/sequencerUtils.js';

export const sequencerStaggerTime = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const play = document.querySelector('.animation-play');
    const reverse = document.querySelector('.animation-reverse');
    const playReverse = document.querySelector('.animation-play-reverse');
    const stop = document.querySelector('.animation-stop');
    const pause = document.querySelector('.animation-pause');
    const resume = document.querySelector('.animation-resume');

    let sequencers = [];
    const duration = 2000;

    // Create sequencer
    const createSequencer = () => {
        sequencers = [...items].map((item, i) => {
            const sequencer = new HandleSequencer();
            sequencer.setDuration(duration);

            /**
             *  Equal distance
             **/
            // const { start, end } = sequencerEqual({
            //     duration: sequencer.getDuration(),
            //     itemsLength: items.length,
            //     index: i,
            // });

            /**
             *  Delay
             **/
            const { start, end } = sequencerDelay({
                factor: 1000,
                duration: sequencer.getDuration(),
                itemsLength: items.length,
                index: i,
            });

            sequencer
                .setData({ y: 0 })
                .goTo({ y: 300 }, { start, end, ease: 'easeInOutBack' });

            const unsubscribe = sequencer.subscribe(({ y }) => {
                item.style.transform = `translate3D(0px,0px,0px) translate(0, ${y}px)`;
            });

            return { sequencer, unsubscribe };
        });
    };

    createSequencer();

    /**
     *  Animation
     **/
    const timeline = new HandleSyncTimeline({ repeat: -1, yoyo: true });
    sequencers.forEach(({ sequencer }, i) => timeline.add(sequencer));
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
