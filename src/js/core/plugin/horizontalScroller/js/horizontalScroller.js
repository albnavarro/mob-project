import ParallaxClass from '../../../animation/parallax/parallax';
import { handleFrame } from '../../../events/rafutils/handleFrame';
import { handleNextTick } from '../../../events/rafutils/handleNextTick';
import { handleResize } from '../../../events/resizeUtils/handleResize';
import {
    getTranslateValues,
    offset,
    outerHeight,
    outerWidth,
} from '../../../utils/vanillaFunction';
import { horizontalScrollerCss } from './horizontalScrollerCss.js';
import { mq } from '../../../utils/mediaManager.js';
import { handleFrameIndex } from '../../../events/rafutils/handleFrameIndex';
import { horizontalScrollerContstant } from './horizontalScrollerConstant';
import { pipe } from '../../../utils/functionsUtils';
import { handleScroll } from '../../../events/scrollUtils/handleScroll';

/**
 * @typedef {Object} horizontalScrollerType

 * @prop {boolean} [ ease = false ] 
    Defines whether the animation will have ease.
    The default value is `false`.
 * @prop {boolean} [ animateAtStart = false ] 
    The element will animate with easing (if used) on loading the page or animation.
    The default value is `false`.
 * @prop {('spring'|'lerp')} [ easeType = 'lerp'] 
    Defines the type of easing. The default is `lerp`.
 * @prop {boolean} [ useThrottle = false ] 
    Enable a Throttle function on the scroll.
    The option will not be enabled with the presence of an active pin to maintain accuracy.
    The default value is `false`.
 * @prop {boolean} [ forceTranspond = false ] 
    Property valid only with `useSticky = false`.
    The element will always be appended to the document body.
    The default value is false.
 * @prop {function():void} [ onEnterBack = null ] -
 * @prop {function():void} [ onLeave = null ] -
 * @prop {function():void} [ onLeaveBack = null ]-
 * @prop {function(Number):void} [ onTick = null ] 
    Function that is launched at each tick.
    The function will have the current value as input parameter.
 * @prop {Boolean} [ useWillChange ]
    Enable the css property will-change: transform; when the frame rate falls below 3/5 of the optimal value.
    The property remains active for 1000 frames.
    If after the previous value the fps value is back to normal the will-change property is disabled.
    `Use with CAUTION only if necessary.`
    The default value is `false`.
 * @prop {boolean} [ animatePin = false ] 
    Property valid only with `useSticky = false`.
    A spring animation will be applied to the pinned element on state change.

 * @prop {Object} [ useSticky ]
    Use native `postion: sticky` to pin the scroller or use scrolleTrigger pin.
    Default value is `false`.
 * @prop {Boolean} [ addCss ]
    Generate scoped css.
    Default value is `true`.
 * @prop {Number} [columnHeight]
    If the addCss property is active, it is possible to define a default height for the columns.
    The value must be a number between 0 and 100. 
    The unit of measure used in vh
    The default value is `100`.
 * @prop {Number} [columnWidth]
    If the addCss property is active, it is possible to define a default width for the columns.
    The value must be a number between 0 and 100. 
    The unit of measure used in `vh`
    The default value is null ( no value will be applied ).
* @prop {('start'|'center'|'end')} columnAlign
    If the addCss property is active, it is possible to define the vertical alignment of the columns.
    The default value is `start`.
* @prop {string} root 
    Root element.
    Accept only a unique class in the form of a string (dot included)
    It is necessary to provide a string in order to create the necessary css.
* @prop {string} container 
    Container element.
    Accept only a unique class in the form of a string (dot included)
    It is necessary to provide a string in order to create the necessary css.
* @prop {string} row 
    Row element.
    Accept only a unique class in the form of a string (dot included)
    It is necessary to provide a string in order to create the necessary css.
* @prop {string} column 
    Column element.
    Accept only a unique class in the form of a string (dot included)
    It is necessary to provide a string in order to create the necessary css.
* @prop {string} trigger 
    Trigger element.
    Accept only a unique class in the form of a string (dot included)
    It is necessary to provide a string in order to create the necessary css.
* @prop {string} shadowClass 
    The name of the class that will be used to create vertical shadow elements.
    In this case the dot is optional.
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

    The `scroller`,`direction`,`branckPoint`,`queryType` properties
    will be automatically aligned.
  */

