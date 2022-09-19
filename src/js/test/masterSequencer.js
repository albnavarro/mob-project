import { mobbu, outerHeight } from '../core';

export const masterSequencer = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = mobbu.create('masterSequencer');
    let sequencers = [];

    const staggers = mobbu.create('stagger', {
        items,
        stagger: {
            type: 'equal',
            each: 60,
            // type: 'equal',
            // each: 40,
        },
    });

    // Create sequencer
    const createSequencer = () => {
        sequencers = staggers.map(({ item, start, end }) => {
            const sequencer = mobbu
                .create('sequencer', { data: { y: 0 } })
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
    mobbu.use('resize', () => {
        sequencers.forEach(({ unsubscribe }, i) => unsubscribe());
        masterSequencer.destroy();
        createSequencer();
    });

    const parallaxIn = mobbu.create('scrolltrigger', {
        item: trigger,
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
