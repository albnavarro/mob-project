import { timeline, tween } from '../mobbu';
import { detectSafari } from '../utility/isSafari.js';

export const stressTestStagger = () => {
    const items = document.querySelectorAll(
        '.radial-stress-stagger .radial-stress-stagger__item'
    );

    const tween1 = tween.createTween({
        ease: 'easeInOutQuad',
        stagger: {
            each: 15,
            // from: 'center',
            // // // Row is 22 but for diagonal animation use 45
            // grid: { col: 45, row: 45, direction: 'row' },
            waitComplete: false,
        },
        data: { scale: 1, rotate: 0, opacity: 1 },
    });

    if (detectSafari()) {
        // items.forEach((item, i) => {
        //     tween1.subscribe(({ scale, rotate, opacity }) => {
        //         item.style.transform = `translate3D(-50%, -50%, 1px) scale(${scale}) rotate(${rotate}deg)`;
        //         item.style.opacity = opacity;
        //     });
        // });
        items.forEach((item) => {
            tween1.subscribeCache(item, ({ scale, rotate, opacity }) => {
                item.style.transform = `translate3D(0, 0, 1px) scale(${scale}) rotate(${rotate}deg)`;
                item.style.opacity = opacity;
            });
        });
    } else {
        // items.forEach((item, i) => {
        //     tween1.subscribe(({ scale, rotate, opacity }) => {
        //         item.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
        //         item.style.opacity = opacity;
        //     });
        // });
        items.forEach((item) => {
            tween1.subscribeCache(item, ({ scale, rotate, opacity }) => {
                item.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
                item.style.opacity = opacity;
            });
        });
    }

    // tween1.destroy();

    const timeline1 = timeline
        .createAsyncTimeline({ repeat: -1, yoyo: true })
        .goTo(tween1, { scale: 1.5 }, { duration: 1000 })
        .goTo(tween1, { scale: 0.5 }, { duration: 500 })
        .goTo(tween1, { rotate: 180, scale: 1.2 }, { duration: 500 })
        .goTo(tween1, { scale: 1.3 }, { duration: 500 })
        .goTo(tween1, { opacity: 0.5 }, { duration: 1200 })
        .goTo(tween1, { opacity: 1, scale: 1 }, { duration: 1200 })
        .play();
};
