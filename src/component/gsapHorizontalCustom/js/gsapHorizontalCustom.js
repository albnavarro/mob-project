import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { eventManager } from '../../../js/base/eventManager.js';
import { mq } from '../../../js/base/mediaManager.js';
import { SimpleStore } from '../../../js/utility/simpleStore.js';
import {
    offset,
    outerHeight,
    outerWidth,
} from '../../../js/utility/vanillaFunction.js';
import { getTranslateValues } from '../../../js/utility/getTranslateValues.js';

export class GsapHorizontalCustomClass {
    constructor(rootEl) {
        this.mainContainer = document.querySelector(rootEl);
        this.triggerContainer =
            this.mainContainer.querySelector('.scroller__trigger');
        this.row = this.mainContainer.querySelector('.scroller__row');
        this.cards = this.mainContainer.querySelectorAll('.scroller__section');
        this.shadow = this.mainContainer.querySelectorAll('[data-shadow]');
        this.shadowMainClass = 'scroller__shadowEl';
        this.shadowMainClassTransition = 'scroller__shadow';

        // GSAP store
        this.store = new SimpleStore({
            gsapisActive: false,
            horizontalWidth: 0,
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

        this.store.setProp('horizontalWidth', horizontalWidth);
    }

    createShadow() {
        const shadowsTransition = `
            ${[...this.shadow]
                .map((item, i) => {
                    const shadowClass = item.dataset.shadow;
                    const debug = item.dataset.debug ? 'debug' : '';
                    const start = item.dataset.debug ? `in ${shadowClass}` : '';
                    const left = item.dataset.debug
                        ? `left left : ${shadowClass}`
                        : '';
                    const inCenter = item.dataset.debug
                        ? `in center : ${shadowClass}`
                        : '';
                    const outCenter = item.dataset.debug
                        ? `center out : ${shadowClass}`
                        : '';
                    const end = item.dataset.debug
                        ? `out : ${shadowClass}`
                        : '';

                    return `
                        <div class='${this.shadowMainClassTransition} ${this.shadowMainClassTransition}--${shadowClass}' data-shadow='${shadowClass}'>
                            <span class="${this.shadowMainClassTransition}__in-center ${debug}">
                                ${inCenter}
                            </span>
                            <span class="${this.shadowMainClassTransition}__out-center ${debug}">
                                ${outCenter}
                            </span>
                            <span class="${this.shadowMainClassTransition}__left ${debug}">
                                ${left}
                            </span>
                            <span class="${this.shadowMainClassTransition}__end ${debug}">
                                ${end}
                            </span>
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
        const shadowEl = this.mainContainer.querySelectorAll(
            `.${this.shadowMainClass}`
        );
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
            const shadowTransitionEl = this.mainContainer.querySelector(
                `.scroller__shadow[data-shadow="${shadowData}"]`
            );
            const inCenterMarker = shadowTransitionEl.querySelector(
                '.scroller__shadow__in-center'
            );
            const outCenterMarker = shadowTransitionEl.querySelector(
                '.scroller__shadow__out-center'
            );
            const leftMarker = shadowTransitionEl.querySelector(
                '.scroller__shadow__left'
            );
            const endMarker = shadowTransitionEl.querySelector(
                '.scroller__shadow__end'
            );

            // Strengh shadow end item to bottom of page
            const plusFull =
                eventManager.windowsWidth() > eventManager.windowsHeight()
                    ? eventManager.windowsHeight()
                    : 0;

            // Strengh center in out item to bottom of page
            const plusHalf =
                eventManager.windowsWidth() > eventManager.windowsHeight()
                    ? eventManager.windowsHeight() / 2
                    : 0;

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

            const left = ((i) => {
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
                return val1 + val2 + left;
            })(i);

            const inCenter = ((i) => {
                return end / 2 + plusHalf;
            })(i);

            this.triggerContainer.style['margin-top'] = `-${height}px`;
            shadowTransitionEl.style.top = `${start}px`;
            inCenterMarker.style.height = `${inCenter}px`;
            outCenterMarker.style.height = `${inCenter}px`;
            outCenterMarker.style.top = `${inCenter}px`;
            leftMarker.style.height = `${left}px`;
            endMarker.style.height = `${end + plusFull}px`;
            shadowTransitionEl.style.height = `${left}px`;
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
