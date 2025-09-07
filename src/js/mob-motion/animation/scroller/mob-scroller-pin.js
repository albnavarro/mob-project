// @ts-check

import MobSpring from '../spring/mob-spring.js';
import { MobScrollerConstant } from './mob-scroller-constant.js';
import { position } from '../../../mob-core/utils/index.js';
import { clamp } from '../utils/animation-utils.js';
import { MobCore } from '../../../mob-core/index.js';
import { getMarkerWrapperStyle } from './mob-scroller-pin-utils.js';

export class MobScrollerPin {
    /**
     * @type {number}
     */
    #scrollerHeight = 0;

    /**
     * @type {number}
     */
    #start = 0;

    /**
     * @type {number}
     */
    #startFromTop = 0;

    /**
     * @type {boolean | undefined}
     */
    #invertSide;

    /**
     * @type {number}
     */
    #end;

    /**
     * @type{() => number}
     */
    #getStart;

    /**
     * @type{() => number}
     */
    #getEnd;

    /**
     * @type {string}
     */
    #direction;

    /**
     * @type {number}
     */
    #compesateValue;

    /**
     * @type {HTMLElement | null | undefined}
     */
    #item;

    /**
     * @type {MobSpring | undefined | null}
     */
    #spring;

    /**
     * @type {HTMLElement | undefined}
     */
    #wrapper;

    /**
     * @type {String | undefined}
     */
    #marker;

    /**
     * @type {globalThis | HTMLElement}
     */
    #screen;

    /**
     * @type {HTMLElement | undefined}
     */
    #pin;

    /**
     * @type {boolean}
     */
    #isOver;

    /**
     * @type {boolean}
     */
    #isInner;

    /**
     * @type {boolean}
     */
    #isUnder;

    /**
     * @type {Function}
     */
    #unsubscribeScroll;

    /**
     * @type {Function}
     */
    #unsubscribeScrollStart;

    /**
     * @type {Function}
     */
    #unsubscribeSpring;

    /**
     * @type {boolean}
     */
    #firstTime;

    /**
     * Item style applied to pin wrapper
     *
     * @type {string[]}
     */
    #itemRequireStyleToWrapper;

    /**
     * Item style get and applied itself when transpond
     *
     * @type {string[]}
     */
    #itemRequireStyleWhenTraspond;

    /**
     * Paerent style to applied to pin
     *
     * @type {string[]}
     */
    #parentRequireStyle;

    /**
     * Item style applied to pin
     *
     * @type {string[]}
     */
    #itemRequireStyleToPin;

    /**
     * Parent style that activate transpond
     *
     * @type {string[]}
     */
    #styleToTranspond;

    /**
     * Skip parent style to activate transpond above with this value
     *
     * @type {string[]}
     */
    #nonRelevantRule;

    /**
     * @type {boolean}
     */
    #isInizialized;

    /**
     * @type {number}
     */
    #prevScroll;

    /**
     * @type {number}
     */
    #prevscrollY;

    /**
     * @type {boolean}
     */
    #animatePin;

    /**
     * @type {number}
     */
    #anticipateFactor;

    /**
     * @type {boolean}
     */
    #forceTranspond;

    /**
     * @type {boolean}
     */
    #justPinned;

    /**
     * @type {number}
     */
    #afterPinCounter;

    /**
     * @type {number}
     */
    #lastStep;

    /**
     * @type {boolean}
     */
    #afterJustPinned;

    /**
     * @type {number}
     */
    #afterJustPinnedCounter;

    /**
     * @type {number}
     */
    #numeCycleToFreeze;

    /**
     * @type {string}
     */
    #collisionStyleProp;

    /**
     * @type {boolean}
     */
    #shoulTranspond;

    /**
     * @type {boolean}
     */
    #anticipatePinOnLoad;

