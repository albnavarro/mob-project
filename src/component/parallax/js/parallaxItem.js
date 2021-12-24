import { mq } from '../../../js/core/mediaManager.js';
import { offset, position } from '../../../js/utility/vanillaFunction.js';
import { parallaxUtils } from './parallaxUtils.js';
import { useFrame } from '.../../../js/core/events/rafutils/rafUtils.js';
import { useResize } from '.../../../js/core/events/resizeUtils/useResize.js';
import { useScroll } from '.../../../js/core/events/scrollUtils/useScroll.js';
import { useSpring } from '.../../../js/core/animation/spring/useSpring.js';
import { springConfig } from '.../../../js/core/animation/spring/springConfig.js';

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
        this.unsubscribeResize = () => {};
        this.unsubscribeScroll = () => {};

        // Constant misure units
        this.PX = 'PX';
        this.VH = 'VH';
        this.VW = 'VW';
        this.Wpercent = 'W%';
        this.Hpercent = 'H%';

        // Constant direction
        this.DIRECTION_VERTICAL = 'VERTICAL';
        this.DIRECTION_HORIZONTAL = 'HORIZONTAL';

        // Constant computation type
        this.TYPE_DEFAULT = 'DEFAULT';
        this.TYPE_FIXED = 'FIXED';

        // Constant propierties
        this.PROP_VERTICAL = 'VERTICAL';
        this.PROP_HORIZONTAL = 'HORIZONTAL';
        this.PROP_ROTATE = 'ROTATE';
        this.PROP_ROTATEY = 'ROTATEY';
        this.PROP_ROTATEX = 'ROTATEX';
        this.PROP_ROTATEZ = 'ROTATEZ';
        this.PROP_OPACITY = 'OPACITY';
        this.PROP_SCALE = 'SCALE';

        // Align constant
        this.ALIGN_START = 'START';
        this.ALIGN_TOP = 'TOP';
        this.ALIGN_CENTER = 'CENTER';
        this.ALIGN_BOTTOM = 'BOTTOM';
        this.ALIGN_END = 'END';

        // Switch constant
        this.IN_STOP = 'IN-STOP';
        this.IN_BACK = 'IN-BACK';
        this.OUT_STOP = 'OUT-STOP';
        this.OUT_BACK = 'OUT-BACK';

        // Ease type constant
        this.EASE_JS = 'JS';
        this.EASE_CSS = 'CSS';

        // 'PROPS'
        this.item = data.item;
        this.direction = (() => {
            return data.direction
                ? data.direction.toUpperCase()
                : this.DIRECTION_VERTICAL;
        })();

        this.scroller = data.scroller
            ? document.querySelector(data.scroller)
            : window;

        this.screen = data.screen
            ? document.querySelector(data.screen)
            : window;

        //Fixed prop
        this.fixedFromTo = data.fixedFromTo || false;
        this.fixedOffset = data.fixedOffset || 0;
        this.fixedEndOff = data.fixedEndOff || false;
        this.fixedStartOff = data.fixedStartOff || false;
        this.fixedInvertSide = data.fixedInvertSide || false;

        //Lienar prop
        this.align = (() => {
            return data.align ? data.align.toUpperCase() : this.ALIGN_CENTER;
        })();

        // Opacity Prop
        this.opacityStart = data.opacityStart || 100;
        this.opacityEnd = data.opacityEnd || 0;

        this.onSwitch = (() => {
            return data.onSwitch ? data.onSwitch.toUpperCase() : false;
        })();

        // Common prop
        this.computationType = (() => {
            return data.computationType
                ? data.computationType.toUpperCase()
                : this.TYPE_DEFAULT;
        })();

        this.range =
            data.range ||
            (() => (this.computationType === this.TYPE_DEFAULT ? 8 : 100))();
        this.numericRange = 0;
        this.perspective = data.perspective || false;
        this.applyTo = data.applyTo || false;
        this.scrollTrigger = data.scrollTrigger
            ? document.querySelector(data.scrollTrigger)
            : null;
        this.breackpoint = data.breackpoint || 'desktop';
        this.queryType = data.queryType || 'min';
        this.limiterOff = data.limiterOff || false;
        this.scrub = data.scrub || 8;
        this.reverse = data.reverse || false;
        this.ease = data.ease || false;
        this.propierties = (() => {
            return data.propierties
                ? data.propierties.toUpperCase()
                : this.PROP_VERTICAL;
        })();

        this.easeType = (() => {
            return data.easeType ? data.easeType.toUpperCase() : this.EASE_JS;
        })();

        //
        this.springConfig = data.springConfig || null;
        this.spring = new useSpring();
        this.unsubscribeSpring = () => {};

        this.unitMisure = '';
    }

    init() {
        if (this.computationType == this.TYPE_FIXED) {
            this.numericRange = parseFloat(
                this.range.toString().replace(/^[^-]\D+/g, '')
            );

            this.unitMisure = (() => {
                if (this.range.toString().includes('px')) return this.PX;
                else if (this.range.toString().includes('vh')) return this.VH;
                else if (this.range.toString().includes('vw')) return this.VW;
                else if (this.range.toString().includes('w%'))
                    return this.Wpercent;
                else if (this.range.toString().includes('h%'))
                    return this.Hpercent;
                else return '';
            })();

            this.limiterOff = true;
        }

        this.spring.setData({ val: 0 });

        this.unsubscribeSpring = this.spring.subscribe(({ val }) => {
            this.updateStyle(val);
        });

        if (this.springConfig && this.springConfig in springConfig) {
            const config = springConfig[this.springConfig];
            this.spring.updateConfig(config);
        }

        this.item.classList.add('parallax__item');
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();

        if (this.computationType !== this.TYPE_FIXED)
            this.range = parallaxUtils.normalizeRange(this.range);

        this.scrub = parallaxUtils.normalizeVelocity(this.scrub);

        if (this.perspective) {
            const style = {
                perspective: `${this.perspective}px`,
                'transform-style': 'preserve-3d',
            };
            const parent = this.item.parentNode;
            Object.assign(parent.style, style);
        }

        if (this.ease) {
            switch (this.easeType) {
                case this.EASE_CSS:
                    this.item.style.transition =
                        'transform 1s cubic-bezier(0.305, 0.55, 0.47, 1.015)';
                    this.unsubscribeScroll = useScroll(() =>
                        this.executeParallax()
                    );

                    break;
                case this.EASE_JS:
                    this.unsubscribeScroll = useScroll(() =>
                        this.smoothParallaxJs()
                    );

                    this.smoothParallaxJs();
                    break;
            }
        } else {
            this.unsubscribeScroll = useScroll(() => this.executeParallax());
            this.executeParallax();
        }

        this.unsubscribeResize = useResize(() => this.refresh());
    }

    calcOffset() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;

        // Reset transofrm for get right offset value if transform is applyed itself
        if (this.scrollTrigger === null) el.style.transform = '';

        if (this.direction === this.DIRECTION_VERTICAL) {
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
            this.direction === this.DIRECTION_VERTICAL
                ? (this.offset -= parseInt(offset(this.screen).top))
                : (this.offset -= parseInt(position(this.screen).left));
        }
    }

    calcHeight() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;
        this.height =
            this.direction === this.DIRECTION_VERTICAL
                ? parseInt(el.offsetHeight)
                : parseInt(el.offsetWidth);
    }

    calcWidth() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;
        this.width =
            this.direction === this.DIRECTION_VERTICAL
                ? parseInt(el.offsetWidth)
                : parseInt(el.offsetHeight);
    }

    getScrollerOffset() {
        if (this.scroller === window) {
            this.scrollerScroll =
                this.direction === this.DIRECTION_VERTICAL
                    ? this.scroller.pageYOffset
                    : this.scroller.pageXOffset;
        } else {
            this.scrollerScroll =
                this.direction === this.DIRECTION_VERTICAL
                    ? -offset(this.scroller).top
                    : -offset(this.scroller).left;
        }
    }

    getScreenHeight() {
        if (this.screen === window) {
            this.scrollerHeight =
                this.direction === this.DIRECTION_VERTICAL
                    ? window.innerHeight
                    : window.innerWidth;
        } else {
            this.scrollerHeight =
                this.direction === this.DIRECTION_VERTICAL
                    ? parseInt(this.screen.offsetHeight)
                    : parseInt(this.screen.offsetWidth);
        }
    }

    unsubscribe() {
        this.unsubscribeScroll();
        this.unsubscribeResize();
        this.unsubscribeSpring();
    }

    refresh() {
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();
        this.move();
    }

    move() {
        if (this.ease) {
            switch (this.easeType) {
                case this.EASE_CSS:
                    this.executeParallax();
                    break;
                case this.EASE_JS:
                    this.smoothParallaxJs();
                    break;
            }
        } else {
            this.executeParallax();
        }
    }

    smoothParallaxJs() {
        this.executeParallax(false);
        this.spring.goTo({ val: this.endValue }).catch((err) => {});
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
            case this.TYPE_FIXED:
                const { applyStyleComputed, value } =
                    this.getFixedValue(applyStyle);
                applyStyle = applyStyleComputed;
                this.endValue = value;
                break;

            default:
                switch (this.propierties) {
                    case this.PROP_OPACITY:
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

    getFixedValue(applyStyle) {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;
        const invertEnterSide = this.fixedInvertSide;
        const height = this.height;
        const width = this.width;
        const offset = this.offset;
        const fixedFromTo = this.fixedFromTo;
        const fixedStartOff = this.fixedStartOff;
        const fixedEndOff = this.fixedEndOff;
        const range = this.range;
        const fixedOffset = this.fixedOffset;
        const startPoint = (windowsHeight / 100) * fixedOffset; //sp = Start point calculated in vh

        const partials = !invertEnterSide
            ? -(scrollTop + windowsHeight - startPoint - (offset + height))
            : -(scrollTop + startPoint - (offset + height));

        const maxVal = (height / 100) * this.numericRange;
        const partialVal = (partials / 100) * this.numericRange;

        const elementAlign = !invertEnterSide
            ? parallaxUtils.getFixedElementAlignNatural({
                  scrollTop,
                  windowsHeight,
                  startPoint,
                  offset,
                  height,
              })
            : parallaxUtils.getFixedElementAlignInvert({
                  scrollTop,
                  windowsHeight,
                  startPoint,
                  offset,
                  height,
              });

        const { value, applyStyleComputed } =
            parallaxUtils.getFixedValueByAlign(elementAlign)({
                fixedFromTo,
                maxVal,
                fixedStartOff,
                applyStyle,
                fixedEndOff,
                partialVal,
            });

        const percent = (value * 100) / height;

        switch (this.propierties) {
            case this.PROP_HORIZONTAL:
            case this.PROP_VERTICAL:
                const value = (() => {
                    switch (this.unitMisure) {
                        case this.VW:
                            return (window.innerWidth / 100) * -percent;

                        case this.VH:
                            return (window.innerHeight / 100) * -percent;

                        case this.Wpercent:
                            return this.direction === this.DIRECTION_VERTICAL
                                ? (width / 100) * -percent
                                : (height / 100) * -percent;

                        case this.Hpercent:
                            return this.direction === this.DIRECTION_VERTICAL
                                ? (height / 100) * -percent
                                : (width / 100) * -percent;

                        case this.PX:
                        default:
                            return -percent;
                    }
                })();
                return {
                    applyStyleComputed,
                    value,
                };

            case this.PROP_SCALE:
                return {
                    applyStyleComputed,
                    value: -percent * 10,
                };

            case this.PROP_OPACITY:
                return {
                    applyStyleComputed,
                    value: -percent / 100,
                };

            default:
                return {
                    applyStyleComputed,
                    value: -percent,
                };
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
            this.align == this.ALIGN_START
                ? -scrollTop * -1
                : (scrollTop + vhLimit - offset) * -1;

        const valClamped =
            this.align == this.ALIGN_START
                ? 1 - val / offset
                : 1 - val / (windowsHeight - vhStart - vhLimit);

        return parallaxUtils.clamp(valClamped, 0, 1);
    }

    getIsNaNValue() {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;

        const documentHeight =
            this.direction === this.DIRECTION_VERTICAL
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;
        const range = this.range;
        const offset = this.offset;
        const height = this.height;

        // Prefixed align
        switch (this.align) {
            case this.ALIGN_START:
                return scrollTop / range;

            case this.ALIGN_TOP:
                return (scrollTop - offset) / range;

            case this.ALIGN_CENTER:
                return (
                    (scrollTop + (windowsHeight / 2 - height / 2) - offset) /
                    range
                );

            case this.ALIGN_BOTTOM:
                return (scrollTop + (windowsHeight - height) - offset) / range;

            case this.ALIGN_END:
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
            prop: {
                inStop: this.IN_STOP,
                inBack: this.IN_BACK,
                outStop: this.OUT_STOP,
                outBack: this.OUT_BACK,
            },
        });
    }

    getStyle(val) {
        const reverseVal = this.reverse
            ? parallaxUtils.getRetReverseValue(
                  this.propierties,
                  val,
                  this.PROP_OPACITY
              )
            : val;

        const typeVal =
            this.computationType !== this.TYPE_FIXED
                ? this.getSwitchAfterZeroValue(reverseVal)
                : reverseVal;

        switch (this.propierties) {
            case this.PROP_VERTICAL:
                return {
                    transform: `translate3d(0,0,0) translateY(${typeVal}px)`,
                };

            case this.PROP_HORIZONTAL:
                return {
                    transform: `translate3d(0,0,0) translateX(${typeVal}px)`,
                };

            case this.PROP_ROTATE:
                return {
                    transform: `translate3d(0,0,0) rotate(${typeVal}deg)`,
                };
                break;

            case this.PROP_ROTATEY:
                return {
                    transform: `translate3d(0,0,0) rotateY(${typeVal}deg)`,
                };

            case this.PROP_ROTATEX:
                return {
                    transform: `translate3d(0,0,0) rotateX(${typeVal}deg)`,
                };

            case this.PROP_ROTATEZ:
                return {
                    transform: `translate3d(0,0,0) rotateZ(${typeVal}deg)`,
                };

            case this.PROP_OPACITY:
                return { opacity: `${typeVal}` };

            case this.PROP_SCALE:
                const scaleVal = 1 + typeVal / 1000;
                return {
                    transform: `translate3d(0,0,0) scale(${scaleVal})`,
                };

            default:
                return { [this.propierties.toLowerCase()]: `${typeVal}px` };
        }
    }
}
