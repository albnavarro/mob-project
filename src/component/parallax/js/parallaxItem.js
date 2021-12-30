import { mq } from '../../../js/core/mediaManager.js';
import { offset, position } from '../../../js/utility/vanillaFunction.js';
import { parallaxUtils } from './parallaxUtils.js';
import { parallaxConstant } from './parallaxConstant.js';
import { parallaxMarker } from './parallaxMarker.js';
import { useFrame } from '.../../../js/core/events/rafutils/rafUtils.js';
import { useResize } from '.../../../js/core/events/resizeUtils/useResize.js';
import { useScroll } from '.../../../js/core/events/scrollUtils/useScroll.js';
import { useSpring } from '.../../../js/core/animation/spring/useSpring.js';
import { springConfig } from '.../../../js/core/animation/spring/springConfig.js';
import { useLerp } from '.../../../js/core/animation/lerp/useLerp.js';

export class ParallaxItemClass {
    constructor(data) {
        this.offset = 0;
        this.endValue = 0;
        this.currentValue = 0;
        this.height = 0;
        this.width = 0;
        this.scrollerScroll = 0;
        this.scrollerHeight = 0;
        this.gap = 150;
        this.numericRange = 0;
        this.unsubscribeResize = () => {};
        this.unsubscribeScroll = () => {};
        this.unsubscribeMarker = () => {};
        this.startMarker = null;
        this.endMarker = null;

        // Base props
        this.item = data.item;
        this.direction = (() => {
            return data.direction
                ? data.direction
                : parallaxConstant.DIRECTION_VERTICAL;
        })();
        this.scroller = data.scroller
            ? document.querySelector(data.scroller)
            : window;
        this.screen = data.screen
            ? document.querySelector(data.screen)
            : window;

        //Fixed prop
        this.fromTo = data.fromTo || false;
        this.start = data.start || '0px';
        this.end = data.end || null;
        this.invertSide = data.invertSide || false;
        this.marker = data.marker || null;

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
        this.scrollTrigger = data.scrollTrigger
            ? document.querySelector(data.scrollTrigger)
            : null;
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
            return this.easeType === parallaxConstant.EASE_LERP
                ? new useLerp()
                : new useSpring();
        })();
        this.unsubscribeMotion = () => {};

        //
        this.unitMisure = '';
        this.startPoint = 0;
        this.endPoint = 0;
    }

    init() {
        this.item.classList.add('parallax__item');
        this.setMotion();
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();
        this.setPerspective();

        if (this.computationType == parallaxConstant.TYPE_FIXED) {
            this.limiterOff = true;
            this.calcRangeAndUnitMiusure();
            this.calcFixedLimit();
        }

        if (this.ease) {
            this.unsubscribeScroll = useScroll(() => this.smoothParallaxJs());
            this.smoothParallaxJs();
        } else {
            this.unsubscribeScroll = useScroll(() => this.executeParallax());
            this.executeParallax();
        }

        if (this.scroller !== window) {
            this.unsubscribeMarker = useScroll(() => {
                // Refresh marker
                if (this.marker) this.calcFixedLimit();
            });
        }

        this.unsubscribeResize = useResize(() => this.refresh());
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
        this.unsubscribeMotion = this.motion.subscribe(({ val }) => {
            this.updateStyle(val);
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

        const {
            value: startPoint,
            additionalVal: additionalStartVal,
            position: startPosition,
        } = parallaxUtils.getStartPoint(screenUnit, this.start, this.direction);

        this.invertSide =
            startPosition === parallaxConstant.POSITION_TOP ||
            startPosition === parallaxConstant.POSITION_LEFT;

        // ADD ADDITONAL VALUE
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
        this.unsubscribeMarker();
        this.dynamicRange = null;
    }

    refresh() {
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();
        if (this.computationType == parallaxConstant.TYPE_FIXED) {
            this.calcFixedLimit();
            if (this.dynamicRange) this.calcRangeAndUnitMiusure();
        }

        this.move();
    }

    move() {
        if (this.ease) {
            this.smoothParallaxJs();
        } else {
            this.executeParallax();
        }
    }

    smoothParallaxJs() {
        this.executeParallax(false);
        this.motion.goTo({ val: this.endValue }).catch((err) => {});
    }

    updateStyle(val) {
        if (this.applyTo) {
            Object.assign(this.applyTo.style, this.getStyle(val));
        } else {
            Object.assign(this.item.style, this.getStyle(val));
        }
    }

    executeParallax(applyStyle = true) {
        if (!mq[this.queryType](this.breackpoint)) return;

        this.getScrollerOffset();
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;

        if (
            !parallaxUtils.isInViewport({
                offset: this.offset,
                height: this.height,
                gap: this.gap,
                wScrollTop: scrollTop,
                wHeight: windowsHeight,
            }) &&
            !this.limiterOff
        )
            return;

        switch (this.computationType) {
            case parallaxConstant.TYPE_FIXED:
                this.endValue = this.getFixedValue();
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

        if (!applyStyle) return;

        useFrame(() => {
            this.updateStyle(this.endValue);
        });
    }

    getFixedValue() {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;
        const invertEnterSide = this.invertSide;
        const height = this.height;
        const width = this.width;
        const offset = this.offset;
        const fromTo = this.fromTo;
        const range = this.range;
        const startPoint = this.startPoint;
        const endPoint = this.endPoint;

        const partials = !invertEnterSide
            ? -(scrollTop + windowsHeight - startPoint - (offset + endPoint))
            : -(scrollTop + startPoint + endPoint - (offset + endPoint));

        const maxVal = (endPoint / 100) * this.numericRange;
        const partialVal = (partials / 100) * this.numericRange;

        const valPerDirection = (() => {
            if (fromTo) {
                return !invertEnterSide ? partialVal : maxVal - partialVal;
            } else {
                return !invertEnterSide ? maxVal - partialVal : partialVal;
            }
        })();

        const clamp =
            maxVal > 0
                ? -parallaxUtils.clamp(valPerDirection, 0, maxVal)
                : -parallaxUtils.clamp(valPerDirection, maxVal, 0);

        const percent = (clamp * 100) / endPoint;

        switch (this.propierties) {
            case parallaxConstant.PROP_HORIZONTAL:
            case parallaxConstant.PROP_VERTICAL:
                const value = (() => {
                    switch (this.unitMisure) {
                        case parallaxConstant.VW:
                            return (window.innerWidth / 100) * -percent;

                        case parallaxConstant.VH:
                            return (window.innerHeight / 100) * -percent;

                        case parallaxConstant.WPERCENT:
                            return this.direction ===
                                parallaxConstant.DIRECTION_VERTICAL
                                ? (width / 100) * -percent
                                : (height / 100) * -percent;

                        case parallaxConstant.HPERCENT:
                            return this.direction ===
                                parallaxConstant.DIRECTION_VERTICAL
                                ? (height / 100) * -percent
                                : (width / 100) * -percent;

                        case parallaxConstant.PX:
                        case parallaxConstant.DEGREE:
                        default:
                            return -percent;
                    }
                })();
                return value;

            case parallaxConstant.PROP_SCALE:
                return -percent * 10;

            case parallaxConstant.PROP_OPACITY:
                return -percent / 100;

            default:
                return -percent;
        }
    }

    getOpacityValue() {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;

        const offset = this.offset;
        const vhLimit = (windowsHeight / 100) * this.opacityEnd;
        const vhStart =
            windowsHeight - (windowsHeight / 100) * this.opacityStart;

        const val =
            this.align == parallaxConstant.ALIGN_START
                ? -scrollTop * -1
                : (scrollTop + vhLimit - offset) * -1;

        const valClamped =
            this.align == parallaxConstant.ALIGN_START
                ? 1 - val / offset
                : 1 - val / (windowsHeight - vhStart - vhLimit);

        return parallaxUtils.clamp(valClamped, 0, 1);
    }

    getIsNaNValue() {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;

        const documentHeight =
            this.direction === parallaxConstant.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;
        const range = this.range;
        const offset = this.offset;
        const height = this.height;

        // Prefixed align
        switch (this.align) {
            case parallaxConstant.ALIGN_START:
                return scrollTop / range;

            case parallaxConstant.ALIGN_TOP:
                return (scrollTop - offset) / range;

            case parallaxConstant.ALIGN_CENTER:
                return (
                    (scrollTop + (windowsHeight / 2 - height / 2) - offset) /
                    range
                );

            case parallaxConstant.ALIGN_BOTTOM:
                return (scrollTop + (windowsHeight - height) - offset) / range;

            case parallaxConstant.ALIGN_END:
                return -(documentHeight - (scrollTop + windowsHeight)) / range;
        }
    }

    getIsANumberValue() {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;

        const align = parseFloat(this.align);
        const offset = this.offset;
        const range = this.range;

        return (scrollTop + (windowsHeight / 100) * align - offset) / range;
    }

    getSwitchAfterZeroValue(value) {
        return parallaxUtils.getValueOnSwitch({
            switchPropierties: this.onSwitch,
            isReverse: this.reverse,
            value,
        });
    }

    getStyle(val) {
        const reverseVal = this.reverse
            ? parallaxUtils.getRetReverseValue(this.propierties, val)
            : val;

        const typeVal =
            this.computationType !== parallaxConstant.TYPE_FIXED
                ? this.getSwitchAfterZeroValue(reverseVal)
                : reverseVal;

        switch (this.propierties) {
            case parallaxConstant.PROP_VERTICAL:
                return {
                    transform: `translate3d(0,0,0) translateY(${typeVal}px)`,
                };

            case parallaxConstant.PROP_HORIZONTAL:
                return {
                    transform: `translate3d(0,0,0) translateX(${typeVal}px)`,
                };

            case parallaxConstant.PROP_ROTATE:
                return {
                    transform: `translate3d(0,0,0) rotate(${typeVal}deg)`,
                };
                break;

            case parallaxConstant.PROP_ROTATEY:
                return {
                    transform: `translate3d(0,0,0) rotateY(${typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEX:
                return {
                    transform: `translate3d(0,0,0) rotateX(${typeVal}deg)`,
                };

            case parallaxConstant.PROP_ROTATEZ:
                return {
                    transform: `translate3d(0,0,0) rotateZ(${typeVal}deg)`,
                };

            case parallaxConstant.PROP_OPACITY:
                return { opacity: `${typeVal}` };

            case parallaxConstant.PROP_SCALE:
                const scaleVal = 1 + typeVal / 1000;
                return {
                    transform: `translate3d(0,0,0) scale(${scaleVal})`,
                };

            default:
                return { [this.propierties.toLowerCase()]: `${typeVal}px` };
        }
    }
}
