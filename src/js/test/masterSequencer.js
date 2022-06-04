import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';
import { HandleMasterSequencer } from '../core/animation/sequencer/handleMasterSequencer.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { outerHeight } from '../core/utils/vanillaFunction.js';
import { handleResize } from '../core/events/resizeUtils/handleResize.js';
import {
    sequencerDelay,
    sequencerEqual,
} from '../core/animation/sequencer/sequencerUtils.js';

export const masterSequencer = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = new HandleMasterSequencer();
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

            const unsubscribeStop = sequencer.onStop(({ y }) => {
                item.style.transform = `translate(0, ${y}px)`;
            });

            masterSequencer.add(sequencer);
            return { sequencer, unsubscribe, unsubscribeStop };
        });
    };

    createSequencer();

    // Test destroy and create sequencer on resize
    handleResize(() => {
        sequencers.forEach(({ unsubscribe }, i) => unsubscribe());
        sequencers.forEach(({ unsubscribeStop }, i) => unsubscribeStop());
        masterSequencer.destroy();
        createSequencer();
    });

    const parallaxIn = new ParallaxItemClass({
        item: trigger,
        computationType: 'fixed',
        propierties: 'tween',
        tween: masterSequencer,
        dynamicStart: {
            position: 'bottom',
            value: () => window.innerHeight,
        },
        dynamicEnd: {
            position: 'bottom',
            value: () => outerHeight(trigger),
        },
        ease: true,
        easeType: 'lerp',
        // lerpConfig: 0.09,
    });
    parallaxIn.init();
};
