import { mobbu, outerHeight } from '../core';

export const masterSequencer = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = mobbu.createMasterSequencer();
    let sequencers = [];

    const staggers = mobbu.createStaggers({
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
            const sequencer = mobbu
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
    mobbu.useResize(() => {
        sequencers.forEach(({ unsubscribe }, i) => unsubscribe());
        masterSequencer.destroy();
        createSequencer();
    });

    const parallaxIn = mobbu.createScrollTrigger({
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
