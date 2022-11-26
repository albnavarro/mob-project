import { move3DitemClass } from './move3Ditem.js';
import { outerHeight, outerWidth, offset, mobbu } from '.../../../js/core';

export class move3DContainerClass {
    constructor(data) {
        this.item = data.item;
        this.scene = this.item.querySelector('.move3D__scene');
        this.container = this.item.querySelector('.move3D__container');
        this.children = this.item.querySelectorAll('.move3D__item');
        this.centerToViewoport = data.centerToViewoport;
        this.perspective = data.perspective;
        this.xDepth = data.xDepth;
        this.yDepth = data.yDepth;
        this.xLimit = data.xLimit;
        this.yLimit = data.yLimit;
        this.drag = data.drag;
        this.height = 0;
        this.width = 0;
        this.offSetLeft = 0;
        this.offSetTop = 0;
        this.delta = 0;
        this.limit = 0;
        this.lastX = 0;
        this.dragX = 0;
        this.lastY = 0;
        this.dragY = 0;
        this.onDrag = false;
        this.firstDrag = false;
        this.pageY = false;
        this.childrenInstances = [];

        this.spring = mobbu.createSpring();
        this.unsubscribeSpring = () => {};

        // MOUSE COORD
        this.pageCoord = { x: 0, y: 0 };
        this.lastScrolledTop = 0;

        this.unsubscribeScroll = () => {};
        this.unsubscribeTouchStart = () => {};
        this.unsubscribeTouchEnd = () => {};
        this.unsubscribeMouseDown = () => {};
        this.unsubscribeMouseUp = () => {};
        this.unsubscribeMouseMove = () => {};
        this.unsubscribeTouchMove = () => {};
        this.unsubscribeResize = () => {};
        this.unsubscribeOnComplete = () => {};
    }

