import {
    outerHeight,
    outerWidth,
    offset,
    getTranslateValues,
    mobbu,
    handleResize,
    handleScroll,
    handleMouseMove,
} from '.../../../js/core';

export class MouseParallaxItemClass {
    constructor(data) {
        this.item = data.item;
        this.centerToViewoport = data.centerToViewoport;
        this.rangex = data.rangex;
        this.rangey = data.rangey;
        this.height = 0;
        this.width = 0;
        this.offSetTop = 0;
        this.offSetLeft = 0;
        this.smooth = 10;
        this.spring = mobbu.create('spring');
        this.unsubscribeSpring = () => {};
        this.unsubscribeOnComplete = () => {};

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

        this.unsubscribeScroll = handleScroll(({ scrollY }) => {
            this.onScroll(scrollY);
        });

        this.spring.setData({ ax: 0, ay: 0 });

        this.unsubscribeSpring = this.spring.subscribe(({ ax, ay }) => {
            this.item.style.transform = `translate3D(0,0,0) translateX(${ax}px) translateY(${ay}px)`;
        });

        this.unsubscribeOnComplete = this.spring.onComplete(({ ax, ay }) => {
            this.item.style.transform = `translateX(${ax}px) translateY(${ay}px)`;
        });
    }

    destroy() {
        this.unsubscribeScroll();
        this.unsubscribeMouseMove();
        this.unsubscribeResize();
        this.unsubscribeSpring();
        this.unsubscribeOnComplete();
        this.spring = null;
    }

    setGlobalCoord({ page, client }) {
        this.pageCoord = { x: page.x, y: page.y };
        this.clientCoord = { x: client.x, y: client.y };
    }

    onScroll(scrollY) {
        const scrollTop = window.pageYOffset;

        if (this.lastScrolledTop != scrollTop) {
            this.pageCoord.y -= this.lastScrolledTop;
            this.lastScrolledTop = scrollTop;
            this.pageCoord.y += this.lastScrolledTop;
        }

        this.onMove();
    }

    getDimension() {
        const { x, y } = getTranslateValues(this.item);
        this.item.style.transform = '';

        this.height = outerHeight(this.item);
        this.width = outerWidth(this.item);
        this.offSetTop = offset(this.item).top;
        this.offSetLeft = offset(this.item).left;
        this.item.style.transform = `translate(${x}px, ${y}px)`;
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
                    ax: (x - vw / 2) / this.rangex,
                    ay: (y - vh / 2) / this.rangey,
                };
            } else {
                return {
                    ax: (x - this.offSetLeft - vw / 2) / this.rangex,
                    ay: (y - this.offSetTop - vh / 2) / this.rangey,
                };
            }
        })();

        this.spring.goTo({ ax, ay }).catch((err) => {});
    }
}
