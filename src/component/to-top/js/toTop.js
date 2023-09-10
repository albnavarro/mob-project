import { mobCore } from '../../../js/mobCore';
import { bodyScroll } from '../../../js/mobMotion/plugin';

class totopClass {
    constructor() {
        this.totop = document.querySelector('.to-top');
        this.hide = true;
    }

    init() {
        this.addHandler();
        this.showArrow();
        mobCore.useScroll(({ scrollY }) => this.showArrow(scrollY));
    }

    addHandler() {
        this.totop.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
        event.preventDefault();
        bodyScroll.to(0, {
            duration: 1000,
            overflow: true,
        });
    }

    showArrow(scrollY) {
        mobCore.useFrame(() => {
            mobCore.useNextTick(() => {
                if (scrollY >= window.innerWidth && this.hide) {
                    mobCore.useFrame(() => {
                        this.totop.classList.add('visible');
                        this.hide = false;
                    });
                } else if (scrollY < window.innerWidth && !this.hide) {
                    mobCore.useFrame(() => {
                        this.totop.classList.remove('visible');
                        this.hide = true;
                    });
                }
            });
        });
    }
}

export const totop = new totopClass();
