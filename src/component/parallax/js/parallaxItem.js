import { mq } from '../../../js/core/utils/mediaManager.js';
import { offset, position } from '../../../js/core/utils/vanillaFunction.js';
import { parallaxUtils } from './parallaxUtils.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxMarker } from './parallaxMarker.js';
import { parallaxEmitter } from './parallaxEmitter.js';
import { ParallaxPin } from './parallaxPin.js';
import {
    handleFrame,
    handleNextTick,
} from '../../../js/core/events/rafutils/rafUtils.js';
import { handleResize } from '../../../js/core/events/resizeUtils/handleResize.js';
import { handleScroll } from '../../../js/core/events/scrollUtils/handleScroll.js';
import { handleScrollImmediate } from '../../../js/core/events/scrollUtils/handleScrollImmediate.js';
import { handleScrollStart } from '../../../js/core/events/scrollUtils/handleScrollUtils.js';
import { handleSpring } from '../../../js/core/animation/spring/handleSpring.js';
import { handleLerp } from '../../../js/core/animation/lerp/handleLerp.js';
import { springConfig } from '../../../js/core/animation/spring/springConfig.js';
import { getTranslateValues } from '../../../js/core/utils/vanillaFunction.js';

export class ParallaxItemClass {
    constructor(data) {
        this.offset = 0;
        this.screenPosition = 0;
        this.endValue = 0;
        this.height = 0;
        this.width = 0;
        this.scrollerScroll = 0;
        this.scrollerHeight = 0;
        this.windowInnerWidth = window.innerWidth;
        this.windowInnerHeight = window.innerHeight;
        this.gap = 150;
        this.numericRange = 0;
        this.unsubscribeResize = () => {};
        this.unsubscribeScroll = () => {};
        this.unsubscribeScrollStart = () => {};
        this.unsubscribeMarker = () => {};
        this.startMarker = null;
        this.endMarker = null;
        this.lastValue = null;
        this.prevFixedRawValue = 0;
        this.fixedShouldRender = null;
        this.prevFixedClamp = null;
        this.firstTime = true;
        this.isInViewport = false;
        this.force3D = false;

        // Base props
        this.item = data.item;
        this.direction = (() => {
            return data.direction
                ? data.direction
                : parallaxConstant.DIRECTION_VERTICAL;
        })();
        this.scroller = data.scroller
            ? (() => {
                  return typeof data.scroller === 'string'
                      ? document.querySelector(data.scroller)
                      : data.scroller;
              })()
            : window;
        this.screen = data.screen
            ? document.querySelector(data.screen)
            : window;

        this.pin = data.pin || false;
        this.animatePin = data.animatePin || false;
        this.pinInstance = null;
        this.forceTranspond = data.forceTranspond || false;

        //Fixed prop
        this.fromTo = data.fromTo || false;
        this.start = data.start || '0px';
        this.dynamicStart = data.dynamicStart || null;
        this.end = data.end || null;
        this.dynamicEnd = data.dynamicEnd || null;
        this.invertSide = data.invertSide || false;
        this.marker = data.marker || null;
        this.tween = data.tween || null;

        //Lienar prop
        this.align = data.align ? data.align : parallaxConstant.ALIGN_CENTER;
        this.onSwitch = data.onSwitch ? data.onSwitch : false;

        // Opacity Prop
        this.opacityStart = data.opacityStart || 100;
        this.opacityEnd = data.opacityEnd || 0;

        // Common prop
        this.computationType = data.computationType
            ? data.computationType
            : parallaxConstant.TYPE_DEFAULT;

        // Base range
        this.range =
            data.range ||
            (() =>
                this.computationType === parallaxConstant.TYPE_DEFAULT
                    ? 2
                    : 0)();
        // Function that return a range value
        this.dynamicRange = data.dynamicRange || null;
        this.perspective = data.perspective || false;
        this.applyTo = data.applyTo || false;
        this.trigger = (() => {
            if (data.trigger) {
                return typeof data.trigger === 'string'
                    ? document.querySelector(data.trigger)
                    : data.trigger;
            } else {
                return null;
            }
        })();
        this.breackpoint = data.breackpoint || 'desktop';
        this.queryType = data.queryType || 'min';
        this.limiterOff = data.limiterOff || false;
        this.reverse = data.reverse || false;
        this.ease = data.ease || false;
        this.propierties = data.propierties
            ? data.propierties
            : parallaxConstant.PROP_VERTICAL;

        this.easeType = data.easeType
            ? data.easeType
            : parallaxConstant.EASE_SPRING;

        // Add more precision to motion spring/lerp to trigger better force3D
        this.motionParameters =
            data.easeType === parallaxConstant.EASE_SPRING
                ? { config: { precision: parallaxConstant.EASE_PRECISION } }
                : { precision: parallaxConstant.EASE_PRECISION };

        //
        this.springConfig = data.springConfig || null;
        this.lerpConfig = data.lerpConfig || null;
        this.motion = (() => {
            if (
                this.tween &&
                this.tween.getType() === parallaxConstant.TWEEN_TIMELINE
            ) {
                this.easeType = parallaxConstant.EASE_LERP;
                // Force lerp motion parameters if tween is a sequencer
                this.motionParameters = {
                    precision: parallaxConstant.EASE_PRECISION,
                };
            }

            return this.easeType === parallaxConstant.EASE_LERP
                ? new handleLerp()
                : new handleSpring();
        })();
        this.unsubscribeMotion = () => {};
        this.unsubscribeOnComplete = () => {};
        this.animateAtStart = data.animateAtStart || false;

        //
        this.unitMisure = '';
        this.startPoint = 0;
        this.endPoint = 0;

        // Event
        this.onEnter = data.onEnter || null;
        this.onEnterBack = data.onEnterBack || null;
        this.onLeave = data.onLeave || null;
        this.onLeaveBack = data.onLeaveBack || null;
        this.onTickCallback = data.onTick || null;
    }

