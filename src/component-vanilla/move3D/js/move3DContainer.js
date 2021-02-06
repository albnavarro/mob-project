import {mouseManager} from "../../../js/base/mouseManager.js";
import {eventManager} from "../../../js/base/eventManager.js";
import {move3DitemClass} from "./move3Ditem.js";
import { outerHeight, outerWidth, offset } from "../../../js/utility/vanillaFunction.js";

export class move3DContainerClass {
    constructor(data) {
        this.item = data.item
        this.scene = this.item.querySelector('.move3D__scene')
        this.container = this.item.querySelector('.move3D__container')
        this.children = this.item.querySelectorAll('.move3D__item')
        this.centerToViewoport = data.centerToViewoport
        this.perspective = data.perspective
        this.xDepth = data.xDepth
        this.yDepth = data.yDepth
        this.xLimit = data.xLimit
        this.yLimit = data.yLimit
        this.drag = data.drag
        this.height = 0
        this.width = 0
        this.offsetLeft = 0
        this.offSetTop = 0
        this.delta = 0
        this.limit = 0
        this.lastX = 0
        this.dragX = 0
        this.lastY = 0
        this.dragY = 0
        this.onDrag = false
        this.firstDrag = false
        this.pageY = false
        this.childrenInstances = []
    }

    init() {
        if(Modernizr.touchevents && !this.drag) return

        if(!this.centerToViewoport && !this.drag) this.pageY = true

        const itemArray = Array.from(this.children);
        const dataArray = itemArray.map(item => {
            return this.getItemData(this.item, item);
        })

        for (const item of dataArray) {
            const move3Ditem = new move3DitemClass(item);
            this.childrenInstances.push(move3Ditem);
            move3Ditem.init();
        }

        this.setDepth()
        this.getDimension()

        mouseManager.push('mousemove', () => this.onMove())
        eventManager.push('resize', () => this.getDimension())

        if(this.pageY) {
            mouseManager.push('scroll', () => this.onMove())
        }

        if(this.drag) {
            this.dragX = eventManager.windowsWidth()/2
            this.dragY = eventManager.windowsHeight()/2
            this.item.classList.add('move3D--drag')

            mouseManager.push('mousedown', () => this.onMouseDown())
            mouseManager.push('mouseup', () => this.onMouseUp())

            mouseManager.push('touchstart', () => this.onMouseDown())
            mouseManager.push('touchend', () => this.onMouseUp())
            mouseManager.push('touchmove', () => this.onMove())
        }
    }

    getDimension() {
        this.height = outerHeight(this.item)
        this.width = outerWidth(this.item)
        this.offsetLeft = offset(this.item).left
        this.offSetTop = offset(this.item).top
    }

    getItemData(container, item) {
        const data = {};
        data.item = item
        data.container = container
        data.depth = item.getAttribute('data-depth') || 0
        // additional rotate
        data.rotate = item.getAttribute('data-rotate') || null
        data.direction = item.getAttribute('data-direction') || null
        data.range = item.getAttribute('data-range') || 0
        data.initialRotate = item.getAttribute('data-initialRotate') || 0
        //
        data.animate = item.getAttribute('data-animate') || 0
        return data;
    }

    setDepth() {
        const style = {
            'perspective': `${this.perspective}px`
        }
        Object.assign(this.scene.style, style)
    }

    onMove() {
        let vw = 0
        let vh = 0

        if(this.centerToViewoport || this.drag) {
            vw = eventManager.windowsWidth()
            vh = eventManager.windowsHeight()
        } else {
            vw = this.width
            vh = this.height
        }

        let x = mouseManager.clientX()
        let y = 0
        ;(this.pageY) ? y = mouseManager.pageY() : y = mouseManager.clientY()

        if(Modernizr.touchevents) {
            x = mouseManager.pageX()
            y = mouseManager.pageY()
        }

        let xgap = 0
        let ygap = 0
        if( this.drag && this.onDrag ) {
            if(this.firstDrag) {
                xgap = 0
                ygap = 0
                this.firstDrag = false
            } else {
                xgap = x - this.lastX
                ygap = y - this.lastY
            }

            this.dragX += xgap
            x =  this.dragX;

            this.dragY += ygap
            y =  this.dragY
        }

        /*
        ax = grado di rotazione sull'asse X
        ay = grado di rotazione sull'asse Y
        */
        let ax = 0
        let ay = 0

        if(this.centerToViewoport || this.drag) {
            ax = - ( (vw / 2) - x ) / this.xDepth;
            ay = ( (vh / 2) - y ) / this.yDepth;
        } else {
            ax = - ( (vw / 2) - (x - this.offsetLeft) ) / this.xDepth;
            ay = ( (vh / 2) - (y - this.offSetTop) ) / this.yDepth;
        }

        if (Math.abs(ax) > this.xLimit) {
            (ax > 0) ? ax = this.xLimit : ax = -this.xLimit
            /*
            prevent stall when angle reaches the limit
            */
            this.dragX -= xgap
        }

        if (Math.abs(ay) > this.yLimit) {
            (ay > 0) ? ay = this.yLimit : ay = -this.yLimit
            /*
            prevent stall when angle reaches the limit
            */
            this.dragY -= ygap
        }

        this.lastX = mouseManager.clientX()
        ;(this.pageY) ? this.lastY = mouseManager.pageY() : this.lastY = mouseManager.clientY()

        if(Modernizr.touchevents) {
            this.lastX = mouseManager.pageX()
            this.lastY =  mouseManager.pageY()
        }

        /*
        Calcolo il valore da passare ai componenti figli per animarre l'asse Z.
        Il delta sarà l'ipotenusa del triangolo formato dai volri ax e ay
        */
        this.delta = Math.sqrt(Math.pow(Math.abs(ay), 2) +  Math.pow(Math.abs(ax), 2));
        this.limit = Math.sqrt(Math.pow(Math.abs(this.xLimit), 2) +  Math.pow(Math.abs(this.yLimit), 2));

        let apply = false;
        if( (this.drag && this.onDrag ) || !this.drag) apply = true

        if (apply) {
            const style = {
                'transform': `rotateY(${ax}deg) rotateX(${ay}deg) translateZ(0)`
            }
            Object.assign(this.container.style, style)

            // Children
            for (const item of this.childrenInstances) {
                if(item.animate) item.move(this.delta, this.limit)
            }
        }
    }

    onMouseDown() {
        this.onDrag = true
        this.firstDrag = true
    }

    onMouseUp() {
        this.onDrag = false
    }
}
