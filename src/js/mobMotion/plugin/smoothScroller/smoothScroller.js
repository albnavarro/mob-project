// @ts-check

import HandleLerp from '../../animation/lerp/handleLerp.js';
import HandleSpring from '../../animation/spring/handleSpring.js';
import { clamp } from '../../animation/utils/animationUtils.js';
import { mq } from '../../utils/mediaManager.js';
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
} from '../../animation/utils/tweenAction/tweenValidation.js';
import { mobCore } from '../../../mobCore/index.js';
import {
    isDescendant,
    outerHeight,
    outerWidth,
} from '../../../mobCore/utils/index.js';

export default class SmoothScroller {
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
     * @type {any}
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
     * @type {import('../../utils/type.js').mqValues}
     */
    #breakpoint;

    /**
     * @type {import('../../utils/type.js').mqAction}
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
     * @type {import('./type.d.ts').onTick}
     */
    #onTickCallback;

    /**
     * @type {import('./type.d.ts').onUpdate}
     */
    #onUpdateCallback;

    /**
     * @type {() => void}
     */
    #onAfterRefresh;

    /**
     * @type {() => void}
     */
    #afterInit;

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
     * @param { import('./type.d.ts').SmoothScroller } data
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
        this.#dragEnable = null;
        this.#prevTouchVal = 0;
        this.#touchVal = 0;
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
        this.#motion = null;
        this.#unsubscribeMotion = NOOP;
        this.#unsubscribeOnComplete = NOOP;
        this.#direction = directionIsValid(data?.direction, 'SmoothScroller');
        this.#isDestroyed = false;

        this.#easeType = genericEaseTypeIsValid(
            data?.easeType,
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

        this.#scroller = mobCore.checkType(String, data?.scroller)
            ? document.querySelector(/** @type{string} */ (data.scroller))
            : data.scroller;

        if (!this.#scroller) {
            console.warn('SmoothScroller: scroller node not found');
            this.#propsIsValid = false;
            return;
        }

        this.#screen = data?.screen
            ? (() => {
                  return mobCore.checkType(String, data.screen)
                      ? document.querySelector(
                            /** @type{string} */ (data.screen)
                        )
                      : data.screen;
              })()
            : document.documentElement;

        if (!this.#screen) {
            this.#propsIsValid = false;
            console.warn('SmoothScroller: screen node not found');
            return;
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
            const { spinY } = mobCore.normalizeWheel(event);
            this.onScopedWhell({
                spinY,
            });
        };

        this.#scopedTouchMove = (event) => {
            // @ts-ignore
            const { clientX, clientY } = event.touches
                ? // @ts-ignore
                  event.touches[0]
                : event;

