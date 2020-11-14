import {eventManager} from "../../../js/base/eventManager.js";
import {modernzier} from "../../../js/utility/modernizr.js"
import { mq } from "../../../js/base/mediaManager.js";
import { outerHeight, outerWidth, offset } from "../../../js/utility/vanillaFunction.js";
import { } from "../../../js/polyfill/closest.js";

export class parallaxItemClass {
    constructor(data) {
        this.offset = 0
        this.endValue = 0
        this.startValue = 0
        this.prevValue = 0
        this.height = 0
        this.width = 0
        this.applyOnIsValid = false

        this.item = data.item
        this.container = data.container
        this.computationType = data.computationType
        this.fixedRange = data.fixedRange
        this.scalable = data.scalable
        this.scalableBreackpoint = data.scalableBreackpoint
        this.fromCalculatedValue = data.fromCalculatedValue
        this.applyOn = data.applyOn
        this.applyEndOff = data.applyEndOff
        this.applyStartOff = data.applyStartOff
        this.breackpoint = data.breackpoint
        this.queryType = data.queryType
        this.useOtherPosition = data.useOtherPosition
        this.limiterOff = data.limiterOff
        this.distance = data.distance
        this.jsVelocity = data.jsVelocity
        this.reverse = data.reverse
        this.reverse = data.reverse
        this.oneDirection = data.oneDirection
        this.align = data.align
        this.opacityStart = data.opacityStart
        this.opacityEnd = data.opacityEnd
        this.ease = data.ease
        this.propierties = data.propierties
        this.smoothType = data.smoothType
        //
        this.transformProperty = Modernizr.prefixed('transform')
        this.req = null
    }

    init() {
        this.calcOffset()
        this.calcHeight()
        this.calcWidth()
        this.checkApplyOnIsValid()
        this.distance = this.normalizeDistance(this.distance)
        this.jsVelocity = this.normalizeVelocity(this.jsVelocity)

        if (this.ease == 'smooth' && this.smoothType == 'css') {
            this.item.classList.add('smooth-transition')
        }

        this.linearParallax()
        this.smoothParallax()

        eventManager.push('scroll', this.linearParallax.bind(this));
        eventManager.push('scrollThrottle', this.smoothParallax.bind(this));
        eventManager.push('resize', this.refresh.bind(this));
    }

    normalizeDistance(n) {
        let _n = n

        if (_n < 0) _n = .1
        if (_n > 10) _n = 10

        return 10 - _n
    }

    normalizeVelocity(n) {
        let _n = n

        if (_n < 1) _n = 1
        if (_n > 10) _n = 10

        return (10 - _n) * 10
    }

    calcOffset() {
        if (this.useOtherPosition == null) {
            this.offset = parseInt(offset(this.container).top)
        } else {
            this.offset = parseInt(offset(document.querySelector(this.useOtherPosition)).top)
        }
    }

    calcHeight () {
        if (this.useOtherPosition == null) {
            this.height = parseInt(outerHeight(this.container));
        } else {
            this.height = parseInt(outerHeight(document.querySelector((this.useOtherPosition))))
        }
    }

    calcWidth () {
        if (this.useOtherPosition == null) {
            this.width = parseInt(outerWidth(this.container))
        } else {
            this.width = parseInt(outerWidth(document.querySelector(this.useOtherPosition)))
        }
    }

    checkApplyOnIsValid () {
        (this.applyOn !== null) ? this.applyOnIsValid = true : this.applyOnIsValid = false;
    }

    isInViewport() {
        return this.offset + this.height > eventManager.scrollTop() &&
               this.offset < eventManager.scrollTop() + eventManager.windowsHeight();
    }

    /////

    refresh() {
        this.calcOffset()
        this.calcHeight()
        this.calcWidth()
        this.linearParallax()
        this.smoothParallax()
    }

    linearParallax() {
        if (this.ease == 'linear') this.executeParallax()
    }

    smoothParallax() {
        // Se è un item con ease smooth in css calcolo ivalori e li applico
        if (this.ease == 'smooth' && this.smoothType == 'css') {
            this.executeParallax()
        }

        // Se è un item con ease smotth in js calcolo ivalori e non li applico
        if (this.ease == 'smooth' && this.smoothType == 'js') {
            this.executeParallax(false)

            if (this.req) cancelAnimationFrame(this.req);
            this.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
        }
    }

    onReuqestAnim(timeStamp) {
        const draw = (timeStamp) => {
            this.prevValue = this.startValue

            const s = this.startValue,
                f = this.endValue,
                v = this.jsVelocity,
                val = ((f - s) / v) + s * 1;


            switch (this.propierties) {
                case 'opacity':
                case 'rotate':
                case 'border-width':
                    this.startValue = val.toFixed(4);
                break;

                default:
                    this.startValue = val.toFixed(1);
            }

            if(this.applyOnIsValid) {
                Object.assign(this.applyOn.style, this.setStyle(this.startValue))
            } else {
                Object.assign(this.item.style, this.setStyle(this.startValue))
            }

            // La RAF viene "rigenerata" fino a quando tutti gli elementi rimangono fermi
            if (this.prevValue == this.startValue) return;

            if (this.req) cancelAnimationFrame(this.req);
            this.req = requestAnimationFrame(draw)
        }

        draw(timeStamp)
    }