    init() {
        this.setMotion();
        this.calcScreenPosition();
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();
        this.setPerspective();

        if (this.computationType == parallaxConstant.TYPE_FIXED) {
            this.limiterOff = true;
            if (this.propierties === parallaxConstant.PROP_TWEEN) {
                this.range = this.tween.getDuration();
            }
            this.calcRangeAndUnitMiusure();
            this.calcFixedLimit();
        }

        // If use pin we have to get fresh value on scroll
        // Otherwise we can optimize and fire scoll callback after requerst animationFrame
        const getScrollfucuntion = (cb) => {
            if (this.pin) {
                this.unsubscribeScroll = handleScrollImmediate(cb);
                return handleScrollImmediate;
            } else {
                this.unsubscribeScroll = handleScroll(cb);
                return handleScroll;
            }
        };

        if (this.ease) {
            // Force transform3D onscroll start
            this.unsubscribeScrollStart = handleScrollStart(() => {
                this.force3D = true;
            });

            if (this.scroller === window) {
                getScrollfucuntion(() => {
                    this.smoothParallaxJs();
                });
            }

            this.smoothParallaxJs();
        } else {
            if (this.scroller === window) {
                getScrollfucuntion(() => {
                    this.computeValue();
                    this.noEasingRender();
                });
            }
            this.computeValue();
            this.noEasingRender();
        }

        if (this.scroller !== window) {
            this.unsubscribeMarker = handleScroll(() => {
                // Refresh marker
                if (this.marker) this.calcFixedLimit();
            });
        }

        this.unsubscribeResize = handleResize(({ horizontalResize }) => {
            if (horizontalResize) this.refresh();
        });

        if (this.pin) {
            this.pinInstance = new ParallaxPin({ instance: this });

            if (mq[this.queryType](this.breackpoint)) {
                handleNextTick.add(() => {
                    this.getScrollerOffset();
                    this.pinInstance.init();
                    this.pinInstance.onScroll(this.scrollerScroll);
                });
            }
        }
    }

    setPerspective() {
        if (this.perspective) {
            const style = {
                perspective: `${this.perspective}px`,
                'transform-style': 'preserve-3d',
            };
            const parent = this.item.parentNode;
            Object.assign(parent.style, style);
        }
    }

