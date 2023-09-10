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
} from '../../animation/utils/tweenValidation.js';
import { mobCore } from '../../../mobCore/index.js';
import {
    isDescendant,
    outerHeight,
    outerWidth,
} from '../../../mobCore/utils/index.js';

/**
 * @typedef {Object} smoothScrollerType
 * @prop {('vertical'|'horizontal')} [ direction = 'vertical' ]
    Defines the scroll direction
 * @prop {('spring'|'lerp')} [ easeType = 'lerp']
    Defines the type of easing. The default is `lerp`.
 * @prop {( String|Element )} scroller
   The node that will have to scroll
 * @prop {( String|Element )} [ screen ]
    The scroller container.
    The default value is `document.documentElement`.
 * @prop {Boolean} scopedEvent
   Use event ( scroll,wheel,etc.. ) on scroller or on document.
   If the events are used on the scroller they will have the passive property set to true (better performance).
   Otherwise, based on the general value of the passive property, the listener attached to the document will use the `preventDefault()` function.
   This will prevent the page from scrolling in turn when scrolling over the component.
   To set the global passive property use:
   `core.setDefault({ usePassive: true|false })`;
 * @prop {Number} speed
   You can adjust the speed of the wheel event.
   The default value is `60`.
 * @prop {Boolean} drag
   It is possible to enable and disable the drag functionality.
   The default value is `false`.
 * @prop {function({value:number, percent:number, parentIsMoving:boolean}):void} [ onTick = null ]
   Function that is launched at each tick.
   The function will have an Object as input parameter.
   `value`: scroll value
   `percent`: scroll value in percent
   `parentIsMoving`: A boolean value indicating whether the scroller has stopped ( last tick )
 * @prop {function({value:number, percent:number, parentIsMoving:boolean}):void} [ onUpdate = null ]
   Function that is launched at each update value ( non easing value ).
   The function will have an Object as input parameter.
   `value`: scroll value
   `percent`: scroll value in percent
 * @prop {function():void} [ afterRefresh = null ]
   Function that is launched after refresh
 * @prop {function():void} [ afterInit = null ]
   Function that is launched after inizialization
 * @prop {function():void} [ afterDestroy = null ]
   Function that is launched after destroy
 * @prop {Array.<ParallaxClass>} children
   An array of instances of the ParallaxClass class used within the scroller.
   Es:
   const parallax = mobbu.createParallax({ ... })
   const scrolltrigger = mobbu.createScrollTrigger({ ... })
   ...
   children: [parallax, scrolltrigger],
   ...

   The instances contained in the array will be:
   Drive.
   Updated.
   Destroyed.

   The `scroller`,`screen`, `direction`,`branckPoint`,`queryType` properties
   will be automatically aligned.
 */

/**
 * @typedef  { smoothScrollerType & import('../../utils/mediaManager.js').breackPointTypeObj & import('../../utils/mediaManager.js').mqTypeObject } smoothScrollerConstructorType
 */
export default class SmoothScroller {
    /**
     * @param { smoothScrollerConstructorType } data
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
           afterDestroy: () => {
               ...
           },
       });

       mySmoothScroller.init();
       ```
     */
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
        this.scroller = mobCore.checkType(String, data?.scroller)
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
                  return mobCore.checkType(String, data.screen)
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
        this.onUpdateCallback = valueIsFunctionAndReturnDefault(
            data?.onUpdate,
            'SmoothScroller: onUpdate',
            null
        );

        /**
         * @private
         */
        this.onAfterRefresh = valueIsFunctionAndReturnDefault(
            data?.afterRefresh,
            'SmoothScroller: afterRefresh',
            NOOP
        );

        /**
         * @private
         */
        this.afterInit = valueIsFunctionAndReturnDefault(
            data?.afterInit,
            'SmoothScroller: afterInit',
            NOOP
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
            const { spinY } = mobCore.normalizeWheel(e);
            this.onScopedWhell({
                target: e.target,
                spinY,
            });
        };

        /**
         * @private
         */
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

