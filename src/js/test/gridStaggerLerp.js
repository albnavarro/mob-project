import { handleLerp } from '../core/animation/lerp/handleLerp.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export const gridStaggerLerp = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-lerp .grid-stagger__item'
    );

    const tween = new handleLerp();
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
        }
    );

    tween.set({ scale: 1 }).then((value) => {
        timeline.play();
    });
};
