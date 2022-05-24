import { HandleSyncTimeline } from '../core/animation/syncTimeline/handleSyncTimeline.js';
import { HandleSequencer } from '../core/animation/sequencer/handleSequencer.js';

export const gridStaggerSequencer = () => {
    const items = document.querySelectorAll(
        '.grid-stagger-sequencer .grid-stagger__item'
    );

    const tween = new HandleSequencer({
        stagger: {
            each: 15,
            from: 'start',
            grid: { col: 7, row: 7, direction: 'row' },
        },
    });

    tween
        .setData({ scale: 1 })
        .goTo({ scale: 0.5 }, { start: 0, end: 4000, ease: 'easeInOutBack' })
        .goTo({ scale: 1 }, { start: 4000, end: 5000, ease: 'easeInOutBack' });

    items.forEach((item, i) => {
        tween.subscribe(({ scale }) => {
            item.style.transform = `scale(${scale})`;
        });
    });

    const timeline = new HandleSyncTimeline({ repeat: -1, yoyo: false });
    timeline.add(tween);
    timeline.setDuration('5000');
    timeline.play();
};
