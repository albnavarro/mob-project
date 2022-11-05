import { mobbu } from '../core';

export const gridStaggerTween = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-tween .grid-stagger__item'
    );

    const tween = mobbu.createTween({
        ease: 'easeInOutQuad',
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

    const timeline = mobbu.createAsyncTimeline({ repeat: -1, yoyo: true });
    timeline.goTo(
        tween,
        { scale: 0.5 },
        {
            duration: 500,
        }
    );

    timeline.play();
};
