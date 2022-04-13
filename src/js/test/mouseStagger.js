import { handleSpring } from '../core/animation/spring/handleSpring.js';
import { handleTween } from '../core/animation/tween/handleTween.js';
import { HandleAsyncTimeline } from '../core/animation/asyncTimeline/handleAsyncTimeline.js';
import { handleMouseMove } from '../core/events/mouseUtils/handleMouse.js';

export const mouseStagger = () => {
    // 1
    const cursor = document.querySelectorAll('.mouseStagger__item');

    const spring = new handleSpring('gentle');
    spring.setData({ x: 0, y: 0 });

    cursor.forEach((item, i) => {
        spring.subscribe(({ x, y }) => {
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
        });
    });

    cursor.forEach((item, i) => {
        spring.onComplete(({ x, y }) => {
            item.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // In real time (like mousemove) use waitComplete: false, to avoid moviemnt when promise in sot resolved
    handleMouseMove(({ client }) => {
        const { x, y } = client;
        spring.goTo({ x, y }, { stagger: { each: 4 } });
    });

    // 2
    const stagger = document.querySelectorAll('.stagger__item');
    const tween = new handleTween('easeInQuad');
    tween.setData({ scale: 1 });
    tween.set({ scale: 1 });

    stagger.forEach((item, i) => {
        tween.subscribe(({ scale }) => {
            item.style.transform = `translate3D(0px,0px,0px) scale(${scale})`;
        });
    });

    const timeline = new HandleAsyncTimeline({ repeat: -1, yoyo: true });
    timeline.goTo(
        tween,
        { scale: 2 },
        {
            stagger: { each: 10 },
            duration: 1000,
        }
    );

    timeline.play();
};
