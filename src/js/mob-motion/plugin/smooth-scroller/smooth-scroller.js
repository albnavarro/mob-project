import MobLerp from '../../animation/lerp/mob-lerp.js';
import MobSpring from '../../animation/spring/mob-spring.js';
import { clamp } from '../../animation/utils/animation-utils.js';
import { mq } from '../../utils/media-manager.js';
import { NOOP } from '../../utils/functions-utils.js';
import { MobScrollerConstant } from '../../animation/scroller/mob-scroller-constant.js';
import {
    breakpointIsValid,
    breakpointTypeIsValid,
    directionIsValid,
    genericEaseTypeIsValid,
    valueIsBooleanAndReturnDefault,
    valueIsFunctionAndReturnDefault,
    valueIsNumberAndReturnDefault,
} from '../../animation/utils/tween-action/tween-validation.js';
import { MobCore } from '../../../mob-core/index.js';
import {
    isDescendant,
    outerHeight,
    outerWidth,
} from '../../../mob-core/utils/index.js';
import {
    FreezeMobPageScroll,
    UnFreezeMobPageScroll,
} from '../page-scroll/page-scroller.js';

export class MobSmoothScroller {
    /**
     * @type {boolean}
     */
    #propsIsValid = true;

    /**
     * @type {number}
     */
    #endValue = 0;

    /**
     * @type {number}
     */
    #percent = 0;

    /**
     * @type {number}
     */
    #screenWidth = 0;

    /**
     * @type {number}
     */
    #screenHeight = 0;

    /**
     * @type {number}
     */
    #firstTouchValue = 0;

    /**
     * @type {number}
     */
    #threshold = 30;

    /**
     * @type {number}
     */
    #maxValue = 0;

    /**
     * @type {boolean}
     */
    #dragEnable = false;

    /**
     * @type {number}
     */
    #prevTouchVal = 0;

    /**
     * @type {number}
     */
    #touchVal = 0;

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
     * @returns {void}
     */
    #subscribeMouseDown;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #subscribeMouseUp;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #subscribeMouseWheel;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #subscribeMouseMove;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #subscribeTouchMove;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #subscribeMouseClick;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #subscribeDebuoceWhell;

    /**
     * @type {MobLerp | MobSpring}
     */
    #motion;

    /**
     * @type {() => void}
     */
    #subscribeMotion;

    /**
     * @type {() => void}
     */
    #subscribeOnComplete;

    /**
     * @type {string}
     */
    #direction;

    /**
     * @type {boolean}
     */
    #isDestroyed;

    /**
     * @type {'lerp' | 'spring'}
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

    #scroller;

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
     * @type {import('./type.js').OnTick}
     */
    #onTickCallback;

    /**
     * @type {import('./type.js').OnUpdate}
     */
    #onUpdateCallback;

