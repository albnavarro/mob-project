import { mobbu, outerHeight } from '../core';

export const createStagger = () => {
    const items = document.querySelectorAll('.create-stagger__item');
    const trigger = document.querySelector('.scrollStagger');

    let masterSequencer = mobbu.createMasterSequencer();
    const duration = 2000;

    const staggers = mobbu.createStaggers({
        items,
        stagger: {
            type: 'equal',
            each: 4,
            from: { x: 4, y: 4 },
            grid: { col: 5, row: 5, direction: 'radial' },
        },
        duration,
    });

    // Create sequencer
    const createSequencer = () => {
        return staggers.map(({ item, start, end }) => {
            const sequencer = mobbu
                .createSequencer({
                    duration,
                    data: { scale: 0.5 },
                })
                .goTo({ scale: 1 }, { start, end })
                .add(({ direction, isForced }) => {
                    console.log('add function', direction, isForced);
                    if (direction == 'forward') {
                        item.classList.add('is-red');
                    } else {
                        item.classList.remove('is-red');
                    }
                }, end - 1);

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

    const sequencers = createSequencer();
    console.log(sequencers);

    const parallaxIn = mobbu.create('scrolltrigger', {
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
    });
    parallaxIn.init();
};
