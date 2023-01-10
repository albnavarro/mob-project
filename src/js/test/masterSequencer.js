import { scroller, tween } from '../mobbu';
import { core } from '../mobbu';
import { outerHeight } from '../mobbu/utils';

export const masterSequencer = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = tween.createMasterSequencer();
    let sequencers = [];

    const staggers = tween.createStaggers({
        items,
        stagger: {
            type: 'equal',
            each: 6,
            // type: 'equal',
            // each: 4,
        },
    });

    // Create sequencer
    const createSequencer = () => {
        sequencers = staggers.map(({ item, start, end }) => {
            const sequencer = tween
                .createSequencer({ data: { y: 0 } })
                .goTo({ y: 300 }, { start, end, ease: 'easeInOutBack' });

            const unsubscribe = sequencer.subscribe(({ y }) => {
                item.style.transform = `translate(0, ${y}px)`;
            });

            masterSequencer.add(sequencer);
            return { sequencer, unsubscribe };
        });
    };

    createSequencer();

    // Test destroy and create sequencer on resize
    core.useResize(() => {
        sequencers.forEach(({ unsubscribe }) => unsubscribe());
        masterSequencer.destroy();
        createSequencer();
    });

    const parallaxIn = scroller.createScrollTrigger({
        trigger,
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
