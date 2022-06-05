import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';
import { HandleMasterSequencer } from '../core/animation/sequencer/handleMasterSequencer.js';
import { ParallaxItemClass } from '../../component/parallax/js/parallaxItem.js';
import { outerHeight } from '../core/utils/vanillaFunction.js';
import { createStaggers } from '../core/animation/sequencer/sequencerUtils.js';

export const createStagger = () => {
    const items = document.querySelectorAll('.create-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = new HandleMasterSequencer();
    let sequencers = [];

    const staggers = createStaggers({
        items,
        stagger: {
            each: 'equal',
            from: { x: 4, y: 4 },
            grid: { col: 5, row: 5, direction: 'radial' },
        },
    });

    // Create sequencer
    const createSequencer = () => {
        sequencers = staggers.map(({ item, start, end, index }) => {
            const sequencer = new HandleSequencer();
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
