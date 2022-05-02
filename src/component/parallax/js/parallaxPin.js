import { handleSpring } from '.../../../js/core/animation/spring/handleSpring.js';
import { handleFrame } from '.../../../js/core/events/rafutils/rafUtils.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxUtils } from './parallaxUtils.js';
import { position } from '../../../js/core/utils/vanillaFunction.js';
import { handleScroll } from '.../../../js/core/events/scrollUtils/handleScroll.js';
import { handleScrollStart } from '.../../../js/core/events/scrollUtils/handleScrollUtils.js';
import { getTranslateValues } from '../../../js/core/utils/vanillaFunction.js';

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
        this.pippo = 0;
        this.orientation = parallaxConstant.DIRECTION_VERTICAL;
        this.compesateValue = 0;
        this.trigger = null;
        this.item = null;
        this.spring = null;
        this.springIsRunning = false;
        this.wrapper = null;
        this.pin = null;
        this.isOver = false;
        this.isInner = false;
        this.isUnder = false;
        this.lastPosition = 0;
        this.lastTop = 0;
        this.lastLeft = 0;
        this.lastWidth = null;
        this.lastHeight = null;
        this.unsubscribeScroll = () => {};
        this.unsubscribeScrollStart = () => {};
        this.unsubscribeSpring = () => {};

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

        // Paerent style to applied to pin wrapper
        this.parentRequireStyle = ['text-align'];

        // Item style get and applied itself when transpond
        this.itemRequireStyleWhenTraspond = [
            'font-size',
            'padding',
            'margin',
            'line-height',
            'white-space',
        ];

        // Parent style that activate transpond
        this.styleToTranspond = ['transform', 'position'];

        // Skip parent style to activate transpond above with this value
        this.nonRelevantRule = ['none', 'static'];

        this.isInizialized = false;
        this.prevScroll = 0;
        this.animatePin = false;
        this.anticipateFactor = 1.2;
        this.forceTranspond = false;
    }

    init() {
        // Get baisc element item ad if exist scrolltrigger
        this.item = this.parallaxInstance.item;
        this.trigger =
            this.parallaxInstance.scrollTrigger || this.parallaxInstance.item;
        this.scroller = this.parallaxInstance.scroller;
        this.screen = this.parallaxInstance.screen;
        this.prevscrollY = window.pageYOffset;
        this.animatePin = this.parallaxInstance.animatePin;
        this.forceTranspond = this.parallaxInstance.forceTranspond;
        this.isInizialized = true;

        this.refresh();
        this.createPin();
        this.setPinSize();
        this.addStyleFromPinToWrapper();
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
                if (this.orientation === parallaxConstant.DIRECTION_VERTICAL) {
                    // In vertical mode gap to translate when pin is in fixed position
                    // on window scroll is the same of collision
                    // The same axis reset the two prop
                    this.pin.style.transform = `translate(0px, ${collision}px)`;
                } else {
                    this.pin.style.transform = `translate(${collision}px, ${verticalGap}px)`;
                }
            }
        );
    }

    resetSpring() {
        this.spring.set({ collision: 0, verticalGap: 0 }).catch((err) => {});
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

        // Add disply table to avoid margin problem inside
        this.pin.style.display = 'table';
        // Set misure to pin lement and wrap element

        const requiredStyleToadd = this.addRquiredStyle();
        handleFrame.add(() => {
            Object.assign(this.pin.style, requiredStyleToadd);
        });
        this.checkIfShouldTranspond();
    }

    // Get style fomr item and apply to wrapper ( es: flex)
    addStyleFromPinToWrapper() {
        const compStyles = window.getComputedStyle(this.item);
        const style = this.itemRequireStyleToWrapper.reduce((p, c) => {
            return { ...p, ...{ [c]: compStyles.getPropertyValue(c) } };
        }, {});

        handleFrame.add(() => Object.assign(this.wrapper.style, style));
    }

    setPinSize() {
        const cb = () => {
            this.wrapper.style.height = '';
            this.wrapper.style.width = '';
            this.pin.style.height = '';
            this.pin.style.width = '';
            const height = this.lastHeight
                ? this.lastHeight
                : this.pin.offsetHeight;
            const width = this.lastWidth
                ? this.lastWidth
                : this.pin.offsetWidth;
            this.wrapper.style.height = `${height}px`;
            this.wrapper.style.width = `${width}px`;
            this.pin.style.height = `${height}px`;
            this.pin.style.width = `${width}px`;
        };

        handleFrame.add(() => {
            cb();
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

    /**
     * reset - on parallax refresh reset pin postion to permit parallax get right offset value
     * this before any aother operation in parallax reresh methods
     *
     * @return {void}
     */
    reset() {
        if (this.pin && this.isInizialized) {
            this.lastPosition = this.pin.style.position;
            this.lastTop = this.pin.style.top;
            this.lastLeft = this.pin.style.left;

            this.wrapper.style.height = '';
            this.wrapper.style.width = '';
            this.pin.style.height = '';
            this.pin.style.width = '';
            this.pin.style.position = '';

            this.lastWidth = this.pin.offsetWidth;
            this.lastHeight = this.pin.offsetHeight;
            // this.pin.style.transform = `translate(0px,0px)`;

            if (this.scroller === window) {
                this.pin.style.left = ``;
                this.pin.style.top = ``;
            }
        }
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

    /**
     * refresh - on parallax refresh after all opration restore pin tp and position values
     * and get fresh data
     *
     * @return {void}
     */
    refresh() {
        if (!this.isInizialized) return;

        this.invertSide = this.parallaxInstance.invertSide;
        this.orientation = this.parallaxInstance.direction;
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

        if (this.pin) {
            const cb = () => {
                this.pin.style.position = this.lastPosition;

                if (this.scroller === window) {
                    this.pin.style.top = this.lastTop;
                    this.pin.style.left = this.lastLeft;
                }
            };

            handleFrame.add(() => {
                cb();
            });

            this.setPinSize();
            this.checkIfShouldTranspond();
        }
    }

    destroy() {
        if (!this.isInizialized) return;

        this.unsubscribeSpring();
        this.unsubscribeScroll();
        this.unsubscribeScrollStart();
        this.spring = null;

        const cb = () => {
            if (this.pin && this.wrapper) {
                this.wrapper.parentNode.insertBefore(this.item, this.wrapper);
                this.pin.remove();
                this.wrapper.remove();
                this.wrapper = null;
                this.pin = null;
                this.isInizialized = false;
            }
        };

        handleFrame.add(() => {
            cb();
        });
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
            this.pin.style[this.collisionStyleProp] = `${this.startFromTop}px`;
        };

        handleFrame.add(() => {
            cb();
        });

        if (this.animatePin) {
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
            this.pin.style.transform = `translate(0px, 0px)`;
        };

        handleFrame.add(() => {
            cb();
        });
    }

    resetStyleWhenUnder() {
        this.resetSpring();
        const cb = () => {
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
            this.pin.style.position = 'fixed';
            this.pin.style[style] = `${left}px`;
        };

        handleFrame.add(() => {
            cb();
        });
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
            const styleToAdd = this.addStyleToItem();

            const cb = () => {
                Object.assign(this.pin.style, requiredStyleToAdd);
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
        const step = Math.abs(scrollTop - this.prevScroll);
        const remaining = Math.abs(this.startFromTop - scrollTop);
        return step > remaining
            ? Math.abs(step - remaining) * this.anticipateFactor
            : step * this.anticipateFactor;
    }

    getAnticipateValue(scrollTop, scrollDirection) {
        if (this.animatePin) {
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
            anticipateBottom,
            anticipateInnerIn,
            anticipateInnerOut,
        };
    }

    getAnticipateValueInverted(scrollTop, scrollDirection) {
        if (this.animatePin) {
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
            anticipateBottom,
            anticipateInnerIn,
            anticipateInnerOut,
        };
    }

    onScroll(scrollTop) {
        if (!this.isInizialized) return;

        const scrollDirection =
            this.prevScroll > scrollTop
                ? parallaxConstant.SCROLL_UP
                : parallaxConstant.SCROLL_DOWN;

        // Set up scroll condition
        const offsetTop =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? position(this.wrapper).top
                : position(this.wrapper).left;

        // Get anticipate value
        const {
            anticipateBottom,
            anticipateInnerIn,
            anticipateInnerOut,
        } = !this.invertSide
            ? this.getAnticipateValue(scrollTop, scrollDirection)
            : this.getAnticipateValueInverted(scrollTop, scrollDirection);

        const bottomCondition = !this.invertSide
            ? offsetTop > this.scrollerHeight - this.start + anticipateBottom
            : offsetTop < this.start - anticipateBottom;

        const innerCondition = !this.invertSide
            ? offsetTop <=
                  this.scrollerHeight - this.start + anticipateInnerIn &&
              this.scrollerHeight - offsetTop <=
                  this.end + anticipateInnerOut + this.start
            : offsetTop >= this.start - anticipateInnerIn &&
              offsetTop <= this.start + anticipateInnerOut + this.end;

        if (bottomCondition) {
            if (!this.isUnder) {
                // Reset style
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
    }
}