/**
 * @typedef  { horizontalScrollerType & import('../../../utils/mediaManager.js').breackPointTypeObj & import('../../../utils/mediaManager.js').mqTypeObject } horizontalScrollerConstructorType
 */

export class HorizontalScroller {
    /**
     * @param  { horizontalScrollerConstructorType } data
    *
    * @description
    *
    * Create new HorizontalScroller instance.
    *
    * Special attributes to handle shadow elements:
    * Apply the following data-attributes to any element
    *
    * `data-shadow="<String>"` 
    * Create a vertical shadow element with a custom className.
    *
    * `data-debug` 
    * Makes the shadow element visible
    *
    * Available methods:
    * myHorizontalScroller.init();
    * myHorizontalScroller.refresh();
    * myHorizontalScroller.destroy();
    *
    * @example
    *
    * HTML:
       <div class="root">
           <div class="container">
               <div class="row">
                   <section class="column" data-shadow="section1">
                       <h1>title</h1>
                   </section>
                   <section class="column">
                       <h1 data-shadow="title" data-debug>title</h1>
                   </section>
                   ...
               </div>
               <div class="trigger"></div>
           </div>
       </div>

    * JS:
        const myHorizontalScroller = new HorizontalScroller({
            root: '.root',
            container: '.container',
            row: '.row',
            column: '.column',
            trigger: '.trigger',
            shadowClass: '.myShadowClass,
            useThrottle: [ Boolean ],
            useSticky: [ Boolean ],
            animatePin: [ Boolean ],
            forceTranspond: [ Boolean ],
            useWillChange: [ Boolean ],
            animateAtStart: [ Boolean ],
            queryType: [ String ],
            breackpoint: [ String ],
            ease: [ Boolean ],
            easeType: [ String ],
            addCss: [ Boolean ],
            columnHeight: [ Number ],
            columnWidth: [ Number ],
            columnAlign: [ String ],
            children: [child1,child2, ...],
            onEnter: () => {
                ...
            },
            onEnterBack: () => {
                ...
            },
            onLeave: () => {
                ...
            },
            onLeaveBack: () => {
                ...
            },
            afterInit: () => {
                ...
            },
            onTick: ({ value, parentIsMoving, percent }) => {
                ...
            },
            afterRefresh: () => {
                ...
            },
            afterDestroy: () => {
                ...
            },
        });
    *
     */
    constructor(data = {}) {
        /**
         * @private
         */
        this.NOOP = () => {};

        /**
         * @private
         */
        this.triggerTopPosition = 0;

        /**
         * @private
         */
        this.touchActive = false;

        /**
         * @private
         */
        this.lastTouchValueX = 0;

        /**
         * @private
         */
        this.dragSecureAreaBottom = 0;

        /**
         * @private
         */
        this.dragSecureAreaTop = 100;

        /**
         * @private
         */
        this.shouldDragValue = false;

        /**
         * @private
         */
        this.unsubscribeScroll = () => {};

        /**
         * @private
         */
        this.useWillChange = data?.useWillChange ?? false;

        /**
         * @private
         */
        this.breackpoint = data?.breackpoint || 'desktop';

        /**
         * @private
         */
        this.queryType = data?.queryType || 'min';

        /**
         * @private
         */
        this.forceTranspond = data?.forceTranspond || false;

        /**
         * @private
         */
        this.addCss = data.addCss || true;

        /**
         * @private
         */
        this.animateAtStart = data?.animateAtStart;

        /**
         * @private
         */
        this.ease = data?.ease;

        /**
         * @private
         */
        this.easeType = data?.easeType;

        /**
         * @private
         */
        this.useSticky = data?.useSticky ?? false;

        /**
         * @private
         */
        this.animatePin = data?.animatePin ?? false;

        /**
         * @private
         */
        this.reverse = data?.reverse;

        /**
         * @private
         */
        this.useThrottle = data?.useThrottle;

        /**
         * @private
         */
        this.columnHeight = data?.columnHeight || 100;

        /**
         * @private
         */
        this.columnWidth = data?.columnWidth || null;

        /**
         * @private
         */
        this.columnAlign = data?.columnAlign
            ? data.columnAlign.toUpperCase()
            : horizontalScrollerContstant.START;

        // Methods

        /**
         * @private
         */
        this.onEnter = data?.onEnter || this.NOOP;

        /**
         * @private
         */
        this.onEnterBack = data?.onEnterBack || this.NOOP;

        /**
         * @private
         */
        this.onLeave = data?.onLeave || this.NOOP;

        /**
         * @private
         */
        this.onLeaveBack = data?.onLeaveBack || this.NOOP;

        /**
         * @private
         */
        this.afterInit = data?.afterInit || this.NOOP;

        /**
         * @private
         */
        this.afterRefresh = data?.afterRefresh || this.NOOP;

        /**
         * @private
         */
        this.afterDestroy = data?.afterDestroy || this.NOOP;

        /**
         * @private
         */
        this.onTick = data?.onTick || this.NOOP;

        /**
         * Dom element
         */

        /**
         * @private
         */
        this.mainContainer = document.querySelector(data.root);
        if (!this.mainContainer) {
            console.warn('horizontal custom: root node not found');
            return;
        }

        /**
         * @private
         */
        this.container = data?.container;
        const scrollerTester = this.mainContainer.querySelector(this.container);
        if (!scrollerTester) {
            console.warn('horizontal custom: container node not found');
            return;
        }

        /**
         * @private
         */
        this.trigger = this.mainContainer.querySelector(data.trigger);
        if (!this.trigger) {
            console.warn('horizontal custom: trigger node not found');
            return;
        }

        /**
         * @private
         */
        this.row = this.mainContainer.querySelector(data.row);
        if (!this.row) {
            console.warn('horizontal custom: row node not found');
            return;
        }

        /**
         * @private
         */
        this.column = this.mainContainer.querySelectorAll(data.column);
        if (!this.column) {
            console.warn('horizontal custom: column nodeList not found');
            return;
        }

        /**
         * @private
         */
        this.shadow = this.mainContainer.querySelectorAll('[data-shadow]');
        const originalShadowClass = data?.shadowClass || 'shadow';

        /**
         * @private
         */
        this.shadowMainClassTransition = originalShadowClass.replace('.', '');

        /**
         * @private
         */
        this.moduleisActive = false;
        /**
         * @private
         */
        this.horizontalWidth = 0;

        /**
         * @private
         */
        this.scrollTriggerInstance = {};

        /**
         * @private
         */
        this.percentRange = 0;

        // Inizialize children.

        /**
         * @private
         */
        this.children = data?.children || [];
        this.children.forEach((element) => {
            element.setScroller(this.row);
            element.setDirection('horizontal');
            element.setBreakPoint(this.breackpoint);
            element.setQueryType(this.queryType);
            element.init();
        });

        if (this.addCss)
            horizontalScrollerCss({
                mainContainer: this.mainContainer,
                queryType: this.queryType,
                breackpoint: this.breackpoint,
                container: this.container,
                trigger: data?.trigger ?? 'trigger',
                row: data.row,
                column: data.column,
                shadow: this.shadowMainClassTransition,
                useSticky: this.useSticky,
                columnHeight: this.columnHeight,
                columnWidth: this.columnWidth,
                columnAlign: this.columnAlign,
            });
    }

