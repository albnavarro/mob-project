import {
    HandleSequencer,
    HandleMasterSequencer,
    ParallaxItemClass,
    outerHeight,
    handleResize,
    createStaggers,
} from '../core';

export const masterSequencer = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = new HandleMasterSequencer();
    let sequencers = [];

    const staggers = createStaggers({
        items,
        stagger: {
            each: 30,
        },
    });

    // Create sequencer
    const createSequencer = () => {
        sequencers = staggers.map(({ item, start, end }) => {
            const sequencer = new HandleSequencer();

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