    init() {
        console.log('test');
        this.spring.setData({ ax: 0, ay: 0 });

        this.unsubscribeSpring = this.spring.subscribe(({ ax, ay }) => {
            this.container.style.transform = `translate3D(0,0,0) rotateY(${ax}deg) rotateX(${ay}deg)`;
        });

        this.unsubscribeOnComplete = this.spring.onComplete(({ ax, ay }) => {
            this.container.style.transform = `rotateY(${ax}deg) rotateX(${ay}deg)`;
        });

        if (!this.centerToViewoport && !this.drag) this.pageY = true;

        const itemArray = Array.from(this.children);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(this.item, item);
        });

        for (const item of dataArray) {
            const move3Ditem = new move3DitemClass(item);
            this.childrenInstances.push(move3Ditem);
            move3Ditem.init();
        }

        this.setDepth();
        this.getDimension();

        this.unsubscribeMouseMove = mobbu.useMouseMove(({ page }) => {
            this.setGlobalCoord({ page });
            this.onMove();
        });

        this.unsubscribeResize = mobbu.useResize(() => {
            this.getDimension();
        });

        if (this.pageY) {
            this.unsubscribeScroll = mobbu.useScroll(({ scrollY }) => {
                this.onScroll(scrollY);
            });
        }

        if (this.drag) {
            this.dragX = window.innerWidth / 2;
            this.dragY = window.innerHeight / 2;
            this.item.classList.add('move3D--drag');

            this.unsubscribeTouchMove = mobbu.useTouchStart(({ page }) => {
                this.onMouseDown({ page });
            });

            this.unsubscribeTouchMove = mobbu.useTouchEnd(() => {
                this.onMouseUp();
            });

            this.unsubscribeTouchMove = mobbu.useMouseDown(({ page }) => {
                this.onMouseDown({ page });
            });

            this.unsubscribeTouchMove = mobbu.useMouseUp(() => {
                this.onMouseUp();
            });

            this.unsubscribeTouchMove = mobbu.useTouchMove(({ page }) => {
                this.setGlobalCoord({ page });
                this.onMove();
            });
        }
    }

    destroy() {
        this.unsubscribeScroll();
        this.unsubscribeTouchStart();
        this.unsubscribeTouchEnd();
        this.unsubscribeMouseDown();
        this.unsubscribeMouseUp();
        this.unsubscribeMouseMove();
        this.unsubscribeTouchMove();
        this.unsubscribeResize();
        this.unsubscribeOnComplete();

        this.childrenInstances.forEach((item, i) => {
            item.destroy();
        });
    }

    getDimension() {
        this.height = outerHeight(this.item);
        this.width = outerWidth(this.item);
        this.offSetLeft = offset(this.item).left;
        this.offSetTop = offset(this.item).top;
    }

    getItemData(container, item) {
        const data = {};
        data.item = item;
        data.container = container;
        data.depth = item.getAttribute('data-depth') || 0;
        // additional rotate
        data.rotate = item.getAttribute('data-rotate') || null;
        data.anchorPoint = item.getAttribute('data-anchorPoint') || null;
        data.range = item.getAttribute('data-range') || 0;
        data.initialRotate = item.getAttribute('data-initialRotate') || 0;
        //
        data.animate = item.getAttribute('data-animate') || 0;
        return data;
    }

    setDepth() {
        const style = {
            perspective: `${this.perspective}px`,
        };
        Object.assign(this.scene.style, style);
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

    setGlobalCoord({ page }) {
        this.pageCoord = { x: page.x, y: page.y };
    }

    onMove() {
        const { vw, vh } = (() => {
            if (this.centerToViewoport || this.drag) {
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

        const x = this.pageCoord.x;
        const y = this.pageCoord.y;

        const { xgap, ygap } = (() => {
            if (!this.onDrag) return { xgap: 0, ygap: 0 };

            if (this.firstDrag) {
                this.firstDrag = false;
                return {
                    xgap: 0,
                    ygap: 0,
                };
            } else {
                return {
                    xgap: x - this.lastX,
                    ygap: y - this.lastY,
                };
            }
        })();

        if (this.onDrag) {
            this.dragX += xgap;
            this.dragY += ygap;
        }

        const { xInMotion, yInMotion } = (() => {
            if (this.onDrag) {
                return {
                    xInMotion: this.dragX,
                    yInMotion: this.dragY,
                };
            } else {
                return {
                    xInMotion: x,
                    yInMotion: y,
                };
            }
        })();

        /*
        ax = grado di rotazione sull'asse X
        ay = grado di rotazione sull'asse Y
        */
        const { ax, ay } = (() => {
            if (this.centerToViewoport || this.drag) {
                return {
                    ax: -(vw / 2 - xInMotion) / this.xDepth,
                    ay: (vh / 2 - yInMotion) / this.yDepth,
                };
            } else {
                return {
                    ax: -(vw / 2 - (xInMotion - this.offSetLeft)) / this.xDepth,
                    ay: (vh / 2 - (yInMotion - this.offSetTop)) / this.yDepth,
                };
            }
        })();

        const xlimitReached = Math.abs(ax) > this.xLimit;
        const ylimitReached = Math.abs(ay) > this.yLimit;

        const axLimited = (() => {
            if (!xlimitReached) return ax;
            return ax > 0 ? this.xLimit : -this.xLimit;
        })();

        const ayLimited = (() => {
            if (!ylimitReached) return ay;
            return ay > 0 ? this.yLimit : -this.yLimit;
        })();

        // TODO: calcolare il valore x y corrspondente all 'angolo limite e assegnarlo
        if (xlimitReached) this.dragX -= xgap;
        if (ylimitReached) this.dragY -= ygap;

        this.lastX = x;
        this.lastY = y;

        /*
        Calcolo il valore da passare ai componenti figli per animarre l'asse Z.
        Il delta sarà l'ipotenusa del triangolo formato dai volri ax e ay
        */
        this.delta = Math.sqrt(
            Math.pow(Math.abs(ayLimited), 2) + Math.pow(Math.abs(axLimited), 2)
        );

        this.limit = Math.sqrt(
            Math.pow(Math.abs(this.xLimit), 2) +
                Math.pow(Math.abs(this.yLimit), 2)
        );

        const apply = (this.drag && this.onDrag) || !this.drag ? true : false;

        if (apply) {
            this.spring
                .goTo({ ax: axLimited, ay: ayLimited })
                .catch((err) => {});

            // Children
            for (const item of this.childrenInstances) {
                if (item.animate) item.move(this.delta, this.limit);
            }
        }
    }

    draggable({ page }) {
        return (
            page.y > this.offSetTop &&
            page.y < this.offSetTop + this.height &&
            page.x > this.offSetLeft &&
            page.x < this.offSetLeft + this.width
        );
    }

    onMouseDown({ page }) {
        if (this.draggable({ page })) {
            this.onDrag = true;
            this.firstDrag = true;
        }
    }

    onMouseUp() {
        this.onDrag = false;
    }
}
