import { eventManager } from '../../../js/base/eventManager.js';
import { modernzier } from '../../../js/utility/modernizr.js';
import { mq } from '../../../js/base/mediaManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';
import {} from '../../../js/polyfill/closest.js';

export class parallaxItemClass {
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
        this.checkapplyElIsValid();
        if (this.computationType != 'fixed')
            this.range = this.normalizeRange(this.range);
        this.jsDelta = this.normalizeVelocity(this.jsDelta);

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

    normalizeRange(value) {
        if (value < 0) {
            return 9.9;
        } else if (value >= 10) {
            return 0.1;
        } else {
            return 10 - value;
        }
    }

    normalizeVelocity(value) {
        if (value < 1) {
            return 1;
        } else if (value >= 10) {
            return 9.9;
        } else {
            return (10 - value) * 10;
        }
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

    checkapplyElIsValid() {
        this.applyEl !== null
            ? (this.applyElIsValid = true)
            : (this.applyElIsValid = false);
    }

    isInViewport() {
        return (
            this.offset + this.height > eventManager.scrollTop() - this.gap &&
            this.offset <
                eventManager.scrollTop() +
                    (eventManager.windowsHeight() + this.gap)
        );
    }

    /////

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
                    this.setStyle(this.startValue)
                );
            } else {
                Object.assign(this.item.style, this.setStyle(this.startValue));
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

        // this.isInViewport() -> Esegui i colcoli solo se l'lemento è visibile nello schemro
        // limiterOff ->  forzo il sempre il calcolo per lementi in postion fixed/sticky e otherPos attivo
        if (!this.isInViewport() && !this.limiterOff) return;

        switch (this.computationType) {
            case 'fixed':
                const { applyStyleFixedFinal, finalVal } =
                    this.fixedValue(applyStyle);
                applyStyle = applyStyleFixedFinal;
                this.endValue = finalVal;
                break;

            default:
                switch (this.propierties) {
                    case 'opacity':
                        this.endValue = this.opacityValue().toFixed(2);
                        break;

                    default:
                        if (Number.isNaN(parseInt(this.align))) {
                            this.endValue = this.isNaNValue().toFixed(1) / 2;
                        } else {
                            this.endValue =
                                this.isANumberValue().toFixed(1) / 2;
                        }
                        break;
                }
        }

        if (!applyStyle) return;

        if (this.applyElIsValid) {
            Object.assign(this.applyEl.style, this.setStyle(this.endValue));
        } else {
            Object.assign(this.item.style, this.setStyle(this.endValue));
        }
    }

    getFixedFinalValue(
        scrollTop,
        windowsHeight,
        startPoint,
        offset,
        height,
        fixedInward,
        maxVal,
        fixedStartOff,
        applyStyleFixed,
        fixedEndOff,
        partialVal
    ) {
        const getElPos = (
            scrollTop,
            windowsHeight,
            startPoint,
            offset,
            height
        ) => {
            if (scrollTop + windowsHeight - startPoint < offset) {
                return 'OVER';
            } else if (
                scrollTop + windowsHeight - startPoint >
                offset + height
            ) {
                return 'DOWN';
            } else {
                return 'INSIDE';
            }
        };

        const elPos = getElPos(
            scrollTop,
            windowsHeight,
            startPoint,
            offset,
            height
        );

        switch (elPos) {
            case 'OVER':
                return {
                    pxVal: fixedInward ? maxVal : 0,
                    applyStyleFixedFinal: fixedStartOff
                        ? false
                        : applyStyleFixed,
                };
            case 'DOWN':
                return {
                    pxVal: fixedInward ? 0 : -maxVal,
                    applyStyleFixedFinal: fixedEndOff ? false : applyStyleFixed,
                };
            case 'INSIDE':
                return {
                    pxVal: fixedInward ? partialVal : partialVal - maxVal,
                    applyStyleFixedFinal: applyStyleFixed,
                };
        }
    }

    fixedValue(applyStyleFixed) {
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
        const { pxVal, applyStyleFixedFinal } = this.getFixedFinalValue(
            scrollTop,
            windowsHeight,
            startPoint,
            offset,
            height,
            fixedInward,
            maxVal,
            fixedStartOff,
            applyStyleFixed,
            fixedEndOff,
            partialVal
        );
        const percent = (Math.abs(pxVal) * 100) / height;

        switch (this.propierties) {
            case 'horizontal':
                return {
                    applyStyleFixedFinal,
                    finalVal:
                        -((width / 100) * percent) -
                        (selfWidth / 100) * percent,
                };

            case 'scale':
                return {
                    applyStyleFixedFinal,
                    finalVal: percent * 10,
                };

            case 'opacity':
                return {
                    applyStyleFixedFinal,
                    finalVal: percent / 100,
                };

            case 'rotate':
            case 'rotateX':
            case 'rotateY':
            case 'rotateZ':
            case 'border-width':
                return {
                    applyStyleFixedFinal,
                    finalVal: percent,
                };

            default:
                return {
                    applyStyleFixedFinal,
                    finalVal: pxVal,
                };
        }
    }

    opacityValue() {
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

    isNaNValue() {
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

    isANumberValue() {
        const scrollTop = eventManager.scrollTop();
        const windowsHeight = eventManager.windowsHeight();
        const align = this.align;
        const offset = this.offset;
        const range = this.range;

        return (scrollTop + (windowsHeight / 100) * align - offset) / range;
    }

    switchAfterZero(val) {
        const getValueOnSwitchNoPacity = (value) => {
            switch (this.onSwitch) {
                case 'stop':
                    if (
                        (!this.reverse && value > 0) ||
                        (this.reverse && value < 0)
                    ) {
                        return 0;
                    }

                case 'back':
                    if (
                        (!this.reverse && value > 0) ||
                        (this.reverse && value < 0)
                    ) {
                        return -value;
                    }

                default:
                    return value;
            }
        };

        const getElementPositionStatus = (
            elementOffset,
            limitTop,
            limitBottom
        ) => {
            if (elementOffset >= limitTop && elementOffset <= limitBottom) {
                return 'INSIDE';
            } else if (elementOffset < limitTop && !this.reverse) {
                return 'OVER';
            } else if (elementOffset < limitTop && this.reverse) {
                return 'OVER-REVERSE';
            }
        };

        const getValueByPositionBack = (positionStatus, val) => {
            switch (positionStatus) {
                case 'INSIDE':
                    const valStep1 = val > 1.999 ? 1.999 : val;
                    const valStep2 = valStep1 < 0 ? -valStep1 : valStep1;
                    const valStep3 =
                        valStep2 > 1 ? 1 - (valStep2 % 1) : valStep2;
                    return valStep3;

                case 'OVER':
                    return 0;

                case 'OVER-REVERSE':
                    return -val;

                default:
                    return val;
            }
        };

        if (this.propierties !== 'opacity') {
            return getValueOnSwitchNoPacity(val);
        } else {
            if (this.onSwitch !== 'back') return val;

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

            // Invert opacity if should be applied
            const positionStatus = getElementPositionStatus(
                elementOffset,
                limitTop,
                limitBottom
            );
            return getValueByPositionBack(positionStatus, val);
        }
    }

    setReverse(val) {
        switch (this.propierties) {
            case 'opacity':
                return 1 - val;

            default:
                return -val;
        }
    }

    setStyle(val) {
        const reverseVal = this.reverse ? this.setReverse(val) : val;
        const typeVal =
            this.computationType != 'fixed'
                ? this.switchAfterZero(reverseVal)
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
