export class move3DitemClass {
    constructor(data) {
        this.item = data.item
        this.depth = data.depth
        this.animate = data.animate
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
        let d = this.depth
        d = parseInt(Math.abs(( this.depth * delta ) / limit))

        const style = {
            'transform': `translateZ(${d}px)`
        }
        Object.assign(this.item.style, style)
    }
}
