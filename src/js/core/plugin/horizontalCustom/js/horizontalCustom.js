import ParallaxClass from '../../../animation/parallax/parallax';
import { handleFrame } from '../../../events/rafutils/handleFrame';
import { handleNextTick } from '../../../events/rafutils/handleNextTick';
import { handleResize } from '../../../events/resizeUtils/handleResize';
import { getTranslateValues, outerWidth } from '../../../utils/vanillaFunction';
import { horizontalCustomCss } from './horizontalCustomCss.js';
import { mq } from '../../../utils/mediaManager.js';
import { handleFrameIndex } from '../../../events/rafutils/handleFrameIndex';

export class HorizontalCustomClass {
    constructor(data = {}) {
        this.breackpoint = data.breackpoint || 'desktop';
        this.queryType = data.queryType || 'min';
        this.forceTranspond = data.forceTranspond || false;
        this.addCss = data.addCss || false;
        this.animateAtStart = data?.animateAtStart;
        this.ease = data?.ease;
        this.easeType = data?.easeType;

        // Main container
        this.mainContainer = document.querySelector(data.root);
        if (!this.mainContainer) {
            console.warn('horizontal custom: root node not found');
            return;
        }

        this.container = data.container;

        // Scroller trigger
        this.triggerContainer = this.mainContainer.querySelector(data.trigger);
        if (!this.triggerContainer) {
            console.warn('horizontal custom: trigger node not found');
            return;
        }

        this.row = this.mainContainer.querySelector(data.row);
        if (!this.triggerContainer) {
            console.warn('horizontal custom: row node not found');
            return;
        }

        this.cards = this.mainContainer.querySelectorAll(data.column);
        if (!this.triggerContainer) {
            console.warn('horizontal custom: column nodeList not found');
            return;
        }

        this.shadow = this.mainContainer.querySelectorAll('[data-shadow]');

        const originalShadowClass = data?.shadow || 'shadow';
        this.shadowMainClassTransition = originalShadowClass.replace('.', '');

        //
        this.onTickCallBack = [];
        this.onRefreshCallBack = [];
        //
        this.moduleisActive = false;
        this.horizontalWidth = 0;
        this.scroller = {};
        this.percentRange = 0;

        if (this.addCss)
            horizontalCustomCss({
                queryType: this.queryType,
                breackpoint: this.breackpoint,
                container: this.container,
                trigger: data.trigger,
                row: data.row,
                column: data.column,
                shadow: this.shadowMainClassTransition,
            });
    }

