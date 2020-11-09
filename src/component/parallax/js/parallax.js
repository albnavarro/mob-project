import {eventManager} from "../../../js/base/eventManager.js";
import {modernzier} from "../../../js/utility/modernizr.js"
import { mq } from "../../../js/base/mediaManager.js";

class parallaxClass {
    constructor() {
        this.s = {
            $parallaxItem: $("*[data-conponent='m-comp--parallax']"),
            itemArray: [],
            transformProperty: Modernizr.prefixed('transform'),

            // SMOOTH JS
            smoothCss: 'CSS',
            smoothJs: 'JS',
            smoothType: '',
            req: null,
            toFixedValue: 1
        }
    }

    init(smoothType = this.s.smoothCss) {
        let _smoothType = smoothType

        this.s.smoothType = _smoothType
        eventManager.push('scroll', this.linearParallax.bind(this));
        eventManager.push('scrollThrottle', this.smoothParallax.bind(this));
        eventManager.push('resize', this.updateArray.bind(this));
        eventManager.push('load', this.buildData.bind(this));
    }




    buildData() {
        function obj(item) {
            this.item = item
            this.container = item.closest('.parallax__container')
            this.offset = 0
            this.endValue = 0
            this.startValue = 0
            this.prevValue = 0
            this.height = 0

            // default: use distance ( 1 - 10 ) to compute value
            // fixed: use fixedRange to compute value
            this.computationType = (this.item.attr('data-computationType') || 'default'),


            // FIXED STYLE propierties

            // move element by percentage of item height 0 up to 100 ore more
            // 100 is 100% of item height
            // oneDirection ( toStop to back is disabled )
            // ENABLE ONLY WITH COMPUTATIONTYPE SET TO FIXED
            // MANDATORY limiterOff ENABLED
            this.fixedRange = (this.item.attr('data-fixedRange') || null),

            // use this attribute with data-fixedRange: convert value to vw and vh
            // ENABLE ONLY WITH COMPUTATIONTYPE SET TO FIXED
            this.scalable = (this.item.attr('data-scalable') || null),

            // use with data-fixedRange revert end value and start value, and substract end value to calculation
            // useful to preserve layout align on first item
            // ENABLE ONLY WITH COMPUTATIONTYPE SET TO FIXED
            this.fromCalculatedValue = (this.item.attr('data-fromCalculatedValue') || null),

            // WE HAVE NO OPACITY WITH FIXED STYLE propierties, TO BE UPDATED


            // DEFAULT propierties

            // set breackpoint
            this.breackpoint = this.item.attr('data-breackpoint') || 'desktop',
            this.queryType = this.item.attr('data-queryType') || 'min',

            // computation of element scrollTop and Height form other DOM element
            this.useOtherPosition = (this.item.attr('data-otherPos') || null)

            // updates the item even if it is out of the viewport
            // usefull on element in fixed/sticky positon and data-otherPos on.
            // mandatory whith computationType set to fixed
            this.limiterOff = (this.item.attr('data-limiterOff') || null)

            // 1 - 10 , 10 = more distance,  1 = less distance
            this.distance = (this.item.attr('data-distance') || 8)

            // 1 - 10,  10 = quick, 1 = slow
            this.jsVelocity = (this.item.attr('data-jsVelocity') || 8)

            // true - false: Bollean alla vuol make true response
            this.reverse = (this.item.attr('data-reverse') || false)

            // toStop - toBack
            // In case Opacity only toBack is active ( default is toStop)
            // In the case recomended start point at 100
            this.oneDirection = (this.item.attr('data-oneDirection') || '')

            // start - top -center - bottom - end - number: 1-100 (vh postion respect windowsHeight)
            // omn opacity work only start
            this.align = (this.item.attr('data-align') || 'top')

            // 100 = bottom , opacityStart must be grater then opacityEnd
            // with 'align=start' opacityStart have no effect
            this.opacityStart = (this.item.attr('data-opacityStart') || 100)

            // 0 = top
            // with 'align=start' opacityStart have no effect
            this.opacityEnd = (this.item.attr('data-opacityEnd') || 0)

            // linear - smooth
            // se instance smoothtype ( 'CSS' or 'JS')
            // es: parallax.init('JS');
            this.ease = (this.item.attr('data-ease') || 'linear')

            // vertical - horizontal - rotate - opacity - scale
            // with 'opacity' the align have no effect, is enabled only "start' value for element in top of page
            // with 'opacity' distance have no effect
            // with 'opacity' in 'smooth mode' uggest to use jsVelocity hight like 8
            this.propierties = (this.item.attr('data-propierties') || 'vertical')

            this.calcOffset = () => {
                if (this.useOtherPosition == null) {
                    this.offset = parseInt(this.container.offset().top)
                } else {
                    this.offset = parseInt($(this.useOtherPosition).offset().top)
                }
            }

            this.calcHeight = () => {
                if (this.useOtherPosition == null) {
                    this.height = parseInt(this.container.outerHeight())
                } else {
                    this.height = parseInt($(this.useOtherPosition).outerHeight())
                }
            }
        }

        this.s.$parallaxItem.each((index, element) => {
            const item = $(element)
            this.s.itemArray.push(new obj(item));
            this.s.itemArray[this.s.itemArray.length - 1].calcOffset()
            this.s.itemArray[this.s.itemArray.length - 1].calcHeight()
            this.s.itemArray[this.s.itemArray.length - 1].distance = this.normalizeDistance(this.s.itemArray[this.s.itemArray.length - 1].distance)
            this.s.itemArray[this.s.itemArray.length - 1].jsVelocity = this.normalizeVelocity(this.s.itemArray[this.s.itemArray.length - 1].jsVelocity)

            if (this.s.itemArray[this.s.itemArray.length - 1].ease == 'smooth' && this.s.smoothType == this.s.smoothCss) {
                this.s.itemArray[this.s.itemArray.length - 1].item.addClass('smooth-transition')
            }
        })

        for (let index = 0; index < this.s.itemArray.length; index++) {
            const element = this.s.itemArray[index];

            this.executeParallax(element)
        }

        if (this.s.smoothType == this.s.smoothJs) {
            if (this.s.req) cancelAnimationFrame(this.s.req);
            this.s.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
        }
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

    updateArray() {
        for (let index = 0; index < this.s.itemArray.length; index++) {
            const element = this.s.itemArray[index];

            element.calcOffset()
            element.calcHeight();
            this.executeParallax(element)
        }

        if (this.s.smoothType == this.s.smoothJs) {
            if (this.s.req) cancelAnimationFrame(this.s.req);
            this.s.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
        }
    }




    linearParallax() {
        for (let index = 0; index < this.s.itemArray.length; index++) {
            const element = this.s.itemArray[index];
            if (element.ease == 'linear') this.executeParallax(element)
        }
    }




    smoothParallax() {
        for (let index = 0; index < this.s.itemArray.length; index++) {
            const element = this.s.itemArray[index];

            // Se è un item con ease smooth in css calcolo ivalori e li applico
            if (element.ease == 'smooth' && this.s.smoothType == this.s.smoothCss) {
                this.executeParallax(element)
            }

            // Se è un item con ease smotth in js calcolo ivalori e non li applico
            if (element.ease == 'smooth' && this.s.smoothType == this.s.smoothJs) {
                this.executeParallax(element, false)
            }
        }

        // Se uso lo smooth js faccio partire il loop di RAF
        // Al suo interno verranno filtrati tutti gli elementi senza easing
        if (this.s.smoothType == this.s.smoothJs) {
            if (this.s.req) cancelAnimationFrame(this.s.req);
            this.s.req = requestAnimationFrame(this.onReuqestAnim.bind(this))
        }
    }


    // RAF
    onReuqestAnim(timeStamp) {
        const draw = (timeStamp) => {
            let isCompleted = true;

            for (let index = 0; index < this.s.itemArray.length; index++) {
                const element = this.s.itemArray[index];

                if (element.ease != 'linear') {
                    element.prevValue = element.startValue

                    const s = element.startValue,
                        f = element.endValue,
                        v = element.jsVelocity,
                        val = ((f - s) / v) + s * 1;

                    if (element.propierties == 'opacity') {
                        // in smooth mode use 4 value after comma so i can check very slow change
                        element.startValue = val.toFixed(4);
                    } else {
                        element.startValue = val.toFixed(this.s.toFixedValue);
                    }
                    element.item.css(this.setStyle(element, element.startValue));


                    if (element.prevValue != element.startValue) isCompleted = false;
                }
            }

            // La RAF viene "rigenerata" fino a quando tutti gli elementi rimangono fermi
            if (isCompleted) return;

            if (this.s.req) cancelAnimationFrame(this.s.req);
            this.s.req = requestAnimationFrame(draw)
        }

        draw(timeStamp)
    }



    isInViewport(element) {
        return element.offset + element.height > eventManager.scrollTop() &&
               element.offset < eventManager.scrollTop() + eventManager.windowsHeight();
    }



    executeParallax(element, applyStyle = true) {
        if(!mq[element.queryType](element.breackpoint)) return;

        // this.isInViewport(element) -> Esegui i colcoli solo se l'lemento è visibile nello schemro
        // element.limiterOff ->  forzo il sempre il calcolo per lementi in postion fixed/sticky e otherPos attivo
        if( !this.isInViewport(element) && element.limiterOff === null) return;

        switch (element.computationType) {
            case 'fixed':
                const scrolTop = eventManager.scrollTop();
                const winHeight = eventManager.windowsHeight();
                const endPos = ((element.height / 100) * element.fixedRange);
                const partials =  - ((scrolTop + winHeight) - (element.offset + element.height))
                const inMotion = (partials / 100) * element.fixedRange;

                if(scrolTop + winHeight < element.offset) {
                    element.endValue = (element.fromCalculatedValue) ? endPos : 0;

                } else if (scrolTop + winHeight > element.offset + element.height) {
                    element.endValue = (element.fromCalculatedValue) ? 0 : - endPos;

                } else {
                    element.endValue = (element.fromCalculatedValue) ? inMotion : inMotion - endPos;
                }
            break;

            default:
                switch (element.propierties) {
                    case 'opacity':
                        const vhLimit = (eventManager.windowsHeight() / 100 * element.opacityEnd);
                        const vhStart = eventManager.windowsHeight() - (eventManager.windowsHeight() / 100 * element.opacityStart);

                        let opacityVal = 0;
                        if (element.align == 'start') {
                            opacityVal = -eventManager.scrollTop();
                        } else {
                            opacityVal = (eventManager.scrollTop() + vhLimit - element.offset);
                        }

                        opacityVal = opacityVal * -1;

                        if (element.align == 'start') {
                            opacityVal = 1 - opacityVal / element.offset;
                        } else {
                            opacityVal = 1 - opacityVal / (eventManager.windowsHeight() - vhStart - vhLimit);
                        }

                        element.endValue = opacityVal.toFixed(2);
                    break;

                    default:
                        if (isNaN(element.align)) {

                            // Prefixed align
                            switch (element.align) {
                                case 'start':
                                element.endValue = (eventManager.scrollTop() / element.distance);
                                break;

                                case 'top':
                                element.endValue = (((eventManager.scrollTop() - element.offset) / element.distance));
                                break;

                                case 'center':
                                element.endValue = ((((eventManager.scrollTop() + (eventManager.windowsHeight() / 2 - element.height / 2)) - element.offset) / element.distance));
                                break;

                                case 'bottom':
                                element.endValue = ((((eventManager.scrollTop() + (eventManager.windowsHeight() - element.height)) - element.offset) / element.distance));
                                break;

                                case 'end':
                                element.endValue = -((eventManager.documentHeight() - (eventManager.scrollTop() + eventManager.windowsHeight())) / element.distance);
                                break;
                            }
                        } else {

                            // VH Align
                            element.endValue = ((((eventManager.scrollTop() + (eventManager.windowsHeight() / 100 * element.align)) - element.offset) / element.distance));
                        }

                        element.endValue = element.endValue.toFixed(this.s.toFixedValue) / 2;

                }

        }

        if (!applyStyle) return;
        element.item.css(this.setStyle(element, element.endValue));
    }



    setStyle(element, val) {
        let style = {};

        // CHECK Reverse
        if (element.reverse) {
            switch (element.propierties) {
                case 'opacity':
                    val = 1 - val;
                    break;

                default:
                    val = -val;

            }
        }


        // CHECK ONE DIRECTION ToStop/ToBack
        if(element.fixedRange == null) {
            if (element.propierties != 'opacity') {
                switch (element.oneDirection) {
                    case 'toStop':
                    if (!element.reverse && val > 0 ||
                        element.reverse && val < 0) {
                            val = 0;
                        }
                        break;

                        case 'toBack':
                        if (!element.reverse && val > 0 ||
                            element.reverse && val < 0) {
                                val = -val;
                            }
                            break;
                        }
            } else {
                if (element.oneDirection == 'toBack') {
                    if (val > 1.999) val = 1.999
                    if (val < 0) val = -val;
                    if (val > 1) val = 1 - (val % 1);
                }
            }
        }

        switch (element.propierties) {
            case 'vertical':
                if(element.scalable != null && element.fixedRange != null) {
                    const value = (val * element.fixedRange) / element.height;
                    style[this.s.transformProperty] = `translate3d(0,0,0) translateY(${value}vh)`;
                } else {
                    style[this.s.transformProperty] = `translate3d(0,0,0) translateY(${val}px)`;
                }
                break;

            case 'horizontal':
                if(element.scalable != null && element.fixedRange != null) {
                    const value = (val * element.fixedRange) / element.height;
                    style[this.s.transformProperty] = `translate3d(0,0,0) translateX(${value}vw)`;
                } else {
                    style[this.s.transformProperty] = `translate3d(0,0,0) translateX(${val}px)`;
                }
                break;

            case 'rotate':
                style[this.s.transformProperty] = `translate3d(0,0,0) rotate(${val}deg)`;
                break;

            case 'opacity':
                style['opacity'] = `${val}`;
                break;

            case 'scale':
                // NormalizeValue
                const scaleVal = 1 + (val / 1000);
                style[this.s.transformProperty] = `translate3d(0,0,0) scale(${scaleVal})`;
                break;
        }

        return style
    }



    recalcPosition() {
        this.updateArray();
    }
}

export const parallax = new parallaxClass()
