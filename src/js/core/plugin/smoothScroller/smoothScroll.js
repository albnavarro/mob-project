import { handleResize } from '../../events/resizeUtils/handleResize.js';
import {
    handleScrollStart,
    handleScrollEnd,
} from '../../events/scrollUtils/handleScrollUtils.js';
import {
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleTouchMove,
    handleMouseWheel,
    handleMouseClick,
} from '../../events/mouseUtils/handleMouse.js';
import {
    isDescendant,
    getTranslateValues,
} from '../../utils/vanillaFunction.js';
import HandleLerp from '../../animation/lerp/handleLerp.js';
import HandleSpring from '../../animation/spring/handleSpring.js';
import { clamp } from '../../animation/utils/animationUtils.js';
import { normalizeWheel } from '../../events/mouseUtils/normalizeWhell.js';
import { checkType } from '../../store/storeType.js';

export default class SmoothScrollClass {
    constructor(data = {}) {
        this.VERTICAL = 'VERTICAL';
        this.HORIZONTAL = 'HORIZONTAL';
        this.direction = data.direction ?? this.VERTICAL;

        this.target = checkType(String, data?.target)
            ? document.querySelector(data.target)
            : data.target;

        this.container = data?.container
            ? (() => {
                  return checkType(String, data.container)
                      ? document.querySelector(data.container)
                      : data.container;
              })()
            : document.documentElement;

        this.scopedEvent = data?.scopedEvent ?? false;
        this.speed = data.speed ?? 60;
        this.drag = data.drag ?? false;
        this.endValue = 0;
        this.percent = 0;
        this.containerWidth = 0;
        this.containerHeight = 0;
        this.firstTouchValue = 0;
        this.threshold = 30;
        this.maxValue = 0;
        this.minValue - 0;

        // Touch controls
        this.dragEnable = null;
        this.touchend = null;
        this.touchmove = null;
        this.prevTouchVal = 0;
        this.touchVal = 0;
        //
        this.onTickCallback = [];
        this.onUpdateScrollBar = () => {};

        // Unsubscribe event
        this.subscribeResize = () => {};
        this.subscribeScrollStart = () => {};
        this.subscribeScrollEnd = () => {};
        this.subscribeTouchStart = () => {};
        this.subscribeTouchEnd = () => {};
        this.subscribeMouseDown = () => {};
        this.subscribeMouseUp = () => {};
        this.subscribeMouseWheel = () => {};
        this.subscribeMouseMove = () => {};
        this.subscribeTouchMove = () => {};
        this.subscribeMouseClick = () => {};

        // Animation
        this.LERP = 'lerp';
        this.SPRING = 'spring';
        this.motionType = data.motionType || this.LERP;
        this.motion = null;
        this.unsubscribeMotion = () => {};
        this.unsubscribeOnComplete = () => {};

        this.scrollbarIsRunning = false;
    }

    init() {
        switch (this.motionType) {
            case this.SPRING:
                this.motion = new HandleSpring();
                break;

            default:
                this.motion = new HandleLerp();
                break;
        }

        /**
         * scoped event
         */
        if (this.scopedEvent) {
            this.target.addEventListener('wheel', this.scopedWhell, {
                passive: true,
            });

            this.target.addEventListener('mousemove', this.scopedTouchMove, {
                passive: true,
            });

            this.target.addEventListener('touchmove', this.scopedTouchMove, {
                passive: true,
            });
        } else {
            this.subscribeMouseWheel = handleMouseWheel((data) =>
                this.onWhell(data)
            );

            this.subscribeMouseMove = handleMouseMove((data) =>
                this.onTouchMove(data)
            );
            this.subscribeTouchMove = handleTouchMove((data) =>
                this.onTouchMove(data)
            );
        }

        /**
         * Common event
         */
        this.updateProps();
        this.subscribeResize = handleResize(() => this.updateProps());
        this.subscribeScrollStart = handleScrollStart(() => this.updateProps());
        this.subscribeScrollEnd = handleScrollEnd(() => this.updateProps());
        this.subscribeTouchStart = handleTouchStart((data) =>
            this.onMouseDown(data)
        );
        this.subscribeTouchEnd = handleTouchEnd((data) => this.onMouseUp(data));
        this.subscribeMouseDown = handleMouseDown((data) =>
            this.onMouseDown(data)
        );
        this.subscribeMouseUp = handleMouseUp((data) => this.onMouseUp(data));

        if (this.drag) {
            this.subscribeMouseClick = handleMouseClick(
                ({ target, preventDefault }) => {
                    this.preventChecker({ target, preventDefault });
                }
            );
        }

        // Set link and button to draggable false, prevent mousemouve fail
        this.target.style['user-select'] = 'none';
        const activeElement = this.target.querySelectorAll('a, button');
        [...activeElement].forEach((item) => {
            item.setAttribute('draggable', false);
            item.style['user-select'] = 'none';
        });

        this.initMotion();
    }

