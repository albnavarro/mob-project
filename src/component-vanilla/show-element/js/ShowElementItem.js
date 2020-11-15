import { eventManager } from "../../../js/base/eventManager.js";
import { offset } from "../../../js/utility/vanillaFunction.js";

export class showElementItemClass {
    constructor(data) {
        this.pos = 0;
        this.hide = true;
        this.firstActive = false;
        this.item = data.item
        this.useOtherPosition = data.useOtherPosition
        this.OtherPositionGap = data.OtherPositionGap
        this.onlyOnce = data.onlyOnce
        this.startClass = data.startClass
        this.gap = data.gap
        this.endClass = data.endClass
    }

    init() {
        this.calcOffset()
        eventManager.push('scroll', this.checkPosition.bind(this))
        eventManager.push('resize', this.refresh.bind(this))
    }

    calcOffset() {
        if (this.useOtherPosition == null) {
            this.pos = parseInt(offset(this.item).top)
        } else {
            this.pos = parseInt(offset(document.querySelector(this.useOtherPosition)).top)
        }
    }

    refresh() {
        this.calcOffset()
        this.checkPosition()
    }

    checkPosition() {
        const postion = this.pos - eventManager.windowsHeight() + this.gap;

        let isAble = true;
        if (this.onlyOnce && this.firstActive) isAble = false;

        if (postion < eventManager.scrollTop() && this.hide && isAble) {
            this.item.classList.remove(this.startClass);
            this.item.classList.add(this.endClass);
            this.hide = false;
            this.firstActive = true;
        } else if (postion >= eventManager.scrollTop() && !this.hide && isAble) {
            this.item.classList.remove(this.endClass);
            this.item.classList.add(this.startClass);
            this.hide = true
        }
    }
}
