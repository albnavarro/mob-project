import {mouseManager} from "../../../js/base/mouseManager.js";
import {eventManager} from "../../../js/base/eventManager.js";
import {move3DitemClass} from "./move3Ditem.js";

export class move3DContainerClass {
    constructor(data) {
        this.item = data.item
        this.container = this.item.querySelector('.move3D__container')
        this.children = this.item.querySelectorAll('.move3D__item')
        this.perspective = data.perspective
        this.xDepth = data.xDepth
        this.yDepth = data.yDepth
        this.xLimit = data.xLimit
        this.yLimit = data.yLimit
        this.drag = data.drag
        this.delta = 0
        this.limit = 0
        this.lastX = 0
        this.dragX = 0
        this.lastY = 0
        this.dragY = 0
        this.onDrag = false
        this.childrenInstances = []
    }

    init() {
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

        mouseManager.push('mousemove', () => {
            this.onMove()
        })

        if(!this.drag) {
            mouseManager.push('scroll', () => {
                this.onMove()
            })
        }

        if(this.drag) {
            this.dragX = eventManager.windowsWidth()/2
            this.dragY = eventManager.windowsHeight()/2

            mouseManager.push('mousedown', () => {
                this.onMouseDown()
            })

            mouseManager.push('mouseup', () => {
                this.onMouseUp()
            })
        }
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
        //
        data.animate = item.getAttribute('data-animate') || 0
        return data;
    }

    setDepth() {
        const style = {
            'perspective': `${this.perspective}px`
        }
        Object.assign(this.item.style, style)
    }

    onMove() {
        const vw = eventManager.windowsWidth()
        const vh = eventManager.windowsHeight()
        let x = mouseManager.clientX()
        let y = mouseManager.clientY()

        let xgap = 0
        let ygap = 0
        if( this.drag && this.onDrag ) {
            xgap = x - this.lastX
            ygap = y - this.lastY;

            this.dragX += xgap
            x =  this.dragX;

            this.dragY += ygap
            y =  this.dragY
        }

        /*
        ax = grado di rotazione sull'asse X
        ay = grado di rotazione sull'asse Y
        */
        let ax = - ( (vw / 2) - x ) / this.xDepth;
        let ay = ( (vh / 2) - y ) / this.yDepth;

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
        this.lastY = mouseManager.clientY()

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
    }

    onMouseUp() {
        this.onDrag = false
    }
}
