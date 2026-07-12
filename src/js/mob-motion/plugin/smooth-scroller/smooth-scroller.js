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
    valueIsArrayAndReturnDefault,
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
    static #DEBOUNCE_FRAMES = 4000;

    /**
     * @type {boolean}
     */
    #syncTab = false;

    /**
     * @type {boolean}
     */
    #fixedTab = true;

    /**
     * @type {boolean}
     */
    #syncArrow = false;

    /**
     * @type {number}
     */
    #arrowThreshold = 100;

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
     * Track the is-whelling state to touch the DOM only once per gesture.
     *
     * - Safari invalidates style on every classList.add() call, even when the token is already present.
     * - `#addWhellingClass()` runs on every wheel event, so without this guard the class toggle would trigger a style
     *   recalc per frame ( freeze on big scrollers ).
     *
     * @type {boolean}
     */
    #isWhelling = false;

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
    #unSubscribeResize;

    /**
     * @type {() => void}
     */
    #unSubscribeScrollStart;

    /**
     * @type {() => void}
     */
    #unSubscribeScrollEnd;

    /**
     * @type {() => void}
     */
    #unSubscribeTouchStart;

    /**
     * @type {() => void}
     */
    #unSubscribeTouchEnd;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeMouseDown;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeMouseUp;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeMouseWheel;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeMouseMove;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeTouchMove;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeMouseClick;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeDebounceWhell;

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeMouseLeave = () => UnFreezeMobPageScroll();

    /**
     * @type {() => void}
     * @returns {void}
     */
    #unSubscribeHandleTab = () => {};

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

    /**
     * @type {string | Element | null}
     */
    #scroller;

    /**
     * @type {string | Element | null}
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
     * @type {import('./type.js').OnTick}
     */
    #onTickCallback;

    /**
     * @type {import('./type.js').OnUpdate}
     */
    #onUpdateCallback;

    /**
     * @type {(arg0: { shouldScroll: boolean }) => void}
     */
    #onAfterRefresh;

    /**
     * @type {(arg0: { shouldScroll: boolean }) => void}
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
     * @type {number[]}
     */
    #snapPoints;

    /**
     * @type {boolean}
     */
    #freezeSnap = false;

    /**
     * @type {number}
     */
    #velocity = 1;

    /**
     * @type {number}
     */
    #previousEndValue = 0;

    /**
     * @type {number}
     */
    #previousTime = 0;

    /**
     * @type {number}
     */
    #scrollDirection = 0;

    /**
     * @type {any}
     */
    #snapResetDebounce = null;

    /**
     * @type {number}
     */
    #lastSnapTime = MobCore.getTime();

    /**
     * @type {number}
     */
    #velocityThreshold;

    /**
     * @type {number}
     */
    #velocityEasing;

    /**
     * @type {(arg0: KeyboardEvent) => void}
     */
    #eventKeyArrow;

    /**
     * @type {number}
     */
    #rtl;

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
     *            snapPoints: [1,2,...],
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
        this.#unSubscribeResize = NOOP;
        this.#unSubscribeScrollStart = NOOP;
        this.#unSubscribeScrollEnd = NOOP;
        this.#unSubscribeTouchStart = NOOP;
        this.#unSubscribeTouchEnd = NOOP;
        this.#unSubscribeMouseDown = NOOP;
        this.#unSubscribeMouseUp = NOOP;
        this.#unSubscribeMouseWheel = NOOP;
        this.#unSubscribeMouseMove = NOOP;
        this.#unSubscribeTouchMove = NOOP;
        this.#unSubscribeMouseClick = NOOP;
        this.#unSubscribeDebounceWhell = NOOP;
        this.#unSubscribeHandleTab = NOOP;

        /**
         * Move in opposite direction with rtl
         */
        const dir = document.documentElement.getAttribute('dir');
        this.#rtl = dir === 'rtl' ? -1 : 1;

        /**
         * Initialize tween param.
         *
         * - Them we store here real tween.
         */
        this.#motion = {
            updateVelocity: NOOP,
            // @ts-ignore
            subscribe: NOOP,
            // @ts-ignore
            onComplete: NOOP,
            goTo: () => Promise.resolve(),
            set: () => Promise.resolve(),
            stop: NOOP,
            destroy: NOOP,
        };

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

        this.#syncTab = valueIsBooleanAndReturnDefault(
            data?.syncTab,
            'syncTab',
            false
        );

        this.#syncArrow = valueIsBooleanAndReturnDefault(
            data?.syncArrow,
            'syncArrow',
            false
        );

        this.#arrowThreshold = valueIsNumberAndReturnDefault(
            data?.arrowThreshold,
            'arrowThreshold',
            100
        );

        this.#fixedTab = valueIsBooleanAndReturnDefault(
            data?.fixedTab,
            'fixedTab',
            true
        );

        this.#snapPoints = valueIsArrayAndReturnDefault(
            data?.snapPoints,
            'SmoothScroller: snapPoints',
            []
        );

        this.#velocityThreshold = valueIsNumberAndReturnDefault(
            data?.velocityThreshold,
            'SmoothScroller: velocityThreshold',
            3
        );

        this.#velocityEasing = valueIsNumberAndReturnDefault(
            data?.velocityEasing,
            'SmoothScroller: velocityEasing',
            0.4
        );

        this.#children = data?.children || [];
        for (const element of this.#children) {
            element.setScroller(this.#scroller);
            element.setDirection(this.#direction);
            element.setScreen(this.#screen);
            element.setBreakPoint(this.#breakpoint);
            element.setQueryType(this.#queryType);
            element.init();
        }

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

        this.#eventKeyArrow = (event) => {
            const keyEvent = event.key?.toUpperCase();
            if (keyEvent !== 'ARROWDOWN' && keyEvent !== 'ARROWUP') return;

            const valueToAdd =
                keyEvent === 'ARROWDOWN'
                    ? this.#arrowThreshold
                    : -this.#arrowThreshold;

            this.#endValue = clamp(
                Math.round(this.#endValue + valueToAdd),
                0,
                this.#maxValue
            );

            /**
             * Preveniamo il caso in cui la gesture `enter` venga interpretata come mouseClick.
             *
             * - In questo case il check `preventChecker` impedirebbe di eseguire l'azione di click
             * - FirstTouchValue && endValue devono coincidere, non stiamo draggando l'elemento, ma il sistema puo pensare
             *   di si.
             */
            this.#firstTouchValue = this.#endValue;
            this.#updateScrollState();
            this.#executeScroll();
            event.preventDefault();
        };

        /**
         * Remove wheeling class at the end of wheel.
         */
        this.#unSubscribeDebounceWhell = MobCore.useMouseWheel(
            MobCore.debounce(() => {
                this.#removeWhellingClass();
            }, 500)
        );
    }

    /**
     * @type {() => void}
     */
    #removeWhellingClass() {
        if (!this.#scroller || !this.#isWhelling) return;

        this.#isWhelling = false;
        // @ts-ignore
        this.#scroller.classList.remove('is-whelling');
    }

    /**
     * @type {() => void}
     */
    #addWhellingClass() {
        if (!this.#scroller || this.#isWhelling) return;

        this.#isWhelling = true;
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
     * @param {HTMLElement} focusedElement
     */
    #checkIfElementIsInsideScreen(focusedElement) {
        if (!this.#screen) return;

        const screenRect = /** @type {HTMLElement} */ (
            this.#screen
        ).getBoundingClientRect();
        const focusedRect = focusedElement.getBoundingClientRect();

        const isVertical =
            this.#direction === MobScrollerConstant.DIRECTION_VERTICAL;
        const elementSize = isVertical
            ? focusedElement.clientHeight
            : focusedElement.clientWidth;
        const screenSize = isVertical ? screenRect.height : screenRect.width;
        const safetyMargin = Math.ceil(elementSize * 0.1);

        if (elementSize > screenSize) return true;
        const threshold = elementSize + safetyMargin;

        if (isVertical) {
            const distanceToTop = focusedRect.top - screenRect.top;
            const distanceToBottom = screenRect.bottom - focusedRect.bottom;
            return distanceToTop < threshold || distanceToBottom < threshold;
        }

        const distanceToLeft = focusedRect.left - screenRect.left;
        const distanceToRight = screenRect.right - focusedRect.right;
        return distanceToLeft < threshold || distanceToRight < threshold;
    }

    /**
     * Update scroller after user Tab
     */
    #setUsability() {
        let tabIsActive = false;

        if (this.#syncTab) {
            this.#unSubscribeHandleTab = MobCore.useTabHandler(() => {
                if (
                    tabIsActive ||
                    !this.#screen ||
                    !this.#scroller ||
                    /** @type {any} */ (this.#screen) === globalThis
                )
                    return;

                tabIsActive = true;
                const screenEl = /** @type {HTMLElement} */ (this.#screen);
                const scrollerEl = /** @type {HTMLElement} */ (this.#scroller);

                MobCore.useFrameIndex(() => {
                    MobCore.useNextTick(() => {
                        const focusedElement = document.activeElement;

                        if (
                            !focusedElement ||
                            !scrollerEl.contains(focusedElement)
                        ) {
                            tabIsActive = false;
                            return;
                        }

                        /**
                         * Aggiorna lo scroller
                         *
                         * - A ogni tab.
                         * - Quando l'elemento con il focus stá per uscire dallo schermo.
                         */
                        if (
                            !this.#fixedTab &&
                            !this.#checkIfElementIsInsideScreen(
                                /** @type {HTMLElement} */ (focusedElement)
                            )
                        ) {
                            tabIsActive = false;
                            return;
                        }

                        const scrollerRect = scrollerEl.getBoundingClientRect();
                        const focusedRect =
                            focusedElement.getBoundingClientRect();

                        const targetScrollValue =
                            this.#direction ===
                            MobScrollerConstant.DIRECTION_VERTICAL
                                ? focusedRect.top -
                                  scrollerRect.top -
                                  screenEl.offsetHeight / 5
                                : focusedRect.left -
                                  scrollerRect.left -
                                  screenEl.offsetWidth / 5;

                        this.#endValue = clamp(
                            Math.round(targetScrollValue),
                            0,
                            this.#maxValue
                        );

                        /**
                         * Preveniamo il caso in cui la gesture `enter` venga interpretata come mouseClick.
                         *
                         * - In questo case il check `preventChecker` impedirebbe di eseguire l'azione di click
                         * - FirstTouchValue && endValue devono coincidere, non stiamo draggando l'elemento, ma il sistema
                         *   puo pensare di si.
                         */
                        this.#firstTouchValue = this.#endValue;

                        screenEl.scrollTop = 0;
                        screenEl.scrollLeft = 0;

                        this.#updateScrollState();
                        this.#executeScroll();
                        tabIsActive = false;
                    });
                }, 2);
            });
        }

        if (this.#syncArrow) {
            const screen = /** @type {any} */ (this.#screen);
            if (screen === globalThis) return;
            screen.addEventListener('keydown', this.#eventKeyArrow);
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

        for (const item of activeElements) {
            item.setAttribute('draggable', 'false');
            // @ts-ignore
            item.style['user-select'] = 'none';
        }
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

        for (const item of activeElement) {
            item.removeAttribute('draggable');
            // @ts-ignore
            item.style['user-select'] = '';
        }
    }

    /**
     * @type {() => void}
     */
    #initMotion() {
        if (!this.#motion) return;

        this.#subscribeMotion = this.#motion.subscribe(({ val }) => {
            /** @type {HTMLElement} */ (this.#scroller).style.transform =
                this.#direction == MobScrollerConstant.DIRECTION_VERTICAL
                    ? `translate3d(0px, 0px, 0px) translateY(${-Math.trunc(val)}px)`
                    : `translate3d(0px, 0px, 0px) translateX(${-Math.trunc(val * this.#rtl)}px)`;

            /**
             * TODO:
             *
             * - TriggerScrollStart() should be called once at the beginning of motion,
             * - Not on every tick. Currently there is no dedicated "first tick" event from
             * - Internalli children set this.#force3D = true when triggerScrollStart is Called.
             */
            for (const element of this.#children) {
                element.triggerScrollStart();
            }

            MobCore.useNextTick(() => {
                this.#onTickCallback({
                    value: -val,
                    percent: this.#percent,
                    parentIsMoving: true,
                });

                for (const element of this.#children) {
                    element.move({
                        value: -val,
                        parentIsMoving: true,
                    });
                }
            });
        });

        this.#subscribeOnComplete = this.#motion.onComplete(({ val }) => {
            /** @type {HTMLElement} */ (this.#scroller).style.transform =
                this.#direction == MobScrollerConstant.DIRECTION_VERTICAL
                    ? `translateY(${-Math.trunc(val)}px)`
                    : `translateX(${-Math.trunc(val * this.#rtl)}px)`;

            MobCore.useNextTick(() => {
                this.#onTickCallback({
                    value: -val,
                    percent: this.#percent,
                    parentIsMoving: false,
                });

                for (const element of this.#children) {
                    element.triggerScrollEnd();
                    element.move({
                        value: -val,
                        parentIsMoving: false,
                    });
                }
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

        this.#updateScrollState();
        this.#executeScroll();
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
        this.#endValue = clamp(this.#endValue, 0, this.#maxValue);

        this.#updateScrollState();
        this.#executeScroll();
    }

    /**
     * TODO: aggiungere spinX e controllo come per onWhell ( x or y ) ?
     *
     * - Scoped wheel ad ora tiene in cosiderazione solo l'asse delle Y.
     *
     * @type {(arg0: { spinY: number }) => void}
     */
    #onScopedWhell({ spinY = 0 }) {
        if (!mq[this.#queryType](this.#breakpoint)) return;
        FreezeMobPageScroll();

        this.#dragEnable = false;

        /**
         * Eseguiamo un reset del debounce per la detext del fine wheel.
         *
         * - Evitiamo che i valori di velocity etc.. vengano resettati troppo presto dal timeout attivo.
         * - In questo modo goToNextSnap userá un valore di velocity reale e non forzato a 1.
         * - CheckSnapOpportunity si occuperá di creare un nuovo timeout se necessario ( snap individuato ).
         * - Questa é la logica della gestione del debounce attivando quando uno snap é intercettato.
         */
        this.#clearSnapTimeout();

        /**
         * Normalize spinValue between -1 && 1.
         */
        const spinYParsed = clamp(spinY, -1, 1);
        this.#endValue += spinYParsed * this.#speed;
        this.#endValue = clamp(this.#endValue, 0, this.#maxValue);
        this.#updateScrollState();

        /**
         * Gestisce il lifecycle dello snap:
         *
         * 1. Interrompe eventuali snap in corso (freezeSnap = false)
         * 2. Aggiorna/Cancella il timer di debounce
         * 3. Valuta se attivare un nuovo snap (velocity > 5, direzione, etc.)
         *
         * Se uno snap viene attivato, il flusso corrente termina qui
         *
         * - Lo motion gestirà l'animazione verso il punto di snap.
         */
        const useSnap =
            this.#snapPoints.length > 0 ? this.#checkSnapOpportunity() : false;

        if (useSnap) {
            /**
             * Schedula il timeout per tracciare la fine degli eventi di wheel.
             *
             * - Con lo snap attivo non viene eseguita executeScroll
             */
            this.#scheduleSnapTimeout();
            return;
        }

        this.#executeScroll();

        /**
         * Schedula il timeout per tracciare la fine degli eventi di wheel.
         */
        if (this.#snapPoints.length > 0) {
            this.#scheduleSnapTimeout();
        }
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
            FreezeMobPageScroll();

            /**
             * Clear pending snap timeout.
             */
            if (this.#snapPoints.length > 0) this.#clearSnapTimeout();

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
        UnFreezeMobPageScroll();

        if (this.#snapPoints.length > 0) {
            /**
             * Check next snap on drag end;
             */
            this.#goToNextSnap();

            /**
             * Prepara lo stato per il prossimo input (evento) dopo uno snap da drag.
             *
             * - Dopo uno swipe veloce (con conseguente snap), la velocity rimane alta (es. 8.0).
             * - Il primo wheel troverebbe velocity >= 3 e verrebbe intercettato da goToNextSnap().
             * - Verrebbe forzato un nuovo snap (spesso verso lo stesso punto), rendendo il wheel non reattivo.
             * - Questo metodo schedula il ripristino di velocity a 1 dopo ~25ms (1500/fps).
             * - Così il prossimo wheel troverà velocity insufficiente per triggerare un nuovo snap e potrà scorrere
             *   liberamente.
             */
            this.#scheduleSnapTimeout();
        }
    }

    /**
     * @type {import('./type.js').MobSmoothScrollerOnMouseEvent}
     */
    #onTouchMove({ target, client, preventDefault }) {
        if (!(
            this.#dragEnable &&
            this.#drag &&
            (target === this.#scroller ||
                isDescendant(
                    /** @type {HTMLElement} */ (this.#scroller),
                    /** @type {HTMLElement} */ (target)
                ))
        )) {
            return;
        }

        // @ts-ignore
        preventDefault();

        this.#prevTouchVal = this.#touchVal;
        this.#touchVal = this.#getMousePos({
            x: client?.x ?? 0,
            y: client?.y ?? 0,
        });

        const result = Math.round(this.#prevTouchVal - this.#touchVal);
        this.#endValue += result;
        this.#endValue = clamp(this.#endValue, 0, this.#maxValue);
        this.#updateScrollState();
        this.#executeScroll();
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

            /**
             * Eseguiamo un reset del debounce per la detext del fine wheel.
             *
             * - Evitiamo che i valori di velocity etc.. vengano resettati troppo presto dal timeout attivo.
             * - In questo modo goToNextSnap userá un valore di velocity reale e non forzato a 1.
             * - CheckSnapOpportunity si occuperá di creare un nuovo timeout se necessario ( snap individuato ).
             * - Questa é la logica della gestione del debounce attivando quando uno snap é intercettato.
             */
            this.#clearSnapTimeout();

            /**
             * Default mode.
             */
            const spinXdiff = Math.abs(this.#lastSpinX - spinX);
            const spinYdiff = Math.abs(this.#lastSpinY - spinY);

            /**
             * In horizontal mode, allow scroll in X and Y direction.
             */
            const spinValue = this.#useHorizontalScroll
                ? (() => {
                      return spinXdiff > spinYdiff ? spinX : spinY;
                  })()
                : spinY;

            /**
             * When there is no advanced return;
             */
            if (Math.abs(spinValue) === 0) return;

            /**
             * Normalize spinValue between -1 && 1.
             */
            this.#endValue += clamp(spinValue, -1, 1) * this.#speed;
            this.#endValue = clamp(this.#endValue, 0, this.#maxValue);
            this.#updateScrollState();

            /**
             * Gestisce il lifecycle dello snap:
             *
             * 1. Interrompe eventuali snap in corso (freezeSnap = false)
             * 2. Aggiorna/Cancella il timer di debounce
             * 3. Valuta se attivare un nuovo snap (velocity > X, direzione, etc.)
             *
             * Se uno snap viene attivato, il flusso corrente termina qui
             *
             * - Lo motion gestirà l'animazione verso il punto di snap.
             */
            const useSnap =
                this.#snapPoints.length > 0
                    ? this.#checkSnapOpportunity()
                    : false;

            if (useSnap) {
                /**
                 * Schedula il timeout per tracciare la fine degli eventi di wheel.
                 *
                 * - Con lo snap attivo non viene eseguita executeScroll
                 */
                this.#scheduleSnapTimeout();
                return;
            }

            /**
             * - Aggiorna:
             * - PercentValue
             *
             * Lancia il tween
             */
            this.#executeScroll();
            this.#lastSpinY = spinY;
            this.#lastSpinX = spinX;

            /**
             * Schedula il timeout per tracciare la fine degli eventi di wheel.
             */
            if (this.#snapPoints.length > 0) {
                this.#scheduleSnapTimeout();
            }
        }
    }

    /**
     * Schedula il reset di velocity ( per coerenza anche di freezeSnap ).
     *
     * - Viene chiamato dopo ogni wheel, dopo uno snap o al rilascio del drag.
     * - Il reset avviene dopo 3 frame ( 3000ms / currentFps ),
     * - 3000 = 3 secondi.
     * - CurrentFps = frame per secondo
     * - Questo serve a gestire eventi molto ravvicinati del trackpad.
     * - Se arrivano nuovi eventi durante questa finestra, il timer viene cancellato e rischedulato, permettendo alla
     *   velocity di accumularsi senza reset.
     *
     * @type {() => void}
     */
    #scheduleSnapTimeout() {
        if (this.#snapResetDebounce) {
            clearTimeout(this.#snapResetDebounce);
        }

        this.#snapResetDebounce = setTimeout(
            () => {
                this.#freezeSnap = false;
                this.#velocity = 1;
                this.#snapResetDebounce = null;
            },
            Math.ceil(MobSmoothScroller.#DEBOUNCE_FRAMES / MobCore.getFps())
        );
    }

    #clearSnapTimeout() {
        if (!this.#snapResetDebounce) {
            return;
        }

        /**
         * 1. CANCELLIAMO il timeout di reset pending
         *
         * - Se il timer scadesse ora, resetterebbe velocity a 1.
         * - Con velocity = 1, il check successivo `this.#velocity < X` in goToNextSnap() fallirebbe.
         * - Impedirebbe cosi l'attivazione dello snap nonostante l'utente stia scrollando velocemente.
         *
         * Il clearTimeout mantiene la velocity accumulata per permettere la valutazione corretta del prossimo snap.
         */
        clearTimeout(this.#snapResetDebounce);
        this.#snapResetDebounce = null;
    }

    /**
     * @returns {boolean | undefined}
     */
    #checkSnapOpportunity() {
        if (this.#snapPoints.length === 0) return;

        /**
         * 2. INTERRUMPIAMO lo snap in corso (se c'è)
         *
         * - Se eravamo già in uno snap automatico:
         * - Lo interrompiamo per dare priorità al nuovo input utente.
         * - FreezeSnap = false permette a updateScrollState() di riprendere e il motion gestirà il cambio target in modo
         *   fluido.
         */
        if (this.#freezeSnap) {
            this.#freezeSnap = false;
        }

        /**
         * 3. VALUTIAMO il nuovo snap
         *
         * - Ora che velocity è preservata (non resettata dal timer) e freezeSnap è sbloccato, possiamo valutare se
         *   attivare uno snap.
         * - Se attivato, freezeSnap tornerà true e il motion gestirà l'animazione.
         */
        return !this.#dragEnable && this.#goToNextSnap();
    }

    /**
     * Go to next snap by velocity;
     *
     * @returns {boolean | undefined}
     */
    #goToNextSnap() {
        if (
            this.#snapPoints.length === 0 ||
            this.#velocity < this.#velocityThreshold ||
            this.#freezeSnap
        )
            return;

        const percentTarget =
            this.#scrollDirection === 1
                ? this.#snapPoints.find((percent) => {
                      return this.#percent <= percent;
                  })
                : this.#snapPoints.findLast((percent) => {
                      return this.#percent >= percent;
                  });

        if (!percentTarget && percentTarget !== 0) return;

        this.#freezeSnap = true;

        /**
         * Importante. Questo é l'unico punto in cui settare lastSnapTime.
         *
         * - Si tratta dell' ultimo livello di sicurezza per preservare la chiamata dello snap
         */
        this.#lastSnapTime = MobCore.getTime();
        this.move(percentTarget);

        return true;
    }

    #setVelocity() {
        const time = MobCore.getTime();
        const diffTime = time - this.#previousTime;

        /**
         * DiffEndValue al cambio di direzione genera un valore molto piccolo ( cambio segno ) per cui la velocitá sará
         * 1.
         */
        const diffEndValue = this.#endValue - this.#previousEndValue;

        /**
         * - Calcola la direzione dello scroll.
         * - Il risultato è sempre 1 (avanti) o -1 (indietro)
         * - #setVelocity() viene invocata esclusivamente da #updateScrollState(), che a sua volta è triggerata solo da
         *   input utente reale (wheel, drag, touch).
         * - In tutti questi casi #endValue è già stato modificato, quindi diffEndValue non può mai essere 0 in condizioni
         *   normali.
         */
        this.#scrollDirection = Math.sign(diffEndValue);

        /**
         * Identifichiamo la pausa esplicita dell'utente (ha smesso di scrollare)
         *
         * - Usiamo lo stesso threshold del debounce (3 frame).
         * - Se passano più di 3 frame senza nuovi eventi, consideriamo la pausa intenzionale.
         */
        const threshold = Math.ceil(
            MobSmoothScroller.#DEBOUNCE_FRAMES / MobCore.getFps()
        );

        /**
         * Arriviamo da uno scorrimento continuo.
         *
         * - Il check su diffEndValue ( valore attuale e precedente uguale ) é necessario perché:
         * - 1. Drag con movimento < 0.5px (arrotontato a 0 da Math.round())
         * - 2. Scroll oltre i limiti (clamp blocca il valore)
         */
        if (diffTime <= threshold && diffEndValue !== 0) {
            /**
             * Normalizza diffTime a un baseline di 60fps
             *
             * - Su display ad alto refresh rate (120Hz, 144Hz) gli eventi arrivano con diffTime più basso.
             * - Gonfiando artificialmente la velocity.
             * - Math.max porta diffTime ad almeno 16.67ms, equiparando la velocity a quella che si avrebbe a 60fps.
             * - Per eventi meno frequenti (mouse wheel, ~80-100ms) diffTime è già maggiore del baseline, quindi non viene
             *   alterato.
             */
            const baselineInterval = 1000 / 60;
            const normalizedDiffTime = Math.max(diffTime, baselineInterval);
            const vv = diffEndValue / normalizedDiffTime;

            /**
             * Velocitá instantanea
             */
            const newVelocity =
                Math.round((Math.abs(vv) + 1) * 10_000) / 10_000;

            /**
             * Media pesata della velocitá precedente e istantanea.
             *
             * - Questo evitá che lo snap scatti direttamente sui picchi.
             * - Smorziamo il picco in modo che:
             * - Lo snap non scatti su un singolo picco
             * - Lo snap scatterá quando abbiamo una sequenza temporale di eventi veloci.
             *
             * Esempio pratico:
             *
             * - NewVelocity: 4.6, 4.6
             * - This.#velocity: 2.44, 3.304
             *
             * EMA ( Exponential Moving Average ):
             *
             * - Media mobile che dá piu peso ai valori recenti tramite un fattore di smoothing.
             */
            this.#velocity = Math.max(
                1,
                this.#velocityEasing * newVelocity +
                    (1 - this.#velocityEasing) * this.#velocity
            );
        }

        /**
         * Dopo una pausa gestiamo la ripresa dal valore neutro di velocitá pari a 1.
         */
        if (diffTime > threshold) {
            this.#velocity = 1;
        }

        this.#previousTime = time;
        this.#previousEndValue = this.#endValue;
    }

    /**
     * @returns {void}
     */
    #updateScrollState() {
        /**
         * Layer di sicurezza n1.
         */
        if (this.#snapPoints.length > 0 && this.#freezeSnap) return;

        /**
         * Layer di sicurezza n2.
         *
         * - Se appena dopo uno snap ci troviamo inquesto punto del codice vuol dire che:
         * - Sappiamo che stiamo esenguendo uno snap,e questo evento é da considerarsi involontario
         * - Usiamo 100ms come threshold, nei primi 100ms da uno snap siamo sicuri che l'azione corrente é uno snap.
         * - Ci blocchiamo subito.
         * - Questo evento puó eseere causato da vari motivi, es: rotella del mouse con inerzia su monitor ad alta
         *   frequenza.
         * - 100ms sono un tempo ragionevole, dopo uno snap qualsiasi evento che arriva nei primi 100ms é per forza un
         *   residuo indesiderato.
         * - Senza questo controllo il target dello span corrente rischia di essere alterato.
         */
        if (this.#snapPoints.length > 0) {
            const currentTime = MobCore.getTime();
            const timeFromLastSnap = Math.abs(this.#lastSnapTime - currentTime);
            if (timeFromLastSnap < 100) return;
        }

        /**
         * Update base value
         *
         * - Prevent division by 0 ( NaN ).
         */
        const percentValue =
            this.#maxValue > 0 ? (this.#endValue * 100) / this.#maxValue : 0;
        this.#percent = clamp(percentValue, 0, 100);

        /**
         * Start velocity check.
         */
        if (this.#snapPoints.length > 0) this.#setVelocity();

        return;
    }

    #executeScroll() {
        /**
         * Layer di sicurezza n1.
         *
         * - Tutti i `chiamanti` di #executeScroll devono prima eseguire `#checkSnapOpportunity()`.
         * - `#scheduleCurrentSnap()` modificano il valore di freezeSnap a false.
         * - Manteniamo il controllo in caso di future modifiche.
         * - SnapPoints.length serve a proteggere per fuiture modifiche, attualamente non sarebbe necessario.
         */
        if (this.#snapPoints.length > 0 && this.#freezeSnap) return;

        /**
         * This.motion use spring or lerp, so goTo generic type is not the same. But we don't use props here, so skip ts
         * error
         */
        void this.#motion.goTo({ val: this.#endValue }).catch(() => {});

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
                this.#motion = new MobSpring({
                    data: { val: 0 },
                    config: 'scroller',
                    configProps: {
                        tension: 15,
                    },
                });
                break;
            }

            default: {
                this.#motion = new MobLerp({ data: { val: 0 } });
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

            /**
             * See global `MobCore.useTouchMove` issue
             */
            // /** @type {HTMLElement} */ (this.#scroller).addEventListener(
            //     'touchmove',
            //     this.#scopedTouchMove,
            //     {
            //         passive: true,
            //     }
            // );
        }

        /**
         * Non scoped event
         */
        if (!this.#scopedEvent) {
            this.#unSubscribeMouseWheel = MobCore.useMouseWheel((data) => {
                this.#onWhell(data);
            });

            this.#unSubscribeMouseMove = MobCore.useMouseMove((data) => {
                this.#onTouchMove(data);
            });

            /**
             * See global `MobCore.useTouchMove` issue
             */
            // this.#unSubscribeTouchMove = MobCore.useTouchMove((data) => {
            //     this.#onTouchMove(data);
            // });
        }

        /**
         * Common event
         */
        this.#unSubscribeResize = MobCore.useResize(() => this.refresh());

        this.#unSubscribeScrollStart = MobCore.useScrollStart(() =>
            this.#refreshScroller()
        );

        this.#unSubscribeScrollEnd = MobCore.useScrollEnd(() =>
            this.#refreshScroller()
        );

        this.#unSubscribeTouchStart = MobCore.useTouchStart((data) =>
            this.#onMouseDown(data)
        );

        this.#unSubscribeTouchEnd = MobCore.useTouchEnd((data) =>
            this.#onMouseUp(data)
        );

        this.#unSubscribeMouseDown = MobCore.useMouseDown((data) =>
            this.#onMouseDown(data)
        );

        this.#unSubscribeMouseUp = MobCore.useMouseUp((data) =>
            this.#onMouseUp(data)
        );

        /**
         * TouchMove at moment do not use scoped vs !norScoped logic.
         *
         * - With scped logc FreezeMobPageScroll is ok.
         * - But we does not now when fire UnFreezeMobPageScroll.
         * - Event similar to mouseleave is missed from touch logix.
         * - TODO: how fire UnFreezeMobPageScroll with scoped touch.
         */
        this.#unSubscribeTouchMove = MobCore.useTouchMove((data) => {
            this.#onTouchMove(data);
        });

        /**
         * UnFreeze page scroller
         */
        /** @type {HTMLElement} */ (this.#scroller).addEventListener(
            'mouseleave',
            this.#unSubscribeMouseLeave
        );

        if (this.#drag) {
            this.#unSubscribeMouseClick = MobCore.useMouseClick(
                ({ target, preventDefault }) => {
                    this.#preventChecker({ target, preventDefault });
                }
            );
        }

        this.#initMotion();
        this.#setUsability();

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

                for (const element of this.#children) {
                    element.refresh();
                }
            });
        }, 3);
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
        this.#endValue = clamp(
            (this.#percent * this.#maxValue) / 100,
            0,
            this.#maxValue
        );

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
        this.#endValue = clamp(
            (this.#percent * this.#maxValue) / 100,
            0,
            this.#maxValue
        );

        /**
         * This.motion use spring or lerp, so set generic type is not the same. But we don't use props here, so skip ts
         * error
         */

        // @ts-ignore
        this.#motion.set({ val: this.#endValue });
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

                for (const element of this.#children) {
                    element.refresh();
                }
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
        this.#removeWhellingClass();
        this.#removeScrolerStyle();
        this.#unSubscribeResize();
        this.#unSubscribeScrollStart();
        this.#unSubscribeScrollEnd();
        this.#unSubscribeTouchStart();
        this.#unSubscribeTouchEnd();
        this.#unSubscribeMouseDown();
        this.#unSubscribeMouseUp();
        this.#unSubscribeMouseWheel();
        this.#unSubscribeMouseMove();
        this.#unSubscribeTouchMove();
        this.#unSubscribeMouseClick();
        this.#subscribeMotion();
        this.#subscribeOnComplete();
        this.#unSubscribeDebounceWhell();
        this.#unSubscribeHandleTab();
        this.#motion?.destroy();
        // @ts-ignore
        this.#motion = null;
        for (const element of this.#children) {
            element?.destroy?.();
        }
        this.#children = [];
        this.#onTickCallback = NOOP;
        this.#onUpdateCallback = NOOP;
        this.#onAfterRefresh = NOOP;
        this.#afterInit = NOOP;
        UnFreezeMobPageScroll();

        if (this.#snapResetDebounce) {
            clearTimeout(this.#snapResetDebounce);
            this.#snapResetDebounce = null;
        }

        /** @type {HTMLElement} */ (this.#scroller).removeEventListener(
            'mouseleave',
            this.#unSubscribeMouseLeave
        );

        this.#unSubscribeMouseLeave = NOOP;

        if (this.#syncArrow) {
            /** @type {HTMLElement} */ (this.#screen).removeEventListener(
                'keydown',
                this.#eventKeyArrow
            );

            this.#eventKeyArrow = NOOP;
        }

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

            this.#scopedTouchMove = NOOP;
            this.#scopedWhell = NOOP;
        }

        MobCore.useFrameIndex(() => {
            MobCore.useNextTick(() => {
                /** @type {HTMLElement} */ (this.#scroller).style.transform =
                    '';
                this.#scroller = null;
                this.#screen = null;
            });
        }, 3);
    }
}
