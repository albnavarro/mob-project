import { mobbu } from '../core';

export const gridStaggerSequencer = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-sequencer .grid-stagger__item'
    );
    const duration = 5000;

    const tween = mobbu
        .create('sequencer', {
            stagger: {
                each: 15,
                from: 'start',
                grid: { col: 7, row: 7, direction: 'row' },
            },
            data: { scale: 1 },
            duration,
        })
        .goTo({ scale: 0.5 }, { start: 0, end: 4000, ease: 'easeInOutBack' })
        .goTo({ scale: 1 }, { start: 4000, end: 5000, ease: 'easeInOutBack' });

    items.forEach((item, i) => {
        tween.subscribe(({ scale }) => {
            item.style.transform = `scale(${scale})`;
        });
    });

    const timeline = mobbu
        .create('syncTimeline', {
            repeat: -1,
            yoyo: false,
            duration,
        })
        .add(tween)
        .play();
};
