import { mobbu } from '../core';

export const gridStaggerSequencer = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-sequencer .grid-stagger__item'
    );
    const duration = 4000;

    const tween = mobbu
        .createSequencer({
            ease: 'easeInOutBack',
            stagger: {
                each: 15,
                grid: { col: 7, row: 7, direction: 'radial' },
            },
            data: { scale: 1, x: 0 },
            duration,
        })
        .goTo({ scale: 3 }, { end: duration / 2 })
        .goTo({ scale: 0.5 }, { start: duration / 2 })
        .goTo({ x: 100 });

    items.forEach((item) => {
        tween.subscribeCache(item, ({ scale, x }) => {
            item.style.transform = `translate3D(0,0,0) scale(${scale}) translateX(${x}%)`;
        });
    });

    items.forEach((item) => {
        tween.onStop(({ scale, x }) => {
            item.style.transform = `scale(${scale}) translateX(${x}%)`;
        });
    });

    const timeline = mobbu
        .createSyncTimeline({
            repeat: -1,
            yoyo: true,
            duration,
        })
        .add(tween)
        .play();
};
