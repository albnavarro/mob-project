import { timeline, tween } from '../mobbu';

export const gridStaggerSpring = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-spring .grid-stagger__item'
    );

    const tween1 = tween.createSpring({
        config: 'bounce',
        stagger: {
            each: 15,
            from: 'center',
            grid: { col: 7, row: 7, direction: 'row' },
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

    const timeline1 = timeline.createAsyncTimeline({ repeat: -1, yoyo: true });
    timeline1.goTo(tween1, { scale: 0.5 });
    timeline1.play();
};
