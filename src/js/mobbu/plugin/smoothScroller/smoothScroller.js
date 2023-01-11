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
    outerHeight,
    outerWidth,
} from '../../utils/vanillaFunction.js';
import HandleLerp from '../../animation/lerp/handleLerp.js';
import HandleSpring from '../../animation/spring/handleSpring.js';
import { clamp } from '../../animation/utils/animationUtils.js';
import { normalizeWheel } from '../../events/mouseUtils/normalizeWhell.js';
import { checkType } from '../../store/storeType.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { handleFrameIndex } from '../../events/rafutils/handleFrameIndex.js';
import { mq } from '../../utils/mediaManager.js';
import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { NOOP } from '../../utils/functionsUtils.js';
import { parallaxConstant } from '../../animation/parallax/parallaxConstant.js';
import {
    breakpointIsValid,
    breakpointTypeIsValid,
    directionIsValid,
    genericEaseTypeIsValid,
    valueIsBooleanAndReturnDefault,
    valueIsFunctionAndReturnDefault,
    valueIsNumberAndReturnDefault,
} from '../../animation/utils/tweenValidation.js';

export default class SmoothScroller {
    constructor(data = {}) {
        /**
         * @private
         */
        this.propsIsValid = true;

        /**
         * @private
         */
        this.endValue = 0;

        /**
         * @private
         */
        this.percent = 0;

        /**
         * @private
         */
        this.screenWidth = 0;

        /**
         * @private
         */
        this.screenHeight = 0;

        /**
         * @private
         */
        this.firstTouchValue = 0;

        /**
         * @private
         */
        this.threshold = 30;

        /**
         * @private
         */
        this.maxValue = 0;

        /**
         * @private
         */
        this.minValue = 0;

        /**
         * @private
         */
        this.dragEnable = null;

        /**
         * @private
         */
        this.touchend = null;

        /**
         * @private
         */
        this.touchmove = null;

        /**
         * @private
         */
        this.prevTouchVal = 0;

        /**
         * @private
         */
        this.touchVal = 0;

        /**
         * @private
         */
        this.onUpdateScrollBar = NOOP;

        /**
         * @private
         */
        this.subscribeResize = NOOP;

        /**
         * @private
         */
        this.subscribeScrollStart = NOOP;

        /**
         * @private
         */
        this.subscribeScrollEnd = NOOP;

        /**
         * @private
         */
        this.subscribeTouchStart = NOOP;

        /**
         * @private
         */
        this.subscribeTouchEnd = NOOP;

        /**
         * @private
         */
        this.subscribeMouseDown = NOOP;

        /**
         * @private
         */
        this.subscribeMouseUp = NOOP;

        /**
         * @private
         */
        this.subscribeMouseWheel = NOOP;

        /**
         * @private
         */
        this.subscribeMouseMove = NOOP;

        /**
         * @private
         */
        this.subscribeTouchMove = NOOP;

        /**
         * @private
         */
        this.subscribeMouseClick = NOOP;

        /**
         * @private
         */
        this.motion = null;

        /**
         * @private
         */
        this.unsubscribeMotion = NOOP;

        /**
         * @private
         */
        this.unsubscribeOnComplete = NOOP;

        /**
         * @private
         */
        this.scrollbarIsRunning = false;

        /**
         * @private
         */
        this.direction = directionIsValid(data?.direction, 'SmoothScroller');

        /**
         * @private
         */
        this.easeType = genericEaseTypeIsValid(
            data?.easeType,
            'SmoothScroller'
        );

        /**
         * @private
         */
        this.breackpoint = breakpointIsValid(
            data?.breackpoint,
            'breakpoint',
            'SmoothScroller'
        );

        /**
         * @private
         */
        this.queryType = breakpointTypeIsValid(
            data?.queryType,
            'queryType',
            'SmoothScroller'
        );

        /**
         * @private
         */
        this.scroller = checkType(String, data?.scroller)
            ? document.querySelector(data.scroller)
            : data.scroller;

        if (!this.scroller) {
            console.warn('SmoothScroller: scroller node not found');
            this.propsIsValid = false;
            return;
        }

        /**
         * @private
         */
        this.screen = data?.screen
            ? (() => {
                  return checkType(String, data.screen)
                      ? document.querySelector(data.screen)
                      : data.screen;
              })()
            : document.documentElement;

        if (!this.screen) {
            this.propsIsValid = false;
            console.warn('SmoothScroller: screen node not found');
            return;
        }

        /**
         * @private
         */
        this.scopedEvent = valueIsBooleanAndReturnDefault(
            data?.scopedEvent,
            'SmoothScroller: scopedEvent',
            false
        );

        /**
         * @private
         */
        this.speed = valueIsNumberAndReturnDefault(
            data?.speed,
            'SmoothScroller: speed',
            60
        );

        /**
         * @private
         */
        this.drag = valueIsBooleanAndReturnDefault(
            data?.drag,
            'SmoothScroller: drag',
            false
        );

        /**
         * @private
         */
        this.onTickCallback = valueIsFunctionAndReturnDefault(
            data?.onTick,
            'SmoothScroller: onTick',
            null
        );

        /**
         * @private
         */
        this.onAfterRefresh = valueIsFunctionAndReturnDefault(
            data?.afterRefresh,
            'SmoothScroller: afterRefresh',
            null
        );

        /**
         * @private
         */
        this.children = data?.children || [];
        this.children.forEach((element) => {
            element.setScroller(this.scroller);
            element.setDirection(this.direction);
            element.setScreen(this.screen);
            element.setBreakPoint(this.breackpoint);
            element.setQueryType(this.queryType);
            element.init();
        });

        /**
         * Scoped event
         */
        this.scopedWhell = (e) => {
            const { spinY } = normalizeWheel(e);
            this.onScopedWhell({
                target: e.target,
                spinY,
            });
        };

        this.scopedTouchMove = (e) => {
            const { clientX, clientY } = e.touches ? e.touches[0] : e;

            this.onScopedTouchMove({
                client: {
                    x: clientX,
                    y: clientY,
                },
            });
        };
    }

