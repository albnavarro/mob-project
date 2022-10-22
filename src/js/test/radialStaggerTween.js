import { mobbu } from '../core';

export const radialStaggerTween = () => {
    const items = document.querySelectorAll(
        '.radial-stagger .radial-stagger__item'
    );

    const tween = mobbu.createTween({
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
    //     tween.subscribe(({ scale }) => {
    //         item.style.transform = `scale(${scale})`;
    //     });
    // });

    items.forEach((item, i) => {
        tween.subscribeCache(item, ({ scale }) => {
            item.style.transform = `scale(${scale})`;
        });
    });

    const timeline = mobbu
        .create('asyncTimeline', { repeat: -1, yoyo: true })
        .goTo(tween, { scale: 0.5 }, { duration: 1000 })
        .goTo(tween, { scale: 2.5 }, { duration: 500 })
        .play();
};
