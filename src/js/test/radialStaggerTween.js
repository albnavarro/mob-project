import { timeline, tween } from '../mobMotion';

export const radialStaggerTween = () => {
    const items = document.querySelectorAll(
        '.radial-stagger .radial-stagger__item'
    );

    const tween1 = tween.createTween({
        ease: 'easeInOutQuad',
        stagger: {
            each: 15,
            from: { x: 4, y: 4 },
            grid: { col: 9, row: 9, direction: 'radial' },
            waitComplete: false,
        },
        data: { scale: 1 },
    });

    // items.forEach((item, i) => {
    //     tween1.subscribe(({ scale }) => {
    //         item.style.transform = `scale(${scale})`;
    //     });
    // });

    items.forEach((item) => {
        tween1.subscribeCache(item, ({ scale }) => {
            item.style.transform = `scale(${scale})`;
        });
    });

    const timeline1 = timeline
        .createAsyncTimeline({ repeat: -1, yoyo: true })
        .goTo(tween1, { scale: 0.5 }, { duration: 1000 })
        .goTo(tween1, { scale: 2.5 }, { duration: 500 })
        .play();
};
