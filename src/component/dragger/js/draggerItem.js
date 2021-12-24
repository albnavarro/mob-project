import { isDescendant } from '../../../js/utility/vanillaFunction.js';
import { useSpring } from '.../../../js/core/animation/spring/useSpring.js';
import { useResize } from '.../../../js/core/events/resizeUtils/useResize.js';
import { useScroll } from '.../../../js/core/events/scrollUtils/useScroll.js';
import {
    useTouchStart,
    useTouchEnd,
    useMouseDown,
    useMouseUp,
    useMouseMove,
    useTouchMove,
} from '.../../../js/core/events/mouseUtils/useMouse.js';

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

        // Detect click
        this.firstTouchValue = { x: 0, y: 0 };
        this.threshold = 30;

        // Animation
        this.endValue = { xValue: 0, yValue: 0 };
        this.spring = new useSpring();
        this.unsubscribeSpring = () => {};

        this.unsubscribeResize = () => {};
        this.unsubscribeTouchStart = () => {};
        this.unsubscribeTouchEnd = () => {};
        this.unsubscribeMouseDown = () => {};
        this.unsubscribeMouseUp = () => {};
        this.unsubscribeMouseMove = () => {};
        this.unsubscribeTouchMove = () => {};
        this.unsubscribeResize = () => {};
    }

    init() {
        this.unsubscribeTouchStart = useTouchStart(({ page, target }) => {
            this.onMouseDown({ page, target });
        });

        this.unsubscribeMouseDown = useMouseDown(({ page, target }) => {
            this.onMouseDown({ page, target });
        });

        this.unsubscribeTouchEnd = useTouchEnd(() => {
            this.onMouseUp();
        });

        this.unsubscribeMouseUp = useMouseUp(() => {
            this.onMouseUp();
        });

        this.unsubscribeMouseMove = useMouseMove(({ page }) => {
            this.onMove({ page });
        });

        this.unsubscribeTouchMove = useTouchMove(({ page }) => {
            this.onMove({ page });
        });

        this.unsubscribeResize = useResize(() => {
            this.onResize();
        });

        // Prevent default listener
        this.compRoot.addEventListener(
            'click',
            (e) => this.preventChecker(e),
            false
        );

        this.TOP_LEFT = 'TOP-LEFT';
        this.TOP_RIGHT = 'TOP-RIGHT';
        this.BOTTOM_LEFT = 'BOTTOM-LEFT';
        this.BOTTOM_RIGHT = 'BOTTOM-RIGHT';

        // Set start position
        switch (this.startPosition) {
            case this.TOP_LEFT:
                this.endValue = {
                    xValue: this.limitX,
                    yValue: this.limitY,
                };
                this.dragX = this.itemWidth;
                this.dragY = this.itemHeight;
                break;

            case this.TOP_RIGHT:
                this.endValue = {
                    xValue: -this.limitX,
                    yValue: this.limitY,
                };
                this.dragX = -this.itemWidth;
                this.dragY = this.itemHeight;
                break;

            case this.BOTTOM_LEFT:
                this.endValue = {
                    xValue: this.limitX,
                    yValue: -this.limitY,
                };
                this.dragX = this.itemWidth;
                this.dragY = -this.itemHeight;
                break;

            case this.BOTTOM_RIGHT:
                this.endValue = {
                    xValue: -this.limitX,
                    yValue: -this.limitY,
                };
                this.dragX = -this.itemWidth;
                this.dragY = -this.itemHeight;
                break;
        }

        // Setup spring animation
        this.spring.setData({
            x: 0,
            y: 0,
        });

        // Set inzial position based on align selected
        this.spring.set({
            x: this.endValue.xValue,
            y: this.endValue.yValue,
        });

        this.unsubscribeSpring = this.spring.subscribe(({ x, y }) => {
            this.item.style.transform = `translate3D(${x}px, ${y}px, 0)`;
        });

        // Set link and button to draggable false, prevent mousemouve fail
        this.compRoot.style['user-select'] = 'none';
        const activeElement = this.compRoot.querySelectorAll('a, button');
        [...activeElement].forEach((item, i) => {
            item.setAttribute('draggable', false);
            item.style['user-select'] = 'none';
        });
    }

    destroy() {
        this.unsubscribeResize();
        this.unsubscribeTouchStart();
        this.unsubscribeTouchEnd();
        this.unsubscribeMouseDown();
        this.unsubscribeMouseUp();
        this.unsubscribeMouseMove();
        this.unsubscribeTouchMove();
        this.unsubscribeResize();
    }

    onResize() {
        this.itemWidth = this.item.offsetWidth;
        this.itemHeight = this.item.offsetHeight;
        this.contWidth = this.compRoot.offsetWidth;
        this.contHeight = this.compRoot.offsetHeight;
        this.limitX = (this.itemWidth - this.contWidth) / 2;
        this.limitY = (this.itemHeight - this.contHeight) / 2;
    }

    /**
     * preventChecker - prevent default if scroll difference from dow to up is less thshold value
     *
     * @param  {event} e listener event
     * @return {void}
     */
    preventChecker(e) {
        const { x: xFirst, y: yFirst } = this.firstTouchValue;

        const xChecker = Math.abs(this.lastX - xFirst) > this.threshold;
        const yChecker = Math.abs(this.lastY - yFirst) > this.threshold;

        if (xChecker || yChecker) {
            e.preventDefault();
        }
    }

    onMouseDown({ page, target }) {
        if (target === this.item || isDescendant(this.item, target)) {
            this.onDrag = true;
            this.firstDrag = true;
            this.firstTouchValue = { x: page.x, y: page.y };
        }
    }

    onMouseUp() {
        this.onDrag = false;
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    onMove({ page }) {
        const { x, y } = page;

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
            this.spring.goTo({ x: xValue, y: yValue }).catch((err) => {});
        }
    }
}
