import { MobTimeline, MobTween } from '../mob-motion';

export const gridStaggerLerp = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-lerp .grid-stagger__item'
    );

    const tween1 = MobTween.createLerp({
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
        tween1.subscribeCache(({ scale }) => {
            item.style.transform = `scale(${scale})`;
        });
    });

    const timeline1 = MobTimeline.createAsyncTimeline({
        repeat: -1,
        yoyo: true,
        autoSet: false,
    });
    timeline1.goTo(tween1, { scale: 0.5 });
    timeline1.play();
};