    init() {
        if (!this.propsIsValid) return;

        switch (this.easeType) {
            case parallaxConstant.EASE_SPRING:
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
            this.scroller.addEventListener('wheel', this.scopedWhell, {
                passive: true,
            });

            this.scroller.addEventListener('mousemove', this.scopedTouchMove, {
                passive: true,
            });

            this.scroller.addEventListener('touchmove', this.scopedTouchMove, {
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
        this.subscribeResize = handleResize(() => this.refresh());
        this.subscribeScrollStart = handleScrollStart(() =>
            this.refreshScroller()
        );
        this.subscribeScrollEnd = handleScrollEnd(() => this.refreshScroller());
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

        this.initMotion();

        if (mq[this.queryType](this.breackpoint)) {
            this.setScrolerStyle();
            this.refreshScroller();
        }
    }

    setScrolerStyle() {
        this.scroller.style['user-select'] = 'none';

        const activeElement = this.scroller.querySelectorAll('a, button');
        [...activeElement].forEach((item) => {
            item.setAttribute('draggable', false);
            item.style['user-select'] = 'none';
        });
    }

    removeScrolerStyle() {
        this.scroller.style['user-select'] = '';

        const activeElement = this.scroller.querySelectorAll('a, button');
        [...activeElement].forEach((item) => {
            item.removeAttribute('draggable');
            item.style['user-select'] = '';
        });
    }

    initMotion() {
        this.motion.setData({ val: 0 });

        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            if (this.direction == parallaxConstant.DIRECTION_VERTICAL) {
                this.scroller.style.transform = `translate3d(0px, 0px, 0px) translateY(${-val}px)`;
            } else {
                this.scroller.style.transform = `translate3d(0px, 0px, 0px) translateX(${-val}px)`;
            }

            /**
             * TODO Move to scroll Start (scopedEvent or not , wheel touch etc...)
             * Used by instance with ease = true;
             */
            this.children.forEach((element) => {
                element.triggerScrollStart();
            });

            handleNextTick.add(() => {
                if (this.onTickCallback)
                    this.onTickCallback({
                        value: -val,
                        percent: this.percent,
                        parentIsMoving: true,
                    });

                this.children.forEach((element) => {
                    element.move({
                        value: -val,
                        parentIsMoving: true,
                    });
                });
            });
        });

        this.unsubscribeOnComplete = this.motion.onComplete(({ val }) => {
            if (this.direction == parallaxConstant.DIRECTION_VERTICAL) {
                this.scroller.style.transform = `translateY(${-val}px)`;
            } else {
                this.scroller.style.transform = `translateX(${-val}px)`;
            }

            handleNextTick.add(() => {
                if (this.onTickCallback)
                    this.onTickCallback({
                        value: -val,
                        percent: this.percent,
                        parentIsMoving: false,
                    });

                this.children.forEach((element) => {
                    element.triggerScrollEnd();
                    element.move({
                        value: -val,
                        parentIsMoving: false,
                    });
                });
            });
        });
    }

    refreshScroller() {
        this.screenWidth =
            this.screen === document.documentElement
                ? window.innerWidth
                : outerWidth(this.screen);

        this.screenHeight =
            this.screen === document.documentElement
                ? window.innerHeight
                : outerHeight(this.screen);

        this.maxValue =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.scroller.offsetHeight - this.screenHeight
                : this.scroller.offsetWidth - this.screenWidth;

        this.calculateValue();
    }

    onScopedTouchMove({ client }) {
        if (!this.dragEnable || !this.drag) return;

        this.prevTouchVal = this.touchVal;
        this.touchVal = this.getMousePos(client);
        this.endValue += parseInt(this.prevTouchVal - this.touchVal);
        this.calculateValue();
        this.scrollbarIsRunning = false;
    }

    onScopedWhell({ spinY }) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.dragEnable = false;
        this.endValue += spinY * this.speed;
        this.calculateValue();
        this.scrollbarIsRunning = false;
    }

