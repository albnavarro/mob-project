import { mouseManager } from '../../../js/base/mouseManager.js';
import { eventManager } from '../../../js/base/eventManager.js';
import { move3DitemClass } from './move3Ditem.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';

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

        this.endValue = { axLimited: 0, ayLimited: 0 };
        this.startValue = { axLimited: 0, ayLimited: 0 };
        this.smooth = 10;
        this.prevValue = 0;
        this.rafOnScroll = null;
    }

    init() {
        if (Modernizr.touchevents && !this.drag) return;

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

        mouseManager.push('mousemove', () => this.onMove());
        eventManager.push('resize', () => this.getDimension());

        if (this.pageY) {
            mouseManager.push('scroll', () => this.onMove());
        }

        if (this.drag) {
            this.dragX = eventManager.windowsWidth() / 2;
            this.dragY = eventManager.windowsHeight() / 2;
            this.item.classList.add('move3D--drag');

            if (Modernizr.touchevents) {
                mouseManager.push('touchstart', () => this.onMouseDown());
                mouseManager.push('touchend', () => this.onMouseUp());
            } else {
                mouseManager.push('mousedown', () => this.onMouseDown());
                mouseManager.push('mouseup', () => this.onMouseUp());
            }

            mouseManager.push('touchmove', () => this.onMove());
        }
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

    onMove() {
        const { vw, vh } = (() => {
            if (this.centerToViewoport || this.drag) {
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

        const x = Modernizr.touchevents
            ? mouseManager.pageX()
            : mouseManager.clientX();

        const y =
            Modernizr.touchevents || this.pageY
                ? mouseManager.pageY()
                : mouseManager.clientY();

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
            this.endValue = { axLimited, ayLimited };

            if (!this.rafOnScroll)
                this.rafOnScroll = requestAnimationFrame(
                    this.onReuqestAnimScroll.bind(this)
                );

            // Children
            for (const item of this.childrenInstances) {
                if (item.animate) item.move(this.delta, this.limit);
            }
        }
    }

    onReuqestAnimScroll(timeStamp) {
        const draw = (timeStamp) => {
            // console.log('tick');

            this.prevValue = { ...this.startValue };

            const { axLimited, ayLimited } = (() => {
                const v = this.smooth;
                const { axLimited: axLimitedStart, ayLimited: ayLimitedStart } =
                    this.startValue;
                const { axLimited: axLimitedEnd, ayLimited: ayLimitedEnd } =
                    this.endValue;

                const axLimited =
                    (axLimitedEnd - axLimitedStart) / v + axLimitedStart * 1;
                const ayLimited =
                    (ayLimitedEnd - ayLimitedStart) / v + ayLimitedStart * 1;

                return {
                    axLimited: axLimited.toFixed(1),
                    ayLimited: ayLimited.toFixed(1),
                };
            })();

            this.startValue = { axLimited, ayLimited };
            const { axLimited: axPrev, ayLimited: ayPrev } = this.prevValue;

            this.container.style.transform = `rotateY(${axLimited}deg) rotateX(${ayLimited}deg) translateZ(0)`;

            if (axLimited == axPrev && ayLimited == ayPrev) {
                cancelAnimationFrame(this.rafOnScroll);
                this.rafOnScroll = null;
                return;
            }

            this.rafOnScroll = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }

    draggable() {
        return (
            mouseManager.pageY() > this.offSetTop &&
            mouseManager.pageY() < this.offSetTop + this.height &&
            mouseManager.pageX() > this.offSetLeft &&
            mouseManager.pageX() < this.offSetLeft + this.width
        );
    }

    onMouseDown() {
        if (this.draggable()) {
            this.onDrag = true;
            this.firstDrag = true;
        }
    }

    onMouseUp() {
        this.onDrag = false;
    }
}
