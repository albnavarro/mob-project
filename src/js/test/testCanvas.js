import { mobbu } from '../core';

export const testCanvas = () => {
    const canvas = document.querySelector('#test-canvas');
    const context = canvas.getContext('2d');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    let canvasW = canvas.width;
    let canvasH = canvas.height;
    let ratioX = canvasW / canvasH;
    let ratioY = canvasH / canvasW;

    const items = 900;
    const numColumn = 30;
    const gutter = 10;
    const width = 40;
    const height = 40 / ratioY;

    let col = -1;
    let row = -2;

    const itemsArr = [...Array(items).keys()].map((item, i) => {
        col = col < numColumn ? col + 1 : 0;
        if (col === 0) row++;

        const x = (width + gutter) * col;
        const y = (height + gutter) * (row + 1);

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
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        canvasW = canvas.width;
        canvasH = canvas.height;
        ratioX = canvasW / canvasH;
        ratioY = canvasH / canvasW;
        draw();
    });

    const tween = mobbu.create('tween', {
        ease: 'easeInOutQuad',
        stagger: {
            each: 15,
            from: { x: 15, y: 10 },
            grid: { col: 31, row: 31, direction: 'radial' },
            waitComplete: false,
        },
        data: { scale: 1, rotate: 0, opacity: 1 },
    });

    const draw = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);

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

    itemsArr.forEach((item, i) => {
        tween.subscribe(({ scale, rotate, opacity }) => {
            item.scale = scale;
            item.rotate = rotate;
            item.opacity = opacity;
        });
    });

    const timeline = mobbu
        .create('asyncTimeline', { repeat: -1, yoyo: true })
        .goTo(tween, { scale: 0.5 }, { duration: 1000 })
        .goTo(tween, { scale: 0.5 }, { duration: 500 })
        .goTo(tween, { rotate: 180, scale: 1.5 }, { duration: 500 })
        .goTo(tween, { scale: 2 }, { duration: 500 })
        .goTo(tween, { opacity: 0.5 }, { duration: 1200 })
        .goTo(tween, { opacity: 1, scale: 1 }, { duration: 1200 })
        .play();

    const loop = () => {
        draw();
        mobbu.use('nextFrame', () => loop());
    };

    mobbu.use('frame', () => loop());
};
