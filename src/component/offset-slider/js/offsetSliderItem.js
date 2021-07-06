import { eventManager } from '../../../js/base/eventManager.js';
import { outerWidth } from '../../../js/utility/vanillaFunction.js';

export class offsetSliderItemClass {
    constructor(data) {
        this.component = data.component;
        this.container = data.component.querySelector(
            '.offset-slider__container'
        );
        this.step = data.step || 5;
        this.containerWidth = 0;
        this.items = data.component.querySelectorAll('.offset-slider__item');
        this.prevBtn = data.component.querySelector('.offset-slider__prev');
        this.nextBtn = data.component.querySelector('.offset-slider__next');
        this.drivenElIndex = 0;
        this.drivenTranslatePosition = 0;
        this.advancement = 0;
        this.activeStep = 0;
        this.elArray = [];
        this.transformProperty = Modernizr.prefixed('transform');
        this.isDown = false;
        this.startX = 0;
        this.endX = 0;
        this.val = 0;
        this.walk = 0;
    }

    init() {
        if (typeof this.container === 'undefined' || this.container === null)
            return;

        this.setData();
        this.getDrivenIndex();
        this.setWidth();
        this.setContainerWidth();
        this.setAdvancement();
        this.initSwipe();
        this.prevBtn.addEventListener('click', this.prevStep.bind(this));
        this.nextBtn.addEventListener('click', this.nextStep.bind(this));

        eventManager.push('resize', this.setContainerWidth.bind(this));
        eventManager.push('resize', this.updateData.bind(this));
        eventManager.push('resize', this.setAdvancement.bind(this));
        eventManager.push(
            'resize',
            this.setDriveElPosition.bind(this, { fireEvent: false })
        );
        eventManager.push('resize', this.setOtherElPosition.bind(this));
    }

    setData() {
        function obj(item, context) {
            this.item = item;
            this.pxWidth = 0;
            this.advancement = 0;
            // fluid set width in px || vw
            this.fluid = item.hasAttribute('data-fluid');
            this.width = item.getAttribute('data-width');
            this.driven = item.hasAttribute('data-driven');
            this.calcPxWidth = () => {
                this.pxWidth = outerWidth(this.item);
            };
            this.calcAdvancement = () => {
                this.advancement =
                    (this.pxWidth - this.containerWidth) /
                    parseInt(context.step);
            };
        }

        const elArray = Array.from(this.items);
        this.elArray = elArray.map((element) => {
            return new obj(element, this);
        });
    }

    updateData() {
        for (const el of this.elArray) {
            el.calcPxWidth();
            el.calcAdvancement();
        }
    }

    checkIfScrollable() {
        return (
            this.elArray[this.drivenElIndex].pxWidth >
            eventManager.windowsWidth()
        );
    }

    initSwipe() {
        const $cont = this.elArray[this.drivenElIndex].item;

        this.container.addEventListener('mousedown', (e) => {
            this.onMousedownTouchstart(e);
        });

        this.container.addEventListener('touchstart', (e) => {
            this.onMousedownTouchstart(e);
        });

        this.container.addEventListener('mouseleave', (e) => {
            this.onMouseleave(e);
        });

        this.container.addEventListener('mouseup', (e) => {
            this.onMouseupTouchend(e);
        });

        this.container.addEventListener('touchend', (e) => {
            this.onMouseupTouchend(e);
        });

        this.container.addEventListener('mousemove', (e) => {
            this.onMousemoveTouchmove(e);
        });

        this.container.addEventListener('touchmove', (e) => {
            this.onMousemoveTouchmove(e);
        });
    }

    onMousedownTouchstart(e) {
        if (!this.checkIfScrollable()) return;

        const elArray = Array.from(this.items);
        for (const el of elArray) {
            el.classList.add('no-transition');
        }

        this.val = this.drivenTranslatePosition;

        if (e.type === 'mousedown') {
            this.startX = e.pageX;
        } else {
            const touch = e.touches[0];
            this.startX = touch.pageX;
        }
        this.isDown = true;
    }

    onMouseleave(e) {
        if (!this.checkIfScrollable() || !this.isDown) return;

        this.drivenTranslatePosition = this.val;
        this.isDown = false;
        this.updateIndex();
    }

