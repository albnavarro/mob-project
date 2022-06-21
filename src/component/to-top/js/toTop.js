import { mobbu } from '../../../js/core';

class totopClass {
    constructor() {
        this.totop = document.querySelector('.to-top');
        this.hide = true;
    }

    init() {
        this.addHandler();
        this.showArrow();
        mobbu.use('scroll', ({ scrollY }) => this.showArrow(scrollY));
    }

    addHandler() {
        this.totop.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
        event.preventDefault();
        mobbu.scrollTo({ target: 0, duration: 1000 });
    }

    showArrow(scrollY) {
        mobbu.use('frame', () => {
            mobbu.use('nextTick', () => {
                if (scrollY >= window.innerWidth && this.hide) {
                    mobbu.use('frame', () => {
                        this.totop.classList.add('visible');
                        this.hide = false;
                    });
                } else if (scrollY < window.innerWidth && !this.hide) {
                    mobbu.use('frame', () => {
                        this.totop.classList.remove('visible');
                        this.hide = true;
                    });
                }
            });
        });
    }
}

export const totop = new totopClass();