    /**
     * Listener related event.
     * Global
     */
    onMouseDown({ target, client }) {
        if (!mq[this.queryType](this.breackpoint)) return;

        if (target === this.scroller || isDescendant(this.scroller, target)) {
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
            (target === this.scroller || isDescendant(this.scroller, target)) &&
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

    onWhell({ target, spinY, preventDefault }) {
        const bodyIsOverflow =
            document.body.style.overflow === 'hidden' &&
            this.direction === parallaxConstant.DIRECTION_VERTICAL;

        if (!mq[this.queryType](this.breackpoint) || bodyIsOverflow) return;

        if (target === this.scroller || isDescendant(this.scroller, target)) {
            this.dragEnable = false;
            preventDefault();
            this.endValue += spinY * this.speed;
            this.calculateValue();
            this.scrollbarIsRunning = false;
        }
    }

    /**
     * Scrollbar
     */
    move(percent) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.scrollbarIsRunning = true;
        this.percent = percent;
        this.endValue = (this.percent * this.maxValue) / 100;
        this.motion.goTo({ val: this.endValue }).catch(() => {});
    }

    /**
     * Utils
     */
    calculateValue() {
        const percentValue = (this.endValue * 100) / this.maxValue;
        this.percent = clamp(percentValue, 0, 100);
        this.endValue = clamp(this.endValue, 0, this.maxValue);
        this.motion.goTo({ val: this.endValue }).catch(() => {});
    }

    preventChecker({ target, preventDefault }) {
        if (
            mq[this.queryType](this.breackpoint) &&
            (target === this.scroller || isDescendant(this.scroller, target)) &&
            Math.abs(this.endValue - this.firstTouchValue) > this.threshold
        ) {
            preventDefault();
        }
    }

    getMousePos(client) {
        const { x, y } = client;
        return this.direction === parallaxConstant.DIRECTION_VERTICAL ? y : x;
    }

    refresh() {
        if (!mq[this.queryType](this.breackpoint)) {
            this.removeScrolerStyle();
            this.motion?.stop?.();
            handleFrame.add(() => {
                handleNextTick.add(() => {
                    this.scroller.style.transform = '';
                });
            });
            return;
        }

        this.refreshScroller();
        this.setScrolerStyle();

        handleFrameIndex.add(() => {
            handleNextTick.add(() => {
                if (this.onAfterRefresh) this.onAfterRefresh();

                this.children.forEach((element) => {
                    element?.refresh?.();
                });
            });
        }, 2);
    }

    /**
     * Destrory
     */
    destroy() {
        this.removeScrolerStyle();
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
        this.children.forEach((element) => {
            element?.destroy?.();
            element = null;
        });
        this.children = [];
        this.onTickCallback = [];
        this.onAfterRefresh = [];

        if (this.scopedEvent) {
            this.scroller.removeEventListener('wheel', this.scopedWhell);
            this.scroller.removeEventListener(
                'mousemove',
                this.scopedTouchMove
            );
            this.scroller.removeEventListener(
                'touchmove',
                this.scopedTouchMove
            );
        }
    }
}