    init() {
        this.getWidth().then(() =>
            this.setDimension().then(() =>
                this.createShadow().then(() =>
                    this.updateShadow().then(() => {
                        this.initScroller();
                        handleResize(({ horizontalResize }) =>
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
        if (!this.triggerContainer || !this.mainContainer || !this.row) {
            return new Promise((resolve) => {
                resolve();
            });
        }

        return new Promise((resolve) => {
            handleFrame.add(() => {
                const width = this.horizontalWidth;
                this.percentRange = (100 * (width - window.innerWidth)) / width;

                if (width > 0) {
                    this.triggerContainer.style.height = `${width}px`;
                    this.mainContainer.style.height = `${width}px`;
                    this.row.style.width = `${width}px`;
                }

                resolve();
            });
        });
    }

    getWidth() {
        return new Promise((resolve) => {
            handleFrame.add(() => {
                if (!mq[this.queryType](this.breackpoint)) {
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
        if (!this.triggerContainer) {
            return new Promise((resolve) => {
                resolve();
            });
        }

        return new Promise((resolve) => {
            handleFrame.add(() => {
                if (!mq[this.queryType](this.breackpoint)) {
                    resolve();
                    return;
                }

                const shadowsTransition = [...this.shadow]
                    .map((item) => {
                        const shadowClass = item.dataset.shadow;
                        const debug = item.dataset.debug ? 'debug' : '';
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
                                <span class="${this.shadowMainClassTransition}--in-center ${debug}">
                                    ${inCenter}
                                </span>
                                <span class="${this.shadowMainClassTransition}--out-center ${debug}">
                                    ${outCenter}
                                </span>
                                <span class="${this.shadowMainClassTransition}--left ${debug}">
                                    ${left}
                                </span>
                                <span class="${this.shadowMainClassTransition}--end ${debug}">
                                    ${end}
                                </span>
                            </div>`;
                    })
                    .join('');

                this.triggerContainer.innerHTML = shadowsTransition;
                resolve();
            });
        });
    }

    removeShadow() {
        this.triggerContainer.innerHTML = '';
    }

    updateShadow() {
        return new Promise((resolve) => {
            if (!mq[this.queryType](this.breackpoint)) {
                resolve();
                return;
            }

            handleFrame.add(() => {
                [...this.shadow].forEach((item) => {
                    const percentrange = this.percentRange / 100;
                    const shadowData = item.dataset.shadow;
                    const width = outerWidth(item);
                    // const height = outerHeight(this.row);
                    const { x } = getTranslateValues(this.row);
                    const offset = item.getBoundingClientRect().left - x;
                    const screenRatio = window.innerWidth / window.innerHeight;
                    const windowDifference =
                        window.innerWidth - window.innerHeight;
                    const widthAmount = offset / screenRatio;
                    const diffAmount = offset - offset / screenRatio;
                    const shadowTransitionEl = this.mainContainer.querySelector(
                        `.${this.shadowMainClassTransition}[data-shadow="${shadowData}"]`
                    );

                    const inCenterMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--in-center`
                    );
                    const outCenterMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--out-center`
                    );
                    const leftMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--left`
                    );
                    const endMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--end`
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
        if (!this.triggerContainer || !mq[this.queryType](this.breackpoint))
            return;

        const scroller = new ParallaxClass({
            type: 'scrolltrigger',
            item: this.row,
            trigger: this.triggerContainer,
            propierties: 'x',
            breackpoint: 'xSmall',
            pin: true,
            ease: this.ease,
            forceTranspond: this.forceTranspond, //Bring element to body to have better performance
            easeType: this.easeType,
            springConfig: 'scroller',
            animateAtStart: this.animateAtStart,
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
                this.onTickCallBack.forEach((item) => {
                    item(scrollVal);
                });
            },
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
                        this.onRefreshCallBack.forEach((item) => item());
                    })
                )
            )
        );
    }

    updateModule() {
        if (this.moduleisActive) {
            this.scroller.refresh();

            handleFrame.add(() => {
                handleNextTick.add(() => {
                    this.onRefreshCallBack.forEach((item) => item());
                });
            });
        }
    }

    refresh() {
        this.getWidth().then(() =>
            this.setDimension().then(() =>
                this.updateShadow().then(() => {
                    this.updateModule();
                    this.scroller.motion?.stop();
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
            handleFrame.add(() => {
                handleNextTick.add(() => {
                    this.scroller.destroy();
                    this.scroller = null;
                    this.moduleisActive = false;
                });
            });
        }
    }

    onResize(horizontalResize) {
        if (this.moduleisActive && mq[this.queryType](this.breackpoint)) {
            if (horizontalResize) this.refresh();
        } else if (
            !this.moduleisActive &&
            mq[this.queryType](this.breackpoint)
        ) {
            this.createScroller();
        } else if (
            this.moduleisActive &&
            !mq[this.queryType](this.breackpoint)
        ) {
            this.killScroller();
        }
    }

    destrory() {
        this.killScroller();

        handleFrameIndex.add(() => {
            this.row.style.transform = '';
            this.row.style.width = '';
            this.triggerContainer.style.height = '';
            this.mainContainer.style.height = '';
            this.mainContainer = null;
            this.triggerContainer = null;
            this.row = [];
            this.cards = [];
            this.shadow = [];
            this.onTickCallBack = [];
            this.onRefreshCallBack = [];
            this.moduleisActive = false;
            this.scroller = null;
        }, 2);
    }
}
