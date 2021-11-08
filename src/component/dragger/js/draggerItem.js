import { eventManager } from '../../../js/base/eventManager.js';
import { mouseManager } from '../../../js/base/mouseManager.js';
import { isDescendant } from '../../../js/utility/vanillaFunction.js';

export class DraggerItemClass {
    constructor(data) {
        // Constant
        this.TOP_LEFT = 'TOP-LEFT';
        this.TOP_RIGHT = 'TOP-RIGHT';
        this.BOTTOM_LEFT = 'BOTTOM-LEFT';
        this.BOTTOM_RIGHT = 'BOTTOM-RIGHT';
        this.CENTER = 'CENTER';
        this.targetClass = '.dragger__item';

        // Prop
        this.compRoot = data.compRoot;
        this.smooth = data.ease;
        this.startPosition = data.position.toUpperCase();
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
        this.endValue = { xValue: 0, yValue: 0 };
        this.startValue = { xValue: 0, yValue: 0 };
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
                    xValue: this.limitX,
                    yValue: this.limitY,
                };
                this.startValue = {
                    xValue: this.limitX,
                    yValue: this.limitY,
                };
                this.dragX = this.itemWidth;
                this.dragY = this.itemHeight;
                break;

            case this.TOP_RIGHT:
                this.item.style.transform = `translate3D(${-this.limitX}px, ${
                    this.limitY
                }px, 0)`;
                this.endValue = {
                    xValue: -this.limitX,
                    yValue: this.limitY,
                };
                this.startValue = {
                    xValue: -this.limitX,
                    yValue: this.limitY,
                };
                this.dragX = -this.itemWidth;
                this.dragY = this.itemHeight;
                break;

            case this.BOTTOM_LEFT:
                this.item.style.transform = `translate3D(${
                    this.limitX
                }px, ${-this.limitY}px, 0)`;
                this.endValue = {
                    xValue: this.limitX,
                    yValue: -this.limitY,
                };
                this.startValue = {
                    xValue: this.limitX,
                    yValue: -this.limitY,
                };
                this.dragX = this.itemWidth;
                this.dragY = -this.itemHeight;
                break;

            case this.BOTTOM_RIGHT:
                this.item.style.transform = `translate3D(${-this
                    .limitX}px, ${-this.limitY}px, 0)`;
                this.endValue = {
                    xValue: -this.limitX,
                    yValue: -this.limitY,
                };
                this.startValue = {
                    xValue: -this.limitX,
                    yValue: -this.limitY,
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

        if (target === this.item || isDescendant(this.item, target)) {
            this.onDrag = true;
            this.firstDrag = true;
        }
    }

    onMouseUp() {
        this.onDrag = false;
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
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

        /**
         * Get diffrence form last value
         */
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

        /**
         * Get x value clamped to min max if is dragging or last vlue
         */
        const dragX = this.onDrag
            ? this.clamp(this.dragX + xgap, -this.limitX, this.limitX)
            : this.dragX;

        /**
         * Get y value clamped to min max if is dragging or last vlue
         */
        const dragY = this.onDrag
            ? this.clamp(this.dragY + ygap, -this.limitY, this.limitY)
            : this.dragY;

        /**
         * use calmped value or mouse value if is dragging
         */
        const { xComputed, yComputed } = (() => {
            if (this.onDrag) {
                return {
                    xComputed: dragX,
                    yComputed: dragY,
                };
            } else {
                return {
                    xComputed: x,
                    yComputed: y,
                };
            }
        })();

        /**
         * Get final value if item is bigger then container
         */
        const xValue = this.itemWidth < this.contWidth ? 0 : xComputed;
        const yValue = this.itemHeight < this.contHeight ? 0 : yComputed;

        /**
         * Update gobal value
         */
        this.dragX = dragX;
        this.dragY = dragY;

        this.lastX = x;
        this.lastY = y;

        if (this.onDrag) {
            this.endValue = { xValue, yValue };

            if (!this.rafOnScroll)
                this.rafOnScroll = requestAnimationFrame(
                    this.onReuqestAnimScroll.bind(this)
                );
        }
    }

    onReuqestAnimScroll(timeStamp) {
        const draw = (timeStamp) => {
            this.prevValue = { ...this.startValue };

            const { xValue, yValue } = (() => {
                const v = this.smooth;
                const { xValue: xValueStart, yValue: yValueStart } =
                    this.startValue;
                const { xValue: xValueEnd, yValue: yValueEnd } = this.endValue;

                const xValue = (xValueEnd - xValueStart) / v + xValueStart * 1;
                const yValue = (yValueEnd - yValueStart) / v + yValueStart * 1;

                return {
                    xValue: xValue.toFixed(1),
                    yValue: yValue.toFixed(1),
                };
            })();

            this.startValue = { xValue, yValue };
            const { xValue: axPrev, yValue: ayPrev } = this.prevValue;

            this.item.style.transform = `translate3D(${xValue}px, ${yValue}px, 0)`;

            if (xValue == axPrev && yValue == ayPrev) {
                cancelAnimationFrame(this.rafOnScroll);
                this.rafOnScroll = null;
                return;
            }

            this.rafOnScroll = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }
}
