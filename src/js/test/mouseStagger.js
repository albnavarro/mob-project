import { timeline, tween, core } from '../mobbu';

export const mouseStagger = () => {
    // 1
    const cursor = document.querySelectorAll('.mouseStagger__item');
    const biggerBtn = document.querySelector('.up');
    const smallerBtn = document.querySelector('.down');
    console.log(biggerBtn, smallerBtn);

    const spring = tween.createSpring({
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
    core.useMouseMove(({ client }) => {
        const { x, y } = client;
        spring.goTo({ x, y });
    });

    // 2
    const stagger = document.querySelectorAll('.stagger__item');
    const tween1 = tween.createTween({
        ease: 'easeInOutQuad',
        duration: 1000,
        stagger: { each: 10, from: 'start' },
        data: { scale: 1 },
    });

    stagger.forEach((item) => {
        tween1.subscribe(({ scale }) => {
            item.style.transform = `translate3D(0px,0px,0px) scale(${scale})`;
        });
    });

    let val = 1;
    biggerBtn.addEventListener('click', () => (val += 0.5));
    smallerBtn.addEventListener('click', () => (val -= 0.5));

    const timeline1 = timeline
        .createAsyncTimeline({ repeat: -1, yoyo: true })
        .goTo(tween1, { scale: () => val * 2 });
    // .goTo(tween1, { scale: () => val * 3 })
    timeline1.play();
    timeline1.onLoopEnd(({ loop, direction }) => {
        // console.log('onLoopEnd', loop, direction);
    });
};
