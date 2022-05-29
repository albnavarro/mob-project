import { handleTween } from '../core/animation/tween/handleTween.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';

export const radialStaggerTween = () => {
    const items = document.querySelectorAll(
        '.radial-stagger .radial-stagger__item'
    );

    const tween = new handleTween('easeInOutQuad');
    tween.setData({ scale: 1 });

    items.forEach((item, i) => {
        tween.subscribe(({ scale }) => {
            item.style.transform = `scale(${scale})`;
        });
    });

    const timeline = new HandleAsyncTimeline({ repeat: -1, yoyo: true });

    timeline
        .goFromTo(
            tween,
            { scale: 1.5 },
            { scale: 0.5 },
            {
                duration: 1000,
            }
        )
        .goFromTo(
            tween,
            { scale: 0.5 },
            { scale: 2.5 },
            {
                duration: 500,
            }
        );

    // Exmple set and go
    tween
        .set(
            { scale: 1.5 },
            {
                stagger: {
                    each: 15,
                    from: { x: 4, y: 4 },
                    grid: { col: 9, row: 9, direction: 'radial' },
                    waitComplete: false,
                },
            }
        )
        .then((value) => {
            timeline.play();
        });
};
