import { eventManager } from '../../../js/base/eventManager.js';
import { modernzier } from '../../../js/utility/modernizr.js';
import { mq } from '../../../js/base/mediaManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';
import {} from '../../../js/polyfill/closest.js';
import { parallaxUtils } from './parallaxUtils.js';

export class ParallaxItemClass {
    constructor(data) {
        this.offset = 0;
        this.endValue = 0;
        this.startValue = 0;
        this.prevValue = 0;
        this.height = 0;
        this.width = 0;
        this.applyElIsValid = false;
        this.transformProperty = Modernizr.prefixed('transform');
        this.req = null;
        this.gap = 150;

        // 'PROPS'
        this.item = data.item;
        this.container = data.container;

        //Fixed prop
        this.fixedInward = data.fixedInward;
        this.fixedOffset = data.fixedOffset;
        this.fixedEndOff = data.fixedEndOff;
        this.fixedStartOff = data.fixedStartOff;

        //Lienar prop
        this.align = data.align;
        this.opacityStart = data.opacityStart;
        this.opacityEnd = data.opacityEnd;
        this.onSwitch = data.onSwitch;

        // Common prop
        this.range = data.range;
        this.computationType = data.computationType;
        this.perspective = data.perspective;
        this.applyEl = data.applyEl;
        this.triggerEl = data.triggerEl;
        this.breackpoint = data.breackpoint;
        this.queryType = data.queryType;
        this.limiterOff = data.limiterOff;
        this.jsDelta = data.jsDelta;
        this.reverse = data.reverse;
        this.ease = data.ease;
        this.propierties = data.propierties;
        this.smoothType = data.smoothType;
        //
    }

