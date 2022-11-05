import { mobbu } from '../core';

export const mouseStagger = () => {
    // 1
    const cursor = document.querySelectorAll('.mouseStagger__item');
    const biggerBtn = document.querySelector('.up');
    const smallerBtn = document.querySelector('.down');
    console.log(biggerBtn, smallerBtn);

    const spring = mobbu.createSpring({
        config: 'gentle',
        stagger: { each: 4 },
        data: { x: 0, y: 0 },
    });

    cursor.forEach((item) => {
        spring.subscribe(({ x, y }) => {
            item.style.transform = `translate3D(0px,0px,0px) translate(${x}px, ${y}px)`;
        });
    });

    cursor.forEach((item) => {
        spring.onComplete(({ x, y }) => {
            item.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // In real time (like mousemove) use waitComplete: false, to avoid moviemnt when promise in sot resolved
    mobbu.use('mouseMove', ({ client }) => {
        const { x, y } = client;
        spring.goTo({ x, y });
    });

    // 2
    const stagger = document.querySelectorAll('.stagger__item');
    const tween = mobbu.createTween({
        ease: 'easeInOutQuad',
        duration: 1000,
        stagger: { each: 10, from: 'start' },
        data: { scale: 1 },
    });

    stagger.forEach((item) => {
        tween.subscribe(({ scale }) => {
            item.style.transform = `translate3D(0px,0px,0px) scale(${scale})`;
        });
    });

    let val = 1;
    biggerBtn.addEventListener('click', () => (val += 0.5));
    smallerBtn.addEventListener('click', () => (val -= 0.5));

    const timeline = mobbu
        .createAsyncTimeline({ repeat: -1, yoyo: true })
        .goTo(tween, { scale: () => val * 2 });
    // .goTo(tween, { scale: () => val * 3 })
    timeline.play();
    timeline.onLoopEnd(({ loop, direction }) => {
        // console.log('onLoopEnd', loop, direction);
    });
};
