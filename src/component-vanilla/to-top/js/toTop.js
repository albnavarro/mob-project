import { eventManager } from "../../../js/base/eventManager.js";
import { bodyScrollTo } from "../../../js/utility/animation.js";

class totopClass {
    constructor() {
        this.$totop = document.querySelector('.to-top');
        this.hide = true
    }

    init() {
        this.addHandler();
        this.showArrow();
        eventManager.push('scroll', this.showArrow.bind(this));
    }

    addHandler() {
        this.$totop.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
        event.preventDefault();
        bodyScrollTo(0);
        console.log('cluckkk')
    }

    showArrow() {
        if (eventManager.scrollTop() >= eventManager.windowsWidth() && this.hide) {
            this.$totop.classList.add('visible');
            this.hide = false;
        } else if (eventManager.scrollTop() < eventManager.windowsWidth() && !this.hide) {
            this.$totop.classList.remove('visible');
            this.hide = true;
        }
    }

}

export const totop = new totopClass()
