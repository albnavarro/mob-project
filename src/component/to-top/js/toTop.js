import { bodyScroll } from '../../../js/core/animation/bodyScroll/bodyScroll.js';
import { handleScroll } from '.../../../js/core/events/scrollUtils/handleScroll.js';

class totopClass {
    constructor() {
        this.$totop = document.querySelector('.to-top');
        this.hide = true;
    }

    init() {
        this.addHandler();
        this.showArrow();
        handleScroll(() => this.showArrow());
    }

    addHandler() {
        this.$totop.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
        event.preventDefault();
        bodyScroll.to({ val: 0, duration: 1000 });
    }

    showArrow() {
        if (window.pageYOffset >= window.innerWidth && this.hide) {
            this.$totop.classList.add('visible');
            this.hide = false;
        } else if (window.pageYOffset < window.innerWidth && !this.hide) {
            this.$totop.classList.remove('visible');
            this.hide = true;
        }
    }
}

export const totop = new totopClass();
