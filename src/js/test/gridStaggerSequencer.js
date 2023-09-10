import { timeline, tween } from '../mobMotion';

export const gridStaggerSequencer = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-sequencer .grid-stagger__item'
    );
    const duration = 4000;

    const tween1 = tween
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
        tween1.subscribeCache(item, ({ scale, x }) => {
            item.style.transform = `translate3D(0,0,0) scale(${scale}) translateX(${x}%)`;
        });
    });

    items.forEach((item) => {
        tween1.onStop(({ scale, x }) => {
            item.style.transform = `scale(${scale}) translateX(${x}%)`;
        });
    });

    const timeline1 = timeline
        .createSyncTimeline({
            repeat: -1,
            yoyo: true,
            duration,
        })
        .add(tween1)
        .play();
};