            this.onScopedTouchMove({
                client: {
                    x: clientX,
                    y: clientY,
                },
            });
        };
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
            case parallaxConstant.EASE_SPRING: {
                this.#motion = new HandleSpring();
                break;
            }

            default: {
                this.#motion = new HandleLerp();
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
            this.#subscribeMouseWheel = mobCore.useMouseWheel((data) =>
                this.onWhell(data)
            );

            this.#subscribeMouseMove = mobCore.useMouseMove((data) =>
                this.onTouchMove(data)
            );
            this.#subscribeTouchMove = mobCore.useTouchMove((data) =>
                this.onTouchMove(data)
            );
        }

        /**
         * Common event
         */
        this.#subscribeResize = mobCore.useResize(() => this.refresh());
        this.#subscribeScrollStart = mobCore.useScrollStart(() =>
            this.refreshScroller()
        );
        this.#subscribeScrollEnd = mobCore.useScrollEnd(() =>
            this.refreshScroller()
        );
        this.#subscribeTouchStart = mobCore.useTouchStart((data) =>
            this.onMouseDown(data)
        );
        this.#subscribeTouchEnd = mobCore.useTouchEnd((data) =>
            this.onMouseUp(data)
        );
        this.#subscribeMouseDown = mobCore.useMouseDown((data) =>
            this.onMouseDown(data)
        );
        this.#subscribeMouseUp = mobCore.useMouseUp((data) =>
            this.onMouseUp(data)
        );

        if (this.#drag) {
            this.#subscribeMouseClick = mobCore.useMouseClick(
                ({ target, preventDefault }) => {
                    this.preventChecker({ target, preventDefault });
                }
            );
        }

        this.initMotion();

        if (mq[this.#queryType](this.#breakpoint)) {
            this.setScrolerStyle();
            this.refreshScroller();
        }

        mobCore.useFrameIndex(() => {
            mobCore.useNextTick(() => {
                if (this.#isDestroyed) return;

                this.#afterInit?.();
                this.#children.forEach((element) => {
                    element.refresh();
                });
            });
        }, 3);
    }

    /**
     * @private
     * @type {() => void}
     */
    setScrolerStyle() {
        /** @type{HTMLElement} */ (this.#scroller).style['user-select'] =
            'none';

        const activeElement = /** @type{HTMLElement} */ (
            this.#scroller
        ).querySelectorAll('a, button');

        [...activeElement].forEach((item) => {
            item.setAttribute('draggable', 'false');
            /** @type {HTMLElement} */ (item).style['user-select'] = 'none';
        });
    }

    /**
     * @private
     * @type {() => void}
     */
    removeScrolerStyle() {
        if (!this.#scroller) return;

        /** @type{HTMLElement} */ (this.#scroller).style['user-select'] = '';
        const activeElement = /** @type{HTMLElement} */ (
            this.#scroller
        ).querySelectorAll('a, button');

        [...activeElement].forEach((item) => {
            item.removeAttribute('draggable');
            /** @type{HTMLElement} */ (item).style['user-select'] = '';
        });
    }

    /**
     * @private
     * @type {() => void}
     */
    initMotion() {
        if (!this.#motion) return;

        this.#motion.setData({ val: 0 });
        this.#unsubscribeMotion = this.#motion.subscribe(({ val }) => {
            /** @type{HTMLElement} */ (this.#scroller).style.transform =
                this.#direction == parallaxConstant.DIRECTION_VERTICAL
                    ? `translate3d(0px, 0px, 0px) translateY(${-val}px)`
                    : `translate3d(0px, 0px, 0px) translateX(${-val}px)`;

            /**
             * TODO Move to scroll Start (scopedEvent or not , wheel touch etc...)
             * Used by instance with ease = true;
             */
            this.#children.forEach((element) => {
                element.triggerScrollStart();
            });

            mobCore.useNextTick(() => {
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
                this.#direction == parallaxConstant.DIRECTION_VERTICAL
                    ? `translateY(${-val}px)`
                    : `translateX(${-val}px)`;

            mobCore.useNextTick(() => {
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
     * @private
     * @type {() => void}
     */
    refreshScroller() {
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
            this.#direction === parallaxConstant.DIRECTION_VERTICAL
                ? /** @type{HTMLElement} */ (this.#scroller).offsetHeight -
                  this.#screenHeight
                : /** @type{HTMLElement} */ (this.#scroller).offsetWidth -
                  this.#screenWidth;

        this.calculateValue();
    }

    /**
     * @private
     * @type {import('./type.d.ts').onMouseEvent}
     */
    onScopedTouchMove({ client }) {
        if (!this.#dragEnable || !this.#drag) return;

        this.#prevTouchVal = this.#touchVal;
        this.#touchVal = this.getMousePos({
            x: client.x,
            y: client.y,
        });
        this.#endValue += Math.round(this.#prevTouchVal - this.#touchVal);
        this.calculateValue();
    }

    /**
     * @private
     * @type {(arg0: {spinY: number}) => void}
     */
    onScopedWhell({ spinY }) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        this.#dragEnable = false;
        this.#endValue += spinY * this.#speed;
        this.calculateValue();
    }

    /**
     * Listener related event.
     * Global
     */

    /**
     * @private
     * @type {import('./type.d.ts').onMouseEvent}
     */
    onMouseDown({ target, client }) {
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
            this.#prevTouchVal = this.getMousePos({
                x: client.x,
                y: client.y,
            });
            this.#touchVal = this.getMousePos({
                x: client.x,
                y: client.y,
            });
        }
    }

    /**
     * @private
     * @type {import('./type.d.ts').onMouseEvent}
     */
    onMouseUp() {
        this.#dragEnable = false;
    }

    /**
     * @private
     * @type {import('./type.d.ts').onMouseEvent}
     */
    onTouchMove({ target, client, preventDefault }) {
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
            this.#touchVal = this.getMousePos({
                x: client.x,
                y: client.y,
            });

            const result = Math.round(this.#prevTouchVal - this.#touchVal);
            this.#endValue += result;

            this.calculateValue();
        }
    }

    /**
     * @private
     * @type {import('./type.d.ts').onMouseEvent}
     */
    onWhell({ target, spinY, preventDefault }) {
        const bodyIsOverflow =
            document.body.style.overflow === 'hidden' &&
            this.#direction === parallaxConstant.DIRECTION_VERTICAL;

        if (!mq[this.#queryType](this.#breakpoint) || bodyIsOverflow) return;

        if (
            target === this.#scroller ||
            isDescendant(
                /** @type{HTMLElement} */ (this.#scroller),
                /** @type{HTMLElement} */ (target)
            )
        ) {
            this.#dragEnable = false;
            preventDefault?.();
            this.#endValue += spinY * this.#speed;
            this.calculateValue();
        }
    }

    /**
     * @description
     * Move scroller
     *
     * @param {number} percent position in percent, from 0 to 100
     *
     * @example
     * myInstance.move(val);
     */
    move(percent) {
        if (!mq[this.#queryType](this.#breakpoint)) return;

        this.#percent = percent;
        this.#endValue = (this.#percent * this.#maxValue) / 100;

        /**
         * this.motion use spring or lerp, so goTo generic type is not the same.
         * But we don't use props here, so skip ts error
         */

        // @ts-ignore
        this.#motion.goTo({ val: this.#endValue });
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
    calculateValue() {
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
        if (this.#onUpdateCallback)
            this.#onUpdateCallback({
                value: -this.#endValue,
                percent: this.#percent,
                parentIsMoving: true,
            });
    }

    /**
     * @private
     * @type {import('./type.d.ts').onMouseEvent}
     */
    preventChecker({ target, preventDefault }) {
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
    getMousePos({ x, y }) {
        if (!x || !y) return 0;

        return this.#direction === parallaxConstant.DIRECTION_VERTICAL ? y : x;
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
            this.removeScrolerStyle();
            this.#motion?.stop?.();

            mobCore.useFrame(() => {
                mobCore.useNextTick(() => {
                    /** @type{HTMLElement} */ (this.#scroller).style.transform =
                        '';
                });
            });
            return;
        }

        this.refreshScroller();
        this.setScrolerStyle();

        mobCore.useFrameIndex(() => {
            mobCore.useNextTick(() => {
                if (this.#onAfterRefresh) this.#onAfterRefresh();

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
        this.removeScrolerStyle();
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

        mobCore.useFrameIndex(() => {
            mobCore.useNextTick(() => {
                this.#scroller = null;
                this.#screen = null;
            });
        }, 3);
    }
}
