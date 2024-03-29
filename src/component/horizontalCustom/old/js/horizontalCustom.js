import {
    offset,
    outerHeight,
    outerWidth,
    getTranslateValues,
    mobbu,
} from '../../../js/core';
import { horizontalCustomCss } from './horizontalCustomCss.js';

export class horizontalCustomClass {
    constructor(data = {}) {
        this.breackpoint = data.breackpoint || 'desktop';
        this.queryType = data.queryType || 'min';
        this.forceTranspond = data.forceTranspond || false;
        this.addCss = data.addCss || false;
        this.mainContainer = document.querySelector(data.rootEl);
        this.triggerContainer =
            this.mainContainer.querySelector('.scroller__trigger');
        this.row = this.mainContainer.querySelector('.scroller__row');
        this.cards = this.mainContainer.querySelectorAll('.scroller__section');
        this.shadow = this.mainContainer.querySelectorAll('[data-shadow]');
        this.shadowMainClass = 'scroller__shadowEl';
        this.shadowMainClassTransition = 'scroller__shadow';
        //
        this.onTickCallBack = [];
        this.onRefreshCallBack = [];
        //
        this.moduleisActive = false;
        this.horizontalWidth = 0;
        this.scroller = [];
        this.percentRange = 0;

        if (this.addCss) horizontalCustomCss(this.queryType, this.breackpoint);
    }

    init() {
        this.getWidth().then(() =>
            this.setDimension().then(() =>
                this.createShadow().then(() =>
                    this.updateShadow().then(() => {
                        this.initScroller();
                        mobbu.useResize(({ horizontalResize }) =>
                            this.onResize(horizontalResize)
                        );
                    })
                )
            )
        );
    }

    onTick(fn) {
        this.onTickCallBack.push(fn);
    }

    onRefresh(fn) {
        this.onRefreshCallBack.push(fn);
    }

    setDimension() {
        return new Promise((resolve, reject) => {
            mobbu.useFrame(() => {
                const width = this.horizontalWidth;
                this.percentRange = (100 * (width - window.innerWidth)) / width;
                this.triggerContainer.style.height = `${width}px`;
                this.mainContainer.style.height = `${width}px`;
                this.row.style.width = `${width}px`;

                resolve();
            });
        });
    }

    getWidth() {
        return new Promise((resolve, reject) => {
            mobbu.useFrame(() => {
                if (!mobbu.mq(this.queryType, this.breackpoint)) {
                    resolve();
                    return;
                }

                this.horizontalWidth = [...this.cards]
                    .map((item) => {
                        return outerWidth(item);
                    })
                    .reduce((a, b) => a + b, 0);

                resolve();
            });
        });
    }

    createShadow() {
        return new Promise((resolve, reject) => {
            mobbu.useFrame(() => {
                if (!mobbu.mq(this.queryType, this.breackpoint)) {
                    resolve();
                    return;
                }

                const shadowsTransition = `
                ${[...this.shadow]
                    .map((item, i) => {
                        const shadowClass = item.dataset.shadow;
                        const debug = item.dataset.debug ? 'debug' : '';
                        const start = item.dataset.debug
                            ? `in ${shadowClass}`
                            : '';
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
                resolve();
            });
        });
    }

    removeShadow() {
        this.triggerContainer.innerHTML = '';
    }

    updateShadow() {
        return new Promise((resolve, reject) => {
            if (!mobbu.mq(this.queryType, this.breackpoint)) {
                resolve();
                return;
            }

            mobbu.useFrame(() => {
                const shadowEl = this.mainContainer.querySelectorAll(
                    `.${this.shadowMainClass}`
                );
                const numItem = shadowEl.length;

                [...this.shadow].forEach((item, i) => {
                    const percentrange = this.percentRange / 100;
                    const shadowData = item.dataset.shadow;
                    const width = outerWidth(item);
                    const height = outerHeight(this.row);
                    const { x } = getTranslateValues(this.row);
                    const offset = item.getBoundingClientRect().left - x;
                    const screenRatio = window.innerWidth / window.innerHeight;
                    const windowDifference =
                        window.innerWidth - window.innerHeight;
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
                        window.innerWidth > window.innerHeight
                            ? window.innerHeight
                            : 0;

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
                        const val2 =
                            (width - width / screenRatio) / percentrange;
                        return val1 + val2 + left;
                    })();

                    const inCenter = (() => {
                        return end / 2 + plusHalf;
                    })();

                    // this.triggerContainer.style['margin-top'] = `-${height}px`;
                    shadowTransitionEl.style.top = `${start}px`;
                    inCenterMarker.style.height = `${inCenter}px`;
                    outCenterMarker.style.height = `${inCenter}px`;
                    outCenterMarker.style.top = `${inCenter}px`;
                    leftMarker.style.height = `${left}px`;
                    endMarker.style.height = `${end + plusFull}px`;
                    shadowTransitionEl.style.height = `${left}px`;
                });

                resolve();
            });
        });
    }

    initScroller() {
        if (
            !this.triggerContainer ||
            !mobbu.mq(this.queryType, this.breackpoint)
        )
            return;

        const scroller = mobbu.createScrollTrigger({
            item: this.row,
            trigger: this.triggerContainer,
            propierties: 'x',
            breackpoint: 'xSmall',
            pin: true,
            dynamicRange: () => {
                return -(this.horizontalWidth - window.innerWidth);
            },
            dynamicStart: {
                position: 'bottom',
                value: () => {
                    return window.innerHeight;
                },
            },
            dynamicEnd: {
                position: 'bottom',
                value: () => {
                    return this.horizontalWidth;
                },
            },
            onTick: (scrollVal) => {
                this.onTickCallBack.forEach((item, i) => {
                    item(scrollVal);
                });
            },
            ease: true,
            forceTranspond: this.forceTranspond, //Bring element to body to have better performance
            easeType: 'lerp',
            animateAtStart: false,
        });
        scroller.init();

        this.moduleisActive = true;
        this.scroller = scroller;
    }

    createScroller() {
        this.getWidth().then(() =>
            this.setDimension().then(() =>
                this.createShadow().then(() =>
                    this.updateShadow().then(() => {
                        this.initScroller();
                        this.onRefreshCallBack.forEach((item, i) => item());
                    })
                )
            )
        );
    }

    updateModule() {
        if (this.moduleisActive) {
            this.scroller.refresh();

            mobbu.useFrame(() => {
                mobbu.useNextTick(() => {
                    this.onRefreshCallBack.forEach((item, i) => item());
                });
            });
        }
    }

    update() {
        this.getWidth().then(() =>
            this.setDimension().then(() =>
                this.updateShadow().then(() => {
                    this.updateModule();
                    this.scroller.motion.stop();
                })
            )
        );
    }

    killScroller() {
        this.row.style.transform = '';
        this.row.style.width = '';
        this.triggerContainer.style.height = '';
        this.mainContainer.style.height = '';
        this.removeShadow();

        if (this.moduleisActive) {
            mobbu.useFrame(() => {
                mobbu.useNextTick(() => {
                    this.scroller.destroy();
                    this.scroller = null;
                    this.moduleisActive = false;
                });
            });
        }
    }

    onResize(horizontalResize) {
        if (this.moduleisActive && mobbu.mq(this.queryType, this.breackpoint)) {
            if (horizontalResize) this.update();
        } else if (
            !this.moduleisActive &&
            mobbu.mq(this.queryType, this.breackpoint)
        ) {
            this.createScroller();
        } else if (
            this.moduleisActive &&
            !mobbu.mq(this.queryType, this.breackpoint)
        ) {
            this.killScroller();
        }
    }
}