    constructor() {
        this.#invertSide = undefined;
        this.#end = 0;
        this.#getStart = () => 0;
        this.#getEnd = () => 0;
        this.#direction = MobScrollerConstant.DIRECTION_VERTICAL;
        this.#compesateValue = 0;
        this.#item = undefined;
        this.#spring = undefined;
        this.#wrapper = undefined;
        this.#pin = undefined;
        this.#isOver = false;
        this.#isInner = false;
        this.#isUnder = false;
        this.#unsubscribeScroll = () => {};
        this.#unsubscribeScrollStart = () => {};
        this.#unsubscribeSpring = () => {};
        this.#firstTime = true;
        this.#marker = undefined;
        this.#screen = globalThis;
        this.#collisionStyleProp = 'left';
        this.#anticipatePinOnLoad = true;
        this.#shoulTranspond = false;

        this.#itemRequireStyleToWrapper = [
            'flex',
            'flex-shrink',
            'flex-basis',
            'float',
            'display',
            'grid-area',
            'grid-column-start',
            'grid-column-end',
            'grid-row-start',
            'grid-row-end',
            'box-sizing',
            'order',
            'place-self',
            'align-self',
            'justify-self',
        ];

        this.#itemRequireStyleWhenTraspond = [
            'font-size',
            'padding',
            'margin',
            'line-height',
            'white-space',
        ];

        this.#parentRequireStyle = ['text-align'];
        this.#itemRequireStyleToPin = ['z-index', 'pointer-events'];

        this.#styleToTranspond = [
            'transform',
            'position',
            'translate',
            'rotate',
            'scale',
        ];

        this.#nonRelevantRule = ['none', 'static'];
        this.#isInizialized = false;
        this.#prevScroll = 0;
        this.#prevscrollY = 0;
        this.#animatePin = false;
        this.#anticipateFactor = 1.5;
        this.#forceTranspond = false;
        this.#justPinned = false;
        this.#afterPinCounter = 0;
        this.#lastStep = 0;
        this.#afterJustPinned = false;
        this.#afterJustPinnedCounter = 0;
        this.#numeCycleToFreeze = 3;
    }

    /**
     * @param {import('./type.js').PinParams} data
     */
    init(data) {
        this.#item = data.item;
        this.#marker = data.marker;
        this.#screen = data.screen;
        this.#animatePin = data.animatePin;
        this.#anticipatePinOnLoad = data.anticipatePinOnLoad;
        this.#forceTranspond = data.forceTranspond;
        this.#invertSide = data.invertSide;
        this.#direction = data.direction;
        this.#getStart = data.getStart;
        this.#getEnd = data.getEnd;
        this.#start = this.#getStart();
        this.#end = this.#getEnd();
        this.#prevscrollY = window.scrollY;
        this.#scrollerHeight = data?.scrollerHeight;
        this.#refreshCollisionPoint();

        this.#collisionStyleProp =
            this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                ? 'top'
                : 'left';
        this.#isInizialized = true;
        this.#firstTime = true;

        this.#createPin();
        this.#addStyleFromPinToWrapper();
        this.#setPinSize();
        this.#setUpMotion();

        /**
         * Update pix top position when use custom screen ad scroll outside on window
         */
        this.#unsubscribeScrollStart = MobCore.useScrollStart(() => {
            if (!this.#isInizialized) return;

            if (this.#screen !== globalThis && this.#isInner && this.#pin) {
                MobCore.useFrame(() => {
                    if (this.#pin)
                        this.#pin.style.transition = `transform .85s cubic-bezier(0, 0.68, 0.45, 1.1)`;
                });
            }
        });

        this.#unsubscribeScroll = MobCore.useScroll(({ scrollY }) => {
            if (!this.#isInizialized) return;

            if (
                this.#screen !== globalThis &&
                this.#screen !== document.documentElement
            ) {
                if (
                    this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                ) {
                    this.#refreshCollisionPoint();
                }

                const gap = scrollY - this.#prevscrollY;
                this.#prevscrollY = scrollY;

                if (this.#isInner && this.#pin && this.#spring) {
                    const { verticalGap } = this.#spring.get();
                    const translateValue = verticalGap - gap;

                    /**
                     * No need animation update data and apply style directly
                     */
                    this.#spring.setData({
                        collision: 0,
                        verticalGap: translateValue,
                    });

                    MobCore.useFrame(() => {
                        if (this.#pin)
                            this.#pin.style.transform = `translate(0px,${translateValue}px)`;
                    });
                }
            }
        });
    }

    #setUpMotion() {
        this.#spring = new MobSpring({
            data: { collision: 0, verticalGap: 0 },
            config: 'wobbly',
        });

        this.#unsubscribeSpring = this.#spring.subscribe(
            ({ collision, verticalGap }) => {
                if (
                    this.#direction ===
                        MobScrollerConstant.DIRECTION_VERTICAL &&
                    this.#pin
                ) {
                    /**
                     * In vertical mode gap to translate when pin is in fixed position on window scroll is the same of
                     * collision The same axis reset the two prop
                     */
                    this.#pin.style.transform = `translate(0px, ${collision}px)`;
                } else if (this.#pin) {
                    this.#pin.style.transform = `translate(${collision}px, ${verticalGap}px)`;
                }
            }
        );
    }

    #resetSpring() {
        if (this.#pin && this.#spring)
            this.#spring.set({ collision: 0, verticalGap: 0 }).catch(() => {});
    }

    #createPin() {
        if (!this.#item) this.#item = document.createElement('div');

        /**
         * Wrap pin element pin-wrapper , use to cache potion into dom flow when pin go to fixed
         */
        const wrapper = document.createElement('div');
        wrapper.classList.add('pin-wrapper');

        /**
         * Pin wrap that go to fixed pos
         */
        const pin = document.createElement('div');
        pin.classList.add('pin');
        wrapper.append(pin);
        const parentNode = this.#item?.parentNode;

        if (parentNode) parentNode.insertBefore(wrapper, this.#item);

        // @ts-ignore
        pin.append(this.#item);

        // @ts-ignore
        this.#wrapper = this.#item.closest('.pin-wrapper');

        // @ts-ignore
        this.#pin = this.#item.closest('.pin');

        /**
         * Get style from parent and add to pin, es text-align
         */
        const requiredStyleToadd = this.#addRquiredStyle();

        /**
         * Get style from iem and add to pin, es z-index
         */
        const pinStyleFromItem = this.#addPinStyleFromItem();

        const markerWrapperStyle = getMarkerWrapperStyle({
            marker: this.#marker,
            invertSide: this.#invertSide,
            direction: this.#direction,
        });

        /**
         * Add display table to avoid margin problem inside
         */
        const display = { display: 'table' };

        MobCore.useFrame(() => {
            if (!this.#pin || !this.#wrapper) return;

            Object.assign(this.#wrapper.style, { ...markerWrapperStyle });
            Object.assign(this.#pin.style, {
                ...display,
                ...pinStyleFromItem,
                ...requiredStyleToadd,
            });
        });

        this.#checkIfShouldTranspond();
    }

    #setPinSize() {
        /*
        Firse time ww don't use raf to apply basic
        misureimmediatly on component creation
        Otherwise we can have some wrong calculation after
        */

        if (!this.#pin || !this.#wrapper) return;
        const height = this.#wrapper.offsetHeight;
        const width = this.#wrapper.offsetWidth;
        this.#wrapper.style.height = `${height}px`;
        this.#wrapper.style.width = `${width}px`;
        this.#pin.style.height = `${height}px`;
        this.#pin.style.width = `${width}px`;
    }

    /**
     * Get style from item and apply to wrapper ( es: flex)
     */
    #addStyleFromPinToWrapper() {
        if (!this.#item) return;

        const compStyles = globalThis.getComputedStyle(this.#item);
        const style = this.#itemRequireStyleToWrapper.reduce((p, c) => {
            return { ...p, [c]: compStyles.getPropertyValue(c) };
        }, {});

        MobCore.useFrame(() => {
            if (!this.#wrapper) return;
            Object.assign(this.#wrapper.style, style);
        });
    }

    /**
     * @param {HTMLElement} target
     * @param {string} rule
     * @returns {Record<string, any> | undefined}
     */
    #findStyle(target, rule) {
        let node = target.parentNode;
        if (!node) return;

        while (node !== null && node !== document) {
            /** @type {Record<string, any>} */
            const style = getComputedStyle(/** @type {Element} */ (node));

            if (style[rule] && !this.#nonRelevantRule.includes(style[rule])) {
                return { [rule]: style[rule] };
            }
            node = node.parentNode;
        }

        return;
    }

    /**
     * @returns {Record<string, string> | {}}
     */
    #addRquiredStyle() {
        if (!this.#pin) return {};

        const stylesObject = this.#parentRequireStyle
            .map((item) => {
                // @ts-ignore
                return this.#findStyle(this.#pin, item);
            })
            .filter((item) => item !== null)
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});

        return stylesObject ?? {};
    }

    /**
     * @returns {void}
     */
    #checkIfShouldTranspond() {
        if (this.#forceTranspond) {
            this.#shoulTranspond = true;
            return;
        }

        this.#shoulTranspond = this.#styleToTranspond
            .map((item) => {
                // @ts-ignore
                const style = this.#findStyle(this.#wrapper, item);
                if (!style) return false;

                const [key] = Object.keys(style);
                const [value] = Object.values(style);

                if (key === 'position') {
                    return value === 'fixed' || value === 'absolute'
                        ? true
                        : false;
                } else {
                    return true;
                }
            })
            .includes(true);
    }

    /**
     * @returns {void}
     */
    #updateStartEndValue() {
        this.#start = this.#getStart();
        this.#end = this.#getEnd();
    }

    /**
     * @returns {void}
     */
    #refreshCollisionPoint() {
        /**
         * Align start && end value to paralllax current values
         */
        this.#updateStartEndValue();

        /**
         * Update start position when use custom screen ad scroll outside on window
         */
        if (this.#screen !== globalThis) {
            this.#start -=
                this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                    ? // @ts-ignore
                      position(this.#screen).top
                    : // @ts-ignore
                      position(this.#screen).left;
        }

        this.#startFromTop = this.#invertSide
            ? this.#start
            : this.#scrollerHeight - this.#start;

        this.#compesateValue = this.#invertSide
            ? -Math.trunc(this.#end)
            : Math.trunc(this.#end);
    }

    /**
     * @returns {void}
     */
    destroy() {
        if (!this.#isInizialized) return;

        this.#spring?.stop?.();
        this.#unsubscribeSpring();
        this.#unsubscribeScroll();
        this.#unsubscribeScrollStart();
        this.#spring?.destroy?.();
        this.#spring = null;
        this.#afterPinCounter = 0;
        this.#justPinned = false;
        this.#isUnder = false;
        this.#isInner = false;
        this.#isOver = false;

        if (this.#pin && this.#wrapper) {
            // @ts-ignore
            this.#wrapper.parentNode?.insertBefore(this.#item, this.#wrapper);
            this.#pin.remove();
            this.#wrapper.remove();
            this.#wrapper = undefined;
            this.#pin = undefined;
            this.#isInizialized = false;
        }
    }

    /**
     * @returns {number}
     */
    #getGap() {
        if (!this.#wrapper) return 0;

        return this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
            ? position(this.#wrapper).top - this.#startFromTop
            : position(this.#wrapper).left - this.#startFromTop;
    }

    /**
     * @returns {void}
     */
    #animateCollision() {
        const gap = this.#getGap();
        this.#tween(gap);
    }

    /**
     * @returns {void}
     */
    #animateCollisionBack() {
        const gap = this.#invertSide
            ? this.#getGap() - this.#end
            : this.#getGap() + this.#end;

        this.#tween(gap);
    }

    /**
     * @param {number} gap
     */
    #tween(gap) {
        MobCore.useFrame(() => {
            if (!this.#pin || !this.#collisionStyleProp) return;

            /** @type{Record<string, any>} */
            const style = this.#pin?.style ?? {};
            style[this.#collisionStyleProp] = `${this.#startFromTop}px`;
        });

        if (this.#animatePin && !this.#firstTime && this.#pin && this.#spring) {
            this.#spring
                .goFrom({ collision: gap })
                .then(() => {
                    this.#resetPinTransform();
                })
                .catch(() => {});
        }
    }

    /**
     * @returns {void}
     */
    #resetPinTransform() {
        MobCore.useFrame(() => {
            if (!this.#pin) return;

            this.#pin.style.transform = `translate(0px, 0px)`;
        });
    }

    /**
     * @returns {void}
     */
    #resetStyleWhenUnder() {
        this.#resetSpring();

        MobCore.useFrame(() => {
            if (!this.#pin) return;

            this.#pin.style.transition = '';
            this.#pin.style.position = 'relative';
            this.#pin.style.top = ``;
            this.#pin.style.left = ``;
        });
    }

    /**
     * @returns {void}
     */
    #resetStyleWhenOver() {
        this.#resetSpring();

        MobCore.useFrame(() => {
            if (!this.#pin) return;

            this.#pin.style.transition = '';
            this.#pin.style.position = 'relative';

            if (this.#direction === MobScrollerConstant.DIRECTION_VERTICAL) {
                this.#pin.style.left = ``;
                this.#pin.style.top = `${this.#compesateValue}px`;
            } else {
                this.#pin.style.top = ``;
                this.#pin.style.left = `${this.#compesateValue}px`;
            }
        });
    }

    /**
     * @returns {void}
     */
    #setFixedPosition() {
        if (!this.#pin) return;

        const left =
            this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                ? position(this.#pin).left
                : position(this.#pin).top;

        const style =
            this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                ? 'left'
                : 'top';

        MobCore.useFrame(() => {
            if (!this.#pin) return;

            this.#pin.style.position = 'fixed';
            this.#pin.style[style] = `${left}px`;

            /**
             * Frezze pin for two frame so avoid possible visual jump Item stop can stop ain the middle of anticipate
             * step and just after item jump to original position
             */
            this.#justPinned = true;
            this.#afterJustPinned = true;
        });
    }

    /**
     * @returns {object}
     */
    #addPinStyleFromItem() {
        if (!this.#item) return {};

        const compStyles = globalThis.getComputedStyle(this.#item);
        return this.#itemRequireStyleToPin.reduce((p, c) => {
            return { ...p, [c]: compStyles.getPropertyValue(c) };
        }, {});
    }

    /**
     * @returns {object}
     */
    #addStyleToItem() {
        if (!this.#item) return {};

        const compStyles = globalThis.getComputedStyle(this.#item);
        return this.#itemRequireStyleWhenTraspond.reduce((p, c) => {
            return { ...p, [c]: compStyles.getPropertyValue(c) };
        }, {});
    }

    /**
     * @returns {object}
     */
    #removeStyleToItem() {
        return this.#itemRequireStyleWhenTraspond.reduce((p, c) => {
            return { ...p, [c]: '' };
        }, {});
    }

    /**
     * @returns {void}
     */
    #activateTrasponder() {
        if (this.#shoulTranspond) {
            /**
             * Interrogato DOM before rendering, avoid recalculation sryle inside RAF
             */
            const requiredStyleToAdd = this.#addRquiredStyle();
            const pinStyleFromItem = this.#addPinStyleFromItem();
            const styleToAdd = this.#addStyleToItem();

            MobCore.useFrame(() => {
                if (!this.#pin) return;

                Object.assign(this.#pin.style, {
                    ...pinStyleFromItem,
                    ...requiredStyleToAdd,
                });

                if (this.#item) Object.assign(this.#item.style, styleToAdd);

                document.body.append(this.#pin);
            });
        }
    }

    /**
     * @returns {void}
     */
    #deactivateTrasponder() {
        if (!this.#shoulTranspond || !this.#item || !this.#wrapper) return;

        MobCore.useFrame(() => {
            if (!this.#pin) return;

            // @ts-ignore
            Object.assign(this.#item.style, this.#removeStyleToItem());
            this.#wrapper?.append(this.#pin);
        });
    }

    /**
     * @param {number} scrollTop
     * @returns {number}
     */
    #getAnticipate(scrollTop) {
        /**
         * If come just after pin use the last step to avoid glitch If item is pinned too soon
         */
        const step =
            this.#afterJustPinned && this.#afterJustPinnedCounter < 3
                ? this.#lastStep
                : clamp(Math.abs(scrollTop - this.#prevScroll), 0, 250);

        /**
         * Reset afterJustPinned
         */
        if (
            this.#afterJustPinned &&
            this.#afterJustPinnedCounter < this.#numeCycleToFreeze
        ) {
            this.#afterJustPinnedCounter++;
        } else {
            this.#afterJustPinnedCounter = 0;
            this.#afterJustPinned = false;
        }

        /**
         * Cache previous stop
         */
        this.#lastStep = step;
        return step * this.#anticipateFactor;
    }

    /**
     * @param {number} scrollTop
     * @param {string} scrollDirection
     * @returns {{ anticipateBottom: number; anticipateInnerIn: number; anticipateInnerOut: number }}
     */
    #getAnticipateValue(scrollTop, scrollDirection) {
        if (
            (this.#animatePin && !this.#firstTime) ||
            (this.#firstTime && !this.#anticipatePinOnLoad)
        ) {
            return {
                anticipateBottom: 0,
                anticipateInnerIn: 0,
                anticipateInnerOut: 0,
            };
        }

        const anticipate = this.#getAnticipate(scrollTop);
        const anticipateBottom =
            scrollDirection === MobScrollerConstant.SCROLL_UP ? 0 : anticipate;
        const anticipateInnerIn =
            scrollDirection === MobScrollerConstant.SCROLL_UP
                ? 0
                : anticipate * 2;
        const anticipateInnerOut =
            scrollDirection === MobScrollerConstant.SCROLL_UP ? anticipate : 0;

        return {
            anticipateBottom: anticipateBottom,
            anticipateInnerIn: anticipateInnerIn,
            anticipateInnerOut: anticipateInnerOut,
        };
    }

    /**
     * @param {number} scrollTop
     * @param {string} scrollDirection
     * @returns {{ anticipateBottom: number; anticipateInnerIn: number; anticipateInnerOut: number }}
     */
    #getAnticipateValueInverted(scrollTop, scrollDirection) {
        if (
            (this.#animatePin && !this.#firstTime) ||
            (this.#firstTime && !this.#anticipatePinOnLoad)
        ) {
            return {
                anticipateBottom: 0,
                anticipateInnerIn: 0,
                anticipateInnerOut: 0,
            };
        }

        const anticipate = this.#getAnticipate(scrollTop);
        const anticipateBottom =
            scrollDirection === MobScrollerConstant.SCROLL_UP ? anticipate : 0;
        const anticipateInnerIn =
            scrollDirection === MobScrollerConstant.SCROLL_UP
                ? anticipate * 2
                : 0;
        const anticipateInnerOut =
            scrollDirection === MobScrollerConstant.SCROLL_UP ? 0 : anticipate;

        return {
            anticipateBottom: anticipateBottom,
            anticipateInnerIn: anticipateInnerIn,
            anticipateInnerOut: anticipateInnerOut,
        };
    }

    /**
     * @param {number} scrollTop
     */
    onScroll(scrollTop) {
        if (!this.#isInizialized || !this.#wrapper) return;

        /**
         * Skip pin check for 3 scroll if is if just pinned this to prevent glitch if item is pinned too son and user
         * stop scroll too soon
         */
        if (
            this.#justPinned &&
            this.#afterPinCounter < this.#numeCycleToFreeze
        ) {
            this.#afterPinCounter++;
            return;
        } else {
            this.#afterPinCounter = 0;
            this.#justPinned = false;
        }

        const scrollDirection =
            this.#prevScroll > scrollTop
                ? MobScrollerConstant.SCROLL_UP
                : MobScrollerConstant.SCROLL_DOWN;

        /**
         * Set up scroll condition
         */
        const offsetTop =
            this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                ? position(this.#wrapper).top
                : position(this.#wrapper).left;

        /**
         * Get anticipate value
         */
        const { anticipateBottom, anticipateInnerIn, anticipateInnerOut } = this
            .#invertSide
            ? this.#getAnticipateValueInverted(scrollTop, scrollDirection)
            : this.#getAnticipateValue(scrollTop, scrollDirection);

        const bottomCondition = this.#invertSide
            ? offsetTop < this.#start - anticipateBottom
            : offsetTop > this.#scrollerHeight - this.#start + anticipateBottom;

        const innerCondition = this.#invertSide
            ? offsetTop >= this.#start - anticipateInnerIn &&
              offsetTop <= this.#start + anticipateInnerOut + this.#end
            : offsetTop <=
                  this.#scrollerHeight - this.#start + anticipateInnerIn &&
              this.#scrollerHeight - offsetTop <=
                  this.#end + anticipateInnerOut + this.#start;

        if (bottomCondition) {
            if (!this.#isUnder) {
                /**
                 * Reset style
                 */
                this.#resetStyleWhenUnder();
                this.#deactivateTrasponder();

                this.#isUnder = true;
                this.#isInner = false;
                this.#isOver = false;
            }
        } else if (innerCondition) {
            if (!this.#isInner) {
                this.#setFixedPosition();

                const fireSpring =
                    (scrollDirection === MobScrollerConstant.SCROLL_DOWN &&
                        !this.#invertSide) ||
                    (scrollDirection === MobScrollerConstant.SCROLL_UP &&
                        this.#invertSide);

                this.#activateTrasponder();
                if (fireSpring) {
                    this.#animateCollision();
                } else {
                    this.#animateCollisionBack();
                }

                this.#isUnder = false;
                this.#isInner = true;
                this.#isOver = false;
            }
        } else {
            if (!this.#isOver) {
                this.#resetStyleWhenOver();
                this.#deactivateTrasponder();
                this.#isUnder = false;
                this.#isInner = false;
                this.#isOver = true;
            }
        }

        this.#prevScroll = scrollTop;
        this.#firstTime = false;
    }
}
