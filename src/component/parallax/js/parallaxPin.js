import { useSpring } from '.../../../js/core/animation/spring/useSpring.js';
import { useFrame } from '.../../../js/core/events/rafutils/rafUtils.js';
import { parallaxConstant } from './parallaxConstant.js';
import { position } from '../../../js/utility/vanillaFunction.js';

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
        this.spring = new useSpring('wobbly');
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
        this.lastScroll = 0;
        this.unsubscribeScroll = () => {};
        this.unsubscribeSpring = () => {};
        this.parentRequireStyle = ['text-align', 'box-sizing'];
        this.styleToTranspond = ['transform', 'position'];
        this.nonRelevantRule = ['none', 'static'];
    }

    init() {
        // Get baisc element item ad if exist scrolltrigger
        this.item = this.parallaxInstance.item;
        this.trigger =
            this.parallaxInstance.scrollTrigger || this.parallaxInstance.item;
        this.scroller = this.parallaxInstance.scroller;

        this.refresh();
        this.createPin();
        this.setPinSize();
        this.setUpMotion();
    }

    setUpMotion() {
        this.spring = new useSpring('wobbly');
        this.spring.setData({ val: 0 });

        const translateProp =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? 'Y'
                : 'X';

        this.unsubscribeSpring = this.spring.subscribe(({ val }) => {
            this.pin.style.transform = `translate${translateProp}(${val}px)`;
        });
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
        // Set misure to pin lement and wrap element

        this.addRquiredStyle();
        this.checkIfShouldTranspond();
    }

    setPinSize() {
        useFrame(() => {
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
        const additionalStyle = this.parentRequireStyle
            .map((item) => {
                return this.findStyle(this.pin, item);
            })
            .filter((item) => item !== null)
            .reduce((p, c) => {
                return { ...p, ...c };
            }, {});

        Object.assign(this.pin.style, additionalStyle);
    }

    checkIfShouldTranspond() {
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
        if (this.pin) {
            this.lastPosition = this.pin.style.position;
            this.lastTop = this.pin.style.top;
            this.lastLeft = this.pin.style.left;
            this.lastWidth = this.pin.offsetWidth;
            this.lastHeight = this.pin.offsetHeight;
            this.pin.style.position = '';

            if (this.scroller === window) {
                this.pin.style.left = ``;
                this.pin.style.top = ``;
            }
        }
    }

    /**
     * refresh - on parallax refresh after all opration restore pin tp and position values
     * and get fresh data
     *
     * @return {void}
     */
    refresh() {
        this.invertSide = this.parallaxInstance.invertSide;
        this.orientation = this.parallaxInstance.direction;
        this.scrollerHeight = this.parallaxInstance.scrollerHeight;
        this.start = this.parallaxInstance.startPoint;
        this.startFromTop = this.invertSide
            ? this.start
            : this.scrollerHeight - this.start;
        this.end = this.parallaxInstance.endPoint;
        this.compesateValue = this.invertSide
            ? -parseInt(this.end)
            : parseInt(this.end);
        this.collisionTranslateProp =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? 'Y'
                : 'X';

        this.collisionStyleProp =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? 'top'
                : 'left';

        if (this.pin) {
            useFrame(() => {
                this.pin.style.position = this.lastPosition;

                if (this.scroller === window) {
                    this.pin.style.top = this.lastTop;
                    this.pin.style.left = this.lastLeft;
                }
            });
            this.setPinSize();
            this.checkIfShouldTranspond();
        }
    }

    destroy() {
        this.unsubscribeSpring();
        this.spring = null;
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
        useFrame(() => {
            this.pin.style[this.collisionStyleProp] = `${this.startFromTop}px`;
        });

        if (this.springIsRunning) return;

        this.springIsRunning = true;
        this.spring
            .goFrom({ val: gap })
            .then(() => {
                useFrame(() => {
                    this.pin.style.transform = `translate${this.collisionTranslateProp}(0px)`;
                    this.springIsRunning = false;
                });
            })
            .catch((err) => {});
    }

    resetStyleWhenUnder() {
        useFrame(() => {
            this.pin.style.position = 'relative';
            this.pin.style.top = ``;
            this.pin.style.left = ``;
        });
    }

    resetStyleWhenOver() {
        useFrame(() => {
            this.pin.style.position = 'relative';

            if (this.orientation === parallaxConstant.DIRECTION_VERTICAL) {
                this.pin.style.left = ``;
                this.pin.style.top = `${this.compesateValue}px`;
            } else {
                this.pin.style.top = ``;
                this.pin.style.left = `${this.compesateValue}px`;
            }
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

        useFrame(() => {
            this.pin.style.position = 'fixed';
            this.pin.style[style] = `${left}px`;
        });
    }

    activateTrasponder() {
        if (this.shoulTranspond) {
            this.addRquiredStyle();
            useFrame(() => {
                document.body.appendChild(this.pin);
            });

            this.trasponderActive = true;
        }
    }

    deactivateTrasponder() {
        if (this.shoulTranspond) {
            useFrame(() => {
                this.wrapper.appendChild(this.pin);
            });
            this.trasponderActive = false;
        }
    }

    onScroll(scrollTop) {
        const scrollDirection =
            this.lastScroll > scrollTop
                ? parallaxConstant.SCROLL_UP
                : parallaxConstant.SCROLL_DOWN;

        // Set up scroll condition
        const offsetTop =
            this.orientation === parallaxConstant.DIRECTION_VERTICAL
                ? position(this.wrapper).top
                : position(this.wrapper).left;

        const bottomCondition = !this.invertSide
            ? offsetTop > this.scrollerHeight - this.start
            : offsetTop < this.start;

        const innerCondition = !this.invertSide
            ? offsetTop < this.scrollerHeight - this.start &&
              this.scrollerHeight - offsetTop < this.end + this.start
            : offsetTop > this.start && offsetTop < this.start + this.end;

        const topCondition = !this.invertSide
            ? this.scrollerHeight - offsetTop > this.start + this.end
            : offsetTop > this.start + this.end;

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
        } else if (topCondition) {
            if (!this.isOver) {
                this.resetStyleWhenOver();
                this.deactivateTrasponder();
                this.isUnder = false;
                this.isInner = false;
                this.isOver = true;
            }
        }

        this.lastScroll = scrollTop;
    }
}
