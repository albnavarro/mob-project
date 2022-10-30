import { mobbu } from '../core';

export const gridStaggerLerp = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-lerp .grid-stagger__item'
    );

    const tween = mobbu.createLerp({
        stagger: {
            each: 15,
            from: 'center',
            grid: { col: 7, row: 7, direction: 'row' },
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

    const timeline = mobbu.create('asyncTimeline', { repeat: -1, yoyo: true });
    timeline.goTo(tween, { scale: 0.5 });

    tween.set({ scale: 1 }).then((value) => {
        timeline.play();
    });
};
