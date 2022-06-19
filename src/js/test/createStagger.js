import {
    HandleSequencer,
    HandleMasterSequencer,
    ParallaxItemClass,
    outerHeight,
    createStaggers,
} from '../core';

export const createStagger = () => {
    const items = document.querySelectorAll('.create-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = new HandleMasterSequencer();
    let sequencers = [];
    const duration = 2000;

    const staggers = createStaggers({
        items,
        stagger: {
            each: 'equal',
            from: { x: 4, y: 4 },
            grid: { col: 5, row: 5, direction: 'radial' },
        },
        duration,
    });

    // Create sequencer
    const createSequencer = () => {
        sequencers = staggers.map(({ item, start, end, index }) => {
            const sequencer = new HandleSequencer();
            sequencer.setDuration(duration);
            sequencer
                .setData({ scale: 0.5 })
                .goTo({ scale: 1 }, { start, end });

            const unsubscribe = sequencer.subscribe(({ scale }) => {
                item.style.transform = `translate3D(0px,0px,0px) scale(${scale})`;
            });

            const unsubscribeStop = sequencer.onStop(({ scale }) => {
                item.style.transform = `scale(${scale})`;
            });

            masterSequencer.add(sequencer);
            return { sequencer, unsubscribe, unsubscribeStop };
        });
    };

    createSequencer();

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
    });
    parallaxIn.init();
};
