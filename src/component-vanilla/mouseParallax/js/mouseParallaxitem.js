import {mouseManager} from "../../../js/base/mouseManager.js";
import {eventManager} from "../../../js/base/eventManager.js";
import { outerHeight, outerWidth, offset } from "../../../js/utility/vanillaFunction.js";

export class mouseParallaxItemClass {
    constructor(data) {
        this.item = data.item
        this.centerToViewoport = data.centerToViewoport
        this.range = data.range
        this.container = data.container
        this.height = 0
        this.width = 0
        this.offSetTop = 0
        this.offSetLeft = 0
    }

    init() {
        this.getDimension()

        if(!Modernizr.touchevents) {
            mouseManager.push('mousemove', () => this.onMove())
            eventManager.push('resize', () => this.getDimension())
            mouseManager.push('scroll', () => this.onMove())
        }


    }

    getDimension() {
        this.height = outerHeight(this.item)
        this.width = outerWidth(this.item)
        this.offSetTop = offset(this.container).top
        this.offSetLeft = offset(this.container).left
    }

    onMove() {
        let vw = 0
        let vh = 0

        if(this.centerToViewoport) {
            vw = eventManager.windowsWidth()
            vh = eventManager.windowsHeight()
        } else {
            vw = this.width
            vh = this.height
        }

        let x = mouseManager.clientX()
        let y = 0
        ;(!this.centerToViewoport) ? y = mouseManager.pageY() : y = mouseManager.clientY()


        let ax = 0
        let ay = 0
        if(this.centerToViewoport) {
            ax = ( x - (vw / 2)) / this.range;
            ay = ( y - (vh / 2)) / this.range;
        } else {
            ax = ((x - this.offSetLeft) - (vw / 2)) / this.range;
            ay = ((y - this.offSetTop) - (vh / 2)) / this.range;
        }

        const style = {
            'transform': `translate3D(${ax}px, ${ay}px, 0)`
        }
        Object.assign(this.item.style, style)

    }
}