    /**
     * @description
     * Inizialize insatance
     *
     * @example
     * myInstance.init()
     */
    init() {
        if (!this.propsIsValid) return;

        switch (this.easeType) {
            case parallaxConstant.EASE_SPRING: {
                this.motion = new HandleSpring();
                break;
            }

            default: {
                this.motion = new HandleLerp();
                break;
            }
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
            this.subscribeMouseWheel = mobCore.useMouseWheel((data) =>
                this.onWhell(data)
            );

            this.subscribeMouseMove = mobCore.useMouseMove((data) =>
                this.onTouchMove(data)
            );
            this.subscribeTouchMove = mobCore.useTouchMove((data) =>
                this.onTouchMove(data)
            );
        }

        /**
         * Common event
         */
        this.subscribeResize = mobCore.useResize(() => this.refresh());
        this.subscribeScrollStart = mobCore.useScrollStart(() =>
            this.refreshScroller()
        );
        this.subscribeScrollEnd = mobCore.useScrollEnd(() =>
            this.refreshScroller()
        );
        this.subscribeTouchStart = mobCore.useTouchStart((data) =>
            this.onMouseDown(data)
        );
        this.subscribeTouchEnd = mobCore.useTouchEnd((data) =>
            this.onMouseUp(data)
        );
        this.subscribeMouseDown = mobCore.useMouseDown((data) =>
            this.onMouseDown(data)
        );
        this.subscribeMouseUp = mobCore.useMouseUp((data) =>
            this.onMouseUp(data)
        );

        if (this.drag) {
            this.subscribeMouseClick = mobCore.useMouseClick(
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

        mobCore.useFrameIndex(() => {
            mobCore.useNextTick(() => {
                this.afterInit?.();
                this.children.forEach((element) => {
                    element.refresh();
                });
            });
        }, 3);
    }

    /**
     * @private
     */
    setScrolerStyle() {
        this.scroller.style['user-select'] = 'none';

        const activeElement = this.scroller.querySelectorAll('a, button');
        [...activeElement].forEach((item) => {
            item.setAttribute('draggable', false);
            item.style['user-select'] = 'none';
        });
    }

    /**
     * @private
     */
    removeScrolerStyle() {
        this.scroller.style['user-select'] = '';

        const activeElement = this.scroller.querySelectorAll('a, button');
        [...activeElement].forEach((item) => {
            item.removeAttribute('draggable');
            item.style['user-select'] = '';
        });
    }

    /**
     * @private
     */
    initMotion() {
        this.motion.setData({ val: 0 });

        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            this.scroller.style.transform =
                this.direction == parallaxConstant.DIRECTION_VERTICAL
                    ? `translate3d(0px, 0px, 0px) translateY(${-val}px)`
                    : `translate3d(0px, 0px, 0px) translateX(${-val}px)`;

            /**
             * TODO Move to scroll Start (scopedEvent or not , wheel touch etc...)
             * Used by instance with ease = true;
             */
            this.children.forEach((element) => {
                element.triggerScrollStart();
            });

            mobCore.useNextTick(() => {
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
            this.scroller.style.transform =
                this.direction == parallaxConstant.DIRECTION_VERTICAL
                    ? `translateY(${-val}px)`
                    : `translateX(${-val}px)`;

            mobCore.useNextTick(() => {
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

    /**
     * @private
     */
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

    /**
     * @private
     */
    onScopedTouchMove({ client }) {
        if (!this.dragEnable || !this.drag) return;

        this.prevTouchVal = this.touchVal;
        this.touchVal = this.getMousePos(client);
        this.endValue += Number.parseInt(this.prevTouchVal - this.touchVal);
        this.calculateValue();
        this.scrollbarIsRunning = false;
    }

    /**
     * @private
     */
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

    /**
     * @private
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

    /**
     * @private
     */
    onMouseUp() {
        this.dragEnable = false;
        this.scrollbarIsRunning = false;
    }

    /**
     * @private
     */
    onTouchMove({ target, client, preventDefault }) {
        if (
            (target === this.scroller || isDescendant(this.scroller, target)) &&
            this.dragEnable &&
            this.drag
        ) {
            preventDefault();

            this.prevTouchVal = this.touchVal;
            this.touchVal = this.getMousePos(client);

            const result = Number.parseInt(this.prevTouchVal - this.touchVal);
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
     * @description
     * Move scroller
     *
     * @prop {Number} new position in percent, from 0 to 100
     *
     * @example
     * myInstance.move(val);
     */
    move(percent) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.scrollbarIsRunning = true;
        this.percent = percent;
        this.endValue = (this.percent * this.maxValue) / 100;
        this.motion.goTo({ val: this.endValue }).catch(() => {});
    }

    /**
     *
     * @description
     * Move scroller immediatr
     *
     * @prop {Number} new position in percent, from 0 to 100
     *
     * @example
     * myInstance.set(val);
     */
    set(percent) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.scrollbarIsRunning = true;
        this.percent = percent;
        this.endValue = (this.percent * this.maxValue) / 100;
        this.motion.set({ val: this.endValue }).catch(() => {});
    }

    /**
     * Utils
     */
    calculateValue() {
        const percentValue = (this.endValue * 100) / this.maxValue;
        this.percent = clamp(percentValue, 0, 100);
        this.endValue = clamp(this.endValue, 0, this.maxValue);
        this.motion.goTo({ val: this.endValue }).catch(() => {});

        /**
         * Fire on update callback
         */
        if (this.onUpdateCallback)
            this.onUpdateCallback({
                value: -this.endValue,
                percent: this.percent,
                parentIsMoving: true,
            });
    }

    /**
     * @private
     */
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

    /**
     * @description
     * Refresh instance
     *
     * @example
     * myInstance.refresh()
     */
    refresh() {
        if (!mq[this.queryType](this.breackpoint)) {
            this.removeScrolerStyle();
            this.motion?.stop?.();
            mobCore.useFrame(() => {
                mobCore.useNextTick(() => {
                    this.scroller.style.transform = '';
                });
            });
            return;
        }

        this.refreshScroller();
        this.setScrolerStyle();

        mobCore.useFrameIndex(() => {
            mobCore.useNextTick(() => {
                if (this.onAfterRefresh) this.onAfterRefresh();

                this.children.forEach((element) => {
                    element?.refresh?.();
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
        this.onUpdateCallback = [];
        this.onAfterRefresh = [];
        this.afterInit = [];

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

        mobCore.useFrameIndex(() => {
            mobCore.useNextTick(() => {
                this.afterDestroy?.();
                this.afterDestroy = [];
            });
        }, 3);
    }
}
