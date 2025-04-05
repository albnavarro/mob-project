// @ts-check

import MobLerp from '../../animation/lerp/MobLerp.js';
import MobSpring from '../../animation/spring/MobSpring.js';
import { clamp } from '../../animation/utils/animationUtils.js';
import { mq } from '../../utils/mediaManager.js';
import { NOOP } from '../../utils/functionsUtils.js';
import { MobScrollerConstant } from '../../animation/scroller/MobScrollerConstant.js';
import {
    breakpointIsValid,
    breakpointTypeIsValid,
    directionIsValid,
    genericEaseTypeIsValid,
    valueIsBooleanAndReturnDefault,
    valueIsFunctionAndReturnDefault,
    valueIsNumberAndReturnDefault,
} from '../../animation/utils/tweenAction/tweenValidation.js';
import { MobCore } from '../../../mobCore/index.js';
import {
    isDescendant,
    outerHeight,
    outerWidth,
} from '../../../mobCore/utils/index.js';
import {
    FreezeMobPageScroll,
    UnFreezeMobPageScroll,
} from '../pageScroll/pageScroller.js';

export class MobSmoothScroller {
    /**
     * @type {boolean}
     */
    #propsIsValid;

    /**
     * @type {number}
     */
    #endValue;

    /**
     * @type {number}
     */
    #percent;

    /**
     * @type {number}
     */
    #screenWidth;

    /**
     * @type {number}
     */
    #screenHeight;

    /**
     * @type {number}
     */
    #firstTouchValue;

    /**
     * @type {number}
     */
    #threshold;

    /**
     * @type {number}
     */
    #maxValue;

    /**
     * @type {boolean}
     */
    #dragEnable;

    /**
     * @type {number}
     */
    #prevTouchVal;

    /**
     * @type {number}
     */
    #touchVal;

    /**
     * @type {() => void}
     */
    #subscribeResize;

    /**
     * @type {() => void}
     */
    #subscribeScrollStart;

    /**
     * @type {() => void}
     */
    #subscribeScrollEnd;

    /**
     * @type {() => void}
     */
    #subscribeTouchStart;

    /**
     * @type {() => void}
     */
    #subscribeTouchEnd;

    /**
     * @type {() => void}
     * @return {void}
     */
    #subscribeMouseDown;

    /**
     * @type {() => void}
     * @return {void}
     */
    #subscribeMouseUp;

    /**
     * @type {() => void}
     * @return {void}
     */
    #subscribeMouseWheel;

    /**
     * @type {() => void}
     * @return {void}
     */
    #subscribeMouseMove;

    /**
     * @type {() => void}
     * @return {void}
     */
    #subscribeTouchMove;

    /**
     * @type {() => void}
     * @return {void}
     */
    #subscribeMouseClick;

    /**
     * @type {MobLerp|MobSpring}
     */
    #motion;

    /**
     * @type {() => void}
     */
    #unsubscribeMotion;

    /**
     * @type {() => void}
     */
    #unsubscribeOnComplete;

    /**
     * @type {string}
     */
    #direction;

    /**
     * @type {boolean}
     */
    #isDestroyed;

    /**
     * @type {'lerp'|'spring'}
     */
    #easeType;

    /**
     * @type {import('../../utils/type.js').MqValues}
     */
    #breakpoint;

    /**
     * @type {import('../../utils/type.js').MqAction}
     */
    #queryType;

    /**
     */
    #scroller;

    /**
     */
    #screen;

    /**
     * @type {boolean}
     */
    #scopedEvent;

    /**
     * @type {number}
     */
    #speed;

    /**
     * @type {boolean}
     */
    #drag;

    /**
     * @type {import('./type').OnTick}
     */
    #onTickCallback;

    /**
     * @type {import('./type').OnUpdate}
     */
    #onUpdateCallback;

    /**
     * @type {import('./type').OnSwipe}
     */
    #onSwipeCallback;

    /**
     * @type {(arg0: { shouldScroll: boolean }) => void}
     */
    #onAfterRefresh;

    /**
     * @type {(arg0: { shouldScroll: boolean }) => void}
     */
    #afterInit;

    /**
     * @type {boolean}
     */
    #swipeisActive;

    /**
     * @type {any[]}
     */
    #children;

    /**
     * @type {(arg0: Event) => void}
     */
    #scopedWhell;

    /**
     * @type {(arg0: Event) => void}
     */
    #scopedTouchMove;

    /**
     * @type {number}
     */
    #lastSpinX;

