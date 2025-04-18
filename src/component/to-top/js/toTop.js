import { MobCore } from '../../../js/mob-core';
import { MobBodyScroll } from '../../../js/mob-motion/plugin';

class totopClass {
    constructor() {
        this.totop = document.querySelector('.to-top');
        this.hide = true;
    }

    init() {
        this.addHandler();
        this.showArrow();
        MobCore.useScroll(({ scrollY }) => this.showArrow(scrollY));
    }

    addHandler() {
        this.totop.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
        event.preventDefault();
        MobBodyScroll.to(0, {
            duration: 1000,
            overflow: true,
        });
    }

    showArrow(scrollY) {
        MobCore.useFrame(() => {
            MobCore.useNextTick(() => {
                if (scrollY >= window.innerWidth && this.hide) {
                    MobCore.useFrame(() => {
                        this.totop.classList.add('visible');
                        this.hide = false;
                    });
                } else if (scrollY < window.innerWidth && !this.hide) {
                    MobCore.useFrame(() => {
                        this.totop.classList.remove('visible');
                        this.hide = true;
                    });
                }
            });
        });
    }
}

export const totop = new totopClass();