    executeParallax(applyStyle = true) {
        if(!mq[this.queryType](this.breackpoint)) return;

        // this.isInViewport() -> Esegui i colcoli solo se l'lemento è visibile nello schemro
        // limiterOff ->  forzo il sempre il calcolo per lementi in postion fixed/sticky e otherPos attivo
        if( !this.isInViewport() && !this.limiterOff) return;

        const scrolTop = eventManager.scrollTop();
        const winHeight = eventManager.windowsHeight();
        const documentHeight = eventManager.documentHeight();

        switch (this.computationType) {
            case 'fixed':
                const partials =  - ((scrolTop + winHeight) - (this.offset + this.height));
                const endPos = ((this.height / 100) * this.fixedRange);
                const inMotion = (partials / 100) * this.fixedRange;

                if(scrolTop + winHeight < this.offset) {
                    this.endValue = (this.fromCalculatedValue) ? endPos : 0;
                    if(this.applyStartOff) applyStyle = false;

                } else if (scrolTop + winHeight > this.offset + this.height) {
                    this.endValue = (this.fromCalculatedValue) ? 0 : - endPos;
                    if(this.applyEndOff) applyStyle = false;

                } else {
                    this.endValue = (this.fromCalculatedValue) ? inMotion : inMotion - endPos;
                }

                const percent = (Math.abs(this.endValue) * 100) / this.height;
                switch (this.propierties) {
                    case 'horizontal':
                        this.endValue = -(( this.width / 100 ) * percent);
                    break;

                    case 'scale':
                        this.endValue = percent * 10;
                    break;

                    case 'opacity':
                        this.endValue = percent / 100;
                    break;

                    case 'rotate':
                    case 'border-width':
                        this.endValue = percent;
                    break;
                }
            break;

            default:
                switch (this.propierties) {
                    case 'opacity':
                        const vhLimit = (winHeight / 100 * this.opacityEnd);
                        const vhStart = winHeight - (winHeight / 100 * this.opacityStart);

                        let opacityVal = 0;
                        if (this.align == 'start') {
                            opacityVal = - scrolTop;
                        } else {
                            opacityVal = (scrolTop + vhLimit - this.offset);
                        }

                        opacityVal = opacityVal * -1;

                        if (this.align == 'start') {
                            opacityVal = 1 - opacityVal / this.offset;
                        } else {
                            opacityVal = 1 - opacityVal / (winHeight - vhStart - vhLimit);
                        }

                        this.endValue = opacityVal.toFixed(2);
                    break;

                    default:
                        if (isNaN(this.align)) {

                            // Prefixed align
                            switch (this.align) {
                                case 'start':
                                this.endValue = (scrolTop / this.distance);
                                break;

                                case 'top':
                                this.endValue = (((scrolTop - this.offset) / this.distance));
                                break;

                                case 'center':
                                this.endValue = ((((scrolTop + (winHeight / 2 - this.height / 2)) - this.offset) / this.distance));
                                break;

                                case 'bottom':
                                this.endValue = ((((scrolTop + (winHeight - this.height)) - this.offset) / this.distance));
                                break;

                                case 'end':
                                this.endValue = -((documentHeight - (scrolTop + winHeight)) / this.distance);
                                break;
                            }
                        } else {

                            // VH Align
                            this.endValue = ((((scrolTop + (winHeight / 100 * this.align)) - this.offset) / this.distance));
                        }

                        this.endValue = this.endValue.toFixed(1) / 2;

                }

        }

        if (!applyStyle) return;

        if(this.applyOnIsValid) {
            Object.assign(this.applyOn.style, this.setStyle(this.endValue))
        } else {
            Object.assign(this.item.style, this.setStyle(this.endValue))
        }
    }


    setStyle(val) {
        let style = {};

        // CHECK Reverse
        if (this.reverse) {
            switch (this.propierties) {
                case 'opacity':
                    val = 1 - val;
                    break;

                default:
                    val = -val;

            }
        }


        // CHECK ONE DIRECTION ToStop/ToBack
        if(this.fixedRange == null) {
            if (this.propierties != 'opacity') {
                switch (this.oneDirection) {
                    case 'toStop':
                    if (!this.reverse && val > 0 ||
                        this.reverse && val < 0) {
                            val = 0;
                        }
                    break;

                    case 'toBack':
                        if (!this.reverse && val > 0 ||
                            this.reverse && val < 0) {
                                val = -val;
                            }
                    break;
                }
            } else {
                if (this.oneDirection == 'toBack') {
                    if (val > 1.999) val = 1.999
                    if (val < 0) val = -val;
                    if (val > 1) val = 1 - (val % 1);
                }
            }
        }

        switch (this.propierties) {
            case 'vertical':
                if(this.scalable  && this.fixedRange != null && !mq.min(this.scalableBreackpoint)) {
                    const value = (val * 100) / this.height;
                    style[this.transformProperty] = `translate3d(0,0,0) translateY(${value}vh)`;
                } else {
                    style[this.transformProperty] = `translate3d(0,0,0) translateY(${val}px)`;
                }
                break;

            case 'horizontal':
                if(this.scalable && this.fixedRange != null && !mq.min(this.scalableBreackpoint)) {
                    const value = (val * 100) / this.width;
                    style[this.transformProperty] = `translate3d(0,0,0) translateX(${value}vw)`;
                } else {
                    style[this.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
                }
                break;

            case 'rotate':
                style[this.transformProperty] = `translate3d(0,0,0) rotate(${val}deg)`;
                break;

            case 'border-width':
                style['border-width'] = `${val}px`;
                break;

            case 'opacity':
                style['opacity'] = `${val}`;
                break;

            case 'scale':
                const scaleVal = 1 + (val / 1000);
                style[this.transformProperty] = `translate3d(0,0,0) scale(${scaleVal})`;
                break;
        }

        return style
    }
}
