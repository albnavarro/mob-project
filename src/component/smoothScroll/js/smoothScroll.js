import { getTranslateValues } from '../../../js/utility/getTranslateValues.js';
import { useResize } from '.../../../js/core/events/resizeUtils/useResize.js';
import { useScroll } from '.../../../js/core/events/scrollUtils/useScroll.js';
import {
    useScrollStart,
    useScrollEnd,
} from '.../../../js/core/events/scrollUtils/useScrollUtils.js';
import {
    useTouchStart,
    useTouchEnd,
    useMouseDown,
    useMouseUp,
    useMouseMove,
    useTouchMove,
    useMouseWheel,
    useMouseClick,
} from '.../../../js/core/events/mouseUtils/useMouse.js';
import { isDescendant } from '../../../js/utility/vanillaFunction.js';
import { useLerp } from '.../../../js/core/animation/lerp/useLerp.js';
import { useSpring } from '.../../../js/core/animation/spring/useSpring.js';

export class SmoothScrollClass {
    constructor(data = {}) {
        this.VERTICAL = 'VERTICAL';
        this.HORIZONTAL = 'HORIZONTAL';
        this.direction = data.direction || this.VERTICAL;
        this.targetClass = data.target;
        this.target =
            document.querySelector(data.target) || document.documentElement;
        this.speed = data.speed || 60;
        this.drag = data.drag || false;
        this.container =
            document.querySelector(data.container) || document.documentElement;
        this.endValue = window.pageYOffset;
        this.startValue = 0;
        this.endValue = 0;
        this.prevValue = 0;
        this.rafOnScroll = null;
        this.containerWidth = 0;
        this.containerHeight = 0;
        this.progress = 0;
        this.firstTouchValue = 0;
        this.threshold = 30;
        this.maxValue = 0;
        this.minValue - 0;

        // Touch controls
        this.dragEnable = null;
        this.touchend = null;
        this.touchmove = null;
        this.prevTouchVal = 0;
        this.touchVal = 0;

        //
        this.callback = [];

        // Unsubscribe event
        this.subscribeResize = () => {};
        this.subscribeScrollStart = () => {};
        this.subscribeScrollEnd = () => {};
        this.subscribeTouchStart = () => {};
        this.subscribeTouchEnd = () => {};
        this.subscribeMouseDown = () => {};
        this.subscribeMouseUp = () => {};
        this.subscribeMouseWheel = () => {};
        this.subscribeMouseMove = () => {};
        this.subscribeTouchMove = () => {};
        this.subscribeMouseClick = () => {};

        // Animation
        this.LERP = 'lerp';
        this.SPRING = 'spring';
        this.motionType = data.motionType || this.LERP;
        this.motion = null;
        this.unsubscribeMotion = () => {};
    }

