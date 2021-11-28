import { eventManager } from '../../../js/base/eventManager.js';
import { modernzier } from '../../../js/utility/modernizr.js';
import { mq } from '../../../js/base/mediaManager.js';
import { offset, position } from '../../../js/utility/vanillaFunction.js';
import { parallaxUtils } from './parallaxUtils.js';

export class ParallaxItemClass {
    constructor(data) {
        this.offset = 0;
        this.endValue = 0;
        this.startValue = 0;
        this.prevValue = 0;
        this.height = 0;
        this.width = 0;
        this.scrollerScroll = 0;
        this.scrollerHeight = 0;
        this.transformProperty = Modernizr.prefixed('transform');
        this.req = null;
        this.gap = 150;

        // 'PROPS'
        this.item = data.item;
        this.direction = data.direction || 'vertical';
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
        this.align = data.align || 'center';

        // Opacity Prop
        this.opacityStart = data.opacityStart || 100;
        this.opacityEnd = data.opacityEnd || 0;
        this.onSwitch = data.onSwitch || false;

        // Common prop
        this.computationType = data.computationType || 'default';
        this.range =
            data.range ||
            (() => (this.computationType === 'default' ? 8 : 100))();
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
        this.propierties = data.propierties || 'vertical';
        this.easeType = data.easeType || 'js';
        //
    }

    init() {
        if (this.computationType == 'fixed') this.limiterOff = true;

        this.item.classList.add('parallax__item');
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();
        this.getScreenHeight();

        if (this.computationType != 'fixed')
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
                case 'css':
                    this.item.style.transition =
                        'transform 1s cubic-bezier(0.305, 0.55, 0.47, 1.015)';
                    eventManager.push(
                        'scrollThrottle',
                        this.executeParallax.bind(this)
                    );
                    this.executeParallax();
                    break;
                case 'js':
                    eventManager.push(
                        'scroll',
                        this.smoothParallaxJs.bind(this)
                    );
                    this.smoothParallaxJs();
                    break;
            }
        } else {
            eventManager.push('scroll', this.executeParallax.bind(this));
            this.executeParallax();
        }
        eventManager.push('resize', this.refresh.bind(this));
    }

    calcOffset() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;

        if (this.direction === 'vertical') {
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
            this.direction === 'vertical'
                ? (this.offset -= parseInt(offset(this.screen).top))
                : (this.offset -= parseInt(position(this.screen).left));
        }
    }

    calcHeight() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;
        this.height =
            this.direction === 'vertical'
                ? parseInt(el.offsetHeight)
                : parseInt(el.offsetWidth);
    }

    calcWidth() {
        const el = this.scrollTrigger === null ? this.item : this.scrollTrigger;
        this.width =
            this.direction === 'vertical'
                ? parseInt(el.offsetWidth)
                : parseInt(el.offsetHeight);
    }

    getScrollerOffset() {
        if (this.scroller === window) {
            this.scrollerScroll =
                this.direction === 'vertical'
                    ? this.scroller.pageYOffset
                    : this.scroller.pageXOffset;
        } else {
            this.scrollerScroll =
                this.direction === 'vertical'
                    ? -offset(this.scroller).top
                    : -offset(this.scroller).left;
        }
    }

    getScreenHeight() {
        if (this.screen === window) {
            this.scrollerHeight =
                this.direction === 'vertical'
                    ? window.innerHeight
                    : window.innerWidth;
        } else {
            this.scrollerHeight =
                this.direction === 'vertical'
                    ? parseInt(this.screen.offsetHeight)
                    : parseInt(this.screen.offsetWidth);
        }
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
                case 'css':
                    this.executeParallax();
                    break;
                case 'js':
                    this.smoothParallaxJs();
                    break;
            }
        } else {
            this.executeParallax();
        }
    }

    smoothParallaxJs() {
        this.executeParallax(false);
        if (!this.req)
            this.req = requestAnimationFrame(this.onReuqestAnim.bind(this));
    }

    onReuqestAnim() {
        const draw = () => {
            this.prevValue = this.startValue;

            const s = this.startValue,
                f = this.endValue,
                v = this.scrub,
                val = (f - s) / v + s * 1;

            this.startValue = val.toFixed(3);
            this.updateStyle(this.startValue);

            // La RAF viene "rigenerata" fino a quando tutti gli elementi rimangono fermi
            if (this.prevValue == this.startValue) {
                cancelAnimationFrame(this.req);
                this.req = null;
                this.updateStyle(this.endValue);
                return;
            }

            this.req = requestAnimationFrame(draw);
        };

        draw();
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
            case 'fixed':
                const { applyStyleComputed, value } =
                    this.getFixedValue(applyStyle);
                applyStyle = applyStyleComputed;
                this.endValue = value;
                break;

            default:
                switch (this.propierties) {
                    case 'opacity':
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
        this.updateStyle(this.endValue);
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

        const maxVal = (height / 100) * range;
        const partialVal = (partials / 100) * range;

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

        const percent = (Math.abs(value) * 100) / height;

        switch (this.propierties) {
            case 'horizontal':
            case 'vertical':
                return {
                    applyStyleComputed,
                    value: -((width / 100) * percent),
                };

            case 'scale':
                return {
                    applyStyleComputed,
                    value: percent * 10,
                };

            case 'opacity':
                return {
                    applyStyleComputed,
                    value: percent / 100,
                };

            default:
                return {
                    applyStyleComputed,
                    value: percent,
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
            this.align == 'start'
                ? -scrollTop * -1
                : (scrollTop + vhLimit - offset) * -1;

        const valClamped =
            this.align == 'start'
                ? 1 - val / offset
                : 1 - val / (windowsHeight - vhStart - vhLimit);

        return parallaxUtils.clamp(valClamped, 0, 1);
    }

    getIsNaNValue() {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;

        const documentHeight =
            this.direction === 'vertical'
                ? document.documentElement.scrollHeight
                : document.documentElement.scrollWidth;
        const range = this.range;
        const offset = this.offset;
        const height = this.height;

        // Prefixed align
        switch (this.align) {
            case 'start':
                return scrollTop / range;

            case 'top':
                return (scrollTop - offset) / range;

            case 'center':
                return (
                    (scrollTop + (windowsHeight / 2 - height / 2) - offset) /
                    range
                );

            case 'bottom':
                return (scrollTop + (windowsHeight - height) - offset) / range;

            case 'end':
                return -(documentHeight - (scrollTop + windowsHeight)) / range;
        }
    }

    getIsANumberValue() {
        const scrollTop = this.scrollerScroll;
        const windowsHeight = this.scrollerHeight;

        const align = this.align;
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
            this.computationType != 'fixed'
                ? this.getSwitchAfterZeroValue(reverseVal)
                : reverseVal;

        switch (this.propierties) {
            case 'vertical':
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) translateY(${typeVal}px)`,
                };

            case 'horizontal':
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) translateX(${typeVal}px)`,
                };

            case 'rotate':
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) rotate(${typeVal}deg)`,
                };
                break;

            case 'rotateY':
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) rotateY(${typeVal}deg)`,
                };

            case 'rotateX':
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) rotateX(${typeVal}deg)`,
                };

            case 'rotateZ':
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) rotateZ(${typeVal}deg)`,
                };

            case 'opacity':
                return { opacity: `${typeVal}` };

            case 'scale':
                const scaleVal = 1 + typeVal / 1000;
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) scale(${scaleVal.toFixed(
                        3
                    )})`,
                };

            default:
                return { [this.propierties]: `${typeVal}px` };
        }
    }
}
