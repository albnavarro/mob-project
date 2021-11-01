import { eventManager } from '../../../js/base/eventManager.js';
import { mouseManager } from '../../../js/base/mouseManager.js';

export class DraggerItemClass {
    constructor(data) {
        // Constant
        this.TOP_LEFT = 'TOP-LEFT';
        this.TOP_RIGHT = 'TOP-RIGHT';
        this.BOTTOM_LEFT = 'BOTTOM-LEFT';
        this.BOTTOM_RIGHT = 'BOTTOM-RIGHT';
        this.CENTER = 'CENTER';

        // Prop
        this.compRoot = data.compRoot;
        this.smooth = data.ease;
        this.startPosition = data.position.toUpperCase();
        console.log(this.startPosition);
        this.item = this.compRoot.querySelector('.dragger__item');

        // MUTABLE
        this.touchstart = null;
        this.touchend = null;
        this.mousedown = null;
        this.mouseup = null;
        this.touchmove = null;
        this.mousemove = null;
        this.dragY = 0;
        this.dragX = 0;
        this.itemWidth = this.item.offsetWidth;
        this.itemHeight = this.item.offsetHeight;
        this.contWidth = this.compRoot.offsetWidth;
        this.contHeight = this.compRoot.offsetHeight;
        this.limitX = (this.itemWidth - this.contWidth) / 2;
        this.limitY = (this.itemHeight - this.contHeight) / 2;

        // EASING
        this.endValue = { xLimited: 0, yLimited: 0 };
        this.startValue = { xLimited: 0, yLimited: 0 };
        this.prevValue = 0;
        this.rafOnScroll = null;
    }

    init() {
        this.item.addEventListener(
            'mousedown',
            (e) => e.preventDefault(),
            false
        );

        this.item.addEventListener(
            'mousedown',
            (e) => e.preventDefault(),
            false
        );

        if (Modernizr.touchevents) {
            this.touchstart = mouseManager.push('touchstart', () =>
                this.onMouseDown()
            );
            this.touchend = mouseManager.push('touchend', () =>
                this.onMouseUp()
            );
        } else {
            this.mousedown = mouseManager.push('mousedown', () =>
                this.onMouseDown()
            );
            this.mouseup = mouseManager.push('mouseup', () => this.onMouseUp());
        }

        this.touchmove = mouseManager.push('touchmove', () => this.onMove());
        this.mousemove = mouseManager.push('mousemove', () => this.onMove());
        this.mousemove = eventManager.push('resize', () => this.onResize());

        this.TOP_LEFT = 'TOP-LEFT';
        this.TOP_RIGHT = 'TOP-RIGHT';
        this.BOTTOM_LEFT = 'BOTTOM-LEFT';
        this.BOTTOM_RIGHT = 'BOTTOM-RIGHT';

        // Set start position
        switch (this.startPosition) {
            case this.TOP_LEFT:
                this.item.style.transform = `translate3D(${this.limitX}px, ${this.limitY}px, 0)`;
                this.endValue = {
                    xLimited: this.limitX,
                    yLimited: this.limitY,
                };
                this.startValue = {
                    xLimited: this.limitX,
                    yLimited: this.limitY,
                };
                this.dragX = this.itemWidth;
                this.dragY = this.itemHeight;
                break;

            case this.TOP_RIGHT:
                this.item.style.transform = `translate3D(${-this.limitX}px, ${
                    this.limitY
                }px, 0)`;
                this.endValue = {
                    xLimited: -this.limitX,
                    yLimited: this.limitY,
                };
                this.startValue = {
                    xLimited: -this.limitX,
                    yLimited: this.limitY,
                };
                this.dragX = -this.itemWidth;
                this.dragY = this.itemHeight;
                break;

            case this.BOTTOM_LEFT:
                this.item.style.transform = `translate3D(${
                    this.limitX
                }px, ${-this.limitY}px, 0)`;
                this.endValue = {
                    xLimited: this.limitX,
                    yLimited: -this.limitY,
                };
                this.startValue = {
                    xLimited: this.limitX,
                    yLimited: -this.limitY,
                };
                this.dragX = this.itemWidth;
                this.dragY = -this.itemHeight;
                break;

            case this.BOTTOM_RIGHT:
                this.item.style.transform = `translate3D(${-this
                    .limitX}px, ${-this.limitY}px, 0)`;
                this.endValue = {
                    xLimited: -this.limitX,
                    yLimited: -this.limitY,
                };
                this.startValue = {
                    xLimited: -this.limitX,
                    yLimited: -this.limitY,
                };
                this.dragX = -this.itemWidth;
                this.dragY = -this.itemHeight;
                break;
        }
    }

