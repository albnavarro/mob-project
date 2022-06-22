import { mobbu } from '../core';

export const mouseStagger = () => {
    // 1
    const cursor = document.querySelectorAll('.mouseStagger__item');

    const spring = mobbu.create('spring', {
        config: 'gentle',
        stagger: { each: 4 },
    });
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
    mobbu.use('mouseMove', ({ client }) => {
        const { x, y } = client;
        spring.goTo({ x, y }).catch((err) => {});
    });

    // 2
    const stagger = document.querySelectorAll('.stagger__item');
    const tween = mobbu.create('tween', {
        ease: 'easeInOutQuad',
        duration: 1000,
        stagger: { each: 10, from: 'start' },
    });
    tween.setData({ scale: 1 });
    tween.set({ scale: 1 });

    stagger.forEach((item, i) => {
        tween.subscribe(({ scale }) => {
            item.style.transform = `translate3D(0px,0px,0px) scale(${scale})`;
        });
    });

    const timeline = mobbu.create('asyncTimeline', { repeat: -1, yoyo: true });
    timeline.goTo(tween, { scale: 2 });

    timeline.play();
};
