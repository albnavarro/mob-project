import { mobbu } from '../core';
import { detectSafari } from '../utility/isSafari.js';

export const stressTestStagger = () => {
    const items = document.querySelectorAll(
        '.radial-stress-stagger .radial-stress-stagger__item'
    );

    const tween = mobbu.create('tween', {
        ease: 'easeInOutQuad',
        stagger: {
            each: 15,
            from: 'center',
            // Row is 22 but for diagonal animation use 45
            grid: { col: 45, row: 45, direction: 'row' },
            waitComplete: false,
        },
        data: { scale: 1, rotate: 0, opacity: 1 },
    });

    /**
     * On safari complex animation with 500/1000 items probably lag
     * In this case will-change fix the problem
     * Chrome and firefix have no problem, will-change is destructive, absolutly not use
     **/
    if (detectSafari()) {
        items.forEach((item, i) => {
            item.style.willChange = 'transform';
        });
    }

    items.forEach((item, i) => {
        tween.subscribe(({ scale, rotate, opacity }) => {
            item.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
            item.style.opacity = opacity;
        });
    });

    const timeline = mobbu
        .create('asyncTimeline', { repeat: -1, yoyo: true })
        .goTo(tween, { scale: 2 }, { duration: 1000 })
        .goTo(tween, { scale: 0.5 }, { duration: 500 })
        .goTo(tween, { rotate: 180, scale: 2.5 }, { duration: 500 })
        .goTo(tween, { scale: 2 }, { duration: 500 })
        .goTo(tween, { opacity: 0.5 }, { duration: 1200 })
        .goTo(tween, { opacity: 1, scale: 1 }, { duration: 1200 });

    // Exmple set and go
    tween.set({ scale: 1.5, rotate: 0 }).then((value) => {
        timeline.play();
    });
};
