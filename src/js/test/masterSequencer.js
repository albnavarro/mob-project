import { mobbu, outerHeight, handleResize } from '../core';

export const masterSequencer = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = mobbu.create('masterSequencer');
    let sequencers = [];

    const staggers = mobbu.create('stagger', {
        items,
        stagger: {
            each: 30,
        },
    });

    // Create sequencer
    const createSequencer = () => {
        sequencers = staggers.map(({ item, start, end }) => {
            const sequencer = mobbu.create('sequencer');

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

    const parallaxIn = mobbu.create('parallax', {
        item: trigger,
        type: 'scrolltrigger',
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
