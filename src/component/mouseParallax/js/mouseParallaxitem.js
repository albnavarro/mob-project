import { mouseManager } from '../../../js/base/mouseManager.js';
import { eventManager } from '../../../js/base/eventManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';
import { useSpring } from '.../../../js/animation/spring/useSpring.js';

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
        this.smooth = 10;
        this.spring = new useSpring();
        this.unsubscribeSpring = () => {};
    }

    init() {
        this.getDimension();

        if (!Modernizr.touchevents) {
            mouseManager.push('mousemove', () => this.onMove());
            eventManager.push('resize', () => this.getDimension());
            mouseManager.push('scroll', () => this.onMove());
        }

        this.spring.setData({ ax: 0, ay: 0 });

        this.unsubscribeSpring = this.spring.subscribe(({ ax, ay }) => {
            this.item.style.transform = `translate3D(${ax}px, ${ay}px, 0)`;
        });
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

        this.spring.goTo({ ax, ay }).catch((err) => {});
    }
}
