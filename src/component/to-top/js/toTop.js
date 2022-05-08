import { bodyScroll } from '../../../js/core/animation/bodyScroll/bodyScroll.js';
import { handleScroll } from '.../../../js/core/events/scrollUtils/handleScroll.js';
import {
    handleFrame,
    handleNextTick,
} from '../../../js/core/events/rafutils/rafUtils.js';

class totopClass {
    constructor() {
        this.totop = document.querySelector('.to-top');
        this.hide = true;
    }

    init() {
        this.addHandler();
        this.showArrow();
        handleScroll(({ scrollY }) => this.showArrow(scrollY));
    }

    addHandler() {
        this.totop.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
        event.preventDefault();
        bodyScroll.to({ val: 0, duration: 1000 });
    }

    showArrow(scrollY) {
        handleFrame.add(() => {
            handleNextTick.add(() => {
                if (scrollY >= window.innerWidth && this.hide) {
                    handleFrame.add(() => {
                        this.totop.classList.add('visible');
                        this.hide = false;
                    });
                } else if (scrollY < window.innerWidth && !this.hide) {
                    handleFrame.add(() => {
                        this.totop.classList.remove('visible');
                        this.hide = true;
                    });
                }
            });
        });
    }
}

export const totop = new totopClass();
