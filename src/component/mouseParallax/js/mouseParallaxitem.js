import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/core/utils/vanillaFunction.js';
import { mobSpring } from '.../../../js/core/animation/spring/mobSpring.js';
import { mobResize } from '.../../../js/core/events/resizeUtils/mobResize.js';
import { mobScroll } from '.../../../js/core/events/scrollUtils/mobScroll.js';
import { mobMouseMove } from '.../../../js/core/events/mouseUtils/mobMouse.js';

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
        this.spring = new mobSpring();
        this.unsubscribeSpring = () => {};

        // MOUSE COORD
        this.pageCoord = { x: 0, y: 0 };
        this.clientCoord = { x: 0, y: 0 };
        this.lastScrolledTop = 0;

        this.unsubscribeScroll = () => {};
        this.unsubscribeMouseMove = () => {};
        this.unsubscribeResize = () => {};
    }

    init() {
        this.getDimension();

        this.unsubscribeMouseMove = mobMouseMove(({ page, client }) => {
            this.setGlobalCoord({ page, client });
            this.onMove();
        });

        this.unsubscribeResize = mobResize(() => {
            this.getDimension();
        });

        this.unsubscribeScroll = mobScroll(({ scrolY }) => {
            this.onScroll(scrolY);
        });

        this.spring.setData({ ax: 0, ay: 0 });

        this.unsubscribeSpring = this.spring.subscribe(({ ax, ay }) => {
            this.item.style.transform = `translate3D(${ax}px, ${ay}px, 0)`;
        });
    }

    destroy() {
        this.unsubscribeSpring();
        this.unsubscribeScroll();
        this.unsubscribeMouseMove();
        this.unsubscribeResize();
    }

    setGlobalCoord({ page, client }) {
        this.pageCoord = { x: page.x, y: page.y };
        this.clientCoord = { x: client.x, y: client.y };
    }

    onScroll(scrolY) {
        const scrollTop = window.pageYOffset;

        if (this.lastScrolledTop != scrollTop) {
            this.pageCoord.y -= this.lastScrolledTop;
            this.lastScrolledTop = scrollTop;
            this.pageCoord.y += this.lastScrolledTop;
        }

        this.onMove();
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
                    vw: window.innerWidth,
                    vh: window.innerHeight,
                };
            } else {
                return {
                    vw: this.width,
                    vh: this.height,
                };
            }
        })();

        const x = this.clientCoord.x;
        const y = !this.centerToViewoport
            ? this.pageCoord.y
            : this.clientCoord.y;

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