    onMouseupTouchend(e) {
        if (!this.checkIfScrollable()) return;

        this.drivenTranslatePosition = this.val;
        this.isDown = false;
        this.updateIndex();
    }

    onMousemoveTouchmove(e) {
        if (!this.isDown || !this.checkIfScrollable()) return;

        if (e.type == 'mousemove') {
            this.endX = e.pageX;
        } else {
            const touch = e.touches[0];
            this.endX = touch.pageX;
        }

        this.walk = this.startX - this.endX;
        this.val = this.drivenTranslatePosition - this.walk;

        const style = {};
        style[
            this.transformProperty
        ] = `translate3d(0,0,0) translateX(${this.val}px)`;

        const $cont = this.elArray[this.drivenElIndex].item;
        Object.assign($cont.style, style);

        this.setOtherElPosition(this.val);
    }

    setContainerWidth() {
        this.containerWidth = outerWidth(this.container);
    }

    updateIndex() {
        const nextIdnexGap = this.startX > this.endX ? 1 : 0;

        for (let index = 0; index < this.step; index++) {
            const min = index * this.advancement;
            const max = (index + 1) * this.advancement;

            const elArray = Array.from(this.items);
            for (const el of elArray) {
                el.classList.remove('no-transition');
            }

            if (
                -this.drivenTranslatePosition > min &&
                -this.drivenTranslatePosition < max
            ) {
                this.activeStep = -(index + nextIdnexGap);

                // CONTROLLI DI SICUREZZA
                if (this.activeStep > 0) this.activeStep = 0;
                if (this.activeStep < -parseInt(this.step))
                    this.activeStep = -parseInt(this.step);

                this.setDriveElPosition();
                this.setOtherElPosition();
                break;
            } else if (this.drivenTranslatePosition > 0) {
                this.activeStep = 0;
                this.setDriveElPosition();
                this.setOtherElPosition();
                break;
            } else if (
                -this.drivenTranslatePosition >
                this.step * this.advancement
            ) {
                this.activeStep = -this.step;
                this.setDriveElPosition();
                this.setOtherElPosition();
                break;
            }
        }
    }

    getDrivenIndex() {
        this.drivenElIndex = this.elArray.findIndex((el, i) => el.driven);
    }

    setWidth() {
        for (const el of this.elArray) {
            const unit = el.fluid ? 'vw' : 'px';

            el.item.style.width = `${el.width}${unit}`;
            el.calcPxWidth();
        }
    }

    setAdvancement() {
        const el = this.elArray[this.drivenElIndex];
        this.advancement =
            (el.pxWidth - this.containerWidth) / parseInt(this.step);
    }

    prevStep() {
        if (this.activeStep >= 0 || !this.checkIfScrollable()) return;

        this.activeStep++;
        const elArray = Array.from(this.items);
        for (const el of elArray) {
            el.classList.remove('no-transition');
        }

        this.setDriveElPosition();
        this.setOtherElPosition();
    }

    nextStep() {
        if (this.activeStep <= -this.step || !this.checkIfScrollable()) return;

        this.activeStep--;

        const elArray = Array.from(this.items);
        for (const el of elArray) {
            el.classList.remove('no-transition');
        }

        this.setDriveElPosition();
        this.setOtherElPosition();
    }

    setDriveElPosition(data) {
        const fireEvent = data && !data.fireEvent ? false : true;

        const el = this.elArray[this.drivenElIndex];
        const val = this.activeStep * this.advancement;

        const style = {};
        style[
            this.transformProperty
        ] = `translate3d(0,0,0) translateX(${val}px)`;
        Object.assign(el.item.style, style);

        this.drivenTranslatePosition = val;

        if (fireEvent) {
            this.component.dispatchEvent(
                new CustomEvent('stepChange', {
                    detail: {
                        index: Math.abs(this.activeStep),
                    },
                })
            );
        }
    }

    setOtherElPosition(val = null) {
        const walk = val ? val : this.drivenTranslatePosition;
        const drivenEl = this.elArray[this.drivenElIndex];

        for (const el of this.elArray) {
            if (!el.driven) {
                const val =
                    ((el.pxWidth - this.containerWidth) * walk) /
                    (drivenEl.pxWidth - this.containerWidth);
                const style = {
                    [this
                        .transformProperty]: `translate3d(0,0,0) translateX(${val}px)`,
                };

                Object.assign(el.item.style, style);
            }
        }
    }
}
