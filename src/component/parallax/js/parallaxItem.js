import { mq } from '../../../js/core/utils/mediaManager.js';
import { offset, position } from '../../../js/core/utils/vanillaFunction.js';
import { parallaxUtils } from './parallaxUtils.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxMarker } from './parallaxMarker.js';
import { parallaxEmitter } from './parallaxEmitter.js';
import { ParallaxPin } from './parallaxPin.js';
import { handleFrame } from '../../../js/core/events/rafutils/rafUtils.js';
import { handleResize } from '../../../js/core/events/resizeUtils/handleResize.js';
import { handleScroll } from '../../../js/core/events/scrollUtils/handleScroll.js';
import { handleVisibilityChange } from '../../../js/core/events/visibilityChange/handleVisibilityChange.js';
import { handleSpring } from '../../../js/core/animation/spring/handleSpring.js';
import { handleLerp } from '../../../js/core/animation/lerp/handleLerp.js';
import { springConfig } from '../../../js/core/animation/spring/springConfig.js';

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
        this.unsubscribeMarker = () => {};
        this.startMarker = null;
        this.endMarker = null;
        this.lastValue = null;
        this.prevFixedRawValue = 0;
        this.fixedShouldRender = null;
        this.prevFixedClamp = null;
        this.firstTime = true;
        this.isInViewport = false;
        this.dontUSeFrame = false;
        this.islagging = false;

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
        this.scrollTrigger = (() => {
            if (data.scrollTrigger) {
                return typeof data.scrollTrigger === 'string'
                    ? document.querySelector(data.scrollTrigger)
                    : data.scrollTrigger;
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

        //
        this.springConfig = data.springConfig || null;
        this.lerpConfig = data.lerpConfig || null;
        this.motion = (() => {
            if (
                this.tween &&
                this.tween.getType() === parallaxConstant.TWEEN_TIMELINE
            ) {
                this.easeType = parallaxConstant.EASE_LERP;
            }

            return this.easeType === parallaxConstant.EASE_LERP
                ? new handleLerp()
                : new handleSpring();
        })();
        this.unsubscribeMotion = () => {};
        this.unsubscribeLag = () => {};

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
        this.item.classList.add('parallax__item');
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

        if (this.ease) {
            handleVisibilityChange(() => {
                handleFrame(() => {
                    this.motion.stop();
                });
            });

            if (this.scroller === window) {
                this.unsubscribeScroll = handleScroll(() => {
                    handleFrame(() => {
                        this.smoothParallaxJs();
                        this.islagging = false;
                    });
                });
            }

            handleFrame(() => {
                this.smoothParallaxJs();
                this.islagging = false;
            });
        } else {
            if (this.scroller === window) {
                this.unsubscribeScroll = handleScroll(() => {
                    this.computeValue();
                    this.dontUSeFrame = false;
                    this.noEasingRender();
                });
            }
            this.computeValue();
            this.dontUSeFrame = false;
            this.noEasingRender();
        }

        if (this.scroller !== window) {
            this.unsubscribeMarker = handleScroll(() => {
                // Refresh marker
                if (this.marker) this.calcFixedLimit();
            });
        }

        this.unsubscribeResize = handleResize(() => this.refresh());

        if (this.pin) {
            this.pinInstance = new ParallaxPin({ instance: this });

            if (mq[this.queryType](this.breackpoint)) {
                this.pinInstance.init();
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
        this.motion.setData({ val: 0 });

        if (this.ease) {
            this.unsubscribeLag = this.motion.onLag((val) => {
                handleFrame(() => {
                    console.warn(`animation is lagging, lost ${val} ms`);
                    this.motion.stop();
                    this.islagging = true;
                });
            });
        }

        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            if (val === this.lastValue) return;

            if (this.propierties === parallaxConstant.PROP_TWEEN) {
                this.tween.draw(val);
                this.lastValue = val;
                this.firstTime = false;
            } else {
                this.updateStyle(val);
            }

            if (this.onTickCallback) this.onTickCallback(val);
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
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;

        // Reset transofrm for get right offset value if transform is applyed itself
        if (this.scrollTrigger === null) el.style.transform = '';

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
    }

    calcScreenPosition() {
        if (this.screen === window) return;

        this.screenPosition =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(offset(this.screen).top)
                : parseInt(position(this.screen).left);
    }

    calcHeight() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;
        this.height =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? parseInt(el.offsetHeight)
                : parseInt(el.offsetWidth);
    }

    calcWidth() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;
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
        this.unsubscribeResize();
        this.unsubscribeMotion();
        this.unsubscribeLag();
        this.unsubscribeMarker();
        this.dynamicRange = null;
        this.onEnter = () => {};
        this.onEnterBack = () => {};
        this.onLeave = () => {};
        this.onLeaveBack = () => {};
        this.onTickCallback = () => {};
        if (this.pin) this.pinInstance.destroy();
        if (this.startMarker) this.startMarker.remove();
        if (this.endMarker) this.endMarker.remove();
        this.startMarker = null;
        this.endMarker = null;
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
        this.move();
    }

    move(scrollVal = null) {
        // Bypass request animation frame, is supposed that is used outside
        this.dontUSeFrame = true;

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

        this.motion
            .goTo({ val: this.endValue }, { immediate: this.islagging })
            .catch((err) => {});
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
        if (this.dontUSeFrame) {
            this.cleanRender();
            return;
        }

        handleFrame(() => {
            this.cleanRender();
        });
    }

    cleanRender() {
        if (this.endValue === this.lastValue) return;

        if (this.propierties === parallaxConstant.PROP_TWEEN) {
            this.tween.draw(this.endValue);
            this.lastValue = this.endValue;
            this.firstTime = false;
        } else {
            this.updateStyle(this.endValue);
        }

        if (this.onTickCallback) this.onTickCallback(this.endValue);
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
        const _ = this;
        const o = {};

        o.partials = !_.invertSide
            ? -(
                  _.scrollerScroll +
                  _.scrollerHeight -
                  _.startPoint -
                  (_.offset + _.endPoint)
              )
            : -(
                  _.scrollerScroll +
                  _.startPoint +
                  _.endPoint -
                  (_.offset + _.endPoint)
              );

        o.maxVal = (_.endPoint / 100) * _.numericRange;
        o.partialVal = (o.partials / 100) * _.numericRange;

        o.valPerDirection = (() => {
            if (_.fromTo) {
                return !_.invertSide ? o.partialVal : o.maxVal - o.partialVal;
            } else {
                return !_.invertSide ? o.maxVal - o.partialVal : o.partialVal;
            }
        })();

        o.clamp =
            o.maxVal > 0
                ? -parallaxUtils.clamp(o.valPerDirection, 0, o.maxVal)
                : -parallaxUtils.clamp(o.valPerDirection, o.maxVal, 0);

        _.fixedShouldRender = _.prevFixedClamp === o.clamp ? false : true;
        _.prevFixedClamp = o.clamp;
        if (!_.fixedShouldRender && !_.firstTime) return _.endValue;

        o.percent = (o.clamp * 100) / _.endPoint;

        // Fire callback if there is
        if (_.onEnter || _.onEnterBack || _.onLeave || _.onLeaveBack) {
            parallaxEmitter({
                prevValue: _.prevFixedRawValue,
                value: o.valPerDirection,
                maxVal: o.maxVal,
                onEnter: _.onEnter,
                onEnterBack: _.onEnterBack,
                onLeave: _.onLeave,
                onLeaveBack: _.onLeaveBack,
            });
        }

        _.prevFixedRawValue = o.valPerDirection;

        switch (_.propierties) {
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_VERTICAL:
                const value = (() => {
                    switch (_.unitMisure) {
                        case parallaxConstant.VW:
                            return (_.windowInnerWidth / 100) * -o.percent;

                        case parallaxConstant.VH:
                            return (_.windowInnerHeight / 100) * -o.percent;

                        case parallaxConstant.WPERCENT:
                            return _.direction ===
                                parallaxConstant.DIRECTION_VERTICAL
                                ? (_.width / 100) * -o.percent
                                : (_.height / 100) * -o.percent;

                        case parallaxConstant.HPERCENT:
                            return _.direction ===
                                parallaxConstant.DIRECTION_VERTICAL
                                ? (_.height / 100) * -o.percent
                                : (_.width / 100) * -o.percent;

                        case parallaxConstant.PX:
                        case parallaxConstant.DEGREE:
                        case parallaxConstant.PROP_TWEEN:
                        default:
                            return -o.percent;
                    }
                })();
                return value;

            case parallaxConstant.PROP_SCALE:
                return -o.percent * 10;

            case parallaxConstant.PROP_OPACITY:
                return -o.percent / 100;

            default:
                return -o.percent;
        }
    }

    getOpacityValue() {
        const _ = this;
        const o = {};

        o.vhLimit = (_.scrollerHeight / 100) * this.opacityEnd;
        o.vhStart =
            _.scrollerHeight - (_.scrollerHeight / 100) * this.opacityStart;

        o.val =
            this.align == parallaxConstant.ALIGN_START
                ? -_.scrollerScroll * -1
                : (_.scrollerScroll + o.vhLimit - _.offset) * -1;

        o.valClamped =
            this.align == parallaxConstant.ALIGN_START
                ? 1 - o.val / _.offset
                : 1 - o.val / (_.scrollerHeight - o.vhStart - o.vhLimit);

        return parallaxUtils.clamp(o.valClamped, 0, 1);
    }

    getIsNaNValue() {
        const _ = this;
        const o = {};

        o.documentHeight =
            _.direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;

        // Prefixed align
        switch (_.align) {
            case parallaxConstant.ALIGN_START:
                return _.scrollerScroll / _.range;

            case parallaxConstant.ALIGN_TOP:
                return (_.scrollerScroll - _.offset) / _.range;

            case parallaxConstant.ALIGN_CENTER:
                return (
                    (_.scrollerScroll +
                        (_.scrollerHeight / 2 - _.height / 2) -
                        _.offset) /
                    _.range
                );

            case parallaxConstant.ALIGN_BOTTOM:
                return (
                    (_.scrollerScroll +
                        (_.scrollerHeight - _.height) -
                        _.offset) /
                    _.range
                );

            case parallaxConstant.ALIGN_END:
                return (
                    -(
                        o.documentHeight -
                        (_.scrollerScroll + _.scrollerHeight)
                    ) / _.range
                );
        }
    }

    getIsANumberValue() {
        const _ = this;
        const o = {};

        o.align = parseFloat(_.align);
        o.offset = _.offset;
        o.range = _.range;

        return (
            (_.scrollerScroll + (_.scrollerHeight / 100) * o.align - o.offset) /
            o.range
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
        const o = {};

        o.reverseVal = this.reverse
            ? parallaxUtils.getRetReverseValue(this.propierties, val)
            : val;

        o.typeVal =
            this.computationType !== parallaxConstant.TYPE_FIXED
                ? this.getSwitchAfterZeroValue(o.reverseVal)
                : o.reverseVal;

        switch (this.propierties) {
            case parallaxConstant.PROP_VERTICAL:
                return {
                    transform: `translate3d(0,0,0) translateY(${o.typeVal}px)`,
                };

            case parallaxConstant.PROP_HORIZONTAL:
                return {
                    transform: `translate3d(0,0,0) translateX(${o.typeVal}px)`,
                };

            case parallaxConstant.PROP_ROTATE:
                return {
                    transform: `translate3d(0,0,0) rotate(${o.typeVal}deg)`,
                };
                break;

            case parallaxConstant.PROP_ROTATEY:
                return {
                    transform: `translate3d(0,0,0) rotateY(${o.typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEX:
                return {
                    transform: `translate3d(0,0,0) rotateX(${o.typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEZ:
                return {
                    transform: `translate3d(0,0,0) rotateZ(${o.typeVal}deg)`,
                };

            case parallaxConstant.PROP_OPACITY:
                return { opacity: `${o.typeVal}` };

            case parallaxConstant.PROP_SCALE:
                o.scaleVal = 1 + o.typeVal / 1000;
                return {
                    transform: `translate3d(0,0,0) scale(${o.scaleVal})`,
                };

            default:
                return { [this.propierties.toLowerCase()]: `${o.typeVal}px` };
        }
    }
}