    /**
     * @description
     * Inizialize insatance
     *
     * @example
     * myInstance.init()
     */
    init() {
        pipe(
            this.getWidth.bind(this),
            this.setDimension.bind(this),
            this.createShadow.bind(this),
            this.updateShadow.bind(this)
        )().then(() => {
            this.initScroller();
            this.addDragListener();

            handleResize(({ horizontalResize }) =>
                this.onResize(horizontalResize)
            );

            handleFrameIndex.add(() => {
                handleNextTick.add(() => {
                    this.afterInit?.();
                    this.children.forEach((element) => {
                        element.refresh();
                    });
                });
            }, 3);
        });
    }

    onMouseMove = (e) => {
        if (!this.touchActive) return;

        const { movementX } = e;
        const value = this.reverse ? movementX : -movementX;
        this.onDrag(value);
        this.touchStart = false;
    };

    onMouseDown = () => {
        if (!mq[this.queryType](this.breackpoint)) return;

        if (this.shouldDragValue) this.row.style.cursor = 'move';
        this.touchActive = true;
    };

    onMouseUp = () => {
        this.touchActive = false;
        handleFrame.add(() => (this.row.style.cursor = ''));
    };

    onMouseLeave = () => {
        this.touchActive = false;
        handleFrame.add(() => (this.row.style.cursor = ''));
    };

    onTouchStart = (e) => {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.lastTouchValueX = -e.touches[0].clientX;
        this.touchActive = true;
    };

    onTouchEnd = () => {
        this.touchActive = false;
    };

