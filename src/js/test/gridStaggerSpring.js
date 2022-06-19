import { HandleSpring, HandleAsyncTimeline } from '../core';

export const gridStaggerSpring = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-spring .grid-stagger__item'
    );

    const tween = new HandleSpring('bounce');
    tween.setData({ scale: 1 });

    items.forEach((item, i) => {
        tween.subscribe(({ scale }) => {
            item.style.transform = `scale(${scale})`;
        });
    });

    const timeline = new HandleAsyncTimeline({ repeat: -1, yoyo: true });
    timeline.goTo(
        tween,
        { scale: 0.5 },
        {
            stagger: {
                each: 15,
                from: 'center',
                grid: { col: 7, row: 7, direction: 'row' },
                waitComplete: false,
            },
            precision: 1,
        }
    );

    tween.set({ scale: 1 }).then((value) => {
        timeline.play();
    });
};
