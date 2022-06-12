import { handleSpring } from '.../../../js/core/animation/spring/handleSpring.js';
import { handleFrame } from '.../../../js/core/events/rafutils/rafUtils.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxUtils } from './parallaxUtils.js';
import { position } from '../../../js/core/utils/vanillaFunction.js';
import { handleScroll } from '.../../../js/core/events/scrollUtils/handleScroll.js';
import { handleScrollStart } from '.../../../js/core/events/scrollUtils/handleScrollUtils.js';
import { getTranslateValues } from '../../../js/core/utils/vanillaFunction.js';
import { clamp } from '.../../../js/core/animation/utils/animationUtils.js';

export class ParallaxPin {
    constructor(data) {
        this.parallaxInstance = data.instance;
        this.trasponderActive = false;
        this.scrollerHeight = 0;
        this.start = 0;
        this.startFromTop = 0;
        this.scroller = window;
        this.invertSide = null;
        this.end = 0;
        this.orientation = parallaxConstant.DIRECTION_VERTICAL;
        this.compesateValue = 0;
        this.trigger = null;
        this.item = null;
        this.spring = null;
        this.wrapper = null;
        this.pin = null;
        this.isOver = false;
        this.isInner = false;
        this.isUnder = false;
        this.unsubscribeScroll = () => {};
        this.unsubscribeScrollStart = () => {};
        this.unsubscribeSpring = () => {};
        this.firstTime = true;

        // Item style applied to pin wrapper
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

        // Item style get and applied itself when transpond
        this.itemRequireStyleWhenTraspond = [
            'font-size',
            'padding',
            'margin',
            'line-height',
            'white-space',
        ];

        // Paerent style to applied to pin
        this.parentRequireStyle = ['text-align'];

        // Item style applied to pin
        this.itemRequireStyleToPin = ['z-index'];

        // Parent style that activate transpond
        this.styleToTranspond = ['transform', 'position'];

        // Skip parent style to activate transpond above with this value
        this.nonRelevantRule = ['none', 'static'];

        this.isInizialized = false;
        this.prevScroll = 0;
        this.animatePin = false;

        this.anticipateFactor = 1.5;
        this.forceTranspond = false;

        this.justPinned = false;
        this.afterPinCounter = 0;
        this.lastStep = 0;
        this.afterJustPinned = false;
        this.afterJustPinnedCounter = 0;
        this.numeCycleToFreeze = 3;

        /*
        Obj utils to avoid new GC allocation during animation
        Try to reduce the GC timing
        Support caluculation in each frame
        */
        this.GC = {
            step: null,
            anticipate: null,
            anticipateBottom: null,
            anticipateInnerIn: null,
            anticipateInnerOut: null,
            scrollDirection: null,
            offsetTop: null,
            bottomCondition: null,
            innerCondition: null,
        };
    }

