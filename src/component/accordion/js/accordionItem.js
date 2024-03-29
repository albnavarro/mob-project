import { slide } from '../../../js/mobbu/plugin';
import { core } from '../../../js/mobbu';

export class AccordionItemClass {
    constructor(data) {
        this.container = data.container;
        this.breackpoint = data.breackpoint || 'xSmall';
        this.notAllClose = data.notAllClose || false;
        this.queryType = data.queryType || 'min';
        this.multiple = data.multiple;
        this.itemClass = data.item || '.js-accordion-item';
        this.toggleClass = data.toggle || '.js-accordion-toggle';
        this.contentClass = data.content || '.js-accordion-content';
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

        const targetArray = Array.from(this.target);
        for (const el of targetArray) {
            slide.subscribe(el);
            slide.reset(el);
        }
    }

    openItem(e) {
        if (!core.mq(this.queryType, this.breackpoint)) return;

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
                    slide
                        .up(el)
                        .then(() => {
                            window.dispatchEvent(new Event('resize'));
                        })
                        .catch((err) => {
                            console.warn(err);
                        });
                }
            }
        }

        if (!btn.classList.contains('active')) {
            btn.classList.add('active');
            slide
                .down(target)
                .then(() => {
                    window.dispatchEvent(new Event('resize'));
                    this.dispatch();
                })
                .catch((err) => {
                    console.warn(err);
                });
        } else if (!this.notAllClose && btn.classList.contains('active')) {
            btn.classList.remove('active');
            slide
                .up(target)
                .then(() => {
                    window.dispatchEvent(new Event('resize'));
                    this.dispatch();
                })
                .catch((err) => {
                    console.warn(err);
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
