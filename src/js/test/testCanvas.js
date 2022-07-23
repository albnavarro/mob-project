import { mobbu } from '../core';

export const testCanvas = () => {
    const canvas = document.querySelector('#test-canvas');
    const context = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const items = 990;
    const numColumn = 44;
    const gutter = 10;
    const width = 30;
    const height = 30;

    let col = -1;
    let row = -2;

    const itemsArr = [...Array(items).keys()].map((item, i) => {
        col = col < numColumn ? col + 1 : 0;
        if (col === 0) row++;

        const x = (width + gutter) * col + gutter * 2;
        const y = (height + gutter) * (row + 1) + gutter;

        return {
            width,
            height,
            x,
            y,
            scale: 1,
            rotate: 0,
            opacity: 1,
            color: '#ccc',
        };
    });

    mobbu.use('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        draw();
    });

    const tween = mobbu.create('tween', {
        ease: 'easeInOutQuad',
        stagger: {
            each: 15,
            from: 'center',
            // from: { x: 23, y: 10 },
            grid: { col: 45, row: 45, direction: 'row' },
            waitComplete: false,
        },
        data: { scale: 1, rotate: 0, opacity: 1 },
    });

    // itemsArr.forEach((item, i) => {
    //     tween.subscribe(({ scale, rotate, opacity }) => {
    //         item.scale = scale;
    //         item.rotate = rotate;
    //         item.opacity = opacity;
    //     });
    // });

    itemsArr.forEach((item, i) => {
        tween.subscribeCache(item, ({ scale, rotate, opacity }) => {
            item.scale = scale;
            item.rotate = rotate;
            item.opacity = opacity;
        });
    });

    const draw = () => {
        // context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.width;

        itemsArr.forEach(
            ({ width, height, x, y, color, scale, rotate, opacity }, i) => {
                const centerX = x + width / 2;
                const centerY = y + height / 2;

                context.save();
                context.translate(centerX, centerY);
                context.globalAlpha = opacity;
                context.rotate((Math.PI / 180) * rotate);
                context.scale(scale, scale);
                context.translate(-centerX, -centerY);
                context.fillStyle = color;
                context.fillRect(x, y, width, height);
                context.globalAlpha = 1;
                context.restore();
            }
        );
    };

    const timeline = mobbu
        .create('asyncTimeline', { repeat: -1, yoyo: true })
        .goTo(tween, { scale: 1.5 }, { duration: 1000 })
        .goTo(tween, { scale: 0.5 }, { duration: 500 })
        .goTo(tween, { rotate: 180, scale: 1.2 }, { duration: 500 })
        .goTo(tween, { scale: 1.3 }, { duration: 500 })
        .goTo(tween, { opacity: 0.5 }, { duration: 1200 })
        .goTo(tween, { opacity: 1, scale: 1 }, { duration: 1200 })
        .play();

    const loop = () => {
        draw();
        mobbu.use('nextFrame', () => loop());
    };

    mobbu.use('frame', () => loop());
};