    onTouchMove = (e) => {
        const touchValueX = -e.touches[0].clientX;
        const gapX = this.reverse
            ? -touchValueX + this.lastTouchValueX
            : touchValueX - this.lastTouchValueX;

        this.onDrag(gapX);
        this.lastTouchValueX = touchValueX;

        if (this.shouldDragValue && e.cancelable) e.preventDefault();
    };

    onDrag(value) {
        if (!this.shouldDragValue) return;
        handleFrame.add(() =>
            window.scrollBy({ top: value, left: 0, behavior: 'instant' })
        );
    }

    shouldDrag() {
        const documentScrollTop = window.scrollY;

        this.shouldDragValue =
            this.triggerTopPosition - this.dragSecureAreaTop <
                documentScrollTop &&
            this.triggerTopPosition +
                this.dragSecureAreaBottom +
                this.horizontalWidth >
                documentScrollTop + window.innerHeight;
    }

    addDragListener() {
        this.unsubscribeScroll = handleScroll(() => this.shouldDrag());
        this.shouldDrag();

        this.row.addEventListener('mousedown', this.onMouseDown, {
            passive: true,
        });

        this.row.addEventListener('mouseup', this.onMouseUp, {
            passive: true,
        });

        this.row.addEventListener('mouseleave', this.onMouseLeave, {
            passive: true,
        });

        this.row.addEventListener('touchstart', this.onTouchStart, {
            passive: true,
        });

        this.row.addEventListener('touchend', this.onTouchEnd, {
            passive: true,
        });

        this.row.addEventListener('mousemove', this.onMouseMove, {
            passive: true,
        });

        this.row.addEventListener('touchmove', this.onTouchMove);
    }

    removeDragListener() {
        this.unsubscribeScroll();
        this.row.removeEventListener('mousedown', this.onMouseDown);
        this.row.removeEventListener('mouseup', this.onMouseUp);
        this.row.removeEventListener('mouseleave', this.onMouseLeave);
        this.row.removeEventListener('touchstart', this.onTouchStart);
        this.row.removeEventListener('touchend', this.onTouchEnd);
        this.row.removeEventListener('mousemove', this.onMouseMove);
        this.row.removeEventListener('touchmove', this.onTouchMove);
    }

    /**
     * @private
     */
    setDimension() {
        if (!this.trigger || !this.mainContainer || !this.row) {
            return new Promise((resolve) => {
                resolve();
            });
        }

        return new Promise((resolve) => {
            handleFrame.add(() => {
                const width = this.horizontalWidth;
                this.percentRange = (100 * (width - window.innerWidth)) / width;

                if (width > 0) {
                    this.trigger.style.height = `${width}px`;
                    this.mainContainer.style.height = `${width}px`;
                    this.row.style.width = `${width}px`;
                }

                resolve();
            });
        });
    }

    /**
     * @private
     */
    getWidth() {
        return new Promise((resolve) => {
            handleFrame.add(() => {
                if (!mq[this.queryType](this.breackpoint)) {
                    resolve();
                    return;
                }

                this.horizontalWidth = [...this.column]
                    .map((item) => {
                        return outerWidth(item);
                    })
                    .reduce((a, b) => a + b, 0);

                resolve();
            });
        });
    }

    /**
     * @private
     */
    createShadow() {
        if (!this.trigger) {
            return new Promise((resolve) => {
                resolve();
            });
        }

        return new Promise((resolve) => {
            handleFrame.add(() => {
                if (!mq[this.queryType](this.breackpoint)) {
                    resolve();
                    return;
                }

                const shadowsTransition = [...this.shadow]
                    .map((item) => {
                        const shadowClass = item.dataset.shadow;
                        const debug = item.dataset.debug ? 'debug' : '';
                        const left = item.dataset.debug
                            ? `left left : ${shadowClass}`
                            : '';
                        const inCenter = item.dataset.debug
                            ? `in center : ${shadowClass}`
                            : '';
                        const outCenter = item.dataset.debug
                            ? `center out : ${shadowClass}`
                            : '';
                        const end = item.dataset.debug
                            ? `in out : ${shadowClass}`
                            : '';

                        return `
                            <div class='${this.shadowMainClassTransition} ${this.shadowMainClassTransition}--${shadowClass}' data-shadow='${shadowClass}'>
                                <span class="${this.shadowMainClassTransition}--in-center ${debug}">
                                    ${inCenter}
                                </span>
                                <span class="${this.shadowMainClassTransition}--out-center ${debug}">
                                    ${outCenter}
                                </span>
                                <span class="${this.shadowMainClassTransition}--left ${debug}">
                                    ${left}
                                </span>
                                <span class="${this.shadowMainClassTransition}--end ${debug}">
                                    ${end}
                                </span>
                            </div>`;
                    })
                    .join('');

                this.trigger.innerHTML = shadowsTransition;
                resolve();
            });
        });
    }

