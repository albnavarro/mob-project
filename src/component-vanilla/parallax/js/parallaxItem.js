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
        this.fixedInward = data.fixedInward
        this.fixedOffset = data.fixedOffset
        this.fixedEndOff = data.fixedEndOff
        this.fixedStartOff = data.fixedStartOff

        //Lienar prop
        this.align = data.align
        this.opacityStart = data.opacityStart
        this.opacityEnd = data.opacityEnd
        this.onSwitch = data.onSwitch

        // Common prop
        this.range = data.range
        this.computationType = data.computationType
        this.perspective = data.perspective
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
        if(this.computationType == 'fixed') this.limiterOff = true

        this.calcOffset()
        this.calcHeight()
        this.calcWidth()
        this.checkapplyElIsValid()
        if(this.computationType != 'fixed') this.range = this.normalizeRange(this.range)
        this.jsDelta = this.normalizeVelocity(this.jsDelta)

        if(this.perspective !== null) {
            const style = {
                'perspective': `${this.perspective}px`
            }
            Object.assign(this.container.style, style)
            this.item.classList.add('parallax__item--3d')
        }

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
                case 'rotateX':
                case 'rotateY':
                case 'rotateZ':
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
        const scrollTop = eventManager.scrollTop()
        const windowsHeight = eventManager.windowsHeight()
        const height = this.height
        const width = this.width
        const selfWidth = this.selfWidth
        const offset = this.offset
        const fixedInward = this.fixedInward
        const fixedStartOff = this.fixedStartOff
        const fixedEndOff = this.fixedEndOff
        const range = this.range
        const fixedOffset = this.fixedOffset

        /*
        sp = Start point calculated in vh
        */
        const startPoint =  ((windowsHeight / 100) * fixedOffset)
        const partials =  - ((scrollTop + windowsHeight - startPoint) - (offset + height))
        const maxVal = (height / 100) * range
        const partialVal = (partials / 100) * range

        if(scrollTop + windowsHeight - startPoint < offset) {
            val = (fixedInward) ? maxVal : 0;
            if(fixedStartOff) applyStyle = false;

        } else if (scrollTop + windowsHeight - startPoint > offset + height) {
            val = (fixedInward) ? 0 : - maxVal;
            if(fixedEndOff) applyStyle = false;

        } else {
            val = (fixedInward) ? partialVal : partialVal - maxVal;
        }

        /*
        percent = percent value
        */
        const percent = (Math.abs(val) * 100) / height;
        switch (this.propierties) {
            case 'horizontal':
                val = -(( width / 100 ) * percent) - ((selfWidth / 100) * percent);
            break;

            case 'scale':
                val = percent * 10;
            break;

            case 'opacity':
                val = percent / 100;
            break;

            case 'rotate':
            case 'rotateX':
            case 'rotateY':
            case 'rotateZ':
            case 'border-width':
                val = percent;
            break;
        }

        return {applyStyle, val}
    }

    opacityValue() {
        let val = 0
        const scrollTop = eventManager.scrollTop()
        const windowsheight = eventManager.windowsHeight()
        const offset = this.offset
        const vhLimit = (windowsheight / 100 * this.opacityEnd)
        const vhStart = windowsheight - (windowsheight / 100 * this.opacityStart)

        if (this.align == 'start') {
            val = - scrollTop;
        } else {
            val = (scrollTop + vhLimit - offset);
        }

        val = val * -1;

        if (this.align == 'start') {
            val = 1 - val / offset;
        } else {
            val = 1 - val / (windowsheight - vhStart - vhLimit);
        }

        return val.toFixed(2);
    }

    isNaNValue() {
        let val = 0
        const scrollTop = eventManager.scrollTop()
        const windowsheight = eventManager.windowsHeight()
        const documentHeight = eventManager.documentHeight()
        const range = this.range
        const offset = this.offset
        const height = this.height

        // Prefixed align
        switch (this.align) {
            case 'start':
            val = (scrollTop / range)
            break;

            case 'top':
            val = (scrollTop - offset) / range;
            break;

            case 'center':
            val = ((scrollTop + (windowsheight / 2 - height / 2)) - offset) / range;
            break;

            case 'bottom':
            val = ((scrollTop + (windowsheight - height)) - offset) / range;
            break;

            case 'end':
            val = -(documentHeight - (scrollTop + windowsheight)) / range;
            break;
        }

        return val
    }

    isANumberValue() {
        const scrollTop = eventManager.scrollTop()
        const windowsHeight = eventManager.windowsHeight()
        const align = this.align
        const offset = this.offset
        const range = this.range

        return (((scrollTop + (windowsHeight / 100 * align)) - offset) / range);
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
                const windowsHeight = eventManager.windowsHeight()
                const scrollTop = eventManager.scrollTop()
                const opacityEnd = this.opacityEnd
                const opacityStart = this.opacityStart
                const offset = this.offset

                /*
                start value in wh percent
                */
                const startValue = (windowsHeight / 100 * opacityStart)

                /*
                end value in vh percent
                */
                const endValue = (windowsHeight / 100 * opacityEnd)

                /*
                Are the upper and lower limits where opacity should be applied
                */
                const limitTop = endValue - (startValue  - endValue)
                const limitBottom = windowsHeight - (windowsHeight - startValue)
                /*
                el relative offset in relation to the window
                */
                const relOffset = offset - scrollTop

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
        if(this.computationType != 'fixed') val = this.switchAfterZero(val)


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

            case 'rotateY':
                style[this.transformProperty] = `translate3d(0,0,0) rotateY(${val}deg)`;
                break;

            case 'rotateX':
                style[this.transformProperty] = `translate3d(0,0,0) rotateX(${val}deg)`;
                break;

            case 'rotateZ':
                style[this.transformProperty] = `translate3d(0,0,0) rotateZ(${val}deg)`;
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
