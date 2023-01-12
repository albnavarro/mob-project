import { bodyScroll } from '../../../js/mobbu/plugin';
import { core } from '../../../js/mobbu';

class totopClass {
    constructor() {
        this.totop = document.querySelector('.to-top');
        this.hide = true;
    }

    init() {
        this.addHandler();
        this.showArrow();
        core.useScroll(({ scrollY }) => this.showArrow(scrollY));
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
        core.useFrame(() => {
            core.useNextTick(() => {
                if (scrollY >= window.innerWidth && this.hide) {
                    core.useFrame(() => {
                        this.totop.classList.add('visible');
                        this.hide = false;
                    });
                } else if (scrollY < window.innerWidth && !this.hide) {
                    core.useFrame(() => {
                        this.totop.classList.remove('visible');
                        this.hide = true;
                    });
                }
            });
        });
    }
}

export const totop = new totopClass();
