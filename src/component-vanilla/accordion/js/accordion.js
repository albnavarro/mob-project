import { eventManager } from "../../../js/base/eventManager.js";
import { mq } from "../../../js/base/mediaManager.js";
import { slideUpDownReset, slideUp, slideDown } from "../../../js/utility/animation.js";

export class accordionClass {
    constructor(data) {
        this.item = data.item;
        this.btn = document.querySelectorAll(data.button);
        this.target = {
            className: data.target,
            domEl: document.querySelectorAll(data.target)
         };
        this.breackpoint = data.breackpoint || 'x-small';
        this.queryType = data.queryType || 'min';
        this.multiple = typeof data.multiple === "undefined" ? false : data.multiple

        this.init();
    }

    init() {
        const buttonArray = Array.from(this.btn);
        for (const button of  buttonArray) {
            button.addEventListener('click', this.openItem.bind(this))
        };

        /// GASP INITIAL STATE
        const targetArray = Array.from(this.target.domEl);
        for (const el of targetArray) {
            slideUpDownReset(el);
        };
    }

    openItem(e) {
        if (!mq[this.queryType](this.breackpoint)) return;

        const btn = e.currentTarget;
        const item = btn.closest(this.item);
        const target = item.querySelector(this.target.className)

        if (!this.multiple) {
            const buttonArray = Array.from(this.btn);
            for (const el of  buttonArray) {
                if(el !== btn) el.classList.remove('active')
            };

            const targetArray = Array.from(this.target.domEl);
            for (const el of  targetArray) {
                if(el !== target.item) {
                    slideUp(el).then(() => {
                        eventManager.execute('resize');
                    });
                }
            };
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
