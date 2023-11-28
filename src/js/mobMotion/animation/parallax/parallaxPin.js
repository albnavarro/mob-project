// @ts-check

import HandleSpring from '../../animation/spring/handleSpring.js';
import { parallaxConstant } from './parallaxConstant.js';
import { position } from '../../../mobCore/utils/index.js';
import { clamp } from '../../animation/utils/animationUtils.js';
import { handleSetUp } from '../../setup.js';
import { mobCore } from '../../../mobCore/index.js';

export class ParallaxPin {
    constructor() {
        /**
         * @type{Object|undefined}
         */
        this.parallaxInstance = undefined;

        /**
         * @type{boolean}
         */
        this.trasponderActive = false;

        /**
         * @type{number}
         */
        this.scrollerHeight = 0;

        /**
         * @type{number}
         */
        this.start = 0;

        /**
         * @type{number}
         */
        this.startFromTop = 0;

        /**
         * @description
         * @type {HTMLElement|Window}
         */
        this.scroller = window;

        /**
         * @type{boolean|undefined}
         */
        this.invertSide = undefined;

        /**
         * @type{number}
         */
        this.end = 0;

        /**
         * @type{string}
         */
        this.orientation = parallaxConstant.DIRECTION_VERTICAL;

        /**
         * @type{number}
         */
        this.compesateValue = 0;

        /**
         * @description
         * @type {HTMLElement|null}
         */
        this.trigger = null;

        /**
         * @description
         * @type {HTMLElement|undefined}
         */
        this.item = undefined;

        /**
         * @description
         * @type {Object|undefined}
         */
        this.spring = undefined;

        /**
         * @description
         * @type {HTMLElement|undefined}
         */
        this.wrapper = undefined;

        /**
         * @description
         * @type {HTMLElement|undefined}
         */
        this.pin = undefined;

        /**
         * @description
         * @type {boolean}
         */
        this.isOver = false;

        /**
         * @description
         * @type {boolean}
         */
        this.isInner = false;

        /**
         * @description
         * @type {boolean}
         */
        this.isUnder = false;

        /**
         * @description
         * @type {Function}
         */
        this.unsubscribeScroll = () => {};

        /**
         * @description
         * @type {Function}
         */
        this.unsubscribeScrollStart = () => {};

        /**
         * @description
         * @type {Function}
         */
        this.unsubscribeSpring = () => {};

        /**
         * @description
         * @type {boolean}
         */
        this.firstTime = true;

        /**
         * @description
         * Item style applied to pin wrapper
         *
         * @type {Array<String>}
         */
        this.itemRequireStyleToWrapper = [
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

        /**
         * @description
         * Item style get and applied itself when transpond
         *
         * @type {Array<String>}
         */
        this.itemRequireStyleWhenTraspond = [
            'font-size',
            'padding',
            'margin',
            'line-height',
            'white-space',
        ];

        /**
         * @description
         * Paerent style to applied to pin
         *
         * @type {Array<String>}
         */
        this.parentRequireStyle = ['text-align'];

        /**
         * @description
         * Item style applied to pin
         *
         * @type {Array<String>}
         */
        this.itemRequireStyleToPin = ['z-index', 'pointer-events'];

        /**
         * @description
         * Parent style that activate transpond
         *
         * @type {Array<String>}
         */
        this.styleToTranspond = [
            'transform',
            'position',
            'translate',
            'rotate',
            'scale',
        ];

        /**
         * @description
         * Skip parent style to activate transpond above with this value
         *
         * @type {Array<String>}
         */
        this.nonRelevantRule = ['none', 'static'];

        /**
         * @description
         * @type {boolean}
         */
        this.isInizialized = false;

        /**
         * @description
         * @type {number}
         */
        this.prevScroll = 0;

        /**
         * @description
         * @type {number}
         */
        this.prevscrollY = 0;

        /**
         * @description
         * @type {boolean}
         */
        this.animatePin = false;

        /**
         * @description
         * @type {number}
         */
        this.anticipateFactor = 1.5;

        /**
         * @description
         * @type {boolean}
         */
        this.forceTranspond = false;

        /**
         * @description
         * @type {boolean}
         */
        this.justPinned = false;

        /**
         * @description
         * @type {number}
         */
        this.afterPinCounter = 0;

        /**
         * @description
         * @type {number}
         */
        this.lastStep = 0;

        /**
         * @description
         * @type {boolean}
         */
        this.afterJustPinned = false;

        /**
         * @description
         * @type {number}
         */
        this.afterJustPinnedCounter = 0;

        /**
         * @description
         * @type {number}
         */
        this.numeCycleToFreeze = 3;
    }

    init({ instance }) {
        this.parallaxInstance = instance;
        this.item = instance.item;
        this.marker = instance.marker;
        this.trigger = instance.trigger || instance.item;
        this.scroller = instance.scroller;
        this.screen = instance.screen;
        this.animatePin = instance.animatePin;
        this.anticipatePinOnLoad = instance.anticipatePinOnLoad;
        this.forceTranspond = instance.forceTranspond;
        this.invertSide = instance.invertSide;
        this.orientation = instance.direction;
        this.prevscrollY = window.pageYOffset;
        this.scrollerHeight = instance.scrollerHeight;
        this.refreshCollisionPoint();
        this.collisionTranslateProp =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? 'Y'
                : 'X';

        this.collisionStyleProp =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? 'top'
                : 'left';
        this.isInizialized = true;
        this.firstTime = true;

        this.createPin();
        this.addStyleFromPinToWrapper();
        this.setPinSize();
        this.setUpMotion();

        /**
         * Update pix top position when use custom screen ad scroll outside on window
         */
        this.unsubscribeScrollStart = mobCore.useScrollStart(() => {
            if (!this.isInizialized) return;

            if (this.screen !== window && this.isInner && this.pin) {
                const cb = () => {
                    if (this.pin)
                        this.pin.style.transition = `transform .85s cubic-bezier(0, 0.68, 0.45, 1.1)`;
                };

                mobCore.useFrame(() => {
                    cb();
                });
            }
        });

        this.unsubscribeScroll = mobCore.useScroll(({ scrollY }) => {
            if (!this.isInizialized) return;

            if (this.screen !== window) {
                if (this.orientation === parallaxConstant.DIRECTION_VERTICAL) {
                    this.refreshCollisionPoint();
                }

                const gap = scrollY - this.prevscrollY;
                this.prevscrollY = scrollY;

                if (this.isInner && this.pin) {
                    const { verticalGap } = this.spring.get();
                    const translateValue = verticalGap - gap;

                    /**
                     * No need animation update data and apply style directly
                     */
                    this.spring.setData({
                        collision: 0,
                        verticalGap: translateValue,
                    });

                    mobCore.useFrame(() => {
                        if (this.pin)
                            this.pin.style.transform = `translate(0px,${translateValue}px)`;
                    });
                }
            }
        });
    }

    setUpMotion() {
        this.spring = new HandleSpring({
            data: { collision: 0, verticalGap: 0 },
            config: 'wobbly',
        });

        this.unsubscribeSpring = this.spring.subscribe(
            ({ collision, verticalGap }) => {
                if (
                    this.orientation === parallaxConstant.DIRECTION_VERTICAL &&
                    this.pin
                ) {
                    /**
                     * In vertical mode gap to translate when pin is in fixed position
                     * on window scroll is the same of collision
                     * The same axis reset the two prop
                     */
                    this.pin.style.transform = `translate(0px, ${collision}px)`;
                } else if (this.pin) {
                    this.pin.style.transform = `translate(${collision}px, ${verticalGap}px)`;
                }
            }
        );
    }

    resetSpring() {
        if (this.pin)
            this.spring.set({ collision: 0, verticalGap: 0 }).catch(() => {});
    }

    createPin() {
        if (!this.item) this.item = document.createElement('div');

        /**
         * Wrap pin element
         * pin-wrapper , use to cache potion into dom flow when pin go to fixed
         */
        const wrapper = document.createElement('div');
        wrapper.classList.add('pin-wrapper');

        /**
         * Pin wrap that go to fixed pos
         */
        const pin = document.createElement('div');
        pin.classList.add('pin');
        wrapper.append(pin);
        const parentNode = this.item?.parentNode;

        if (parentNode) parentNode.insertBefore(wrapper, this.item);

        // @ts-ignore
        pin.append(this.item);

        // @ts-ignore
        this.wrapper = this.item.closest('.pin-wrapper');

        // @ts-ignore
        this.pin = this.item.closest('.pin');

        /**
         * Get style from parent and add to pin, es text-align
         */
        const requiredStyleToadd = this.addRquiredStyle();

        /**
         * Get style from iem and add to pin, es z-index
         */
        const pinStyleFromItem = this.addPinStyleFromItem();

        const wrapperStyle = (() => {
            if (!this.marker) return {};

            const borderColor =
                handleSetUp.get('scrollTrigger')?.markerColor?.item ||
                '#14df3b';
            const borderStyle = `3px ${borderColor} solid`;

            if (this.orientation === parallaxConstant.DIRECTION_VERTICAL) {
                return this.invertSide
                    ? { borderBottom: borderStyle }
                    : { borderTop: borderStyle };
            } else {
                return this.invertSide
                    ? { borderRight: borderStyle }
                    : { borderLeft: borderStyle };
            }
        })();

        /**
         * Add display table to avoid margin problem inside
         */
        const display = { display: 'table' };

        mobCore.useFrame(() => {
            if (!this.pin || !this.wrapper) return;

            Object.assign(this.wrapper.style, { ...wrapperStyle });

            Object.assign(this.pin.style, {
                ...display,
                ...pinStyleFromItem,
                ...requiredStyleToadd,
            });
        });

        this.checkIfShouldTranspond();
    }

    setPinSize() {
        const cb = () => {
            if (!this.pin || !this.wrapper) return;
            const height = this.wrapper.offsetHeight;
            const width = this.wrapper.offsetWidth;
            this.wrapper.style.height = `${height}px`;
            this.wrapper.style.width = `${width}px`;
            this.pin.style.height = `${height}px`;
            this.pin.style.width = `${width}px`;
        };

        /*
        Firse time ww don't use raf to apply basic
        misureimmediatly on component creation
        Otherwise we can have some wrong calculation after
        */
        cb();
    }

    /**
     * @description
     * Get style from item and apply to wrapper ( es: flex)
     */
    addStyleFromPinToWrapper() {
        if (!this.item) return;

        const compStyles = window.getComputedStyle(this.item);
        const style = this.itemRequireStyleToWrapper.reduce((p, c) => {
            return { ...p, [c]: compStyles.getPropertyValue(c) };
        }, {});

        mobCore.useFrame(() => {
            if (!this.wrapper) return;
            Object.assign(this.wrapper.style, style);
        });
    }

    /**
     * @param {HTMLElement} target
     * @param {string} rule
     *
     * @returns {object|undefined}
     */
    findStyle(target, rule) {
        let node = target.parentNode;
        if (!node) return;

        while (node !== null && node !== document) {
            // @ts-ignore
            const style = getComputedStyle(node);

            if (style[rule] && !this.nonRelevantRule.includes(style[rule])) {
                return { [rule]: style[rule] };
            }
            node = node.parentNode;
        }

        return;
    }

    /**
     * @returns {object}
     */
    addRquiredStyle() {
        if (!this.pin) return {};

        return this.parentRequireStyle
            .map((item) => {
                // @ts-ignore
                return this.findStyle(this.pin, item);
            })
            .filter((item) => item !== null)
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});
    }

    /**
     * @returns {void}
     */
    checkIfShouldTranspond() {
        if (this.forceTranspond) {
            this.shoulTranspond = true;
            return;
        }

        this.shoulTranspond = this.styleToTranspond
            .map((item) => {
                // @ts-ignore
                const style = this.findStyle(this.wrapper, item);
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
    refreshCollisionPoint() {
        this.start = this.parallaxInstance.startPoint;

        /**
         * Update start position when use custom screen ad scroll outside on window
         */
        if (this.screen !== window) {
            this.start -=
                this.parallaxInstance.direction ===
                parallaxConstant.DIRECTION_VERTICAL
                    ? position(this.screen).top
                    : position(this.screen).left;
        }

        this.startFromTop = this.invertSide
            ? this.start
            : this.scrollerHeight - this.start;
        this.end = this.parallaxInstance.endPoint;
        this.compesateValue = this.invertSide
            ? -Math.trunc(this.end)
            : Math.trunc(this.end);
    }

    /**
     * @returns {void}
     */
    destroy() {
        if (!this.isInizialized) return;

        this.parallaxInstance = null;
        this.spring.stop();
        this.unsubscribeSpring();
        this.unsubscribeScroll();
        this.unsubscribeScrollStart();
        this.spring.destroy();
        this.spring = null;
        this.afterPinCounter = 0;
        this.justPinned = false;
        this.isUnder = false;
        this.isInner = false;
        this.isOver = false;

        if (this.pin && this.wrapper) {
            // @ts-ignore
            this.wrapper.parentNode?.insertBefore(this.item, this.wrapper);
            this.pin.remove();
            this.wrapper.remove();
            this.wrapper = undefined;
            this.pin = undefined;
            this.isInizialized = false;
        }
    }

    /**
     * @returns {number}
     */
    getGap() {
        if (!this.wrapper) return 0;

        return this.orientation === parallaxConstant.DIRECTION_VERTICAL
            ? position(this.wrapper).top - this.startFromTop
            : position(this.wrapper).left - this.startFromTop;
    }

    /**
     * @returns {void}
     */
    animateCollision() {
        const gap = this.getGap();
        this.tween(gap);
    }

    /**
     * @returns {void}
     */
    animateCollisionBack() {
        const gap = this.invertSide
            ? this.getGap() - this.end
            : this.getGap() + this.end;

        this.tween(gap);
    }

    /**
     * @param {number} gap
     */
    tween(gap) {
        const cb = () => {
            if (!this.pin || !this.collisionStyleProp) return;

            this.pin.style[this.collisionStyleProp] = `${this.startFromTop}px`;
        };

        mobCore.useFrame(() => cb());

        if (this.animatePin && !this.firstTime && this.pin) {
            this.spring
                .goFrom({ collision: gap })
                .then(() => {
                    this.resetPinTransform();
                })
                .catch(() => {});
        }
    }

    /**
     * @returns {void}
     */
    resetPinTransform() {
        const cb = () => {
            if (!this.pin) return;

            this.pin.style.transform = `translate(0px, 0px)`;
        };

        mobCore.useFrame(() => {
            cb();
        });
    }

    /**
     * @returns {void}
     */
    resetStyleWhenUnder() {
        this.resetSpring();
        const cb = () => {
            if (!this.pin) return;

            this.pin.style.transition = '';
            this.pin.style.position = 'relative';
            this.pin.style.top = ``;
            this.pin.style.left = ``;
        };

        mobCore.useFrame(() => {
            cb();
        });
    }

    /**
     * @returns {void}
     */
    resetStyleWhenOver() {
        this.resetSpring();

        const cb = () => {
            if (!this.pin) return;

            this.pin.style.transition = '';
            this.pin.style.position = 'relative';

            if (this.orientation === parallaxConstant.DIRECTION_VERTICAL) {
                this.pin.style.left = ``;
                this.pin.style.top = `${this.compesateValue}px`;
            } else {
                this.pin.style.top = ``;
                this.pin.style.left = `${this.compesateValue}px`;
            }
        };

        mobCore.useFrame(() => {
            cb();
        });
    }

    /**
     * @returns {void}
     */
    setFixedPosition() {
        if (!this.pin) return;

        const left =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? position(this.pin).left
                : position(this.pin).top;

        const style =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? 'left'
                : 'top';

        const cb = () => {
            if (!this.pin) return;

            this.pin.style.position = 'fixed';
            this.pin.style[style] = `${left}px`;

            /**
             * Frezze pin for two frame so avoid possible visual jump
             * Item stop can stop ain the middle of anticipate step
             * and just after item jump to original position
             */
            this.justPinned = true;
            this.afterJustPinned = true;
        };

        mobCore.useFrame(() => {
            cb();
        });
    }

    /**
     * @returns {object}
     */
    addPinStyleFromItem() {
        if (!this.item) return {};

        const compStyles = window.getComputedStyle(this.item);
        return this.itemRequireStyleToPin.reduce((p, c) => {
            return { ...p, [c]: compStyles.getPropertyValue(c) };
        }, {});
    }

    /**
     * @returns {object}
     */
    addStyleToItem() {
        if (!this.item) return {};

        const compStyles = window.getComputedStyle(this.item);
        return this.itemRequireStyleWhenTraspond.reduce((p, c) => {
            return { ...p, [c]: compStyles.getPropertyValue(c) };
        }, {});
    }

    /**
     * @returns {object}
     */
    removeStyleToItem() {
        return this.itemRequireStyleWhenTraspond.reduce((p, c) => {
            return { ...p, [c]: '' };
        }, {});
    }

    /**
     * @returns {void}
     */
    activateTrasponder() {
        if (this.shoulTranspond) {
            /**
             * Interrogato DOM before rendering, avoid recalculation sryle inside RAF
             */
            const requiredStyleToAdd = this.addRquiredStyle();
            const pinStyleFromItem = this.addPinStyleFromItem();
            const styleToAdd = this.addStyleToItem();

            const cb = () => {
                if (!this.pin) return;

                Object.assign(this.pin.style, {
                    ...pinStyleFromItem,
                    ...requiredStyleToAdd,
                });

                if (this.item) Object.assign(this.item.style, styleToAdd);

                document.body.append(this.pin);
            };

            mobCore.useFrame(() => {
                cb();
            });

            this.trasponderActive = true;
        }
    }

    /**
     * @returns {void}
     */
    deactivateTrasponder() {
        if (!this.shoulTranspond || !this.item || !this.wrapper) return;

        const cb = () => {
            if (!this.pin) return;

            // @ts-ignore
            Object.assign(this.item.style, this.removeStyleToItem());
            this.wrapper?.append(this.pin);
        };

        mobCore.useFrame(() => {
            cb();
        });

        this.trasponderActive = false;
    }

    /**
     * @param {number} scrollTop
     *
     * @returns {number}
     */
    getAnticipate(scrollTop) {
        /**
         * If come just after pin use the last step to avoid glitch
         * If item is pinned too soon
         */
        const step =
            this.afterJustPinned && this.afterJustPinnedCounter < 3
                ? this.lastStep
                : clamp(Math.abs(scrollTop - this.prevScroll), 0, 250);

        /**
         * Reset afterJustPinned
         */
        if (
            this.afterJustPinned &&
            this.afterJustPinnedCounter < this.numeCycleToFreeze
        ) {
            this.afterJustPinnedCounter++;
        } else {
            this.afterJustPinnedCounter = 0;
            this.afterJustPinned = false;
        }

        /**
         * Cache previous stop
         */
        this.lastStep = step;
        return step * this.anticipateFactor;
    }

    /**
     * @param {number} scrollTop
     * @param {string} scrollDirection
     *
     * @returns {{anticipateBottom:number,anticipateInnerIn:number,anticipateInnerOut:number}}
     */
    getAnticipateValue(scrollTop, scrollDirection) {
        if (
            (this.animatePin && !this.firstTime) ||
            (this.firstTime && !this.anticipatePinOnLoad)
        ) {
            return {
                anticipateBottom: 0,
                anticipateInnerIn: 0,
                anticipateInnerOut: 0,
            };
        }

        const anticipate = this.getAnticipate(scrollTop);
        const anticipateBottom =
            scrollDirection === parallaxConstant.SCROLL_UP ? 0 : anticipate;
        const anticipateInnerIn =
            scrollDirection === parallaxConstant.SCROLL_UP ? 0 : anticipate * 2;
        const anticipateInnerOut =
            scrollDirection === parallaxConstant.SCROLL_UP ? anticipate : 0;

        return {
            anticipateBottom: anticipateBottom,
            anticipateInnerIn: anticipateInnerIn,
            anticipateInnerOut: anticipateInnerOut,
        };
    }

    /**
     * @param {number} scrollTop
     * @param {string} scrollDirection
     *
     * @returns {{anticipateBottom:number,anticipateInnerIn:number,anticipateInnerOut:number}}
     */
    getAnticipateValueInverted(scrollTop, scrollDirection) {
        if (
            (this.animatePin && !this.firstTime) ||
            (this.firstTime && !this.anticipatePinOnLoad)
        ) {
            return {
                anticipateBottom: 0,
                anticipateInnerIn: 0,
                anticipateInnerOut: 0,
            };
        }

        const anticipate = this.getAnticipate(scrollTop);
        const anticipateBottom =
            scrollDirection === parallaxConstant.SCROLL_UP ? anticipate : 0;
        const anticipateInnerIn =
            scrollDirection === parallaxConstant.SCROLL_UP ? anticipate * 2 : 0;
        const anticipateInnerOut =
            scrollDirection === parallaxConstant.SCROLL_UP ? 0 : anticipate;

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
        if (!this.isInizialized || !this.wrapper) return;

        /**
         * Skip pin check for 3 scroll if is if just pinned
         * this to prevent glitch if item is pinned too son and user stop scroll too soon
         */
        if (this.justPinned && this.afterPinCounter < this.numeCycleToFreeze) {
            this.afterPinCounter++;
            return;
        } else {
            this.afterPinCounter = 0;
            this.justPinned = false;
        }

        const scrollDirection =
            this.prevScroll > scrollTop
                ? parallaxConstant.SCROLL_UP
                : parallaxConstant.SCROLL_DOWN;

        /**
         * Set up scroll condition
         */
        const offsetTop =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? position(this.wrapper).top
                : position(this.wrapper).left;

        /**
         * Get anticipate value
         */
        const { anticipateBottom, anticipateInnerIn, anticipateInnerOut } = this
            .invertSide
            ? this.getAnticipateValueInverted(scrollTop, scrollDirection)
            : this.getAnticipateValue(scrollTop, scrollDirection);

        const bottomCondition = this.invertSide
            ? offsetTop < this.start - anticipateBottom
            : offsetTop > this.scrollerHeight - this.start + anticipateBottom;

        const innerCondition = this.invertSide
            ? offsetTop >= this.start - anticipateInnerIn &&
              offsetTop <= this.start + anticipateInnerOut + this.end
            : offsetTop <=
                  this.scrollerHeight - this.start + anticipateInnerIn &&
              this.scrollerHeight - offsetTop <=
                  this.end + anticipateInnerOut + this.start;

        if (bottomCondition) {
            if (!this.isUnder) {
                /**
                 * Reset style
                 */
                this.resetStyleWhenUnder();
                this.deactivateTrasponder();

                this.isUnder = true;
                this.isInner = false;
                this.isOver = false;
            }
        } else if (innerCondition) {
            if (!this.isInner) {
                this.setFixedPosition();

                const fireSpring =
                    (scrollDirection === parallaxConstant.SCROLL_DOWN &&
                        !this.invertSide) ||
                    (scrollDirection === parallaxConstant.SCROLL_UP &&
                        this.invertSide);

                this.activateTrasponder();
                if (fireSpring) {
                    this.animateCollision();
                } else {
                    this.animateCollisionBack();
                }

                this.isUnder = false;
                this.isInner = true;
                this.isOver = false;
            }
        } else {
            if (!this.isOver) {
                this.resetStyleWhenOver();
                this.deactivateTrasponder();
                this.isUnder = false;
                this.isInner = false;
                this.isOver = true;
            }
        }

        this.prevScroll = scrollTop;
        this.firstTime = false;
    }
}
