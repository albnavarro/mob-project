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
        this.applyElIsValid = false
        this.transformProperty = Modernizr.prefixed('transform')
        this.req = null

        // 'PROPS'
        this.item = data.item
        this.container = data.container

        //Fixed prop
        this.fixedRange = data.fixedRange
        this.fixedInward = data.fixedInward
        this.fixedOffset = data.fixedOffset
        this.fixedEndOff = data.fixedEndOff
        this.fixedStartOff = data.fixedStartOff

        //Lienar prop
        this.range = data.range
        this.align = data.align
        this.opacityStart = data.opacityStart
        this.opacityEnd = data.opacityEnd
        this.onSwitch = data.onSwitch

        // Common prop
        this.computationType = data.computationType
        this.applyEl = data.applyEl
        this.triggerEl = data.triggerEl
        this.breackpoint = data.breackpoint
        this.queryType = data.queryType
        this.limiterOff = data.limiterOff
        this.jsDelta = data.jsDelta
        this.reverse = data.reverse
        this.ease = data.ease
        this.propierties = data.propierties
        this.smoothType = data.smoothType
        //
    }

    init() {
        this.calcOffset()
        this.calcHeight()
        this.calcWidth()
        this.checkapplyElIsValid()
        this.range = this.normalizeRange(this.range)
        this.jsDelta = this.normalizeVelocity(this.jsDelta)

        switch (this.ease) {
            case 'linear':
                eventManager.push('scroll', this.executeParallax.bind(this));
                this.executeParallax()
            break;

            case 'smooth':
                switch (this.smoothType) {
                    case 'css':
                        this.item.classList.add('smooth-transition')
                        eventManager.push('scrollThrottle', this.executeParallax.bind(this));
                        this.executeParallax()
                    break;
                    case 'js':
                        eventManager.push('scrollThrottle', this.smoothParallaxJs.bind(this));
                        this.smoothParallaxJs()
                    break;
                }
            break;
        }

        eventManager.push('resize', this.refresh.bind(this));
    }

    normalizeRange(n) {
        let _n = n

        if (_n < 0) _n = .1
        if (_n >= 10) _n = 9.9

        return 10 - _n
    }

    normalizeVelocity(n) {
        let _n = n

        if (_n < 1) _n = 1
        if (_n >= 10) _n = 9.9

        return (10 - _n) * 10
    }

    calcOffset() {
        if (this.triggerEl == null) {
            this.offset = parseInt(offset(this.container).top)
        } else {
            this.offset = parseInt(offset(document.querySelector(this.triggerEl)).top)
        }
    }

    calcHeight () {
        if (this.triggerEl == null) {
            this.height = parseInt(outerHeight(this.container));
        } else {
            this.height = parseInt(outerHeight(document.querySelector((this.triggerEl))))
        }
    }

    calcWidth () {
        this.selfWidth = parseInt(outerWidth(this.item))

        if (this.triggerEl == null) {
            this.width = parseInt(outerWidth(this.container))
        } else {
            this.width = parseInt(outerWidth(document.querySelector(this.triggerEl)))
        }
    }

    checkapplyElIsValid () {
        (this.applyEl !== null) ? this.applyElIsValid = true : this.applyElIsValid = false;
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

        switch (this.ease) {
            case 'linear':
                this.executeParallax()
            break;

            case 'smooth':
                switch (this.smoothType) {
                    case 'css':
                        this.executeParallax()
                    break;
                    case 'js':
                        this.smoothParallaxJs()
                    break;
                }
            break;
        }
    }

    smoothParallaxJs() {
        this.executeParallax(false)
        if (this.req) cancelAnimationFrame(this.req);
        this.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
    }

    onReuqestAnim(timeStamp) {
        const draw = (timeStamp) => {
            this.prevValue = this.startValue

            const s = this.startValue,
                f = this.endValue,
                v = this.jsDelta,
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

            if(this.applyElIsValid) {
                Object.assign(this.applyEl.style, this.setStyle(this.startValue))
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

        switch (this.computationType) {
            case 'fixed':
                const fixedResult = this.fixedValue(applyStyle)
                applyStyle = fixedResult.applyStyle
                this.endValue = fixedResult.val
            break;

            default:
                switch (this.propierties) {
                    case 'opacity':
                        this.endValue = this.opacityValue()
                    break;

                    default:
                        if (isNaN(this.align)) {
                            this.endValue = this.isNaNValue().toFixed(1) / 2
                        } else {
                            this.endValue = this.isANumberValue().toFixed(1) / 2
                        }
                    break;
                }
        }

        if (!applyStyle) return;

        if(this.applyElIsValid) {
            Object.assign(this.applyEl.style, this.setStyle(this.endValue))
        } else {
            Object.assign(this.item.style, this.setStyle(this.endValue))
        }
    }

    fixedValue(applyStyle) {
        let val = 0
        const s = eventManager.scrollTop()
        const wh = eventManager.windowsHeight()
        const h = this.height
        const w = this.width
        const sw = this.selfWidth
        const o = this.offset
        const fc = this.fixedInward
        const as = this.fixedStartOff
        const ae = this.fixedEndOff
        const fx = this.fixedRange

        /*
        sp = Start point calculated in vh
        */
        const sp =  ((wh / 100) * this.fixedOffset)
        const partials =  - ((s + wh - sp) - (o + h))
        const ep = ((h / 100) * fx)
        const m = (partials / 100) * fx

        if(s + wh - sp < o) {
            val = (fc) ? ep : 0;
            if(as) applyStyle = false;

        } else if (s + wh - sp > o + h) {
            val = (fc) ? 0 : - ep;
            if(ae) applyStyle = false;

        } else {
            val = (fc) ? m : m - ep;
        }

        /*
        p = percent value
        */
        const p = (Math.abs(val) * 100) / h;
        switch (this.propierties) {
            case 'horizontal':
                val = -(( w / 100 ) * p) - ((sw / 100) * p);
            break;

            case 'scale':
                val = p * 10;
            break;

            case 'opacity':
                val = p / 100;
            break;

            case 'rotate':
            case 'border-width':
                val = p;
            break;
        }

        return {applyStyle, val}
    }

    opacityValue() {
        let val = 0
        const st = eventManager.scrollTop()
        const wh = eventManager.windowsHeight()
        const o = this.offset
        const vhLimit = (wh / 100 * this.opacityEnd)
        const vhStart = wh - (wh / 100 * this.opacityStart)

        if (this.align == 'start') {
            val = - st;
        } else {
            val = (st + vhLimit - o);
        }

        val = val * -1;

        if (this.align == 'start') {
            val = 1 - val / o;
        } else {
            val = 1 - val / (wh - vhStart - vhLimit);
        }

        return val.toFixed(2);
    }

    isNaNValue() {
        let val = 0
        const st = eventManager.scrollTop()
        const wh = eventManager.windowsHeight()
        const dh = eventManager.documentHeight()
        const ds = this.range
        const o = this.offset
        const h = this.height

        // Prefixed align
        switch (this.align) {
            case 'start':
            val = (st / ds)
            break;

            case 'top':
            val = (st - o) / ds;
            break;

            case 'center':
            val = ((st + (wh / 2 - h / 2)) - o) / ds;
            break;

            case 'bottom':
            val = ((st + (wh - h)) - o) / ds;
            break;

            case 'end':
            val = -(dh - (st + wh)) / ds;
            break;
        }

        return val
    }

    isANumberValue() {
        const st = eventManager.scrollTop()
        const wh = eventManager.windowsHeight()
        const al = this.align
        const of = this.offset
        const ds = this.range

        return (((st + (wh / 100 * al)) - of) / ds);
    }

    switchAfterZero(val) {
        if (this.propierties != 'opacity') {
            switch (this.onSwitch) {
                case 'stop':
                    if (!this.reverse && val > 0 ||
                        this.reverse && val < 0) {
                        val = 0;
                    }
                break;

                case 'back':
                    if (!this.reverse && val > 0 ||
                        this.reverse && val < 0) {
                        val = -val;
                    }
                break;
            }
        } else {
            if (this.onSwitch == 'back') {
                const wh = eventManager.windowsHeight()
                const st = eventManager.scrollTop()
                const oe = this.opacityEnd
                const os = this.opacityStart
                const of = this.offset

                /*
                start value in wh percent
                */
                const sv = (wh / 100 * os)

                /*
                end value in vh percent
                */
                const ev = (wh / 100 * oe)

                /*
                Are the upper and lower limits where opacity should be applied
                */
                const limitTop = ev - (sv  - ev)
                const limitBottom = wh - (wh - sv)
                /*
                el relative offset in relation to the window
                */
                const relOffset = of - st

                /*
                Invert opacity if should be applied
                */
                if(relOffset >= limitTop && relOffset <= limitBottom) {
                    if (val > 1.999) val = 1.999
                    if (val < 0) val = - val;
                    if (val > 1) val = 1 - (val % 1);
                } else if ( relOffset < limitTop && !this.reverse) {
                    val = 0
                } else if ( relOffset < limitTop && this.reverse) {
                    val = val = - val
                }
            }
        }

        return val
    }

    setReverse(val) {
        if (this.reverse) {
            switch (this.propierties) {
                case 'opacity':
                    val = 1 - val;
                    break;

                default:
                    val = -val;
            }
        }
        return val
    }


    setStyle(val) {
        let style = {};

        // CHECK Reverse
        val = this.setReverse(val)
        if(this.fixedRange == null) val = this.switchAfterZero(val)


        switch (this.propierties) {
            case 'vertical':
                style[this.transformProperty] = `translate3d(0,0,0) translateY(${val}px)`;
            break;

            case 'horizontal':
                style[this.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
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
