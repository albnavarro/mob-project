import { offset, mobbu } from '../../../js/core';

export class showElementItemClass {
    constructor(data) {
        this.pos = 0;
        this.hide = true;
        this.firstActive = false;
        this.item = data.item;
        this.useOtherPosition = data.useOtherPosition;
        this.OtherPositionGap = data.OtherPositionGap;
        this.onlyOnce = data.onlyOnce;
        this.startClass = data.startClass;
        this.gap = data.gap;
        this.endClass = data.endClass;

        this.unsubscribeScroll = () => {};
        this.unsubscribeResize = () => {};
    }

    init() {
        this.calcOffset();
        this.checkPosition();

        this.unsubscribeScroll = mobbu.useScroll(() => {
            this.checkPosition();
        });

        this.unsubscribeResize = mobbu.useResize(() => {
            this.refresh();
        });
    }

    destroy() {
        this.unsubscribeScroll();
        this.unsubscribeResize();
    }

    calcOffset() {
        if (this.useOtherPosition == null) {
            this.pos = parseInt(offset(this.item).top);
        } else {
            this.pos = parseInt(
                offset(document.querySelector(this.useOtherPosition)).top
            );
        }
    }

    refresh() {
        this.calcOffset();
        this.checkPosition();
    }

    checkPosition() {
        const postion = this.pos - window.innerHeight + this.gap;
        const isAble = this.onlyOnce && this.firstActive ? false : true;

        if (postion < window.pageYOffset && this.hide && isAble) {
            mobbu.useFrame(() => {
                this.item.classList.remove(this.startClass);
                this.item.classList.add(this.endClass);
                this.hide = false;
                this.firstActive = true;
            });
        } else if (postion >= window.pageYOffset && !this.hide && isAble) {
            mobbu.useFrame(() => {
                this.item.classList.remove(this.endClass);
                this.item.classList.add(this.startClass);
                this.hide = true;
            });
        }
    }
}
