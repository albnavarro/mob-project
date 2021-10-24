import { mouseManager } from '../../../js/base/mouseManager.js';
import { eventManager } from '../../../js/base/eventManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';

export class MouseParallaxItemClass {
    constructor(data) {
        this.item = data.item;
        this.centerToViewoport = data.centerToViewoport;
        this.range = data.range;
        this.container = data.container;
        this.height = 0;
        this.width = 0;
        this.offSetTop = 0;
        this.offSetLeft = 0;
        this.endValue = { ax: 0, ay: 0 };
        this.startValue = { ax: 0, ay: 0 };
        this.smooth = 10;
        this.prevValue = 0;
        this.rafOnScroll = null;
    }

    init() {
        this.getDimension();

        if (!Modernizr.touchevents) {
            mouseManager.push('mousemove', () => this.onMove());
            eventManager.push('resize', () => this.getDimension());
            mouseManager.push('scroll', () => this.onMove());
        }
    }

    getDimension() {
        this.height = outerHeight(this.item);
        this.width = outerWidth(this.item);
        this.offSetTop = offset(this.container).top;
        this.offSetLeft = offset(this.container).left;
    }

    onMove() {
        const { vw, vh } = (() => {
            if (this.centerToViewoport) {
                return {
                    vw: eventManager.windowsWidth(),
                    vh: eventManager.windowsHeight(),
                };
            } else {
                return {
                    vw: this.width,
                    vh: this.height,
                };
            }
        })();

        const x = mouseManager.clientX();
        const y = !this.centerToViewoport
            ? mouseManager.pageY()
            : mouseManager.clientY();

        const { ax, ay } = (() => {
            if (this.centerToViewoport) {
                return {
                    ax: (x - vw / 2) / this.range,
                    ay: (y - vh / 2) / this.range,
                };
            } else {
                return {
                    ax: (x - this.offSetLeft - vw / 2) / this.range,
                    ay: (y - this.offSetTop - vh / 2) / this.range,
                };
            }
        })();

        this.endValue = { ax, ay };

        if (!this.rafOnScroll)
            this.rafOnScroll = requestAnimationFrame(
                this.onReuqestAnimScroll.bind(this)
            );
    }

    onReuqestAnimScroll(timeStamp) {
        const draw = (timeStamp) => {
            console.log('tick');

            this.prevValue = { ...this.startValue };

            const { ax, ay } = (() => {
                const v = this.smooth;
                const { ax: axStart, ay: ayStart } = this.startValue;
                const { ax: axEnd, ay: ayEnd } = this.endValue;

                const ax = (axEnd - axStart) / v + axStart * 1;
                const ay = (ayEnd - ayStart) / v + ayStart * 1;

                return { ax: ax.toFixed(1), ay: ay.toFixed(1) };
            })();

            this.startValue = { ax, ay };
            const { ax: axPrev, ay: ayPrev } = this.prevValue;
            this.item.style.transform = `translate3D(${ax}px, ${ay}px, 0)`;

            if (ax == axPrev && ay == ayPrev) {
                cancelAnimationFrame(this.rafOnScroll);
                this.rafOnScroll = null;
                return;
            }

            this.rafOnScroll = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }
}