    init() {
        switch (this.motionType) {
            case this.SPRING:
                this.motion = new useSpring('gentle');
                break;

            default:
                this.motion = new useLerp(160);
                break;
        }

        this.reset();
        this.subscribeResize = useResize(() => this.reset());
        this.subscribeScrollStart = useScrollStart(() => this.reset());
        this.subscribeScrollEnd = useScrollEnd(() => this.reset());
        this.subscribeTouchStart = useTouchStart((data) =>
            this.onMouseDown(data)
        );
        this.subscribeTouchEnd = useTouchEnd((data) => this.onMouseUp(data));
        this.subscribeMouseDown = useMouseDown((data) =>
            this.onMouseDown(data)
        );
        this.subscribeMouseUp = useMouseUp((data) => this.onMouseUp(data));
        this.subscribeMouseWheel = useMouseWheel((data) => this.onWhell(data));

        if (this.target !== document.documentElement) {
            this.subscribeMouseMove = useMouseMove((data) =>
                this.onTouchMove(data)
            );
            this.subscribeTouchMove = useTouchMove((data) =>
                this.onTouchMove(data)
            );
        }

        // DRAG LISTENER
        if (this.drag) {
            this.subscribeMouseClick = useMouseClick(
                ({ target, preventDefault }) => {
                    this.preventChecker({ target, preventDefault });
                }
            );
        }

        this.motion.setData({ val: 0 });
        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            if (this.direction == this.VERTICAL) {
                if (this.target === document.documentElement) {
                    this.target.scrollTop = val;
                } else {
                    this.target.style.transform = `translate3d(0, ${-val}px, 0)`;
                }
            } else {
                if (this.target === document.documentElement) {
                    this.target.scrollleft = val;
                } else {
                    this.target.style.transform = `translate3d(${-val}px, 0, 0)`;
                }
            }

            this.callback.forEach((item, i) => {
                item();
            });
        });

        // Set link and button to draggable false, prevent mousemouve fail
        this.target.style['user-select'] = 'none';
        const activeElement = this.target.querySelectorAll('a, button');
        [...activeElement].forEach((item, i) => {
            item.setAttribute('draggable', false);
            item.style['user-select'] = 'none';
        });
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    destroy() {
        this.subscribeResize();
        this.subscribeScrollStart();
        this.subscribeScrollEnd();
        this.subscribeTouchStart();
        this.subscribeTouchEnd();
        this.subscribeMouseDown();
        this.subscribeMouseUp();
        this.subscribeMouseWheel();
        this.subscribeMouseMove();
        this.subscribeTouchMove();
        this.subscribeMouseClick();
        this.unsubscribeMotion();
    }

    onTick(fn) {
        this.callback.push(fn);
    }

    /**
     * preventChecker - prevent default if scroll difference from dow to up is less thshold value
     *
     * @param  {event} e listener event
     * @return {void}
     */
    preventChecker({ target, preventDefault }) {
        if (target === this.target || isDescendant(this.target, target)) {
            if (
                Math.abs(this.endValue - this.firstTouchValue) > this.threshold
            ) {
                preventDefault();
            }
        }
    }

    // RESET DATA
    reset() {
        this.isScrolling = false;

        this.containerWidth =
            this.container === document.documentElement
                ? document.documentElement.clientWidth
                : this.container.offsetWidth;

        this.containerHeight =
            this.container === document.documentElement
                ? document.documentElement.clientHeight
                : this.container.offsetHeight;

        const resetValue = (() => {
            if (
                this.target === document.documentElement &&
                this.direction === this.VERTICAL
            ) {
                return window.pageYOffset;
            } else if (
                this.target === document.documentElement &&
                this.direction === this.HORIZONTAL
            ) {
                return window.pageXOffset;
            } else if (
                this.target !== document.documentElement &&
                this.direction === this.VERTICAL
            ) {
                return -getTranslateValues(this.target).y;
            } else if (
                this.target !== document.documentElement &&
                this.direction === this.HORIZONTAL
            ) {
                return -getTranslateValues(this.target).x;
            }
        })();

        this.endValue = resetValue;
        this.motion.set({ val: resetValue }).catch((err) => {});

        this.maxValue = (() => {
            if (this.direction === this.VERTICAL) {
                const value =
                    this.target === document.documentElement
                        ? this.target.scrollHeight
                        : this.target.offsetHeight;

                return value - this.containerHeight;
            } else {
                const value =
                    this.target === document.documentElement
                        ? this.target.scrollWidth
                        : this.target.offsetWidth;

                return value - this.containerWidth;
            }
        })();

        this.calcaluteValue();
    }

    // GET POSITION FORM MOUSE/TOUCH EVENT
    getMousePos(client) {
        const { x, y } = client;
        return this.direction === this.VERTICAL ? y : x;
    }

    onMouseDown({ target, client }) {
        if (target === this.target || isDescendant(this.target, target)) {
            // Stop lerp when user use scrollbar while lerp is running
            if (this.target === document.documentElement) this.motion.stop();

            this.firstTouchValue = this.endValue;
            this.dragEnable = true;
            this.prevTouchVal = this.getMousePos(client);
            this.touchVal = this.getMousePos(client);
        }
    }

    onMouseUp({ target, client }) {
        this.dragEnable = false;
    }

    onTouchMove({ target, client, preventDefault }) {
        if (
            (target === this.target || isDescendant(this.target, target)) &&
            this.dragEnable &&
            this.drag
        ) {
            preventDefault();

            this.prevTouchVal = this.touchVal;
            this.touchVal = this.getMousePos(client);

            const result = parseInt(this.prevTouchVal - this.touchVal);
            this.endValue += result;

            this.calcaluteValue();
        }
    }

    // WHEEL CONTROLS
    onWhell({ target, spinY, preventDefault }) {
        // Prevent scroll with body in overflow = hidden;
        const bodyIsOverflow =
            document.body.style.overflow === 'hidden' &&
            this.direction === this.VERTICAL;

        if (bodyIsOverflow) return;

        // Secure check on qucky change to drag to whell
        this.dragEnable = false;

        if (target === this.target || isDescendant(this.target, target)) {
            preventDefault();
            this.endValue += spinY * this.speed;
            this.calcaluteValue();
        }
    }

    // COMMON CALCULATE VALUE
    calcaluteValue() {
        this.endValue = this.clamp(this.endValue, 0, this.maxValue);
        this.target.style.setProperty('--progress', `${this.progress * 100}%`);

        this.motion.goTo({ val: this.endValue }).catch((err) => {});
    }
}