    initMotion() {
        this.motion.setData({ val: 0 });

        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            if (this.direction == this.VERTICAL) {
                this.target.style.transform = `translate3d(0px, 0px, 0px) translateY(${-val}px)`;
            } else {
                this.target.style.transform = `translate3d(0px, 0px, 0px) translateX(${-val}px)`;
            }

            this.onTickCallback.forEach((item) => {
                item({
                    scrollValue: -val,
                    percent: this.percent,
                });
            });
        });

        this.unsubscribeOnComplete = this.motion.onComplete(({ val }) => {
            if (this.direction == this.VERTICAL) {
                this.target.style.transform = `translateY(${-val}px)`;
            } else {
                this.target.style.transform = `translateX(${-val}px)`;
            }

            this.onTickCallback.forEach((item) => {
                item(-val);
            });
        });
    }

    scopedWhell = (e) => {
        const { spinY } = normalizeWheel(e);
        this.onScopedWhell({
            target: e.target,
            spinY,
        });
    };

    scopedTouchMove = (e) => {
        const { clientX, clientY } = e.touches ? e.touches[0] : e;

        this.onScopedTouchMove({
            client: {
                x: clientX,
                y: clientY,
            },
        });
    };

    onTick(fn) {
        this.onTickCallback.push(fn);
    }

    updateScrollbar(fn) {
        this.onUpdateScrollBar = fn;
    }

    /**
     * preventChecker - prevent default if scroll difference from dow to up is less thshold value
     *
     * @param  {event} e listener event
     * @return {void}
     */
    preventChecker({ target, preventDefault }) {
        if (target === this.target || isDescendant(this.target, target)) {
            if (
                Math.abs(this.endValue - this.firstTouchValue) > this.threshold
            ) {
                preventDefault();
            }
        }
    }

    // RESET DATA
    updateProps() {
        this.isScrolling = false;

        this.containerWidth =
            this.container === document.documentElement
                ? document.documentElement.clientWidth
                : this.container.offsetWidth;

        this.containerHeight =
            this.container === document.documentElement
                ? document.documentElement.clientHeight
                : this.container.offsetHeight;

        const resetValue = (() => {
            if (this.direction === this.VERTICAL) {
                return -getTranslateValues(this.target).y;
            } else {
                return -getTranslateValues(this.target).x;
            }
        })();

        this.endValue = resetValue;
        this.motion.set({ val: resetValue }).catch(() => {});

        this.maxValue = (() => {
            if (this.direction === this.VERTICAL) {
                return this.target.offsetHeight - this.containerHeight;
            } else {
                return this.target.offsetWidth - this.containerWidth;
            }
        })();

        this.calculateValue();
    }

    // GET POSITION FORM MOUSE/TOUCH EVENT
    getMousePos(client) {
        const { x, y } = client;
        return this.direction === this.VERTICAL ? y : x;
    }

    onMouseDown({ target, client }) {
        if (target === this.target || isDescendant(this.target, target)) {
            this.firstTouchValue = this.endValue;
            this.dragEnable = true;
            this.prevTouchVal = this.getMousePos(client);
            this.touchVal = this.getMousePos(client);
            this.scrollbarIsRunning = false;
        }
    }

    onMouseUp() {
        this.dragEnable = false;
        this.scrollbarIsRunning = false;
    }

    onTouchMove({ target, client, preventDefault }) {
        if (
            (target === this.target || isDescendant(this.target, target)) &&
            this.dragEnable &&
            this.drag
        ) {
            preventDefault();

            this.prevTouchVal = this.touchVal;
            this.touchVal = this.getMousePos(client);

            const result = parseInt(this.prevTouchVal - this.touchVal);
            this.endValue += result;

            this.calculateValue();
            this.scrollbarIsRunning = false;
        }
    }

    onScopedTouchMove({ client }) {
        if (!this.dragEnable || !this.drag) return;

        this.prevTouchVal = this.touchVal;
        this.touchVal = this.getMousePos(client);

        const result = parseInt(this.prevTouchVal - this.touchVal);
        this.endValue += result;

        this.calculateValue();
        this.scrollbarIsRunning = false;
    }

    onScopedWhell({ spinY }) {
        this.dragEnable = false;
        this.endValue += spinY * this.speed;
        this.calculateValue();
        this.scrollbarIsRunning = false;
    }

    onWhell({ target, spinY, preventDefault }) {
        const bodyIsOverflow =
            document.body.style.overflow === 'hidden' &&
            this.direction === this.VERTICAL;

        if (bodyIsOverflow) return;

        this.dragEnable = false;
        if (target === this.target || isDescendant(this.target, target)) {
            preventDefault();
            this.endValue += spinY * this.speed;
            this.calculateValue();
            this.scrollbarIsRunning = false;
        }
    }

    move(percent) {
        this.scrollbarIsRunning = true;
        this.percent = percent;
        this.endValue = (this.percent * this.maxValue) / 100;
        this.motion.goTo({ val: this.endValue }).catch(() => {});
    }

    // COMMON CALCULATE VALUE
    calculateValue() {
        const percentValue = (this.endValue * 100) / this.maxValue;
        this.percent = clamp(percentValue, 0, 100);
        this.endValue = clamp(this.endValue, 0, this.maxValue);
        this.motion.goTo({ val: this.endValue }).catch(() => {});

        if (!this.scrollbarIsRunning) {
            this.onUpdateScrollBar({
                scrollValue: -this.endValue,
                percent: this.percent,
            });
        }
    }

    destroy() {
        this.subscribeResize();
        this.subscribeScrollStart();
        this.subscribeScrollEnd();
        this.subscribeTouchStart();
        this.subscribeTouchEnd();
        this.subscribeMouseDown();
        this.subscribeMouseUp();
        this.subscribeMouseWheel();
        this.subscribeMouseMove();
        this.subscribeTouchMove();
        this.subscribeMouseClick();
        this.unsubscribeMotion();
        this.unsubscribeOnComplete();
        this.onUpdateScrollBar = () => {};
        this.motion?.destroy();
        this.motion = null;

        if (this.scopedEvent) {
            this.target.removeEventListener('wheel', this.scopedWhell);
            this.target.removeEventListener('mousemove', this.scopedTouchMove);
            this.target.removeEventListener('touchmove', this.scopedTouchMove);
        }
    }
}