    /**
     * @type {number}
     */
    #lastSpinY;

    /**
     * @type {boolean}
     */
    #useHorizontalScroll;

    /**
     * @type {boolean}
     */
    #useSwipe;

    /**
     * @type {boolean}
     */
    #revertSwipeDirection;

    /**
     * @param { import('./type.ts').MobSmoothScroller } data
     *
     * @description
     *
       Create new SmoothScroller instance.

       Available methods:
       mySmoothScroll.init();
       mySmoothScroll.refresh();
       mySmoothScroll.destroy();
       mySmoothScroll.move();
       mySmoothScroll.set();

     * @example
       ```javascript
       const mySmoothScroller = new SmoothScroller({
           screen: [String | Element],
           scroller: [String | Element],
           direction: [String],
           speed: [Number],
           drag: [Boolean],
           scopedEvent: [Boolean],
           children: [child1,child2, ...],
           ease: [Boolean],
           easeType: [String],
           afterInit: () => {
               ...
           },
           onTick: ({ value, parentIsMoving, percent }) => {
               ...
           },
           onUpdate: ({ value, percent }) => {
               ...
           },
           afterRefresh: () => {
               ...
           },
       });

       mySmoothScroller.init();
       ```
     */
    constructor(data) {
        this.#propsIsValid = true;
        this.#endValue = 0;
        this.#percent = 0;
        this.#screenWidth = 0;
        this.#screenHeight = 0;
        this.#firstTouchValue = 0;
        this.#threshold = 30;
        this.#maxValue = 0;
        this.#dragEnable = false;
        this.#prevTouchVal = 0;
        this.#touchVal = 0;
        this.#lastSpinX = 0;
        this.#lastSpinY = 0;
        this.#swipeisActive = false;
        this.#subscribeResize = NOOP;
        this.#subscribeScrollStart = NOOP;
        this.#subscribeScrollEnd = NOOP;
        this.#subscribeTouchStart = NOOP;
        this.#subscribeTouchEnd = NOOP;
        this.#subscribeMouseDown = NOOP;
        this.#subscribeMouseUp = NOOP;
        this.#subscribeMouseWheel = NOOP;
        this.#subscribeMouseMove = NOOP;
        this.#subscribeTouchMove = NOOP;
        this.#subscribeMouseClick = NOOP;
        // @ts-ignore
        this.#motion = {};
        this.#unsubscribeMotion = NOOP;
        this.#unsubscribeOnComplete = NOOP;
        this.#direction = directionIsValid(data?.direction, 'SmoothScroller');
        this.#isDestroyed = false;

        // @ts-ignore
        this.#easeType = genericEaseTypeIsValid(
            data?.easeType ?? '',
            'SmoothScroller'
        );

