import { mobbu } from '../../../js/core';
import { bodyScroll } from '../../../js/core/plugin';

class totopClass {
    constructor() {
        this.totop = document.querySelector('.to-top');
        this.hide = true;
    }

    init() {
        this.addHandler();
        this.showArrow();
        mobbu.useScroll(({ scrollY }) => this.showArrow(scrollY));
    }

    addHandler() {
        this.totop.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
        event.preventDefault();
        bodyScroll.to({ target: 0, duration: 1000 });
    }

    showArrow(scrollY) {
        mobbu.useFrame(() => {
            mobbu.useNextTick(() => {
                if (scrollY >= window.innerWidth && this.hide) {
                    mobbu.useFrame(() => {
                        this.totop.classList.add('visible');
                        this.hide = false;
                    });
                } else if (scrollY < window.innerWidth && !this.hide) {
                    mobbu.useFrame(() => {
                        this.totop.classList.remove('visible');
                        this.hide = true;
                    });
                }
            });
        });
    }
}

export const totop = new totopClass();
