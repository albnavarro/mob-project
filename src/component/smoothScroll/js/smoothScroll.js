import { normalizeWheel } from './normalizeWhell.js';
import { getTranslateValues } from '../../../js/utility/getTranslateValues.js';
import { useResize } from '.../../../js/events/resizeUtils/useResize.js';
import { useScroll } from '.../../../js/events/scrollUtils/useScroll.js';
import {
    useScrollStart,
    useScrollEnd,
} from '.../../../js/events/scrollUtils/useScrollUtils.js';
import {
    useTouchStart,
    useTouchEnd,
    useMouseDown,
    useMouseUp,
    useMouseMove,
    useTouchMove,
    useMouseWheel,
} from '.../../../js/events/mouseUtils/useMouse.js';
import { isDescendant } from '../../../js/utility/vanillaFunction.js';

export class SmoothScrollClass {
    constructor(data = {}) {
        this.VERTICAL = 'VERTICAL';
        this.HORIZONTAL = 'HORIZONTAL';
        this.direction = data.direction || this.VERTICAL;
        this.targetClass = data.target;
        this.target =
            document.querySelector(data.target) || document.documentElement;
        this.speed = data.speed || 60;
        this.ease = data.ease || 10;
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

        // Touch controls
        this.dragEnable = null;
        this.touchend = null;
        this.touchmove = null;
        this.prevTouchVal = 0;
        this.touchVal = 0;

        //
        this.callback = [];
    }

    init() {
        this.reset();
        useResize(() => this.reset());
        useScrollStart(() => this.reset());
        useScrollEnd(() => this.reset());
        useTouchStart((data) => this.onMouseDown(data));
        useTouchEnd((data) => this.onMouseUp(data));
        useMouseDown((data) => this.onMouseDown(data));
        useMouseUp((data) => this.onMouseUp(data));
        useMouseWheel((data) => this.onWhell(data));

        if(this.target !== document.documentElement) {            
            useMouseMove((data) => this.onTouchMove(data));
            useTouchMove((data) => this.onTouchMove(data));
        }

        // DRAG LISTENER
        if (this.drag) {
            // Prevent default listener
            this.target.addEventListener(
                'click',
                (e) => this.preventChecker(e),
                false
            );
            // End prevent default listener
        }

        // Set link and button to draggable false, prevent mousemouve fail
        this.target.style['user-select'] = 'none';
        const activeElement = this.target.querySelectorAll('a, button');
        [...activeElement].forEach((item, i) => {
            item.setAttribute('draggable', false);
            item.style['user-select'] = 'none';
        });
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
    preventChecker(e) {
        if (Math.abs(this.endValue - this.firstTouchValue) > this.threshold) {
            e.preventDefault();
        }
    }

    // RESET DATA
    reset() {
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

        this.startValue = resetValue;
        this.endValue = resetValue;
        this.prevValue = resetValue;
        this.rafOnScroll = null;

        this.calcaluteValue();
    }

    // DRAG CONTROLS
    getMousePos(page) {
        const { x, y } = page;
        return this.direction === this.VERTICAL ? y : x;
    }

    onMouseDown({ target, page }) {
        if (target === this.target || isDescendant(this.target, target)) {
            this.firstTouchValue = this.endValue;
            this.dragEnable = true;
            this.prevTouchVal = this.getMousePos(page);
            this.touchVal = this.getMousePos(page);
            console.log(this.prevTouchVal);
        }
    }

    onMouseUp({ target, page }) {
        this.dragEnable = false;
    }

    onTouchMove({ target, page, preventDefault }) {
        if (
            target === this.target ||
            (isDescendant(this.target, target) && this.dragEnable)
        ) {
            preventDefault();

            this.prevTouchVal = this.touchVal;
            this.touchVal = this.getMousePos(page);

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

        if (target === this.target || isDescendant(this.target, target)) {
            preventDefault();
            this.endValue += spinY * this.speed;
            this.calcaluteValue();
        }
    }

    // COMMON CALCULATE VALUE
    calcaluteValue() {
        this.endValue = (() => {
            if (this.direction === this.VERTICAL) {
                const value =
                    this.target === document.documentElement
                        ? this.target.scrollHeight
                        : this.target.offsetHeight;

                // Clamped result
                const result = Math.max(
                    0,
                    Math.min(this.endValue, value - this.containerHeight)
                );

                // Update progress
                this.progress = (
                    result / parseInt(value - this.containerHeight)
                ).toFixed(2);

                return result;
            } else {
                const value =
                    this.target === document.documentElement
                        ? this.target.scrollWidth
                        : this.target.offsetWidth;

                // Clamped result
                const result = Math.max(
                    0,
                    Math.min(this.endValue, value - this.containerWidth)
                );

                // Update progress
                this.progress = (
                    result / parseInt(value - this.containerWidth)
                ).toFixed(2);

                return result;
            }
        })();

        this.target.style.setProperty('--progress', `${this.progress * 100}%`);

        if (!this.rafOnScroll)
            this.rafOnScroll = requestAnimationFrame(
                this.onReuqestAnimScroll.bind(this)
            );
    }

    // EASING
    onReuqestAnimScroll(timeStamp) {
        const draw = (timeStamp) => {
            this.prevValue = this.startValue;

            const s = this.startValue,
                f = this.endValue,
                v = this.ease,
                val = (f - s) / v + s * 1;

            this.startValue = val.toFixed(1);

            if (this.direction == this.VERTICAL) {
                if (this.target === document.documentElement) {
                    this.target.scrollTop = this.startValue;
                } else {
                    this.target.style.transform = `translate3d(0, ${-this
                        .startValue}px, 0)`;
                }
            } else {
                if (this.target === document.documentElement) {
                    this.target.scrollleft = this.startValue;
                } else {
                    this.target.style.transform = `translate3d(${-this
                        .startValue}px, 0, 0)`;
                }
            }

            this.callback.forEach((item, i) => {
                item();
            });

            // La RAF viene "rigenerata" fino a quando tutti gli elementi rimangono fermi
            if (this.prevValue == this.startValue) {
                cancelAnimationFrame(this.rafOnScroll);
                this.rafOnScroll = null;
                return;
            }

            this.rafOnScroll = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }
}
