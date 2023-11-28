import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
    outerHeight,
    outerWidth,
    getTranslateValues,
} from '../../../js/mobCore/utils';
import { mobCore } from '../../../js/mobCore';
import { motionCore } from '../../../js/mobMotion';

export class GsapHorizontalCustomClass {
    constructor(data = {}) {
        this.breackpoint = data.breackpoint || 'desktop';
        this.queryType = data.queryType || 'min';
        this.mainContainer = document.querySelector(data.rootEl);
        this.triggerContainer = this.mainContainer.querySelector(
            '.gsap-scroller__trigger'
        );
        this.row = this.mainContainer.querySelector('.gsap-scroller__row');
        this.cards = this.mainContainer.querySelectorAll(
            '.gsap-scroller__section'
        );
        this.shadow = this.mainContainer.querySelectorAll('[data-shadow]');
        this.shadowMainClass = 'gsap-scroller__shadowEl';
        this.shadowMainClassTransition = 'gsap-scroller__shadow';
        //
        this.callback = [];

        // GSAP store
        this.store = mobCore.createStore({
            gsapisActive: false,
            horizontalWidth: 0,
            tl: [],
            percentRange: 0,
        });

        Object.freeze(this);
    }

    init() {
        // GSAP
        gsap.registerPlugin(ScrollTrigger);
        this.getWidth();
        this.createShadow();
        this.initGsap();
        mobCore.useResize(() => this.onResize());
    }

    onTick(fn) {
        this.callback.push(fn);
    }

    setDimension() {
        const width = this.store.getProp('horizontalWidth');

        const percentRange = (100 * (width - window.innerWidth)) / width;

        this.triggerContainer.style.height = `${width}px`;
        this.row.style.width = `${width}px`;

        this.store.set('percentRange', percentRange);
    }

    getWidth() {
        if (!motionCore.mq(this.queryType, this.breackpoint)) return;

        const horizontalWidth = [...this.cards]
            .map((item) => {
                return outerWidth(item);
            })
            .reduce((a, b) => a + b, 0);

        this.store.set('horizontalWidth', horizontalWidth);
    }

    createShadow() {
        if (!motionCore.mq(this.queryType, this.breackpoint)) return;

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
                        ? `in out : ${shadowClass}`
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
        if (!motionCore.mq(this.queryType, this.breackpoint)) return;

        const shadowEl = this.mainContainer.querySelectorAll(
            `.${this.shadowMainClass}`
        );
        const numItem = shadowEl.length;

        [...this.shadow].forEach((item, i) => {
            const percentrange = this.store.getProp('percentRange') / 100;
            const shadowData = item.dataset.shadow;
            const width = outerWidth(item);
            const height = outerHeight(this.row);
            const { x } = getTranslateValues(this.row);
            const offset = item.getBoundingClientRect().left - x;
            const screenRatio = window.innerWidth / window.innerHeight;
            const windowDifference = window.innerWidth - window.innerHeight;
            const widthAmount = offset / screenRatio;
            const diffAmount = offset - offset / screenRatio;
            const shadowTransitionEl = this.mainContainer.querySelector(
                `.gsap-scroller__shadow[data-shadow="${shadowData}"]`
            );
            const inCenterMarker = shadowTransitionEl.querySelector(
                '.gsap-scroller__shadow__in-center'
            );
            const outCenterMarker = shadowTransitionEl.querySelector(
                '.gsap-scroller__shadow__out-center'
            );
            const leftMarker = shadowTransitionEl.querySelector(
                '.gsap-scroller__shadow__left'
            );
            const endMarker = shadowTransitionEl.querySelector(
                '.gsap-scroller__shadow__end'
            );

            // Strengh shadow end item to bottom of page
            const plusFull =
                window.innerWidth > window.innerHeight ? window.innerHeight : 0;

            // Strengh center in out item to bottom of page
            const plusHalf =
                window.innerWidth > window.innerHeight
                    ? window.innerHeight / 2
                    : 0;

            const start = (() => {
                switch (offset) {
                    case 0:
                        return 0;

                    default:
                        return (
                            widthAmount +
                            diffAmount / percentrange -
                            windowDifference / percentrange
                        );
                }
            })();

            const left = (() => {
                const val =
                    window.innerWidth > window.innerHeight
                        ? windowDifference / percentrange
                        : windowDifference / percentrange +
                          window.innerWidth / screenRatio;

                switch (offset) {
                    case 0:
                        return 0;

                    default:
                        return val;
                }
            })();

            const end = (() => {
                const val1 = width / screenRatio;
                const val2 = (width - width / screenRatio) / percentrange;
                return val1 + val2 + left;
            })();

            const inCenter = (() => {
                return end / 2 + plusHalf;
            })();

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
        if (
            !this.triggerContainer ||
            !motionCore.mq(this.queryType, this.breackpoint)
        )
            return;
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

                    this.callback.forEach((item, i) => {
                        item();
                    });
                },
            },
        });
        this.store.set('gsapisActive', true);
        this.store.set('tl', [tl]);
    }

    killGsap() {
        const [tl] = this.store.getProp('tl');
        const gsapisActive = this.store.getProp('gsapisActive');

        if (gsapisActive) {
            tl.scrollTrigger.kill();
            this.store.set('tl', []);
            this.store.set('gsapisActive', false);
        }
    }

    onResize() {
        const gsapisActive = this.store.getProp('gsapisActive');

        if (gsapisActive && motionCore.mq(this.queryType, this.breackpoint)) {
            this.getWidth();
            this.setDimension();
            this.updateShadow();
            this.killGsap();
            this.initGsap();
        } else if (
            !gsapisActive &&
            motionCore.mq(this.queryType, this.breackpoint)
        ) {
            this.getWidth();
            this.createShadow();
            this.updateShadow();
            this.initGsap();
        } else if (gsapisActive && !core.mq(this.queryType, this.breackpoint)) {
            gsap.set('.gsap-scroller__row', {
                xPercent: 0,
            });
            this.row.style.transform = '';
            this.row.style.width = '';
            this.triggerContainer.style.height = '';
            this.removeShadow();
            this.killGsap();
        }
    }
}
