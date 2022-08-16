import { mq } from '../../utils/mediaManager.js';
import { offset, position } from '../../utils/vanillaFunction.js';
import { parallaxUtils } from './parallaxUtils.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxMarker } from './parallaxMarker.js';
import { parallaxEmitter } from './parallaxEmitter.js';
import { ParallaxPin } from './parallaxPin.js';
import { handleFrame } from '../../events/rafutils/handleFrame.js';
import { handleNextTick } from '../../events/rafutils/handleNextTick.js';
import { handleResize } from '../../events/resizeUtils/handleResize.js';
import { handleScroll } from '../../events/scrollUtils/handleScroll.js';
import { handleScrollImmediate } from '../../events/scrollUtils/handleScrollImmediate.js';
import { handleScrollThrottle } from '../../events/scrollUtils/handleScrollThrottle.js';
import { handleScrollStart } from '../../events/scrollUtils/handleScrollUtils.js';
import { HandleSpring } from '../spring/handleSpring.js';
import { HandleLerp } from '../lerp/handleLerp.js';
import { getRoundedValue } from '../utils/animationUtils.js';
import { getTranslateValues } from '../../utils/vanillaFunction.js';
import { clamp } from '../utils/animationUtils.js';

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

        /*
        Pin  prop
        */
        this.pin = data.pin || false;
        this.animatePin = data.animatePin || false;
        this.forceTranspond = data.forceTranspond || false;
        this.anticipatePinOnLoad = data.anticipatePinOnLoad || false;
        this.pinInstance = null;

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
        this.onSwitch = data.onSwitch ? data.onSwitch.toLowerCase() : false;

        // Opacity Prop
        this.opacityStart = data.opacityStart || 100;
        this.opacityEnd = data.opacityEnd || 0;

        // Common prop
        this.disableForce3D = data.disableForce3D || false;
        this.useThrottle = data.useThrottle || false;
        this.type = data.type
            ? data.type.toLowerCase()
            : parallaxConstant.TYPE_DEFAULT;

        // Base range
        this.range =
            data.range ||
            (() => (this.type === parallaxConstant.TYPE_DEFAULT ? 2 : 0))();
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
                ? new HandleLerp()
                : new HandleSpring();
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

        /*
        Obj utils to avoid new GC allocation during animation
        Try to reduce the GC timing
        Support caluculation in each frame
        */
        this.GC = {
            // getFixedValue
            partials: null,
            maxVal: null,
            partialVal: null,
            valPerDirection: null,
            clamp: null,
            percent: null,
            // getOpacityValue
            vhLimit: null,
            vhStart: null,
            val: null,
            valClamped: null,
            // getIsNaNValue
            documentHeight: null,
            // getIsANumberValue
            align: null,
            offset: null,
            range: null,
            // getStyle
            reverseVal: null,
            typeVal: null,
            force3DStyle: null,
            scaleVal: null,
        };
    }

    init() {
        this.setMotion();
        this.calcScreenPosition();
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();
        this.setPerspective();

        if (this.type == parallaxConstant.TYPE_SCROLLTRIGGER) {
            this.limiterOff = true;
            if (this.propierties === parallaxConstant.PROP_TWEEN) {
                this.range = this.tween.getDuration();
                if (this.tween?.inzializeStagger) this.tween.inzializeStagger();
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
                (() => {
                    if (this.ease && this.useThrottle) {
                        this.unsubscribeScroll = handleScrollThrottle(cb);
                        return handleScrollThrottle;
                    } else {
                        this.unsubscribeScroll = handleScroll(cb);
                        return handleScroll;
                    }
                })();
            }
        };

        if (this.ease) {
            // Force transform3D onscroll start
            this.unsubscribeScrollStart = handleScrollStart(() => {
                if (!this.disableForce3D) this.force3D = true;
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
            this.pinInstance = new ParallaxPin();

            if (mq[this.queryType](this.breackpoint)) {
                handleNextTick.add(() => {
                    this.getScrollerOffset();
                    this.pinInstance.init({ instance: this });
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
                if (this.springConfig) {
                    this.motion.updatePreset(this.springConfig);
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

    destroy() {
        if ('stop' in this.motion) {
            this.motion.stop();
        }
        this.unsubscribeScroll();
        this.unsubscribeScrollStart();
        this.unsubscribeResize();
        this.unsubscribeMotion();
        this.unsubscribeOnComplete();
        this.unsubscribeMarker();
        this.motion.destroy();
        this.dynamicRange = null;
        this.onEnter = () => {};
        this.onEnterBack = () => {};
        this.onLeave = () => {};
        this.onLeaveBack = () => {};
        this.onTickCallback = () => {};
        if (this.pin && this.pinInstance) this.pinInstance.destroy();
        if (this.startMarker) this.startMarker.remove();
        if (this.endMarker) this.endMarker.remove();
        this.motion = null;
        this.startMarker = null;
        this.endMarker = null;
        this.pinInstance = null;
        this.endValue = 0;
    }

    refresh() {
        if (this.pin && this.pinInstance) this.pinInstance.destroy();

        this.calcScreenPosition();
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();

        if (this.type == parallaxConstant.TYPE_SCROLLTRIGGER) {
            this.calcFixedLimit();
            if (this.dynamicRange) this.calcRangeAndUnitMiusure();

            if (this.pin && this.pinInstance) {
                if (mq[this.queryType](this.breackpoint)) {
                    this.pinInstance.init({ instance: this });
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
            this.type === parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        // Skip motion deafault type
        if (
            !this.isInViewport &&
            !this.firstTime &&
            !this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        // First time render with no easing
        const action = this.firstTime & !this.animateAtStart ? 'set' : 'goTo';

        this.motion[action](
            { val: this.endValue },
            this.motionParameters
        ).catch(() => {});
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
            !this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
        )
            return;

        if (this.pin && this.pinInstance) {
            this.pinInstance.onScroll(this.scrollerScroll);
        }

        switch (this.type) {
            case parallaxConstant.TYPE_SCROLLTRIGGER:
                this.endValue = getRoundedValue(this.getFixedValue());
                break;

            default:
                switch (this.propierties) {
                    case parallaxConstant.PROP_OPACITY:
                        this.endValue = getRoundedValue(this.getOpacityValue());
                        break;

                    default:
                        if (Number.isNaN(parseInt(this.align))) {
                            this.endValue = getRoundedValue(
                                this.getIsNaNValue() / 2
                            );
                        } else {
                            this.endValue = getRoundedValue(
                                this.getIsANumberValue() / 2
                            );
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
        this.GC.partials = !this.invertSide
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

        this.GC.maxVal = (this.endPoint / 100) * this.numericRange;
        this.GC.partialVal = (this.GC.partials / 100) * this.numericRange;

        this.GC.valPerDirection = (() => {
            if (this.fromTo) {
                return !this.invertSide
                    ? this.GC.partialVal
                    : this.GC.maxVal - this.GC.partialVal;
            } else {
                return !this.invertSide
                    ? this.GC.maxVal - this.GC.partialVal
                    : this.GC.partialVal;
            }
        })();

        this.GC.clamp =
            this.GC.maxVal > 0
                ? -clamp(this.GC.valPerDirection, 0, this.GC.maxVal)
                : -clamp(this.GC.valPerDirection, this.GC.maxVal, 0);

        this.fixedShouldRender =
            this.prevFixedClamp === this.GC.clamp ? false : true;
        this.prevFixedClamp = this.GC.clamp;
        if (!this.fixedShouldRender && !this.firstTime) return this.endValue;

        this.GC.percent = (this.GC.clamp * 100) / this.endPoint;

        // Fire callback if there is
        if (
            this.onEnter ||
            this.onEnterBack ||
            this.onLeave ||
            this.onLeaveBack
        ) {
            parallaxEmitter({
                prevValue: this.prevFixedRawValue,
                value: this.GC.valPerDirection,
                maxVal: this.GC.maxVal,
                onEnter: this.onEnter,
                onEnterBack: this.onEnterBack,
                onLeave: this.onLeave,
                onLeaveBack: this.onLeaveBack,
            });
        }

        this.prevFixedRawValue = this.GC.valPerDirection;

        switch (this.propierties) {
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_VERTICAL:
                return this.getHVval();

            case parallaxConstant.PROP_SCALE:
            case parallaxConstant.PROP_OPACITY:
                return 1 - this.GC.percent;

            default:
                return -this.GC.percent;
        }
    }

    getHVval() {
        switch (this.unitMisure) {
            case parallaxConstant.VW:
                return (this.windowInnerWidth / 100) * -this.GC.percent;

            case parallaxConstant.VH:
                return (this.windowInnerHeight / 100) * -this.GC.percent;

            case parallaxConstant.WPERCENT:
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.width / 100) * -this.GC.percent
                    : (this.height / 100) * -this.GC.percent;

            case parallaxConstant.HPERCENT:
                return this.direction === parallaxConstant.DIRECTION_VERTICAL
                    ? (this.height / 100) * -this.GC.percent
                    : (this.width / 100) * -this.GC.percent;

            case parallaxConstant.PX:
            case parallaxConstant.DEGREE:
            case parallaxConstant.PROP_TWEEN:
            default:
                return -this.GC.percent;
        }
    }

    getOpacityValue() {
        this.GC.vhLimit = (this.scrollerHeight / 100) * this.opacityEnd;
        this.GC.vhStart =
            this.scrollerHeight -
            (this.scrollerHeight / 100) * this.opacityStart;

        this.GC.val =
            this.align == parallaxConstant.ALIGN_START
                ? -this.scrollerScroll * -1
                : (this.scrollerScroll + this.GC.vhLimit - this.offset) * -1;

        this.GC.valClamped =
            this.align == parallaxConstant.ALIGN_START
                ? 1 - this.GC.val / this.offset
                : 1 -
                  this.GC.val /
                      (this.scrollerHeight - this.GC.vhStart - this.GC.vhLimit);

        return clamp(this.GC.valClamped, 0, 1);
    }

    getIsNaNValue() {
        this.GC.documentHeight =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;

        // Prefixed align
        switch (this.align) {
            case parallaxConstant.ALIGN_START:
                return this.scrollerScroll / this.range;

            case parallaxConstant.ALIGN_TOP:
            case parallaxConstant.ALIGN_LEFT:
                return (this.scrollerScroll - this.offset) / this.range;

            case parallaxConstant.ALIGN_CENTER:
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight / 2 - this.height / 2) -
                        this.offset) /
                    this.range
                );

            case parallaxConstant.ALIGN_BOTTOM:
            case parallaxConstant.ALIGN_RIGHT:
                return (
                    (this.scrollerScroll +
                        (this.scrollerHeight - this.height) -
                        this.offset) /
                    this.range
                );

            case parallaxConstant.ALIGN_END:
                return (
                    -(
                        this.GC.documentHeight -
                        (this.scrollerScroll + this.scrollerHeight)
                    ) / this.range
                );
        }
    }

    getIsANumberValue() {
        this.GC.align = parseFloat(this.align);
        this.GC.offset = this.offset;
        this.GC.range = this.range;

        return (
            (this.scrollerScroll +
                (this.scrollerHeight / 100) * this.GC.align -
                this.GC.offset) /
            this.GC.range
        );
    }

    getSwitchAfterZeroValue(value) {
        return parallaxUtils.getValueOnSwitch({
            switchPropierties: this.onSwitch,
            isReverse: this.reverse,
            value,
        });
    }

    getStyle(val) {
        this.GC.reverseVal = this.reverse
            ? parallaxUtils.getRetReverseValue(this.propierties, val)
            : val;

        this.GC.typeVal =
            this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
                ? this.getSwitchAfterZeroValue(this.GC.reverseVal)
                : this.GC.reverseVal;

        this.GC.force3DStyle = this.force3D ? 'translate3D(0px, 0px, 0px)' : '';

        switch (this.propierties) {
            case parallaxConstant.PROP_VERTICAL:
                return {
                    transform: `${this.GC.force3DStyle} translateY(${this.GC.typeVal}px)`,
                };

            case parallaxConstant.PROP_HORIZONTAL:
                return {
                    transform: `${this.GC.force3DStyle} translateX(${this.GC.typeVal}px)`,
                };

            case parallaxConstant.PROP_ROTATE:
                return {
                    transform: `${this.GC.force3DStyle} rotate(${this.GC.typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEY:
                return {
                    transform: `${this.GC.force3DStyle} rotateY(${this.GC.typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEX:
                return {
                    transform: `${this.GC.force3DStyle} rotateX(${this.GC.typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEZ:
                return {
                    transform: `${this.GC.force3DStyle} rotateZ(${this.GC.typeVal}deg)`,
                };

            case parallaxConstant.PROP_OPACITY:
                return { opacity: `${this.GC.typeVal}` };

            case parallaxConstant.PROP_SCALE:
                this.GC.scaleVal =
                    this.type !== parallaxConstant.TYPE_SCROLLTRIGGER
                        ? 1 + this.GC.typeVal / 1000
                        : this.GC.typeVal;
                return {
                    transform: `${this.GC.force3DStyle} scale(${this.GC.scaleVal})`,
                };

            default:
                return {
                    [this.propierties.toLowerCase()]: `${this.GC.typeVal}px`,
                };
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