    /**
     * @private
     */
    removeShadow() {
        if (this.trigger) this.trigger.innerHTML = '';
    }

    /**
     * @private
     */
    updateShadow() {
        return new Promise((resolve) => {
            if (!mq[this.queryType](this.breackpoint)) {
                resolve();
                return;
            }

            handleFrame.add(() => {
                [...this.shadow].forEach((item) => {
                    const percentrange = this.percentRange / 100;
                    const shadowData = item.dataset.shadow;
                    const width = outerWidth(item);
                    const height = outerHeight(this.row);
                    const { x } = getTranslateValues(this.row);
                    const offset = this.reverse
                        ? this.horizontalWidth -
                          (item.getBoundingClientRect().right - x)
                        : item.getBoundingClientRect().left - x;
                    const screenRatio = window.innerWidth / window.innerHeight;
                    const windowDifference =
                        window.innerWidth - window.innerHeight;
                    const widthAmount = offset / screenRatio;
                    const diffAmount = offset - offset / screenRatio;
                    const shadowTransitionEl = this.mainContainer.querySelector(
                        `.${this.shadowMainClassTransition}[data-shadow="${shadowData}"]`
                    );

                    const inCenterMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--in-center`
                    );
                    const outCenterMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--out-center`
                    );
                    const leftMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--left`
                    );
                    const endMarker = shadowTransitionEl.querySelector(
                        `.${this.shadowMainClassTransition}--end`
                    );

                    // Strengh shadow end item to bottom of page
                    const plusFull =
                        window.innerWidth > window.innerHeight
                            ? window.innerHeight
                            : 0;

                    // Strengh center in out item to bottom of page
                    const plusHalf =
                        window.innerWidth > window.innerHeight
                            ? window.innerHeight / 2
                            : 0;

                    const start = (() => {
                        switch (offset) {
                            case 0:
                                return 0;

                            default:
                                return (
                                    widthAmount +
                                    diffAmount / percentrange -
                                    windowDifference / percentrange
                                );
                        }
                    })();

                    const left = (() => {
                        const val =
                            window.innerWidth > window.innerHeight
                                ? windowDifference / percentrange
                                : windowDifference / percentrange +
                                  window.innerWidth / screenRatio;

                        switch (offset) {
                            case 0:
                                return 0;

                            default:
                                return val;
                        }
                    })();

                    const end = (() => {
                        const val1 = width / screenRatio;
                        const val2 =
                            (width - width / screenRatio) / percentrange;
                        return val1 + val2 + left;
                    })();

                    const inCenter = (() => {
                        return end / 2 + plusHalf;
                    })();

                    if (this.useSticky) {
                        this.trigger.style['margin-top'] = `-${height}px`;
                    }

                    shadowTransitionEl.style.top = `${start}px`;
                    inCenterMarker.style.height = `${inCenter}px`;
                    outCenterMarker.style.height = `${inCenter}px`;
                    outCenterMarker.style.top = `${inCenter}px`;
                    leftMarker.style.height = `${left}px`;
                    endMarker.style.height = `${end + plusFull}px`;
                    shadowTransitionEl.style.height = `${left}px`;
                });

                resolve();
            });
        });
    }

    /**
     * @private
     */
    initScroller() {
        if (!this.trigger || !mq[this.queryType](this.breackpoint)) return;

        const scrollTriggerInstance = new ParallaxClass({
            type: 'scrolltrigger',
            item: this.row,
            useWillChange: this.useWillChange,
            trigger: this.trigger,
            propierties: 'x',
            breackpoint: 'xSmall',
            pin: !this.useSticky,
            animatePin: this.animatePin,
            ease: this.ease,
            forceTranspond: this.forceTranspond,
            useThrottle: this.useThrottle,
            easeType: this.easeType,
            springConfig: 'scroller',
            animateAtStart: this.animateAtStart,
            fromTo: this.reverse,
            dynamicRange: () => {
                return -(this.horizontalWidth - window.innerWidth);
            },
            dynamicStart: {
                position: 'bottom',
                value: () => {
                    return window.innerHeight;
                },
            },
            dynamicEnd: {
                position: 'bottom',
                value: () => {
                    return this.horizontalWidth;
                },
            },
            onTick: ({ value, parentIsMoving }) => {
                const percent = Math.abs(
                    -parseInt(
                        (value * 100) /
                            (this.horizontalWidth - window.innerWidth)
                    )
                );

                // onTick standalone methods.
                this.onTick({
                    value,
                    parentIsMoving,
                    percent: this.reverse ? 100 - percent : percent,
                });

                // Builtin children onTick;
                this.children.forEach((element) => {
                    element.move({ value, parentIsMoving });
                });
            },
            onEnter: this.onEnter,
            onEnterBack: this.onEnterBack,
            onLeave: this.onLeave,
            onLeaveBack: this.onLeaveBack,
        });
        scrollTriggerInstance.init();

        this.moduleisActive = true;
        this.scrollTriggerInstance = scrollTriggerInstance;
        this.triggerTopPosition = offset(this.trigger).top;
    }

    /**
     * @private
     */
    createScroller() {
        pipe(
            this.getWidth.bind(this),
            this.setDimension.bind(this),
            this.createShadow.bind(this),
            this.updateShadow.bind(this)
        )().then(() => {
            this.initScroller();
            this.refreshChildren();
        });
    }

    /**
     * @private
     */
    refreshChildren() {
        handleFrameIndex.add(() => {
            handleNextTick.add(() => {
                this.afterRefresh?.();
                this.children.forEach((element) => {
                    element?.refresh?.();
                });
            });
        }, 3);
    }

    /**
     * @description
     * Refresh instance
     *
     * @example
     * myInstance.refresh()
     */
    refresh() {
        if (!this.moduleisActive || !mq[this.queryType](this.breackpoint))
            return;

        pipe(
            this.getWidth.bind(this),
            this.setDimension.bind(this),
            this.updateShadow.bind(this)
        )().then(() => {
            this.scrollTriggerInstance?.stopMotion?.();
            this.triggerTopPosition = offset(this.trigger).top;

            if (this.moduleisActive) {
                this.scrollTriggerInstance?.refresh?.();
                this.refreshChildren();
            }
        });
    }

    /**
     * @private
     */
    killScroller({ destroyAll = false }) {
        if (this.moduleisActive || destroyAll) {
            this.scrollTriggerInstance?.destroy?.();
            this.scrollTriggerInstance = null;
            if (this.trigger) this.trigger.style.height = '';
            if (this.mainContainer) this.mainContainer.style.height = '';
            if (this.trigger) this.trigger.style.marginTop = '';
            this.removeShadow();
            this.moduleisActive = false;

            // Make sure that if component is running with ease the style is removed.
            handleFrameIndex.add(() => {
                this.row.style = '';

                if (destroyAll && this.mainContainer) {
                    this.removeDragListener();
                    const styleDiv =
                        this.mainContainer.querySelector('.scroller-style');
                    if (styleDiv) styleDiv.remove();

                    this.mainContainer = null;
                    this.trigger = null;
                    this.row = [];
                    this.column = [];
                    this.shadow = [];
                    this.afterInit = null;
                    this.afterRefresh = null;
                    this.onTick = null;
                    this.onEnter = null;
                    this.onEnterBack = null;
                    this.onLeave = null;
                    this.onLeaveBack = null;
                    this.scrollTriggerInstance = null;
                    this.moduleisActive = false;

                    handleNextTick.add(() => {
                        this.afterDestroy?.();
                        this.afterDestroy = null;
                        this.children.forEach((element) => {
                            element?.destroy?.();
                            element = null;
                        });
                        this.children = [];
                    });
                }
            }, 3);
        }
    }

    /**
     * @private
     */
    onResize(horizontalResize) {
        if (this.moduleisActive && mq[this.queryType](this.breackpoint)) {
            if (horizontalResize) this.refresh();
        } else if (
            !this.moduleisActive &&
            mq[this.queryType](this.breackpoint)
        ) {
            this.createScroller();
        } else if (
            this.moduleisActive &&
            !mq[this.queryType](this.breackpoint)
        ) {
            this.killScroller({ destroyAll: false });
        }
    }

    /**
     * @description
     * Destroy instance
     *
     * @example
     * myInstance.destroy()
     */
    destroy() {
        this.killScroller({ destroyAll: true });
    }
}