    setMotion() {
        const initialValue =
            parallaxConstant.PROP_SCALE || parallaxConstant.PROP_OPACITY
                ? 1
                : 0;

        this.motion.setData({ val: initialValue });
        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            if (val === this.lastValue) return;

            if (this.propierties === parallaxConstant.PROP_TWEEN) {
                this.tween.draw({
                    partial: val,
                    isLastDraw: false,
                    useFrame: false,
                });
                this.lastValue = val;
                this.firstTime = false;
            } else {
                this.updateStyle(val);
            }

            handleNextTick.add(() => {
                if (this.onTickCallback) this.onTickCallback(val);
            });
        });

        this.unsubscribeOnComplete = this.motion.onComplete(({ val }) => {
            this.force3D = false;

            if (this.propierties === parallaxConstant.PROP_TWEEN) {
                this.tween.draw({
                    partial: val,
                    isLastDraw: true,
                    useFrame: false,
                });
            } else {
                this.updateStyle(val);
            }
        });

        switch (this.easeType) {
            case parallaxConstant.EASE_LERP:
                if (
                    this.lerpConfig &&
                    !Number.isNaN(parseFloat(this.lerpConfig))
                ) {
                    this.motion.updateVelocity(this.lerpConfig);
                }
                break;
            case parallaxConstant.EASE_SPRING:
            default:
                if (this.springConfig && this.springConfig in springConfig) {
                    const config = springConfig[this.springConfig];
                    this.motion.updateConfig(config);
                }
                break;
        }
    }

    calcRangeAndUnitMiusure() {
        if (this.dynamicRange) {
            const range = this.dynamicRange();
            this.numericRange = Number.isNaN(range) ? 0 : parseFloat(range);
            this.unitMisure = parallaxConstant.PX;
        } else {
            const str = String(this.range);
            const firstChar = str.charAt(0);
            const isNegative = firstChar === '-' ? -1 : 1;
            this.numericRange =
                parseFloat(str.replace(/^\D+/g, '')) * isNegative;
            this.unitMisure = parallaxUtils.getRangeUnitMisure(str);
        }
    }

    calcFixedLimit() {
        const screenUnit = this.scrollerHeight / 100;

        // Check if there is a function that return a start value dinamically
        if (
            this.dynamicStart &&
            this.dynamicStart?.position &&
            this.dynamicStart?.value
        ) {
            const { position, value: fn } = this.dynamicStart;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.start = `${position} ${valueResult}px`;
            }
        }

        // Get postion ( es: 'bottom'),
        // Get processed value ( based on px || vh || vw)
        // Get addtional val ( +height -halfHeight etc ..)
        const {
            value: startPoint,
            additionalVal: additionalStartVal,
            position: startPosition,
        } = parallaxUtils.getStartPoint(screenUnit, this.start, this.direction);

        // Chek if come from top or left
        this.invertSide =
            startPosition === parallaxConstant.POSITION_TOP ||
            startPosition === parallaxConstant.POSITION_LEFT;

        // Add/substract with height or half value
        this.startPoint = parallaxUtils.processFixedLimit(
            startPoint,
            additionalStartVal,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.height
                : this.width,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.width
                : this.height
        );

        // Check if there is a function that return a end value dinamically
        if (
            this.dynamicEnd &&
            this.dynamicEnd?.position &&
            this.dynamicEnd?.value
        ) {
            const { position, value: fn } = this.dynamicEnd;
            const valueResult = fn();
            if (!Number.isNaN(valueResult)) {
                this.end = `${position} ${valueResult}px`;
            }
        }

        // Get postion ( es: 'bottom'),
        // Get processed value ( based on px || vh || vw)
        // Get addtional val ( +height -halfHeight etc ..)
        const {
            value: endPoint,
            additionalVal: additionalEndVal,
            position: endPosition,
        } = parallaxUtils.getEndPoint(
            screenUnit,
            this.end,
            this.startPoint,
            this.scrollerHeight,
            this.invertSide,
            this.direction
        );

        // Get positive or negative multiplier to add or substract value basedto the position
        const multiplier = (() => {
            if (!this.invertSide) {
                return endPosition === parallaxConstant.POSITION_BOTTOM ||
                    endPosition === parallaxConstant.POSITION_RIGHT
                    ? 1
                    : -1;
            } else {
                return endPosition === parallaxConstant.POSITION_BOTTOM ||
                    endPosition === parallaxConstant.POSITION_RIGHT
                    ? -1
                    : 1;
            }
        })();

        // Add/substract with height or half value
        this.endPoint = parallaxUtils.processFixedLimit(
            endPoint,
            additionalEndVal,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.height * multiplier
                : this.width * multiplier,
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? this.width * multiplier
                : this.height * multiplier
        );

        this.setMarker();

        // From left to right or top to bottom
        // the botom or right side of item sollide with start point
        if (this.invertSide) this.startPoint -= this.height;
    }

    setMarker() {
        if (this.marker) {
            // Add Marker
            const { startMarker, endMarker } = parallaxMarker({
                startMarker: this.startMarker,
                endMarker: this.endMarker,
                startPoint: this.startPoint,
                endPoint: this.endPoint,
                screen: this.screen,
                direction: this.direction,
                invertSide: this.invertSide,
                label: this.marker,
            });

            this.startMarker = startMarker;
            this.endMarker = endMarker;
        }
    }

    calcOffset() {
        const el = this.trigger === null ? this.item : this.trigger;

        let x = 0;
        let y = 0;
        let z = 0;

        if (this.trigger) {
            x = getTranslateValues(this.trigger).x;
            y = getTranslateValues(this.trigger).y;
            z = getTranslateValues(this.trigger).z;
        }

        // Reset transofrm for get right offset value if transform is applyed itself
        el.style.transform = '';

        if (this.direction === parallaxConstant.DIRECTION_VERTICAL) {
            this.offset =
                this.scroller !== window
                    ? parseInt(offset(el).top) - offset(this.scroller).top
                    : parseInt(offset(el).top);
        } else {
            this.offset =
                this.scroller !== window
                    ? parseInt(offset(el).left) - offset(this.scroller).left
                    : parseInt(offset(el).left);
        }

        if (this.screen !== window) {
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? (this.offset -= parseInt(offset(this.screen).top))
                : (this.offset -= parseInt(position(this.screen).left));
        }

        if (this.trigger && (x !== 0 || y !== 0 || z !== 0)) {
            console.log('apply');
            this.trigger.style.tranform = `translate3D(${x}px, ${y}px, ${z}px)`;
        }
    }

    calcScreenPosition() {
        if (this.screen === window) return;

        this.screenPosition =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(offset(this.screen).top)
                : parseInt(position(this.screen).left);
    }

    calcHeight() {
        const el = this.trigger === null ? this.item : this.trigger;
        this.height =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(el.offsetHeight)
                : parseInt(el.offsetWidth);
    }

    calcWidth() {
        const el = this.trigger === null ? this.item : this.trigger;
        this.width =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(el.offsetWidth)
                : parseInt(el.offsetHeight);
    }

    getScrollerOffset() {
        if (this.scroller === window) {
            this.scrollerScroll =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? this.scroller.pageYOffset
                    : this.scroller.pageXOffset;
        } else {
            this.scrollerScroll =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? -offset(this.scroller).top
                    : -offset(this.scroller).left;
        }
    }

    getScreenHeight() {
        this.windowInnerWidth = window.innerWidth;
        this.windowInnerHeight = window.innerHeight;

        if (this.screen === window) {
            this.scrollerHeight =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? window.innerHeight
                    : window.innerWidth;
        } else {
            this.scrollerHeight =
                this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? parseInt(this.screen.offsetHeight)
                    : parseInt(this.screen.offsetWidth);
        }
    }

    unsubscribe() {
        this.unsubscribeScroll();
        this.unsubscribeScrollStart();
        this.unsubscribeResize();
        this.unsubscribeMotion();
        this.unsubscribeOnComplete();
        this.unsubscribeMarker();
        this.dynamicRange = null;
        this.onEnter = () => {};
        this.onEnterBack = () => {};
        this.onLeave = () => {};
        this.onLeaveBack = () => {};
        this.onTickCallback = () => {};
        if (this.pin && this.pinInstance) this.pinInstance.destroy();
        if (this.startMarker) this.startMarker.remove();
        if (this.endMarker) this.endMarker.remove();
        this.startMarker = null;
        this.endMarker = null;
        this.pinInstance = null;
        this.endValue = 0;
    }

    refresh() {
        if (this.pin && this.pinInstance) this.pinInstance.reset();

        this.calcScreenPosition();
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();

        if (this.computationType == parallaxConstant.TYPE_FIXED) {
            this.calcFixedLimit();
            if (this.dynamicRange) this.calcRangeAndUnitMiusure();

            if (this.pin && this.pinInstance) {
                if (!mq[this.queryType](this.breackpoint)) {
                    this.pinInstance.destroy();
                } else {
                    if (this.pinInstance.isInizialized) {
                        this.pinInstance.refresh();
                    } else {
                        this.pinInstance.init();
                    }
                }
            }
        }

        // reset value to update animation after resize
        this.lastValue = null;
        this.firstTime = true;

        if (!mq[this.queryType](this.breackpoint)) {
            if (this.ease) this.motion.stop();

            // Reset Style
            // For tween is necessary reset inside tween callback
            handleFrame.add(() => {
                if (this.applyTo) {
                    Object.assign(this.applyTo.style, this.getResetStyle());
                } else {
                    Object.assign(this.item.style, this.getResetStyle());
                }
            });
        } else {
            this.move();
        }
    }

    move(scrollVal = null) {
        if (!mq[this.queryType](this.breackpoint)) return;

        // Bypass translate3D() if there is no easing
        if (!this.ease) this.force3D = false;

        scrollVal =
            scrollVal !== null && this.screen !== window
                ? scrollVal + this.screenPosition
                : null;

        if (this.ease) {
            this.smoothParallaxJs(scrollVal);
        } else {
            this.computeValue(scrollVal);
            this.noEasingRender();
        }
    }

    smoothParallaxJs(scrollVal = null) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.computeValue(scrollVal);

        // Skip motion fixed type
        if (
            !this.fixedShouldRender &&
            !this.firstTime &&
            this.computationType === parallaxConstant.TYPE_FIXED
        )
            return;

        // Skip motion deafault type
        if (
            !this.isInViewport &&
            !this.firstTime &&
            !this.computationType !== parallaxConstant.TYPE_FIXED
        )
            return;

        // First time render with no easing
        const action = this.firstTime & !this.animateAtStart ? 'set' : 'goTo';

        this.motion[action](
            { val: this.endValue },
            this.motionParameters
        ).catch((err) => {});
    }

    computeValue(scrollVal = null) {
        if (!mq[this.queryType](this.breackpoint)) return;

        if (scrollVal === null) {
            this.getScrollerOffset();
        } else {
            this.scrollerScroll = -scrollVal;
        }

        this.isInViewport = parallaxUtils.isInViewport({
            offset: this.offset,
            height: this.height,
            gap: this.gap,
            wScrollTop: this.scrollerScroll,
            wHeight: this.scrollerHeight,
        });

        // Skip motion deafult with limiterOff not active
        if (
            !this.isInViewport &&
            !this.limiterOff &&
            !this.computationType !== parallaxConstant.TYPE_FIXED
        )
            return;

        if (this.pin && this.pinInstance) {
            this.pinInstance.onScroll(this.scrollerScroll);
        }

        switch (this.computationType) {
            case parallaxConstant.TYPE_FIXED:
                const val = this.getFixedValue();
                this.endValue = parseFloat(val).toFixed(4);
                break;

            default:
                switch (this.propierties) {
                    case parallaxConstant.PROP_OPACITY:
                        this.endValue = this.getOpacityValue().toFixed(2);
                        break;

                    default:
                        if (Number.isNaN(parseInt(this.align))) {
                            this.endValue = this.getIsNaNValue() / 2;
                        } else {
                            this.endValue = this.getIsANumberValue() / 2;
                        }
                        break;
                }
        }
    }

    noEasingRender() {
        if (!mq[this.queryType](this.breackpoint)) return;

        handleFrame.add(() => {
            this.cleanRender();
        });
    }

    cleanRender() {
        if (this.endValue === this.lastValue) return;

        if (this.propierties === parallaxConstant.PROP_TWEEN) {
            this.tween.draw({
                partial: this.endValue,
                isLastDraw: true,
                useFrame: false,
            });
            this.lastValue = this.endValue;
            this.firstTime = false;
        } else {
            this.updateStyle(this.endValue);
        }

        handleNextTick.add(() => {
            if (this.onTickCallback) this.onTickCallback(this.endValue);
        });
    }

    updateStyle(val) {
        if (this.applyTo) {
            Object.assign(this.applyTo.style, this.getStyle(val));
        } else {
            Object.assign(this.item.style, this.getStyle(val));
        }

        this.lastValue = val;
        this.firstTime = false;
    }

    getFixedValue() {
        let o = {};

        o.partials = !this.invertSide
            ? -(
                  this.scrollerScroll +
                  this.scrollerHeight -
                  this.startPoint -
                  (this.offset + this.endPoint)
              )
            : -(
                  this.scrollerScroll +
                  this.startPoint +
                  this.endPoint -
                  (this.offset + this.endPoint)
              );

        o.maxVal = (this.endPoint / 100) * this.numericRange;
        o.partialVal = (o.partials / 100) * this.numericRange;

        o.valPerDirection = (() => {
            if (this.fromTo) {
                return !this.invertSide
                    ? o.partialVal
                    : o.maxVal - o.partialVal;
            } else {
                return !this.invertSide
                    ? o.maxVal - o.partialVal
                    : o.partialVal;
            }
        })();

        o.clamp =
            o.maxVal > 0
                ? -parallaxUtils.clamp(o.valPerDirection, 0, o.maxVal)
                : -parallaxUtils.clamp(o.valPerDirection, o.maxVal, 0);

        this.fixedShouldRender = this.prevFixedClamp === o.clamp ? false : true;
        this.prevFixedClamp = o.clamp;
        if (!this.fixedShouldRender && !this.firstTime) return this.endValue;

        o.percent = (o.clamp * 100) / this.endPoint;

        // Fire callback if there is
        if (
            this.onEnter ||
            this.onEnterBack ||
            this.onLeave ||
            this.onLeaveBack
        ) {
            parallaxEmitter({
                prevValue: this.prevFixedRawValue,
                value: o.valPerDirection,
                maxVal: o.maxVal,
                onEnter: this.onEnter,
                onEnterBack: this.onEnterBack,
                onLeave: this.onLeave,
                onLeaveBack: this.onLeaveBack,
            });
        }

        this.prevFixedRawValue = o.valPerDirection;

        switch (this.propierties) {
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_VERTICAL:
                const value = (() => {
                    switch (this.unitMisure) {
                        case parallaxConstant.VW:
                            return (this.windowInnerWidth / 100) * -o.percent;

                        case parallaxConstant.VH:
                            return (this.windowInnerHeight / 100) * -o.percent;

                        case parallaxConstant.WPERCENT:
                            return this.direction ===
                                parallaxConstant.DIRECTION_VERTICAL
                                ? (this.width / 100) * -o.percent
                                : (this.height / 100) * -o.percent;

                        case parallaxConstant.HPERCENT:
                            return this.direction ===
                                parallaxConstant.DIRECTION_VERTICAL
                                ? (this.height / 100) * -o.percent
                                : (this.width / 100) * -o.percent;

                        case parallaxConstant.PX:
                        case parallaxConstant.DEGREE:
                        case parallaxConstant.PROP_TWEEN:
                        default:
                            return -o.percent;
                    }
                })();
                // Remove reference to Object
                o = null;
                //
                return value;

            case parallaxConstant.PROP_SCALE:
            case parallaxConstant.PROP_OPACITY:
                const valueScaleOpacity = 1 - o.percent;
                // Remove reference to Object
                o = null;
                //
                return valueScaleOpacity;

            default:
                const valueDefault = -o.percent;
                // Remove reference to Object
                o = null;
                //
                return valueDefault;
        }
    }

    getOpacityValue() {
        let o = {};

        o.vhLimit = (this.scrollerHeight / 100) * this.opacityEnd;
        o.vhStart =
            this.scrollerHeight -
            (this.scrollerHeight / 100) * this.opacityStart;

        o.val =
            this.align == parallaxConstant.ALIGN_START
                ? -this.scrollerScroll * -1
                : (this.scrollerScroll + o.vhLimit - this.offset) * -1;

        o.valClamped =
            this.align == parallaxConstant.ALIGN_START
                ? 1 - o.val / this.offset
                : 1 - o.val / (this.scrollerHeight - o.vhStart - o.vhLimit);

        const value = o.valClamped;

        // Remove reference to Object
        o = null;
        //
        return parallaxUtils.clamp(value, 0, 1);
    }

    getIsNaNValue() {
        let o = {};

        o.documentHeight =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;

        // Prefixed align
        switch (this.align) {
            case parallaxConstant.ALIGN_START:
                const valueStart = this.scrollerScroll / this.range;
                // Remove reference to Object
                o = null;
                //
                return valueStart;

            case parallaxConstant.ALIGN_TOP:
            case parallaxConstant.ALIGN_LEFT:
                const valueTop =
                    (this.scrollerScroll - this.offset) / this.range;

                // Remove reference to Object
                o = null;
                //
                return valueTop;

            case parallaxConstant.ALIGN_CENTER:
                const valueCenter =
                    (this.scrollerScroll +
                        (this.scrollerHeight / 2 - this.height / 2) -
                        this.offset) /
                    this.range;

                // Remove reference to Object
                o = null;
                //
                return valueCenter;

            case parallaxConstant.ALIGN_BOTTOM:
            case parallaxConstant.ALIGN_RIGHT:
                const valueBottom =
                    (this.scrollerScroll +
                        (this.scrollerHeight - this.height) -
                        this.offset) /
                    this.range;

                // Remove reference to Object
                o = null;
                //
                return valueBottom;

            case parallaxConstant.ALIGN_END:
                const valueEnd =
                    -(
                        o.documentHeight -
                        (this.scrollerScroll + this.scrollerHeight)
                    ) / this.range;

                // Remove reference to Object
                o = null;
                //
                return valueEnd;
        }
    }

    getIsANumberValue() {
        let o = {};

        o.align = parseFloat(this.align);
        o.offset = this.offset;
        o.range = this.range;

        const value =
            (this.scrollerScroll +
                (this.scrollerHeight / 100) * o.align -
                o.offset) /
            o.range;

        // Remove reference to Object
        o = null;
        //

        return value;
    }

    getSwitchAfterZeroValue(value) {
        return parallaxUtils.getValueOnSwitch({
            switchPropierties: this.onSwitch,
            isReverse: this.reverse,
            value,
        });
    }

    getStyle(val) {
        const o = {};

        o.reverseVal = this.reverse
            ? parallaxUtils.getRetReverseValue(this.propierties, val)
            : val;

        o.typeVal =
            this.computationType !== parallaxConstant.TYPE_FIXED
                ? this.getSwitchAfterZeroValue(o.reverseVal)
                : o.reverseVal;

        o.force3DStyle = this.force3D ? 'translate3D(0px, 0px, 0px)' : '';

        switch (this.propierties) {
            case parallaxConstant.PROP_VERTICAL:
                return {
                    transform: `${o.force3DStyle} translateY(${o.typeVal}px)`,
                };

            case parallaxConstant.PROP_HORIZONTAL:
                return {
                    transform: `${o.force3DStyle} translateX(${o.typeVal}px)`,
                };

            case parallaxConstant.PROP_ROTATE:
                return {
                    transform: `${o.force3DStyle} rotate(${o.typeVal}deg)`,
                };
                break;

            case parallaxConstant.PROP_ROTATEY:
                return {
                    transform: `${o.force3DStyle} rotateY(${o.typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEX:
                return {
                    transform: `${o.force3DStyle} rotateX(${o.typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEZ:
                return {
                    transform: `${o.force3DStyle} rotateZ(${o.typeVal}deg)`,
                };

            case parallaxConstant.PROP_OPACITY:
                return { opacity: `${o.typeVal}` };

            case parallaxConstant.PROP_SCALE:
                o.scaleVal =
                    this.computationType !== parallaxConstant.TYPE_FIXED
                        ? 1 + o.typeVal / 1000
                        : o.typeVal;
                return {
                    transform: `${o.force3DStyle} scale(${o.scaleVal})`,
                };

            default:
                return { [this.propierties.toLowerCase()]: `${o.typeVal}px` };
        }
    }

    getResetStyle() {
        switch (this.propierties) {
            case parallaxConstant.PROP_VERTICAL:
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_ROTATE:
            case parallaxConstant.PROP_ROTATEY:
            case parallaxConstant.PROP_ROTATEX:
            case parallaxConstant.PROP_ROTATEZ:
            case parallaxConstant.PROP_SCALE:
                return {
                    transform: ``,
                };

            case parallaxConstant.PROP_OPACITY:
                return { opacity: `` };

            default:
                return { [this.propierties.toLowerCase()]: `` };
        }
    }
}