        this.#breakpoint = breakpointIsValid(
            data?.breakpoint,
            'breakpoint',
            'SmoothScroller'
        );

        this.#queryType = breakpointTypeIsValid(
            data?.queryType,
            'queryType',
            'SmoothScroller'
        );

        this.#scroller = MobCore.checkType(String, data?.scroller)
            ? document.querySelector(/** @type{string} */ (data.scroller))
            : data.scroller;

        if (!this.#scroller) {
            console.warn('SmoothScroller: scroller node not found');
            this.#propsIsValid = false;
        }

        this.#screen = data?.screen
            ? (() => {
                  return MobCore.checkType(String, data.screen)
                      ? document.querySelector(
                            /** @type{string} */ (data.screen)
                        )
                      : data.screen;
              })()
            : document.documentElement;

        if (!this.#screen) {
            this.#propsIsValid = false;
            console.warn('SmoothScroller: screen node not found');
        }

        this.#scopedEvent = valueIsBooleanAndReturnDefault(
            data?.scopedEvent,
            'SmoothScroller: scopedEvent',
            false
        );

        this.#speed = valueIsNumberAndReturnDefault(
            data?.speed,
            'SmoothScroller: speed',
            60
        );

        this.#drag = valueIsBooleanAndReturnDefault(
            data?.drag,
            'SmoothScroller: drag',
            false
        );

        this.#onTickCallback = valueIsFunctionAndReturnDefault(
            data?.onTick,
            'SmoothScroller: onTick',
            NOOP
        );

        this.#onUpdateCallback = valueIsFunctionAndReturnDefault(
            data?.onUpdate,
            'SmoothScroller: onUpdate',
            NOOP
        );

        this.#onSwipeCallback = valueIsFunctionAndReturnDefault(
            data?.onSwipe,
            'SmoothScroller: onSwipe',
            NOOP
        );

        this.#useSwipe = valueIsBooleanAndReturnDefault(
            data?.useSwipe,
            'SmoothScroller: useSwipe',
            false
        );

        this.#revertSwipeDirection = valueIsBooleanAndReturnDefault(
            data?.revertSwipeDirection,
            'SmoothScroller: revertSwipeDirection',
            false
        );

        this.#useHorizontalScroll = valueIsBooleanAndReturnDefault(
            data?.useHorizontalScroll,
            'SmoothScroller: useBothAxis',
            false
        );

        this.#onAfterRefresh = valueIsFunctionAndReturnDefault(
            data?.afterRefresh,
            'SmoothScroller: afterRefresh',
            NOOP
        );

        this.#afterInit = valueIsFunctionAndReturnDefault(
            data?.afterInit,
            'SmoothScroller: afterInit',
            NOOP
        );

        this.#children = data?.children || [];
        this.#children.forEach((element) => {
            element.setScroller(this.#scroller);
            element.setDirection(this.#direction);
            element.setScreen(this.#screen);
            element.setBreakPoint(this.#breakpoint);
            element.setQueryType(this.#queryType);
            element.init();
        });

        this.#scopedWhell = (event) => {
            const { spinY } = MobCore.normalizeWheel(event);
            this.#onScopedWhell({
                spinY,
            });
        };

        this.#scopedTouchMove = (event) => {
            // @ts-ignore
            const { clientX, clientY } = event.touches
                ? // @ts-ignore
                  event.touches[0]
                : event;

            this.#onScopedTouchMove({
                client: {
                    x: clientX,
                    y: clientY,
                },
            });
        };
    }

    /**
     * @description
     * Check if is scrollable
     *
     * @type {() => boolean}
     */
    #getScrollableStatus() {
        return this.#maxValue > 0;
    }

    /**
     * @description
     * Initialize insatance
     *
     * @example
     * myInstance.init()
     *
     * @type {() => void}
     */
    init() {
        if (!this.#propsIsValid) return;

        switch (this.#easeType) {
            case MobScrollerConstant.EASE_SPRING: {
                this.#motion = new MobSpring();
                break;
            }

            default: {
                this.#motion = new MobLerp();
                break;
            }
        }

        /**
         * scoped event
         */
        if (this.#scopedEvent) {
            /** @type{HTMLElement} */ (this.#scroller).addEventListener(
                'wheel',
                this.#scopedWhell,
                {
                    passive: true,
                }
            );

            /** @type{HTMLElement} */ (this.#scroller).addEventListener(
                'mousemove',
                this.#scopedTouchMove,
                {
                    passive: true,
                }
            );

            /** @type{HTMLElement} */ (this.#scroller).addEventListener(
                'touchmove',
                this.#scopedTouchMove,
                {
                    passive: true,
                }
            );
        } else {
            this.#subscribeMouseWheel = MobCore.useMouseWheel((data) => {
                this.#detectSwipe(data);
                this.#onWhell(data);
            });

            this.#subscribeMouseMove = MobCore.useMouseMove((data) =>
                this.#onTouchMove(data)
            );
            this.#subscribeTouchMove = MobCore.useTouchMove((data) =>
                this.#onTouchMove(data)
            );
        }

        /**
         * Common event
         */
        this.#subscribeResize = MobCore.useResize(() => this.refresh());

        this.#subscribeScrollStart = MobCore.useScrollStart(() =>
            this.#refreshScroller()
        );

        this.#subscribeScrollEnd = MobCore.useScrollEnd(() =>
            this.#refreshScroller()
        );

        this.#subscribeTouchStart = MobCore.useTouchStart((data) =>
            this.#onMouseDown(data)
        );

        this.#subscribeTouchEnd = MobCore.useTouchEnd((data) =>
            this.#onMouseUp(data)
        );

        this.#subscribeMouseDown = MobCore.useMouseDown((data) =>
            this.#onMouseDown(data)
        );

        this.#subscribeMouseUp = MobCore.useMouseUp((data) =>
            this.#onMouseUp(data)
        );

        /**
         * UnFreeze page scroller
         */
        /** @type{HTMLElement} */ (this.#scroller).addEventListener(
            'mouseleave',
            () => {
                UnFreezeMobPageScroll();
            }
        );

        if (this.#drag) {
            this.#subscribeMouseClick = MobCore.useMouseClick(
                ({ target, preventDefault }) => {
                    this.#preventChecker({ target, preventDefault });
                }
            );
        }

        this.#initMotion();

        if (mq[this.#queryType](this.#breakpoint)) {
            this.#setScrolerStyle();
            this.#refreshScroller();
        }

        MobCore.useFrameIndex(() => {
            MobCore.useNextTick(() => {
                if (this.#isDestroyed) return;

                this.#afterInit?.({
                    shouldScroll: this.#getScrollableStatus(),
                });

                this.#children.forEach((element) => {
                    element.refresh();
                });
            });
        }, 3);
    }

    /**
     * @param {import('../../../mobCore/events/mouseUtils/type.js').MouseEventParsed} params
     */
    #detectSwipe({ pixelX }) {
        if (
            !this.#useSwipe ||
            !pixelX ||
            this.#swipeisActive ||
            this.#onSwipeCallback.length === 0
        )
            return;

        if (Math.abs(pixelX) > 40) {
            this.#swipeisActive = true;

            const direction = pixelX > 0 ? -1 : 1;
            const directionParsed = this.#revertSwipeDirection
                ? direction
                : direction * -1;

            this.#onSwipeCallback({
                direction: directionParsed,
                move: (value) => this.move(value),
            });

            setTimeout(() => {
                this.#swipeisActive = false;
            }, 500);
        }
    }

    /**
     * @type {() => void}
     */
    #setScrolerStyle() {
        if (this.#scroller) {
            // @ts-ignore
            this.#scroller.style['user-select'] = 'none';
        }

        const activeElement = /** @type{HTMLElement} */ (
            this.#scroller
        ).querySelectorAll('a, button');

        [...activeElement].forEach((item) => {
            item.setAttribute('draggable', 'false');
            // @ts-ignore
            item.style['user-select'] = 'none';
        });
    }

    /**
     * @type {() => void}
     */
    #removeScrolerStyle() {
        if (!this.#scroller) return;

        // @ts-ignore
        this.#scroller.style['user-select'] = '';
        const activeElement = /** @type{HTMLElement} */ (
            this.#scroller
        ).querySelectorAll('a, button');

        [...activeElement].forEach((item) => {
            item.removeAttribute('draggable');
            // @ts-ignore
            item.style['user-select'] = '';
        });
    }

    /**
     * @type {() => void}
     */
    #initMotion() {
        if (!this.#motion) return;

        this.#motion.setData({ val: 0 });
        this.#unsubscribeMotion = this.#motion.subscribe(({ val }) => {
            /** @type{HTMLElement} */ (this.#scroller).style.transform =
                this.#direction == MobScrollerConstant.DIRECTION_VERTICAL
                    ? `translate3d(0px, 0px, 0px) translateY(${-val}px)`
                    : `translate3d(0px, 0px, 0px) translateX(${-val}px)`;

            /**
             * TODO Move to scroll Start (scopedEvent or not , wheel touch etc...)
             * Used by instance with ease = true;
             */
            this.#children.forEach((element) => {
                element.triggerScrollStart();
            });

            MobCore.useNextTick(() => {
                this.#onTickCallback({
                    value: -val,
                    percent: this.#percent,
                    parentIsMoving: true,
                });

                this.#children.forEach((element) => {
                    element.move({
                        value: -val,
                        parentIsMoving: true,
                    });
                });
            });
        });

        this.#unsubscribeOnComplete = this.#motion.onComplete(({ val }) => {
            /** @type{HTMLElement} */ (this.#scroller).style.transform =
                this.#direction == MobScrollerConstant.DIRECTION_VERTICAL
                    ? `translateY(${-val}px)`
                    : `translateX(${-val}px)`;

            MobCore.useNextTick(() => {
                this.#onTickCallback({
                    value: -val,
                    percent: this.#percent,
                    parentIsMoving: false,
                });

                this.#children.forEach((element) => {
                    element.triggerScrollEnd();
                    element.move({
                        value: -val,
                        parentIsMoving: false,
                    });
                });
            });
        });
    }

    /**
     * @type {() => void}
     */
    #refreshScroller() {
        if (!this.#screen) return;

        this.#screenWidth =
            this.#screen === document.documentElement
                ? window.innerWidth
                : outerWidth(/** @type{HTMLElement} */ (this.#screen));

        this.#screenHeight =
            this.#screen === document.documentElement
                ? window.innerHeight
                : outerHeight(/** @type{HTMLElement} */ (this.#screen));

        this.#maxValue =
            this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                ? /** @type{HTMLElement} */ (this.#scroller).offsetHeight -
                  this.#screenHeight
                : /** @type{HTMLElement} */ (this.#scroller).offsetWidth -
                  this.#screenWidth;

        this.#calculateValue();
    }

    /**
     * @type {import('./type').MobSmoothScrollerOnMouseEvent}
     */
    #onScopedTouchMove({ client }) {
        if (!this.#dragEnable || !this.#drag) return;

        this.#prevTouchVal = this.#touchVal;
        this.#touchVal = this.#getMousePos({
            x: client?.x ?? 0,
            y: client?.y ?? 0,
        });
        this.#endValue += Math.round(this.#prevTouchVal - this.#touchVal);
        this.#calculateValue();
    }

    /**
     * @type {(arg0: {spinY: number}) => void}
     */
    #onScopedWhell({ spinY }) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        this.#dragEnable = false;
        this.#endValue += spinY * this.#speed;
        this.#calculateValue();
    }

    /**
     * Listener related event.
     * Global
     */

    /**
     * @type {import('./type').MobSmoothScrollerOnMouseEvent}
     */
    #onMouseDown({ target, client }) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        if (
            target === this.#scroller ||
            isDescendant(
                /** @type{HTMLElement} */ (this.#scroller),
                /** @type{HTMLElement} */ (target)
            )
        ) {
            this.#firstTouchValue = this.#endValue;
            this.#dragEnable = true;
            this.#prevTouchVal = this.#getMousePos({
                x: client?.x ?? 0,
                y: client?.y ?? 0,
            });
            this.#touchVal = this.#getMousePos({
                x: client?.x ?? 0,
                y: client?.y ?? 0,
            });
        }
    }

    /**
     * @type {import('./type').MobSmoothScrollerOnMouseEvent}
     */
    #onMouseUp() {
        this.#dragEnable = false;
    }

    /**
     * @type {import('./type').MobSmoothScrollerOnMouseEvent}
     */
    #onTouchMove({ target, client, preventDefault }) {
        if (
            (target === this.#scroller ||
                isDescendant(
                    /** @type{HTMLElement} */ (this.#scroller),
                    /** @type{HTMLElement} */ (target)
                )) &&
            this.#dragEnable &&
            this.#drag
        ) {
            // @ts-ignore
            preventDefault();

            this.#prevTouchVal = this.#touchVal;
            this.#touchVal = this.#getMousePos({
                x: client?.x ?? 0,
                y: client?.y ?? 0,
            });

            const result = Math.round(this.#prevTouchVal - this.#touchVal);
            this.#endValue += result;

            this.#calculateValue();
        }
    }

    /**
     * @type {import('./type').MobSmoothScrollerOnMouseEvent}
     */
    #onWhell({ target, spinY, spinX, preventDefault }) {
        if (
            !mq[this.#queryType](this.#breakpoint) ||
            (!spinY && spinY !== 0) ||
            (!spinX && spinX !== 0)
        )
            return;

        if (
            target === this.#scroller ||
            isDescendant(
                /** @type{HTMLElement} */ (this.#scroller),
                /** @type{HTMLElement} */ (target)
            )
        ) {
            this.#dragEnable = false;
            preventDefault?.();

            const spinXdiff = Math.abs(this.#lastSpinX - spinX);
            const spinYdiff = Math.abs(this.#lastSpinY - spinY);

            const spinValue =
                this.#useHorizontalScroll && !this.#useSwipe
                    ? (() => {
                          return spinXdiff > spinYdiff ? spinX : spinY;
                      })()
                    : spinY;

            this.#endValue += spinValue * this.#speed;

            this.#calculateValue();
            FreezeMobPageScroll();
            this.#lastSpinY = spinY;
            this.#lastSpinX = spinX;
        }
    }

    /**
     * @description
     * Move scroller
     *
     * @param {number} percent position in percent, from 0 to 100
     * @return {Promise<void>} percent position in percent, from 0 to 100
     *
     * @example
     * myInstance.move(val);
     */
    move(percent) {
        if (!mq[this.#queryType](this.#breakpoint))
            return new Promise((resolve) => resolve());

        this.#percent = percent;
        this.#endValue = (this.#percent * this.#maxValue) / 100;

        /**
         * this.motion use spring or lerp, so goTo generic type is not the same.
         * But we don't use props here, so skip ts error
         */

        // @ts-ignore
        return this.#motion.goTo({ val: this.#endValue });
    }

    /**
     *
     * @description
     * Move scroller immediatr
     *
     * @param {number} percent position in percent, from 0 to 100
     *
     * @example
     * myInstance.set(val);
     */
    set(percent) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        this.#percent = percent;
        this.#endValue = (this.#percent * this.#maxValue) / 100;

        /**
         * this.motion use spring or lerp, so set generic type is not the same.
         * But we don't use props here, so skip ts error
         */

        // @ts-ignore
        this.#motion.set({ val: this.#endValue });
    }

    /**
     * @description
     * Utils
     *
     * @type {() => void}
     */
    #calculateValue() {
        const percentValue = (this.#endValue * 100) / this.#maxValue;
        this.#percent = clamp(percentValue, 0, 100);
        this.#endValue = clamp(this.#endValue, 0, this.#maxValue);

        /**
         * this.motion use spring or lerp, so goTo generic type is not the same.
         * But we don't use props here, so skip ts error
         */

        // @ts-ignore
        this.#motion.goTo({ val: this.#endValue });

        /**
         * Fire on update callback
         */
        this.#onUpdateCallback?.({
            value: -this.#endValue,
            percent: this.#percent,
            parentIsMoving: true,
        });
    }

    /**
     * @type {import('./type').MobSmoothScrollerOnMouseEvent}
     */
    #preventChecker({ target, preventDefault }) {
        if (
            mq[this.#queryType](this.#breakpoint) &&
            (target === this.#scroller ||
                isDescendant(
                    /** @type{HTMLElement} */ (this.#scroller),
                    /** @type{HTMLElement} */ (target)
                )) &&
            Math.abs(this.#endValue - this.#firstTouchValue) > this.#threshold
        ) {
            // @ts-ignore
            preventDefault();
        }
    }

    /**
     * @type (arg0: {x: number, y:number}) => number
     */
    #getMousePos({ x, y }) {
        if (!x || !y) return 0;

        return this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
            ? y
            : x;
    }

    /**
     * @description
     * Refresh instance
     *
     * @example
     * myInstance.refresh()
     *
     * @type {() => void}
     */
    refresh() {
        if (!mq[this.#queryType](this.#breakpoint)) {
            this.#removeScrolerStyle();
            this.#motion?.stop?.();

            MobCore.useFrame(() => {
                MobCore.useNextTick(() => {
                    /** @type{HTMLElement} */ (this.#scroller).style.transform =
                        '';
                });
            });
            return;
        }

        this.#refreshScroller();
        this.#setScrolerStyle();

        MobCore.useFrameIndex(() => {
            MobCore.useNextTick(() => {
                this.#onAfterRefresh?.({
                    shouldScroll: this.#getScrollableStatus(),
                });

                this.#children.forEach((element) => {
                    element.refresh();
                });
            });
        }, 2);
    }

    /**
     * @description
     * Destroy instance
     *
     * @example
     * myInstance.destroy()
     *
     * @type {() => void}
     */
    destroy() {
        this.#isDestroyed = true;
        this.#removeScrolerStyle();
        this.#subscribeResize();
        this.#subscribeScrollStart();
        this.#subscribeScrollEnd();
        this.#subscribeTouchStart();
        this.#subscribeTouchEnd();
        this.#subscribeMouseDown();
        this.#subscribeMouseUp();
        this.#subscribeMouseWheel();
        this.#subscribeMouseMove();
        this.#subscribeTouchMove();
        this.#subscribeMouseClick();
        this.#unsubscribeMotion();
        this.#unsubscribeOnComplete();
        this.#motion?.destroy();
        // @ts-ignore
        this.#motion = null;
        this.#children.forEach((element) => {
            element?.destroy?.();
        });
        this.#children = [];
        this.#onTickCallback = NOOP;
        this.#onUpdateCallback = NOOP;
        this.#onAfterRefresh = NOOP;
        this.#afterInit = NOOP;

        if (this.#scopedEvent) {
            /** @type{HTMLElement} */ (this.#scroller)?.removeEventListener(
                'wheel',
                this.#scopedWhell
            );
            /** @type{HTMLElement} */ (this.#scroller)?.removeEventListener(
                'mousemove',
                this.#scopedTouchMove
            );
            /** @type{HTMLElement} */ (this.#scroller)?.removeEventListener(
                'touchmove',
                this.#scopedTouchMove
            );
        }

        MobCore.useFrameIndex(() => {
            MobCore.useNextTick(() => {
                this.#scroller = null;
                this.#screen = null;
            });
        }, 3);
    }
}
