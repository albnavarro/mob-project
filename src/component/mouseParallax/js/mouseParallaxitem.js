import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/core/utils/vanillaFunction.js';
import { handleSpring } from '.../../../js/core/animation/spring/handleSpring.js';
import { handleResize } from '.../../../js/core/events/resizeUtils/handleResize.js';
import { handleScroll } from '.../../../js/core/events/scrollUtils/handleScroll.js';
import { handleMouseMove } from '.../../../js/core/events/mouseUtils/handleMouse.js';

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
        this.spring = new handleSpring();
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

        this.unsubscribeMouseMove = handleMouseMove(({ page, client }) => {
            this.setGlobalCoord({ page, client });
            this.onMove();
        });

        this.unsubscribeResize = handleResize(() => {
            this.getDimension();
        });

        this.unsubscribeScroll = handleScroll(({ scrolY }) => {
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
