import { mq } from '../../../js/core/mediaManager.js';
import {
    slideUpDownReset,
    slideUp,
    slideDown,
} from '../../../js/utility/animation.js';

export class AccordionItemClass {
    constructor(data) {
        this.container = data.container;
        this.breackpoint = data.breackpoint || 'x-small';
        this.notAllClose = data.notAllClose || false;
        this.queryType = data.queryType || 'min';
        this.multiple = data.multiple;
        this.itemClass = data.item || '[data-item]';
        this.toggleClass = data.toggle || '[data-toggle]';
        this.contentClass = data.content || '[data-content]';
        this.btn = null;
        this.target = null;
    }

    init() {
        if (this.container === null) return;

        this.btn = this.container.querySelectorAll(this.toggleClass);
        this.target = this.container.querySelectorAll(this.contentClass);

        const buttonArray = Array.from(this.btn);
        for (const button of buttonArray) {
            button.addEventListener('click', this.openItem.bind(this));
        }

        /// GASP INITIAL STATE
        const targetArray = Array.from(this.target);
        for (const el of targetArray) {
            slideUpDownReset(el);
        }
    }

    openItem(e) {
        if (!mq[this.queryType](this.breackpoint)) return;

        const btn = e.currentTarget;
        const item = btn.closest(this.itemClass);
        const target = item.querySelector(this.contentClass);

        if (!this.multiple) {
            const buttonArray = Array.from(this.btn);
            for (const el of buttonArray) {
                if (el !== btn) el.classList.remove('active');
            }

            const targetArray = Array.from(this.target);
            for (const el of targetArray) {
                if (el !== target) {
                    slideUp(el).then(() => {
                        window.dispatchEvent(new Event('resize'));
                    });
                }
            }
        }

        if (!btn.classList.contains('active')) {
            btn.classList.add('active');
            slideDown(target).then(() => {
                window.dispatchEvent(new Event('resize'));
                this.dispatch();
            });
        } else if (!this.notAllClose && btn.classList.contains('active')) {
            btn.classList.remove('active');
            slideUp(target).then(() => {
                window.dispatchEvent(new Event('resize'));
                this.dispatch();
            });
        }
    }

    dispatch() {
        this.container.dispatchEvent(
            new CustomEvent('accordionChange', {
                detail: {
                    item: this.container,
                },
            })
        );
    }
}
