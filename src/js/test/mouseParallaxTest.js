import { MouseParallaxClass } from '../core/plugin';

export const mouseParallaxTest = () => {
    const test1 = new MouseParallaxClass({
        item: document.querySelector('.js-mouse-parallax-1'),
        rangex: 10,
        rangey: 10,
    });
    test1.init();

    const test2 = new MouseParallaxClass({
        item: document.querySelector('.js-mouse-parallax-2'),
        rangex: 30,
        rangey: 30,
    });
    test2.init();

    const test3 = new MouseParallaxClass({
        item: document.querySelector('.js-mouse-parallax-3'),
        rangex: 20,
        rangey: 10,
        centerToViewoport: true,
    });
    test3.init();
};
