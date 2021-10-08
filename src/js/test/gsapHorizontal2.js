import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { eventManager } from '../base/eventManager.js';
import { mq } from '../base/mediaManager.js';
import { SimpleStore } from '../utility/simpleStore.js';
import { offset, outerHeight, outerWidth } from '../utility/vanillaFunction.js';

class GsapHorizontal2Class {
    constructor() {
        // GSAP
        this.gsapContainer = document.querySelector('.HP__trigger');
        this.row = document.querySelector('.HP__row');
        this.cards = document.querySelectorAll('.HP__section');
        this.shadowMainClass = 'HP__shadowEl';
        this.shadowMainClassTransition = 'HP__shadowTransition';

        // GSAP store
        this.store = new SimpleStore({
            gsapisActive: false,
            horizontalWidth: 0,
            tl: null,
            percentRange: 0,
        });

        // Object.freeze(this);
    }

    init() {
        // GSAP
        gsap.registerPlugin(ScrollTrigger);
        eventManager.push('load', () => this.getWidth());
        eventManager.push('load', () => this.createShadow());
        eventManager.push('load', () => this.initGsap());
        eventManager.push('resize', () => this.onResize());
    }

    setDimension() {
        const width = this.store.getProp('horizontalWidth');

        const percentRange =
            (100 * (width - eventManager.windowsWidth())) / width;

        this.gsapContainer.style.height = `${width}px`;
        this.row.style.width = `${width}px`;

        this.store.setProp('percentRange', percentRange);
    }

    getWidth() {
        const horizontalWidth = [...this.cards]
            .map((item) => {
                return outerWidth(item);
            })
            .reduce((a, b) => a + b, 0);

        this.store.setProp('horizontalWidth', horizontalWidth);
    }

    createShadow() {
        const shadowsEl = [...this.cards]
            .map((item) => {
                const shadowClass = item.dataset.shadow;

                return `
            <div class='${this.shadowMainClass} ${shadowClass}' data-shadow='${shadowClass}'>
            </div>`;
            })
            .join('');

        const shadowsTransition = `<div class='HP__shadowTransition-container'>
            ${[...this.cards]
                .map((item, i) => {
                    const shadowClass = item.dataset.shadow;

                    return `
                        <div class='${
                            this.shadowMainClassTransition
                        } ${shadowClass}-transition' data-shadow='${shadowClass}'>
                        <h1>${shadowClass} / i:${i + 1}</h1>
                        </div>`;
                })
                .join('')}
        </div>`;

        const shadows = [...[shadowsEl], ...[shadowsTransition]].join('');
        this.gsapContainer.innerHTML = shadows;
    }

    removeShadow() {
        this.gsapContainer.innerHTML = '';
    }

    updateShadow() {
        const shadowEl = document.querySelectorAll(`.${this.shadowMainClass}`);
        const numItem = shadowEl.length;
        const horizontalWidth = this.store.getProp('horizontalWidth');

        shadowEl.forEach((item, i) => {
            const shadowData = item.dataset.shadow;
            const originalItem = [...this.cards].find((item) => {
                return item.dataset.shadow === shadowData;
            });

            const shadowTransitionEl = document.querySelector(
                `.HP__shadowTransition[data-shadow="${shadowData}"]`
            );

            const width = outerWidth(originalItem);
            const height = outerHeight(originalItem);
            const itemDifference = width - height;
            const percentrange = this.store.getProp('percentRange') / 100;

            const top = ((i) => {
                switch (i) {
                    case 0:
                        return 0;

                    case 1:
                        return height;

                    default:
                        return (
                            height * i +
                            (itemDifference * (i - 1)) / percentrange
                        );
                }
            })(i);

            const heightParsed = ((i) => {
                switch (i) {
                    case length:
                        return height + itemDifference / percentrange;

                    case 0:
                        return height + itemDifference / percentrange;

                    default:
                        return height + (itemDifference / percentrange) * 2;
                }
            })(i);

            item.style.height = `${width}px`;
            item.style.width = `${width}px`;
            shadowTransitionEl.style.top = `${top}px`;
            shadowTransitionEl.style.height = `${heightParsed}px`;
        });
    }

    initGsap() {
        if (!this.gsapContainer || mq.max('desktop')) return;
        this.setDimension();
        this.updateShadow();

        const tl = gsap.to(this.row, {
            xPercent: -this.store.getProp('percentRange'), // Percent calc
            ease: 'none',
            scrollTrigger: {
                trigger: this.gsapContainer,
                scrub: 1,
                start: 'top top',
                end: 'bottom bottom',
                onUpdate: (self) => {
                    this.gsapContainer.style.setProperty(
                        '--progress',
                        self.progress
                    );
                },
            },
        });
        this.store.setProp('gsapisActive', true);
        this.store.setProp('tl', tl);
    }

    onResize() {
        const tl = this.store.getProp('tl');
        const gsapisActive = this.store.getProp('gsapisActive');

        if (gsapisActive && mq.min('desktop')) {
            this.getWidth();
            this.setDimension();
            this.updateShadow();
            tl.scrollTrigger.refresh();
        } else if (!gsapisActive && mq.min('desktop')) {
            window.scrollTo(0, 0);
            this.getWidth();
            this.updateShadow();
            this.initGsap();
        } else if (gsapisActive && mq.max('desktop')) {
            tl.kill();
            gsap.set('.HP__row', {
                xPercent: 0,
            });
            this.row.style.transform = '';
            this.row.style.width = '';
            this.gsapContainer.style.height = '';
            this.store.setProp('tl', null);
            this.store.setProp('gsapisActive', false);
        }
    }
}

export const gsapHorizontal2 = new GsapHorizontal2Class();
