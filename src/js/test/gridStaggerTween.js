import { HandleTween, HandleAsyncTimeline } from '../core';

export const gridStaggerTween = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-tween .grid-stagger__item'
    );

    const tween = new HandleTween('easeInOutQuad');
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
            duration: 500,
        }
    );

    // Exmple set and go
    tween.set({ scale: 1 }).then((value) => {
        timeline.play();
    });
};
