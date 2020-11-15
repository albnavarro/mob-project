import { eventManager } from "../../../js/base/eventManager.js";
import { mq } from "../../../js/base/mediaManager.js";
import {} from "../../../js/polyfill/closest.js";
import { slideUp, slideDown } from "../../../js/utility/animation.js";

export class accordionClass {
    constructor(data) {
        this.item = data.item;
        this.btn = document.querySelectorAll(`${data.button}`);
        this.target = data.target;
        this.breackpoint = data.breackpoint || 'x-small';
        this.queryType = data.queryType || 'min';
        this.multiple = typeof data.multiple === "undefined" ? false : data.multiple

        this.init();
    }

    init() {
        [...this.btn].forEach((button) => {
            button.addEventListener('click', this.openItem.bind(this))
        });

        /// GASP INITIAL STATE
        const target = document.querySelectorAll(this.target);
        [...target].forEach((el) => {
            el.style.height = 0;
        });
    }

    openItem(e) {
        if (!mq[this.queryType](this.breackpoint)) return;

        const btn = e.currentTarget;
        const item = btn.closest(this.item);
        const target = item.querySelector(this.target)

        if (!this.multiple) {
            [...this.btn].forEach((el) => {
                if(el !== btn) el.classList.remove('active')
            });

            const targets = document.querySelectorAll(this.target);
            [...targets].forEach((el) => {
                if(el !== target) {
                    slideUp(el).then(() => {
                        eventManager.execute('resize');
                    });
                }
            });
        }

        if (!btn.classList.contains('active')) {
            btn.classList.add('active');
            slideDown(target).then(() => {
                console.log('complete')
                eventManager.execute('resize');
            });
        } else {
            btn.classList.remove('active');
            slideUp(target).then(() => {
                console.log('complete')
                eventManager.execute('resize');
            });
        }
    }

    // closeAllItem() {
    //     this.s.$btn.removeClass('active');
    //     this.s.$target.slideUp(() => {
    //         eventManager.execute('resize');
    //     });
    // }
}
