import { eventManager } from '../../../js/base/eventManager.js';
import {
    outerHeight,
    outerWidth,
    offset
} from '../../../js/utility/vanillaFunction.js';

export class PageScrollItemClass {
    constructor(data) {
        this.root = data.item
        this.content = data.item.querySelector('.pageScroller__content');
        this.shadow = data.item.querySelector('.pageScroller__shadow');
        this.speed = 30;
        this.rafOnScroll = null;
        this.startValue = 0;
        this.endValue = 0;
        this.prevValue = 0;
    }

    init() {
        const componentRoot = document.querySelector('.pageScroller');
        if(componentRoot == null) return;

        eventManager.push('load', () => this.setShadow());
        eventManager.push('load', () => this.onEnter());
        eventManager.push('resize', () => this.setShadow());
        eventManager.push('resize', () => this.onScroll());
        eventManager.push('scroll', () => this.onScroll());
    }

    setShadow() {
        const width = outerWidth(this.content);
        const height = outerHeight(this.content);
        const top = offset(this.root).top;

        const style = {
            'width': `${width}px`,
            'height': `${height}px`,
            'top':  `${top}px`
        }

        Object.assign(this.shadow.style, style)
    }

    onEnter() {
        const offsetTop = offset(this.shadow).top;
        this.endValue = eventManager.scrollTop() - offsetTop;
        this.startValue = this.endValue;

        const style = {
            'transform': `translateY(${-this.endValue}px)`
        }
        Object.assign(this.content.style, style);
    }

    onScroll() {
        const offsetTop = offset(this.shadow).top;
        this.endValue = eventManager.scrollTop() - offsetTop;

        if (!this.rafOnScroll)
            this.rafOnScroll = requestAnimationFrame(this.onReuqestAnimScroll.bind(this));
    }

    onReuqestAnimScroll(timeStamp) {
        const draw = (timeStamp) => {
            this.prevValue = this.startValue;

            const s = this.startValue,
                f = this.endValue,
                v = this.speed,
                val = (f - s) / v + s * 1;

                this.startValue = val.toFixed(1);

                const style = {
                    'transform': `translateY(${-this.startValue}px)`
                }
                Object.assign(this.content.style, style);

            // La RAF viene "rigenerata" fino a quando tutti gli elementi rimangono fermi
            if (this.prevValue == this.startValue) {
                cancelAnimationFrame(this.rafOnScrollEnd);
                this.rafOnScroll = null;
                return;
            }

            this.rafOnScroll = requestAnimationFrame(draw);
        };

        draw(timeStamp);
    }
}
