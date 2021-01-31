export class move3DitemClass {
    constructor(data) {
        this.item = data.item
        this.container = data.container
        this.depth = data.depth
        // additional rotate
        this.rotate = data.rotate
        this.direction = data.direction
        this.range = data.range
        //
        this.animate = data.animate
        this.width = 0
    }

    init() {
        if(!this.animate) {
            const style = {
                'transform': `translateZ(${this.depth}px)`
            }
            Object.assign(this.item.style, style)
        }
    }


    move(delta, limit) {
        let depth = this.depth
        depth = parseInt(Math.abs(( this.depth * delta ) / limit))

        let rotateX = 0
        let rotateY = 0

        // X rotate
        switch (this.rotate) {
            case 'x':
                rotateX = parseInt(Math.abs(( this.range * delta ) / limit))

                switch (this.direction) {
                    case 'bottom':
                        this.item.classList.add('origin-top')
                        rotateX = -rotateX
                    break;

                    case 'top':
                        this.item.classList.add('origin-bottom')
                    break;
                }
            break;

            case 'y':
                rotateY = parseInt(Math.abs(( this.range * delta ) / limit))

                switch (this.direction) {
                    case 'left':
                        this.item.classList.add('origin-right')
                        rotateY = -rotateY
                    break;

                    case 'right':
                        this.item.classList.add('origin-left')
                    break;

                }
            break;

            case 'xy':
                rotateY = parseInt(Math.abs(( this.range * delta ) / limit))
                rotateX = parseInt(Math.abs(( this.range * delta ) / limit))

                switch (this.direction) {
                    case 'top-left':
                        this.item.classList.add('origin-top-left')
                        rotateY = -rotateY
                    break;

                    case 'top-right':
                        this.item.classList.add('origin-top-right')
                    break;

                    case 'bottom-left':
                        this.item.classList.add('origin-bottom-left')
                        rotateY = -rotateY
                        rotateX = -rotateX
                    break;

                    case 'bottom-right':
                        this.item.classList.add('origin-bottom-right')
                        rotateX = -rotateX
                    break;

                }
            break;
        }

        const style = {
            'transform': `translate3D(0,0,${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        }

        Object.assign(this.item.style, style)
    }
}
