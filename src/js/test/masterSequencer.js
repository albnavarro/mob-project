import { MobScroll, MobTween } from '../mob-motion';
import { MobCore } from '../mob-core';
import { outerHeight } from '../mob-core/utils';

export const masterSequencer = () => {
    const items = document.querySelectorAll('.master-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = MobTween.createMasterSequencer();
    let sequencers = [];

    const staggers = MobTween.createStaggers({
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
            const sequencer = MobTween.createSequencer({ data: { y: 0 } }).goTo(
                { y: 300 },
                { start, end, ease: 'easeInOutBack' }
            );

            const unsubscribe = sequencer.subscribe(({ y }) => {
                item.style.transform = `translate(0, ${y}px)`;
            });

            masterSequencer.add(sequencer);
            return { sequencer, unsubscribe };
        });
    };

    createSequencer();

    // Test destroy and create sequencer on resize
    MobCore.useResize(() => {
        sequencers.forEach(({ unsubscribe }) => unsubscribe());
        masterSequencer.destroy();
        createSequencer();
    });

    const parallaxIn = MobScroll.createScrollTrigger({
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