    /**
     * @type {import('./type.js').OnSwipe}
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
    #swipeisActive = false;

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
    #lastSpinX = 0;

    /**
     * @type {number}
     */
    #lastSpinY = 0;

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
     * Create new SmoothScroller instance.
     *
     *        Available methods:
     *        mySmoothScroll.init();
     *        mySmoothScroll.refresh();
     *        mySmoothScroll.destroy();
     *        mySmoothScroll.move();
     *        mySmoothScroll.set();
     *
     * @example
     *     ```javascript
     *        const mySmoothScroller = new SmoothScroller({
     *            screen: [String | Element],
     *            scroller: [String | Element],
     *            direction: [String],
     *            speed: [Number],
     *            drag: [Boolean],
     *            scopedEvent: [Boolean],
     *            children: [child1,child2, ...],
     *            ease: [Boolean],
     *            easeType: [String],
     *            afterInit: () => {
     *                ...
     *            },
     *            onTick: ({ value, parentIsMoving, percent }) => {
     *                ...
     *            },
     *            onUpdate: ({ value, percent }) => {
     *                ...
     *            },
     *            afterRefresh: () => {
     *                ...
     *            },
     *        });
     *
     *        mySmoothScroller.init();
     *        ```;
     *
     * @param {import('./type.js').MobSmoothScroller} data
     */
    constructor(data) {
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
        this.#subscribeDebuoceWhell = NOOP;

        // @ts-ignore
        this.#motion = {};
        this.#subscribeMotion = NOOP;
        this.#subscribeOnComplete = NOOP;
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
            ? document.querySelector(/** @type {string} */ (data.scroller))
            : data.scroller;

        if (!this.#scroller) {
            console.warn('SmoothScroller: scroller node not found');
            this.#propsIsValid = false;
        }

        this.#screen = data?.screen
            ? (() => {
                  return MobCore.checkType(String, data.screen)
                      ? document.querySelector(
                            /** @type {string} */ (data.screen)
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
            this.#addWhellingClass();

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

        /**
         * Remove wheeling class at the end of wheel.
         */
        this.#subscribeDebuoceWhell = MobCore.useMouseWheel(
            MobCore.debounce(() => {
                this.#removeWhellingClass();
            }, 500)
        );
    }

    /**
     * @type {() => void}
     */
    #removeWhellingClass() {
        if (!this.#scroller) return;

        // @ts-ignore
        this.#scroller.classList.remove('is-whelling');
    }

    /**
     * @type {() => void}
     */
    #addWhellingClass() {
        if (!this.#scroller) return;

        // @ts-ignore
        this.#scroller.classList.add('is-whelling');
    }

    /**
     * Check if is scrollable
     *
     * @type {() => boolean}
     */
    #getScrollableStatus() {
        return this.#maxValue > 0;
    }

    /**
     * Initialize insatance
     *
     * @example
     *     myInstance.init();
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
                this.#motion.updateVelocity(0.1);
                break;
            }
        }

        /**
         * Scoped event
         */
        if (this.#scopedEvent) {
            /** @type {HTMLElement} */ (this.#scroller).addEventListener(
                'wheel',
                this.#scopedWhell,
                {
                    passive: true,
                }
            );

            /** @type {HTMLElement} */ (this.#scroller).addEventListener(
                'mousemove',
                this.#scopedTouchMove,
                {
                    passive: true,
                }
            );

            /** @type {HTMLElement} */ (this.#scroller).addEventListener(
                'touchmove',
                this.#scopedTouchMove,
                {
                    passive: true,
                }
            );
        }

        /**
         * Non scoped event
         */
        if (!this.#scopedEvent) {
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
        /** @type {HTMLElement} */ (this.#scroller).addEventListener(
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
     * @param {import('../../../mob-core/events/mouse-utils/type.js').MouseEventParsed} params
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
                move: (value) => this.move(value).catch(() => {}),
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
        if (!this.#scroller) return;

        // @ts-ignore
        this.#scroller.style['user-select'] = 'none';

        const activeElements = /** @type {HTMLElement} */ (
            this.#scroller
        ).querySelectorAll('a, button');

        [...activeElements].forEach((item) => {
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
        const activeElement = /** @type {HTMLElement} */ (
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
        this.#subscribeMotion = this.#motion.subscribe(({ val }) => {
            /** @type {HTMLElement} */ (this.#scroller).style.transform =
                this.#direction == MobScrollerConstant.DIRECTION_VERTICAL
                    ? `translate3d(0px, 0px, 0px) translateY(${-Math.trunc(val)}px)`
                    : `translate3d(0px, 0px, 0px) translateX(${-Math.trunc(val)}px)`;

            /**
             * TODO Move to scroll Start (scopedEvent or not , wheel touch etc...) Used by instance with ease = true;
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

        this.#subscribeOnComplete = this.#motion.onComplete(({ val }) => {
            /** @type {HTMLElement} */ (this.#scroller).style.transform =
                this.#direction == MobScrollerConstant.DIRECTION_VERTICAL
                    ? `translateY(${-Math.trunc(val)}px)`
                    : `translateX(${-Math.trunc(val)}px)`;

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
                : outerWidth(/** @type {HTMLElement} */ (this.#screen));

        this.#screenHeight =
            this.#screen === document.documentElement
                ? window.innerHeight
                : outerHeight(/** @type {HTMLElement} */ (this.#screen));

        this.#maxValue =
            this.#direction === MobScrollerConstant.DIRECTION_VERTICAL
                ? /** @type {HTMLElement} */ (this.#scroller).offsetHeight -
                  this.#screenHeight
                : /** @type {HTMLElement} */ (this.#scroller).offsetWidth -
                  this.#screenWidth;

        this.#calculateValue();
    }

    /**
     * @type {import('./type.js').MobSmoothScrollerOnMouseEvent}
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
     * Speed variation by screensize
     */
    #getDelta() {
        return this.#direction === MobScrollerConstant.DIRECTION_HORIZONTAL
            ? this.#screenWidth / 1920
            : this.#screenHeight / 1080;
    }

    /**
     * @type {(arg0: { spinY: number }) => void}
     */
    #onScopedWhell({ spinY = 0 }) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        this.#dragEnable = false;

        /**
         * Speed variation by screensize
         */
        const delta = this.#getDelta();

        /**
         * Normalize spinValue between -1 && 1.
         */
        const spinYParsed = clamp(spinY, -1, 1);
        this.#endValue += spinYParsed * this.#speed * delta;
        this.#calculateValue();
    }

    /**
     * Listener related event. Global
     */

    /**
     * @type {import('./type.js').MobSmoothScrollerOnMouseEvent}
     */
    #onMouseDown({ target, client }) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        if (
            target === this.#scroller ||
            isDescendant(
                /** @type {HTMLElement} */ (this.#scroller),
                /** @type {HTMLElement} */ (target)
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
     * @type {import('./type.js').MobSmoothScrollerOnMouseEvent}
     */
    #onMouseUp() {
        this.#dragEnable = false;
    }

    /**
     * @type {import('./type.js').MobSmoothScrollerOnMouseEvent}
     */
    #onTouchMove({ target, client, preventDefault }) {
        if (
            (target === this.#scroller ||
                isDescendant(
                    /** @type {HTMLElement} */ (this.#scroller),
                    /** @type {HTMLElement} */ (target)
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
     * @type {import('./type.js').MobSmoothScrollerOnMouseEvent}
     */
    #onWhell({ target, spinY = 0, spinX = 0, preventDefault }) {
        if (!mq[this.#queryType](this.#breakpoint)) return;
        this.#addWhellingClass();

        if (
            target === this.#scroller ||
            isDescendant(
                /** @type {HTMLElement} */ (this.#scroller),
                /** @type {HTMLElement} */ (target)
            )
        ) {
            this.#dragEnable = false;

            preventDefault?.();
            FreezeMobPageScroll();

            const spinXdiff = Math.abs(this.#lastSpinX - spinX);
            const spinYdiff = Math.abs(this.#lastSpinY - spinY);

            /**
             * In horizontal mode, allow scroll in X and Y direction if no swipe is used.
             *
             * With swipe enabled use only vertical wheel, both vertical && horizontal mode.
             */
            const spinValue =
                this.#useHorizontalScroll && !this.#useSwipe
                    ? (() => {
                          return spinXdiff > spinYdiff ? spinX : spinY;
                      })()
                    : spinY;

            /**
             * When there is no advanced return;
             */
            if (Math.abs(spinValue) === 0) return;

            /**
             * Speed variation by screensize
             */
            const delta = this.#getDelta();

            /**
             * Normalize spinValue between -1 && 1.
             */
            this.#endValue +=
                clamp(spinValue, -1, 1) * this.#speed * clamp(delta, 1, 10);
            this.#calculateValue();
            this.#lastSpinY = spinY;
            this.#lastSpinX = spinX;
        }
    }

    /**
     * Move scroller
     *
     * @example
     *     myInstance.move(val);
     *
     * @param {number} percent Position in percent, from 0 to 100
     * @returns {Promise<void>} Percent position in percent, from 0 to 100
     */
    move(percent) {
        if (!mq[this.#queryType](this.#breakpoint))
            return new Promise((resolve) => resolve());

        this.#percent = percent;
        this.#endValue = (this.#percent * this.#maxValue) / 100;

        /**
         * This.motion use spring or lerp, so goTo generic type is not the same. But we don't use props here, so skip ts
         * error
         */

        // @ts-ignore
        return this.#motion.goTo({ val: this.#endValue });
    }

    /**
     * Move scroller immediatr
     *
     * @example
     *     myInstance.set(val);
     *
     * @param {number} percent Position in percent, from 0 to 100
     */
    set(percent) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        this.#percent = percent;
        this.#endValue = (this.#percent * this.#maxValue) / 100;

        /**
         * This.motion use spring or lerp, so set generic type is not the same. But we don't use props here, so skip ts
         * error
         */

        // @ts-ignore
        this.#motion.set({ val: this.#endValue });
    }

    /**
     * Utils
     *
     * @type {() => void}
     */
    #calculateValue() {
        const percentValue = (this.#endValue * 100) / this.#maxValue;
        this.#percent = clamp(percentValue, 0, 100);
        this.#endValue = clamp(this.#endValue, 0, this.#maxValue);

        /**
         * This.motion use spring or lerp, so goTo generic type is not the same. But we don't use props here, so skip ts
         * error
         */

        // @ts-ignore
        this.#motion.goTo({ val: this.#endValue }).catch(() => {});

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
     * @type {import('./type.js').MobSmoothScrollerOnMouseEvent}
     */
    #preventChecker({ target, preventDefault }) {
        if (
            mq[this.#queryType](this.#breakpoint) &&
            (target === this.#scroller ||
                isDescendant(
                    /** @type {HTMLElement} */ (this.#scroller),
                    /** @type {HTMLElement} */ (target)
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
     * Refresh instance
     *
     * @example
     *     myInstance.refresh();
     *
     * @type {() => void}
     */
    refresh() {
        if (!mq[this.#queryType](this.#breakpoint)) {
            this.#removeScrolerStyle();
            this.#motion?.stop?.();

            MobCore.useFrame(() => {
                MobCore.useNextTick(() => {
                    /** @type {HTMLElement} */ (
                        this.#scroller
                    ).style.transform = '';
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
     * Destroy instance
     *
     * @example
     *     myInstance.destroy();
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
        this.#subscribeMotion();
        this.#subscribeOnComplete();
        this.#subscribeDebuoceWhell();
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
            /** @type {HTMLElement} */ (this.#scroller)?.removeEventListener(
                'wheel',
                this.#scopedWhell
            );
            /** @type {HTMLElement} */ (this.#scroller)?.removeEventListener(
                'mousemove',
                this.#scopedTouchMove
            );
            /** @type {HTMLElement} */ (this.#scroller)?.removeEventListener(
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
