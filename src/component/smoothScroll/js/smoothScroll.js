import { eventManager } from '../../../js/base/eventManager.js';
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
        this.endValue = window.pageYOffset;
        this.startValue = 0;
        this.endValue = 0;
        this.prevValue = 0;
        this.rafOnScroll = null;
    }

    init() {
        eventManager.push('load', () => this.reset(), 10);
        eventManager.push('scrollStart', () => this.reset(), 10);
        eventManager.push('scrollEnd', () => this.reset(), 10);
        document.documentElement.addEventListener(
            'wheel',
            (e) => this.onScroll(e),
            {
                passive: false,
            }
        );

        // TODO: is necessary ?
        document.documentElement.addEventListener(
            'DOMMouseScroll',
            (e) => this.onScroll(e),
            {
                passive: false,
            }
        );
    }

    reset() {
        this.startValue = window.pageYOffset;
        this.endValue = window.pageYOffset;
        this.prevValue = window.pageYOffset;
        this.rafOnScroll = null;
    }

    onScroll(e) {
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
                        outerWidth(this.target) -
                            document.documentElement.clientWidth
                    )
                );
            }
        })();

        if (!this.rafOnScroll)
            this.rafOnScroll = requestAnimationFrame(
                this.onReuqestAnimScroll.bind(this)
            );
    }

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
                    this.target.style.transform = `translateY(${-this
                        .startValue}px)`;
                }
            } else {
                if (this.target === document.documentElement) {
                    this.target.scrollleft = this.startValue;
                } else {
                    this.target.style.transform = `translateX(${-this
                        .startValue}px)`;
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