    init() {
        // Get baisc element item ad if exist trigger
        this.item = this.parallaxInstance.item;
        this.marker = this.parallaxInstance.marker;
        this.trigger =
            this.parallaxInstance.trigger || this.parallaxInstance.item;
        this.scroller = this.parallaxInstance.scroller;
        this.screen = this.parallaxInstance.screen;
        this.animatePin = this.parallaxInstance.animatePin;
        this.anticipatePinOnLoad = this.parallaxInstance.anticipatePinOnLoad;
        this.forceTranspond = this.parallaxInstance.forceTranspond;
        this.invertSide = this.parallaxInstance.invertSide;
        this.orientation = this.parallaxInstance.direction;
        this.prevscrollY = window.pageYOffset;
        this.scrollerHeight = this.parallaxInstance.scrollerHeight;
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

        // Update pix top position when use custom screen ad scroll outside on window
        this.unsubscribeScrollStart = handleScrollStart(() => {
            if (!this.isInizialized) return;

            if (this.screen !== window && this.isInner && this.pin) {
                const cb = () => {
                    this.pin.style.transition = `transform .85s cubic-bezier(0, 0.68, 0.45, 1.1)`;
                };

                handleFrame.add(() => {
                    cb();
                });
            }
        });

        this.unsubscribeScroll = handleScroll(({ scrollY }) => {
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

                    // No need animation update data and apply style directly
                    this.spring.setData({
                        collision: 0,
                        verticalGap: translateValue,
                    });

                    handleFrame.add(() => {
                        this.pin.style.transform = `translate(0px,${translateValue}px)`;
                    });
                }
            }
        });
    }

    setUpMotion() {
        this.spring = new handleSpring('wobbly');
        this.spring.setData({ collision: 0, verticalGap: 0 });

        this.unsubscribeSpring = this.spring.subscribe(
            ({ collision, verticalGap }) => {
                if (
                    this.orientation === parallaxConstant.DIRECTION_VERTICAL &&
                    this.pin !== null
                ) {
                    // In vertical mode gap to translate when pin is in fixed position
                    // on window scroll is the same of collision
                    // The same axis reset the two prop
                    this.pin.style.transform = `translate(0px, ${collision}px)`;
                } else if (this.pin !== null) {
                    this.pin.style.transform = `translate(${collision}px, ${verticalGap}px)`;
                }
            }
        );
    }

    resetSpring() {
        if (this.pin)
            this.spring
                .set({ collision: 0, verticalGap: 0 })
                .catch((err) => {});
    }

    createPin() {
        // Wrap pin element
        // pin-wrapper , use to cache potion into dom flow when pin go to fixed
        const wrapper = document.createElement('div');
        wrapper.classList.add('pin-wrapper');
        // pin wrap that go to fixed pos
        const pin = document.createElement('div');
        pin.classList.add('pin');
        wrapper.appendChild(pin);
        this.item.parentNode.insertBefore(wrapper, this.item);
        pin.appendChild(this.item);
        this.wrapper = this.item.closest('.pin-wrapper');
        this.pin = this.item.closest('.pin');

        // get style from parent and add to pin, es text-align
        const requiredStyleToadd = this.addRquiredStyle();

        // get style from iem and add to pin, es z-index
        const pinStyleFromItem = this.addPinStyleFromItem();

        const wrapperStyle = (() => {
            if (!this.marker) return {};

            if (this.orientation === parallaxConstant.DIRECTION_VERTICAL) {
                return this.invertSide
                    ? {
                          borderBottom: '1px green solid',
                      }
                    : {
                          borderTop: '1px green solid',
                      };
            } else {
                return this.invertSide
                    ? {
                          borderRight: '1px green solid',
                      }
                    : {
                          borderLeft: '1px green solid',
                      };
            }
        })();

        // Add disply table to avoid margin problem inside
        const display = { display: 'table' };

        handleFrame.add(() => {
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
        Otherwise we can have some wron calculation after
        */
        cb();
    }

    // Get style fomr item and apply to wrapper ( es: flex)
    addStyleFromPinToWrapper() {
        const compStyles = window.getComputedStyle(this.item);
        const style = this.itemRequireStyleToWrapper.reduce((p, c) => {
            return { ...p, ...{ [c]: compStyles.getPropertyValue(c) } };
        }, {});

        handleFrame.add(() => {
            if (!this.wrapper) return;
            Object.assign(this.wrapper.style, style);
        });
    }

    findStyle(target, rule) {
        let node = target.parentNode;

        while (node != null && node !== document) {
            const style = getComputedStyle(node);
            if (style[rule] && !this.nonRelevantRule.includes(style[rule])) {
                return { [rule]: style[rule] };
            }
            node = node.parentNode;
        }
        return null;
    }

    addRquiredStyle() {
        return this.parentRequireStyle
            .map((item) => {
                return this.findStyle(this.pin, item);
            })
            .filter((item) => item !== null)
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});
    }

    checkIfShouldTranspond() {
        if (this.forceTranspond) {
            this.shoulTranspond = true;
            return;
        }

        this.shoulTranspond = this.styleToTranspond
            .map((item) => {
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
            .some((item) => item === true);
    }

    refreshCollisionPoint() {
        this.start = this.parallaxInstance.startPoint;

        // Update start position when use custom screen ad scroll outside on window
        if (this.screen !== window) {
            if (
                this.parallaxInstance.direction ===
                parallaxConstant.DIRECTION_VERTICAL
            ) {
                this.start -= position(this.screen).top;
            } else {
                this.start -= position(this.screen).left;
            }
        }

        this.startFromTop = this.invertSide
            ? this.start
            : this.scrollerHeight - this.start;
        this.end = this.parallaxInstance.endPoint;
        this.compesateValue = this.invertSide
            ? -parseInt(this.end)
            : parseInt(this.end);
    }

    destroy() {
        if (!this.isInizialized) return;

        this.spring.stop();
        this.unsubscribeSpring();
        this.unsubscribeScroll();
        this.unsubscribeScrollStart();
        this.spring = null;
        this.afterPinCounter = 0;
        this.justPinned = false;
        this.isUnder = false;
        this.isInner = false;
        this.isOver = false;

        if (this.pin && this.wrapper) {
            this.wrapper.parentNode.insertBefore(this.item, this.wrapper);
            this.pin.remove();
            this.wrapper.remove();
            this.wrapper = null;
            this.pin = null;
            this.isInizialized = false;
        }
    }

    getGap() {
        return this.orientation === parallaxConstant.DIRECTION_VERTICAL
            ? position(this.wrapper).top - this.startFromTop
            : position(this.wrapper).left - this.startFromTop;
    }

    animateCollision() {
        const gap = this.getGap();
        this.tween(gap);
    }

    animateCollisionBack() {
        const gap = this.invertSide
            ? this.getGap() - this.end
            : this.getGap() + this.end;

        this.tween(gap);
    }

    tween(gap) {
        const cb = () => {
            if (!this.pin) return;
            this.pin.style[this.collisionStyleProp] = `${this.startFromTop}px`;
        };

        handleFrame.add(() => {
            cb();
        });

        if (this.animatePin && this.pin) {
            this.spring
                .goFrom({ collision: gap })
                .then(() => {
                    this.resetPinTransform();
                })
                .catch((err) => {});
        }
    }

    resetPinTransform() {
        const cb = () => {
            if (!this.pin) return;

            this.pin.style.transform = `translate(0px, 0px)`;
        };

        handleFrame.add(() => {
            cb();
        });
    }

    resetStyleWhenUnder() {
        this.resetSpring();
        const cb = () => {
            if (!this.pin) return;

            this.pin.style.transition = '';
            this.pin.style.position = 'relative';
            this.pin.style.top = ``;
            this.pin.style.left = ``;
        };

        handleFrame.add(() => {
            cb();
        });
    }

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

        handleFrame.add(() => {
            cb();
        });
    }

    setFixedPosition() {
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

            // Frezze pin for two frame so avoid possible visual jump
            // Item stop can stop ain the middle of anticipate step
            // and just after item jump to original position
            this.justPinned = true;
            this.afterJustPinned = true;
        };

        handleFrame.add(() => {
            cb();
        });
    }

    addPinStyleFromItem() {
        const compStyles = window.getComputedStyle(this.item);
        return this.itemRequireStyleToPin.reduce((p, c) => {
            return { ...p, ...{ [c]: compStyles.getPropertyValue(c) } };
        }, {});
    }

    addStyleToItem() {
        const compStyles = window.getComputedStyle(this.item);
        return this.itemRequireStyleWhenTraspond.reduce((p, c) => {
            return { ...p, ...{ [c]: compStyles.getPropertyValue(c) } };
        }, {});
    }

    removeStyleToItem() {
        return this.itemRequireStyleWhenTraspond.reduce((p, c) => {
            return { ...p, ...{ [c]: '' } };
        }, {});
    }

    activateTrasponder() {
        if (this.shoulTranspond) {
            // Interrogato DOM before rendering, avoid recalculation sryle inside RAF
            const requiredStyleToAdd = this.addRquiredStyle();
            const pinStyleFromItem = this.addPinStyleFromItem();
            const styleToAdd = this.addStyleToItem();

            const cb = () => {
                if (!this.pin) return;

                Object.assign(this.pin.style, {
                    ...pinStyleFromItem,
                    ...requiredStyleToAdd,
                });
                Object.assign(this.item.style, styleToAdd);
                document.body.appendChild(this.pin);
            };

            handleFrame.add(() => {
                cb();
            });

            this.trasponderActive = true;
        }
    }

    deactivateTrasponder() {
        if (this.shoulTranspond) {
            const cb = () => {
                if (!this.pin) return;

                Object.assign(this.item.style, this.removeStyleToItem());
                this.wrapper.appendChild(this.pin);
            };

            handleFrame.add(() => {
                cb();
            });

            this.trasponderActive = false;
        }
    }

    getAnticipate(scrollTop) {
        // if come just after pin use the last step to avoid glitch
        // if item is pinned too soon
        this.GC.step =
            this.afterJustPinned && this.afterJustPinnedCounter < 3
                ? this.lastStep
                : clamp(Math.abs(scrollTop - this.prevScroll), 0, 250);

        // Reset afterJustPinned
        if (
            this.afterJustPinned &&
            this.afterJustPinnedCounter < this.numeCycleToFreeze
        ) {
            this.afterJustPinnedCounter++;
        } else {
            this.afterJustPinnedCounter = 0;
            this.afterJustPinned = false;
        }

        // Cache previouse stop
        this.lastStep = this.GC.step;

        return this.GC.step * this.anticipateFactor;
    }

    getAnticipateValue(scrollTop, scrollDirection) {
        if (this.animatePin || (this.firstTime && !this.anticipatePinOnLoad)) {
            return {
                anticipateBottom: 0,
                anticipateInnerIn: 0,
                anticipateInnerOut: 0,
            };
        }

        this.GC.anticipate = this.getAnticipate(scrollTop);
        this.GC.anticipateBottom =
            scrollDirection === parallaxConstant.SCROLL_UP
                ? 0
                : this.GC.anticipate;
        this.GC.anticipateInnerIn =
            scrollDirection === parallaxConstant.SCROLL_UP
                ? 0
                : this.GC.anticipate * 2;
        this.GC.anticipateInnerOut =
            scrollDirection === parallaxConstant.SCROLL_UP
                ? this.GC.anticipate
                : 0;

        return {
            anticipateBottom: this.GC.anticipateBottom,
            anticipateInnerIn: this.GC.anticipateInnerIn,
            anticipateInnerOut: this.GC.anticipateInnerOut,
        };
    }

    getAnticipateValueInverted(scrollTop, scrollDirection) {
        if (this.animatePin || (this.firstTime && !this.anticipatePinOnLoad)) {
            return {
                anticipateBottom: 0,
                anticipateInnerIn: 0,
                anticipateInnerOut: 0,
            };
        }

        this.GC.anticipate = this.getAnticipate(scrollTop);
        this.GC.anticipateBottom =
            scrollDirection === parallaxConstant.SCROLL_UP
                ? this.GC.anticipate
                : 0;
        this.GC.anticipateInnerIn =
            scrollDirection === parallaxConstant.SCROLL_UP
                ? this.GC.anticipate * 2
                : 0;
        this.GC.anticipateInnerOut =
            scrollDirection === parallaxConstant.SCROLL_UP
                ? 0
                : this.GC.anticipate;

        return {
            anticipateBottom: this.GC.anticipateBottom,
            anticipateInnerIn: this.GC.anticipateInnerIn,
            anticipateInnerOut: this.GC.anticipateInnerOut,
        };
    }

    onScroll(scrollTop) {
        if (!this.isInizialized) return;

        // Skip pin check for 3 scroll if is if just pinned
        // this to prevent glitch if item is pinned too son and user stop scroll too soon
        if (this.justPinned && this.afterPinCounter < this.numeCycleToFreeze) {
            this.afterPinCounter++;
            return;
        } else {
            this.afterPinCounter = 0;
            this.justPinned = false;
        }

        this.GC.scrollDirection =
            this.prevScroll > scrollTop
                ? parallaxConstant.SCROLL_UP
                : parallaxConstant.SCROLL_DOWN;

        // Set up scroll condition
        this.GC.offsetTop =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? position(this.wrapper).top
                : position(this.wrapper).left;

        // Get anticipate value
        const {
            anticipateBottom,
            anticipateInnerIn,
            anticipateInnerOut,
        } = !this.invertSide
            ? this.getAnticipateValue(scrollTop, this.GC.scrollDirection)
            : this.getAnticipateValueInverted(
                  scrollTop,
                  this.GC.scrollDirection
              );

        this.GC.bottomCondition = !this.invertSide
            ? this.GC.offsetTop >
              this.scrollerHeight - this.start + anticipateBottom
            : this.GC.offsetTop < this.start - anticipateBottom;

        this.GC.innerCondition = !this.invertSide
            ? this.GC.offsetTop <=
                  this.scrollerHeight - this.start + anticipateInnerIn &&
              this.scrollerHeight - this.GC.offsetTop <=
                  this.end + anticipateInnerOut + this.start
            : this.GC.offsetTop >= this.start - anticipateInnerIn &&
              this.GC.offsetTop <= this.start + anticipateInnerOut + this.end;

        if (this.GC.bottomCondition) {
            if (!this.isUnder) {
                // Reset style
                this.resetStyleWhenUnder();
                this.deactivateTrasponder();

                this.isUnder = true;
                this.isInner = false;
                this.isOver = false;
            }
        } else if (this.GC.innerCondition) {
            if (!this.isInner) {
                this.setFixedPosition();

                const fireSpring =
                    (this.GC.scrollDirection === parallaxConstant.SCROLL_DOWN &&
                        !this.invertSide) ||
                    (this.GC.scrollDirection === parallaxConstant.SCROLL_UP &&
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
