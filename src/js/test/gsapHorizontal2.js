import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { eventManager } from '../base/eventManager.js';
import { mq } from '../base/mediaManager.js';
import { SimpleStore } from '../utility/simpleStore.js';
import { offset, outerHeight, outerWidth } from '../utility/vanillaFunction.js';

class GsapHorizontal2Class {
    constructor() {
        // GSAP
        this.mainContainer = document.querySelector('.HP__main');
        this.triggerContainer = document.querySelector('.HP__trigger');
        this.row = document.querySelector('.HP__row');
        this.cards = document.querySelectorAll('.HP__section');
        this.shadowMainClass = 'HP__shadowEl';
        this.shadowMainClassTransition = 'HP__shadowTransition';

        // GSAP store
        this.store = new SimpleStore({
            gsapisActive: false,
            horizontalWidth: 0,
            verticalHeight: 0,
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

        this.triggerContainer.style.height = `${width}px`;
        this.mainContainer.style.height = `${width * 8}px`;
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
                        <span class="HP__shadowTransition__start">start ${shadowClass} / i:${
                        i + 1
                    }</span>
                        <span class="HP__shadowTransition__end">end ${shadowClass} / i:${
                        i + 1
                    }</span>
                        </div>`;
                })
                .join('')}
        </div>`;

        const shadows = [...[shadowsEl], ...[shadowsTransition]].join('');
        this.triggerContainer.innerHTML = shadows;
    }

    removeShadow() {
        this.triggerContainer.innerHTML = '';
    }

    updateShadow() {
        const shadowEl = document.querySelectorAll(`.${this.shadowMainClass}`);
        const numItem = shadowEl.length;
        const horizontalWidth = this.store.getProp('horizontalWidth');
        const verticalHeight = this.store.getProp('verticalHeight');

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
            const offset = originalItem.getBoundingClientRect().left;
            const itemDifference = width - height;
            const percentrange = this.store.getProp('percentRange') / 100;
            const screenRatio = window.innerWidth / window.innerHeight;
            const windowDifference = window.innerWidth - window.innerHeight;
            // const previousEl = [...this.cards].slice(0, i);

            // const isInsideVieport = (() => {
            //     // this.row.style.transform = 'translate(0,0)';
            //     const result =
            //         originalItem.getBoundingClientRect().left <
            //         window.innerWidth
            //             ? true
            //             : false;
            //     // this.row.style.transform = ``;
            //     return result;
            // })();
            //
            // const widthAmount = previousEl
            //     .map((item) => {
            //         const width = outerWidth(item);
            //         return width / screenRatio;
            //     })
            //     .reduce((a, b) => a + b, 0);
            //
            // const diffAmount = previousEl
            //     .map((item) => {
            //         const width = outerWidth(item);
            //         return width - width / screenRatio;
            //     })
            //     .reduce((a, b) => a + b, 0);
            //

            const widthAmount = offset / screenRatio;
            const diffAmount = offset - offset / screenRatio;

            const top = ((i) => {
                switch (i) {
                    case 0:
                        return 0;

                    default:
                        // return isInsideVieport
                        //     ? offset / screenRatio
                        //     : widthAmount +
                        //           diffAmount / percentrange -
                        //           windowDifference / percentrange;
                        return (
                            widthAmount +
                            diffAmount / percentrange -
                            windowDifference / percentrange
                        );
                }
            })(i);

            const heightParsed = ((i) => {
                const base =
                    (width - (window.innerWidth - width) / screenRatio) /
                    percentrange;

                switch (i) {
                    case shadowEl.length - 1:
                        return base;

                    case 0:
                        return base;

                    default:
                        return base;
                }
            })(i);

            // const heightParsed = ((i) => {
            //     const windowRef =
            //         window.innerWidth > window.innerHeight
            //             ? window.innerWidth
            //             : window.innerheight;
            //
            //     switch (i) {
            //         case shadowEl.length - 1:
            //             return (
            //                 width / screenRatio +
            //                 windowDifference / percentrange
            //             );
            //
            //         case 0:
            //             return (
            //                 width / screenRatio +
            //                 windowDifference / percentrange
            //             );
            //
            //         default:
            //             return (
            //                 width / screenRatio +
            //                 (windowDifference / percentrange) * 2
            //             );
            //     }
            // })(i);

            item.style.height = `${width}px`;
            item.style.width = `${width}px`;
            this.mainContainer.style.height = `${horizontalWidth}px`;
            this.triggerContainer.style['margin-top'] = `-${height}px`;
            shadowTransitionEl.style.top = `${top}px`;
            shadowTransitionEl.style.height = `${heightParsed}px`;
        });
    }

    initGsap() {
        if (!this.triggerContainer || mq.max('desktop')) return;
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
            this.triggerContainer.style.height = '';
            this.store.setProp('tl', null);
            this.store.setProp('gsapisActive', false);
        }
    }
}

export const gsapHorizontal2 = new GsapHorizontal2Class();