    init() {
        if (this.computationType == 'fixed') this.limiterOff = true;

        this.calcOffset();
        this.calcHeight();
        this.calcWidth();

        this.applyEl !== null
            ? (this.applyElIsValid = true)
            : (this.applyElIsValid = false);

        if (this.computationType != 'fixed')
            this.range = parallaxUtils.normalizeRange(this.range);

        this.jsDelta = parallaxUtils.normalizeVelocity(this.jsDelta);

        if (this.perspective !== null) {
            const style = {
                perspective: `${this.perspective}px`,
            };
            Object.assign(this.container.style, style);
            this.item.classList.add('parallax__item--3d');
        }

        switch (this.ease) {
            case 'linear':
                eventManager.push('scroll', this.executeParallax.bind(this));
                this.executeParallax();
                break;

            case 'smooth':
                switch (this.smoothType) {
                    case 'css':
                        this.item.classList.add('smooth-transition');
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
                break;
        }

        eventManager.push('resize', this.refresh.bind(this));
    }

    calcOffset() {
        if (this.triggerEl == null) {
            this.offset = parseInt(offset(this.container).top);
        } else {
            this.offset = parseInt(
                offset(document.querySelector(this.triggerEl)).top
            );
        }
    }

    calcHeight() {
        if (this.triggerEl == null) {
            this.height = parseInt(outerHeight(this.container));
        } else {
            this.height = parseInt(
                outerHeight(document.querySelector(this.triggerEl))
            );
        }
    }

    calcWidth() {
        this.selfWidth = parseInt(outerWidth(this.item));

        if (this.triggerEl == null) {
            this.width = parseInt(outerWidth(this.container));
        } else {
            this.width = parseInt(
                outerWidth(document.querySelector(this.triggerEl))
            );
        }
    }

    refresh() {
        this.calcOffset();
        this.calcHeight();
        this.calcWidth();

        switch (this.ease) {
            case 'linear':
                this.executeParallax();
                break;

            case 'smooth':
                switch (this.smoothType) {
                    case 'css':
                        this.executeParallax();
                        break;
                    case 'js':
                        this.smoothParallaxJs();
                        break;
                }
                break;
        }
    }

    smoothParallaxJs() {
        this.executeParallax(false);
        if (!this.req)
            this.req = requestAnimationFrame(this.onReuqestAnim.bind(this));
    }

    onReuqestAnim(timeStamp) {
        const draw = (timeStamp) => {
            this.prevValue = this.startValue;

            const s = this.startValue,
                f = this.endValue,
                v = this.jsDelta,
                val = (f - s) / v + s * 1;

            switch (this.propierties) {
                case 'opacity':
                case 'rotate':
                case 'rotateX':
                case 'rotateY':
                case 'rotateZ':
                case 'border-width':
                    this.startValue = val.toFixed(4);
                    break;

                default:
                    this.startValue = val.toFixed(1);
            }

            if (this.applyElIsValid) {
                Object.assign(
                    this.applyEl.style,
                    this.getStyle(this.startValue)
                );
            } else {
                Object.assign(this.item.style, this.getStyle(this.startValue));
            }

            // La RAF viene "rigenerata" fino a quando tutti gli elementi rimangono fermi
            if (this.prevValue == this.startValue) {
                cancelAnimationFrame(this.req);
                this.req = null;
                return;
            }

            this.req = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }

    executeParallax(applyStyle = true) {
        if (!mq[this.queryType](this.breackpoint)) return;

        if (
            !parallaxUtils.isInViewport({
                offset: this.offset,
                height: this.height,
                gap: this.gap,
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
                            this.endValue = this.getIsNaNValue().toFixed(1) / 2;
                        } else {
                            this.endValue =
                                this.getIsANumberValue().toFixed(1) / 2;
                        }
                        break;
                }
        }

        if (!applyStyle) return;

        if (this.applyElIsValid) {
            Object.assign(this.applyEl.style, this.getStyle(this.endValue));
        } else {
            Object.assign(this.item.style, this.getStyle(this.endValue));
        }
    }

    getFixedValue(applyStyle) {
        const scrollTop = eventManager.scrollTop();
        const windowsHeight = eventManager.windowsHeight();
        const height = this.height;
        const width = this.width;
        const selfWidth = this.selfWidth;
        const offset = this.offset;
        const fixedInward = this.fixedInward;
        const fixedStartOff = this.fixedStartOff;
        const fixedEndOff = this.fixedEndOff;
        const range = this.range;
        const fixedOffset = this.fixedOffset;
        const startPoint = (windowsHeight / 100) * fixedOffset; //sp = Start point calculated in vh
        const partials = -(
            scrollTop +
            windowsHeight -
            startPoint -
            (offset + height)
        );
        const maxVal = (height / 100) * range;
        const partialVal = (partials / 100) * range;

        const elementAlign = parallaxUtils.getFixedElementAlign({
            scrollTop,
            windowsHeight,
            startPoint,
            offset,
            height,
        });

        const { value, applyStyleComputed } =
            parallaxUtils.getFixedValueByAlign(elementAlign)({
                fixedInward,
                maxVal,
                fixedStartOff,
                applyStyle,
                fixedEndOff,
                partialVal,
            });

        const percent = (Math.abs(value) * 100) / height;

        switch (this.propierties) {
            case 'horizontal':
                return {
                    applyStyleComputed,
                    value:
                        -((width / 100) * percent) -
                        (selfWidth / 100) * percent,
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

            case 'rotate':
            case 'rotateX':
            case 'rotateY':
            case 'rotateZ':
            case 'border-width':
                return {
                    applyStyleComputed,
                    value: percent,
                };

            default:
                return {
                    applyStyleComputed,
                    value,
                };
        }
    }

    getOpacityValue() {
        const scrollTop = eventManager.scrollTop();
        const windowsheight = eventManager.windowsHeight();
        const offset = this.offset;
        const vhLimit = (windowsheight / 100) * this.opacityEnd;
        const vhStart =
            windowsheight - (windowsheight / 100) * this.opacityStart;

        const val =
            this.align == 'start'
                ? -scrollTop * -1
                : (scrollTop + vhLimit - offset) * -1;

        if (this.align == 'start') {
            return 1 - val / offset;
        } else {
            return 1 - val / (windowsheight - vhStart - vhLimit);
        }
    }

    getIsNaNValue() {
        const scrollTop = eventManager.scrollTop();
        const windowsheight = eventManager.windowsHeight();
        const documentHeight = eventManager.documentHeight();
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
                    (scrollTop + (windowsheight / 2 - height / 2) - offset) /
                    range
                );

            case 'bottom':
                return (scrollTop + (windowsheight - height) - offset) / range;

            case 'end':
                return -(documentHeight - (scrollTop + windowsheight)) / range;
        }
    }

    getIsANumberValue() {
        const scrollTop = eventManager.scrollTop();
        const windowsHeight = eventManager.windowsHeight();
        const align = this.align;
        const offset = this.offset;
        const range = this.range;

        return (scrollTop + (windowsHeight / 100) * align - offset) / range;
    }

    getSwitchAfterZeroValue(value) {
        if (this.propierties !== 'opacity') {
            return parallaxUtils.getValueOnSwitchNoPacity({
                switchPropierties: this.onSwitch,
                isReverse: this.reverse,
                value,
            });
        } else {
            if (this.onSwitch !== 'back') return value;

            const windowsHeight = eventManager.windowsHeight();
            const scrollTop = eventManager.scrollTop();
            const opacityEnd = this.opacityEnd;
            const opacityStart = this.opacityStart;
            const offset = this.offset;

            // start value in wh percent
            const startValue = (windowsHeight / 100) * opacityStart;

            // end value in vh percent
            const endValue = (windowsHeight / 100) * opacityEnd;

            // Are the upper and lower limits where opacity should be applied
            const limitTop = endValue - (startValue - endValue);
            const limitBottom = windowsHeight - (windowsHeight - startValue);

            // el relative offset in relation to the window
            const elementOffset = offset - scrollTop;

            const elementAlign = parallaxUtils.getOpacityElementAlign({
                isReverse: this.reverse,
                elementOffset: elementOffset,
                limitTop,
                limitBottom,
            });

            return parallaxUtils.getOpacityValueByAlign(elementAlign)(value);
        }
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

            case 'border-width':
                return { 'border-width': `${typeVal}px` };

            case 'opacity':
                return { opacity: `${typeVal}` };

            case 'scale':
                const scaleVal = 1 + typeVal / 1000;
                return {
                    [this
                        .transformProperty]: `translate3d(0,0,0) scale(${scaleVal})`,
                };
        }
    }
}
