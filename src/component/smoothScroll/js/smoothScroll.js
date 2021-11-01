import { eventManager } from '../../../js/base/eventManager.js';
import { mouseManager } from '../../../js/base/mouseManager.js';
import { normalizeWheel } from './normalizeWhell.js';
import {
    outerHeight,
    outerWidth,
} from '../../../js/utility/vanillaFunction.js';

export class SmoothScrollClass {
    constructor(data = {}) {
        this.VERTICAL = 'VERTICAL';
        this.HORINZONTAL = 'HORIZONTAL';
        this.direction = data.direction || this.VERTICAL;
        this.target = data.target || document.documentElement;
        this.speed = data.speed || 60;
        this.ease = data.ease || 10;
        this.drag = data.drag || false;
        this.endValue = window.pageYOffset;
        this.startValue = 0;
        this.endValue = 0;
        this.prevValue = 0;
        this.rafOnScroll = null;

        // Touch controls
        this.dragEnable = null;
        this.touchend = null;
        this.touchmove = null;
        this.prevTouchVal = 0;
        this.touchVal = 0;
    }

    init() {
        // COMMON LISTENER
        eventManager.push('load', () => this.reset(), 10);
        eventManager.push('scrollStart', () => this.reset(), 10);
        eventManager.push('scrollEnd', () => this.reset(), 10);

        // WHEEL LISTENER
        document.documentElement.addEventListener(
            'wheel',
            (e) => this.onWhell(e),
            {
                passive: false,
            }
        );

        // TODO: is necessary ?
        document.documentElement.addEventListener(
            'DOMMouseScroll',
            (e) => this.onWhell(e),
            {
                passive: false,
            }
        );

        // DRAG LISTENER
        if (this.drag) {
            this.target.addEventListener(
                'mousedown',
                (e) => e.preventDefault(),
                false
            );

            this.target.addEventListener(
                'mousedown',
                (e) => e.preventDefault(),
                false
            );

            this.prevTouchVal = this.getMousePos();
            this.touchVal = this.getMousePos();

            if (Modernizr.touchevents) {
                mouseManager.push('touchstart', () => this.onMouseDown());
                mouseManager.push('touchend', () => this.onMouseUp());
            } else {
                mouseManager.push('mousedown', () => this.onMouseDown());
                mouseManager.push('mouseup', () => this.onMouseUp());
            }

            mouseManager.push('touchmove', () => this.onTouchMove());
            mouseManager.push('mousemove', () => this.onTouchMove());
        }
    }

    // RESET DATA
    reset() {
        this.startValue = window.pageYOffset;
        this.endValue = window.pageYOffset;
        this.prevValue = window.pageYOffset;
        this.rafOnScroll = null;
    }

    // DRAG CONTROLS
    getMousePos() {
        const { x, y } = (() => {
            if (Modernizr.touchevents) {
                return {
                    x: mouseManager.pageX(),
                    y: mouseManager.pageY(),
                };
            } else {
                return {
                    x: mouseManager.clientX(),
                    y: mouseManager.clientY(),
                };
            }
        })();
        return this.direction === this.VERTICAL ? y : x;
    }

    onMouseDown() {
        this.dragEnable = true;
        this.prevTouchVal = this.getMousePos();
        this.touchVal = this.getMousePos();
    }

    onMouseUp() {
        this.dragEnable = false;
    }

    onTouchMove() {
        if (this.dragEnable) {
            this.prevTouchVal = this.touchVal;
            this.touchVal = this.getMousePos();

            const result = parseInt(this.prevTouchVal - this.touchVal);

            this.endValue += result;
            this.calcaluteValue();
        }
    }

    // WHEEL CONTROLS
    onWhell(e) {
        // Prevent scroll with body in overflow = hidden;
        const bodyIsOverflow =
            document.body.style.overflow &&
            (this.direction === this.VERTICAL) === 'hidden';
        if (bodyIsOverflow) return;

        // If wheelDelta or wheelDeltaY is not supported and target is document return
        // ( secure check )
        if (
            (!('wheelDelta' in e) || !('wheelDeltaY' in e)) &&
            this.target === document.documentElement
        )
            return;

        e.preventDefault();

        // Facebook normalize whell code
        const { spinY } = normalizeWheel(e);

        this.endValue += spinY * this.speed;
        this.calcaluteValue();
    }

    // COMMON CALCULATE VALUE
    calcaluteValue() {
        this.endValue = (() => {
            if (this.direction === this.VERTICAL) {
                const value =
                    this.target === document.documentElement
                        ? this.target.scrollHeight
                        : outerHeight(this.target);

                return Math.max(
                    0,
                    Math.min(
                        this.endValue,
                        value - document.documentElement.clientHeight
                    )
                );
            } else {
                const value =
                    this.target === document.documentElement
                        ? this.target.scrollWidth
                        : outerWidth(this.target);

                return Math.max(
                    0,
                    Math.min(
                        this.endValue,
                        value - document.documentElement.clientWidth
                    )
                );
            }
        })();

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
                    this.target.style.transform = `translate3D(0, ${-this
                        .startValue}px, 0)`;
                }
            } else {
                if (this.target === document.documentElement) {
                    this.target.scrollleft = this.startValue;
                } else {
                    this.target.style.transform = `translate3D(${-this
                        .startValue}px, 0, 0)`;
                }
            }

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
