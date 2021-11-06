import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { eventManager } from '../base/eventManager.js';
import { mq } from '../base/mediaManager.js';
import { SimpleStore } from '../utility/simpleStore.js';
import { offset, outerHeight, outerWidth } from '../utility/vanillaFunction.js';
import { getTranslateValues } from '../utility/getTranslateValues.js';

class GsapHorizontal2Class {
    constructor() {
        // GSAP
        this.mainContainer = document.querySelector('.scroller');
        this.triggerContainer = document.querySelector('.scroller__trigger');
        this.row = document.querySelector('.scroller__row');
        this.cards = document.querySelectorAll('.scroller__section');
        this.shadow = document.querySelectorAll('[data-shadow]');
        this.shadowMainClass = 'scroller__shadowEl';
        this.shadowMainClassTransition = 'scroller__shadow';

        // GSAP store
        this.store = new SimpleStore({
            gsapisActive: false,
            horizontalWidth: 0,
            verticalHeight: 0,
            tl: null,
            percentRange: 0,
        });

        Object.freeze(this);
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

        this.triggerContainer.style.height = `${width}px`;
        this.row.style.width = `${width}px`;

        this.store.setProp('percentRange', percentRange);
    }

    getWidth() {
        const horizontalWidth = [...this.cards]
            .map((item) => {
                return outerWidth(item);
            })
            .reduce((a, b) => a + b, 0);

        const verticalHeight = [...this.cards]
            .map((item) => {
                return outerHeight(item);
            })
            .reduce((a, b) => a + b, 0);

        this.store.setProp('horizontalWidth', horizontalWidth);
        this.store.setProp('verticalHeight', verticalHeight);
    }

    createShadow() {
        const shadowsTransition = `
            ${[...this.shadow]
                .map((item, i) => {
                    const shadowClass = item.dataset.shadow;
                    const debug = item.dataset.debug ? 'debug' : '';

                    return `
                        <div class='${this.shadowMainClassTransition} ${this.shadowMainClassTransition}--${shadowClass}' data-shadow='${shadowClass}'>
                            <span class="${this.shadowMainClassTransition}__start ${debug}">start ${shadowClass}</span>
                            <span class="${this.shadowMainClassTransition}__center ${debug}">center ${shadowClass}</span>
                            <span class="${this.shadowMainClassTransition}__end ${debug}">end ${shadowClass}</span>
                        </div>`;
                })
                .join('')}
        `;

        this.triggerContainer.innerHTML = shadowsTransition;
    }

    removeShadow() {
        this.triggerContainer.innerHTML = '';
    }

    updateShadow() {
        const shadowEl = document.querySelectorAll(`.${this.shadowMainClass}`);
        const numItem = shadowEl.length;

        [...this.shadow].forEach((item, i) => {
            const percentrange = this.store.getProp('percentRange') / 100;
            const shadowData = item.dataset.shadow;
            const width = outerWidth(item);
            const height = outerHeight(item);
            const { x } = getTranslateValues(this.row);
            const offset = item.getBoundingClientRect().left - x;
            const screenRatio =
                eventManager.windowsWidth() / eventManager.windowsHeight();
            const windowDifference =
                eventManager.windowsWidth() - eventManager.windowsHeight();
            const widthAmount = offset / screenRatio;
            const diffAmount = offset - offset / screenRatio;
            const shadowTransitionEl = document.querySelector(
                `.scroller__shadow[data-shadow="${shadowData}"]`
            );
            const centerMarker = shadowTransitionEl.querySelector(
                '.scroller__shadow__center'
            );
            const endMarker = shadowTransitionEl.querySelector(
                '.scroller__shadow__end'
            );

            const start = ((i) => {
                switch (i) {
                    case 0:
                        return 0;

                    default:
                        return (
                            widthAmount +
                            diffAmount / percentrange -
                            windowDifference / percentrange
                        );
                }
            })(i);

            const center = ((i) => {
                const val =
                    eventManager.windowsWidth() > eventManager.windowsHeight()
                        ? windowDifference / percentrange
                        : windowDifference / percentrange +
                          eventManager.windowsWidth() / screenRatio;

                switch (i) {
                    case 0:
                        return 0;

                    default:
                        return val;
                }
            })(i);

            const end = ((i) => {
                const val1 = width / screenRatio;
                const val2 = (width - width / screenRatio) / percentrange;
                return val1 + val2 + center;
            })(i);

            this.triggerContainer.style['margin-top'] = `-${height}px`;
            shadowTransitionEl.style.top = `${start}px`;
            centerMarker.style.height = `${center}px`;
            endMarker.style.height = `${end}px`;
            shadowTransitionEl.style.height = `${center}px`;
        });
    }

    initGsap() {
        if (!this.triggerContainer || mq.max('small')) return;
        this.setDimension();
        this.updateShadow();

        const tl = gsap.to(this.row, {
            xPercent: -this.store.getProp('percentRange'), // Percent calc
            ease: 'none',
            scrollTrigger: {
                trigger: this.triggerContainer,
                scrub: 1,
                start: 'top top',
                end: 'bottom bottom',
                onUpdate: (self) => {
                    this.triggerContainer.style.setProperty(
                        '--progress',
                        self.progress
                    );
                },
            },
        });
        this.store.setProp('gsapisActive', true);
        this.store.setProp('tl', [tl]);
    }

    onResize() {
        const [tl] = this.store.getProp('tl');
        const gsapisActive = this.store.getProp('gsapisActive');

        if (gsapisActive && mq.min('small')) {
            this.getWidth();
            this.setDimension();
            this.updateShadow();
            tl.scrollTrigger.kill();
            this.store.setProp('tl', null);
            this.store.setProp('gsapisActive', false);
            this.initGsap();
        } else if (!gsapisActive && mq.min('small')) {
            window.scrollTo(0, 0);
            this.getWidth();
            this.updateShadow();
            this.initGsap();
        } else if (gsapisActive && mq.max('small')) {
            tl.kill();
            gsap.set('.scroller__row', {
                xPercent: 0,
            });
            this.row.style.transform = '';
            this.row.style.width = '';
            this.triggerContainer.style.height = '';
            this.store.setProp('tl', null);
            this.store.setProp('gsapisActive', false);
        }
    }
}

export const gsapHorizontal2 = new GsapHorizontal2Class();