    onResize() {
        this.itemWidth = this.item.offsetWidth;
        this.itemHeight = this.item.offsetHeight;
        this.contWidth = this.compRoot.offsetWidth;
        this.contHeight = this.compRoot.offsetHeight;
        this.limitX = (this.itemWidth - this.contWidth) / 2;
        this.limitY = (this.itemHeight - this.contHeight) / 2;
    }

    onMouseDown() {
        const target = mouseManager.getTarget();

        if (target === this.item) {
            this.onDrag = true;
            this.firstDrag = true;
        }
    }

    onMouseUp() {
        this.onDrag = false;
    }

    onMove() {
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

        const { xComputed, yComputed } = (() => {
            if (this.onDrag) {
                return {
                    xComputed: this.dragX,
                    yComputed: this.dragY,
                };
            } else {
                return {
                    xComputed: x,
                    yComputed: y,
                };
            }
        })();

        const xCondition = (() => {
            if (this.itemWidth < this.contWidth) {
                return 'NO-DRAG';
            } else if (
                this.dragX <= -this.limitX &&
                this.dragX <= this.limitX
            ) {
                return 'RIGHT-LIMIT';
            } else if (this.dragX > -this.limitX && this.dragX >= this.limitX) {
                return 'LEFT-LIMIT';
            } else {
                return 'DEFAULT';
            }
        })();

        const yCondition = (() => {
            if (this.itemHeight < this.contHeight) {
                return 'NO-DRAG';
            } else if (
                this.dragY <= -this.limitY &&
                this.dragY <= this.limitY
            ) {
                return 'BOTTOM-LIMIT';
            } else if (this.dragY > -this.limitY && this.dragY >= this.limitY) {
                return 'TOP-LIMIT';
            } else {
                return 'DEFAULT';
            }
        })();

        const xLimited = (() => {
            switch (xCondition) {
                case 'NO-DRAG':
                    return 0;

                case 'RIGHT-LIMIT':
                    return -this.limitX;

                case 'LEFT-LIMIT':
                    return this.limitX;

                case 'DEFAULT':
                    return xComputed;
            }
        })();

        const yLimited = (() => {
            switch (yCondition) {
                case 'NO-DRAG':
                    return 0;

                case 'BOTTOM-LIMIT':
                    return -this.limitY;

                case 'TOP-LIMIT':
                    return this.limitY;

                case 'DEFAULT':
                    return yComputed;
            }
        })();

        switch (xCondition) {
            case 'NO-DRAG':
                this.dragX -= xgap;
                break;

            case 'RIGHT-LIMIT':
                this.dragX -= this.dragX + this.limitX;
                break;

            case 'LEFT-LIMIT':
                this.dragX -= this.dragX - this.limitX;
                break;
        }

        switch (yCondition) {
            case 'NO-DRAG':
                this.dragY -= ygap;
                break;

            case 'BOTTOM-LIMIT':
                this.dragY -= this.dragY + this.limitY;
                break;

            case 'TOP-LIMIT':
                this.dragY -= this.dragY - this.limitY;
                break;
        }

        this.lastX = x;
        this.lastY = y;

        if (this.onDrag) {
            this.endValue = { xLimited, yLimited };

            if (!this.rafOnScroll)
                this.rafOnScroll = requestAnimationFrame(
                    this.onReuqestAnimScroll.bind(this)
                );
        }
    }

    onReuqestAnimScroll(timeStamp) {
        const draw = (timeStamp) => {
            this.prevValue = { ...this.startValue };

            const { xLimited, yLimited } = (() => {
                const v = this.smooth;
                const { xLimited: xLimitedStart, yLimited: yLimitedStart } =
                    this.startValue;
                const { xLimited: xLimitedEnd, yLimited: yLimitedEnd } =
                    this.endValue;

                const xLimited =
                    (xLimitedEnd - xLimitedStart) / v + xLimitedStart * 1;
                const yLimited =
                    (yLimitedEnd - yLimitedStart) / v + yLimitedStart * 1;

                return {
                    xLimited: xLimited.toFixed(1),
                    yLimited: yLimited.toFixed(1),
                };
            })();

            this.startValue = { xLimited, yLimited };
            const { xLimited: axPrev, yLimited: ayPrev } = this.prevValue;

            this.item.style.transform = `translate3D(${xLimited}px, ${yLimited}px, 0)`;

            if (xLimited == axPrev && yLimited == ayPrev) {
                cancelAnimationFrame(this.rafOnScroll);
                this.rafOnScroll = null;
                return;
            }

            this.rafOnScroll = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }
}
