import { outerHeight, outerWidth } from '.../../../js/mobbu/utils';
import { core } from '../../../js/mobbu';

class LightPichZoomClass {
    constructor() {
        this.scale = 1;
        this.maxZoom = 3;
        this.touchstart = null;
        this.touchend = null;
        this.mousedown = null;
        this.mouseup = null;
        this.touchmove = null;
        this.mousemove = null;
        this.onresize = null;
        this.itemWidth = 0;
        this.itemHeight = 0;
        this.limitX = 0;
        this.limitY = 0;
        this.contWidth = window.innerWidth;
        this.contHeight = window.innerHeight;

        this.unsubscribeTouchStart = () => {};
        this.unsubscribeTouchEnd = () => {};
        this.unsubscribeMouseDown = () => {};
        this.unsubscribeMouseUp = () => {};
        this.unsubscribeMouseMove = () => {};
        this.unsubscribeTouchMove = () => {};
        this.unsubscribeWheel = () => {};
        this.unsubscribeResize = () => {};
    }

    init({ image, wrapper }) {
        this.image = image;
        this.wrapper = wrapper;
        this.setDimension();

        const lightbox = wrapper.closest('.lightbox');

        const zoomEl = document.createElement('nav');
        const zoomIn = document.createElement('button');
        const zoomOut = document.createElement('button');

        zoomEl.classList.add('lightbox__zoom');
        zoomIn.classList.add('lightbox__zoom__in');
        zoomIn.innerHTML = 'zoom in';
        zoomOut.classList.add('lightbox__zoom__out');
        zoomOut.innerHTML = 'zoom out';

        lightbox.appendChild(zoomEl);
        const zoom = lightbox.querySelector('.lightbox__zoom');
        zoom.appendChild(zoomIn);
        zoom.appendChild(zoomOut);
        this.setZoomBtnhandler();

        this.unsubscribeWheel = core.useMouseWheel(({ spinY, target }) => {
            this.onWeel({ spinY, target });
        });

        this.unsubscribeTouchStart = core.useTouchStart(
            ({ target, preventDefault }) => {
                this.onMouseDown({ target, preventDefault });
            }
        );

        this.unsubscribeMouseDown = core.useMouseDown(
            ({ target, preventDefault }) => {
                this.onMouseDown({ target, preventDefault });
            }
        );

        this.unsubscribeTouchEnd = core.useTouchEnd(() => {
            this.onMouseUp();
        });

        this.unsubscribeMouseUp = core.useMouseUp(() => {
            this.onMouseUp();
        });

        this.unsubscribeMouseMove = core.useMouseMove(({ page }) => {
            this.onMove(false, page.x, page.y);
        });

        this.unsubscribeTouchMove = core.useTouchMove(({ page }) => {
            this.onMove(false, page.x, page.y);
        });

        this.unsubscribeResize = core.useResize(() => {
            this.resetZoom();
        });
    }

    setZoomBtnhandler() {
        const zoomOutbtn = document.querySelector('.lightbox__zoom__in');
        zoomOutbtn.addEventListener('click', () => this.zoomOut());

        const zoomInBtn = document.querySelector('.lightbox__zoom__out');
        zoomInBtn.addEventListener('click', () => this.zoomIn());
    }

    setDimension() {
        this.itemWidth = outerWidth(this.image) * this.scale;
        this.itemHeight = outerHeight(this.image) * this.scale;
        this.limitX = (this.itemWidth - window.innerWidth) / 2;
        this.limitY = (this.itemHeight - window.innerHeight) / 2;
    }

    resetData() {
        this.lastX = 0;
        this.dragX = 0;
        this.lastY = 0;
        this.dragY = 0;
        this.onDrag = false;
        this.firstDrag = false;
        this.scale = 1;
        this.itemWidth = 0;
        this.itemHeight = 0;
        this.limitX = 0;
        this.limitY = 0;

        this.unsubscribeTouchStart();
        this.unsubscribeTouchEnd();
        this.unsubscribeMouseDown();
        this.unsubscribeMouseUp();
        this.unsubscribeMouseMove();
        this.unsubscribeTouchMove();
        this.unsubscribeResize();
        this.unsubscribeWheel();

        if (typeof this.wrapper != 'undefined' && this.wrapper != null) {
            const lightbox = this.wrapper.closest('.lightbox');
            const zoom = lightbox.querySelector('.lightbox__zoom');

            if (typeof zoom != 'undefined' && zoom != null) {
                lightbox.removeChild(zoom);
            }
        }
    }

    // EVENT

    zoomIn() {
        this.scale = this.clamp(this.scale - 0.5, 1, this.maxZoom);
        if (this.scale === 1) this.image.classList.remove('drag-cursor');
        this.afterZoom();
    }

    zoomOut() {
        this.scale = this.clamp(this.scale + 0.5, 1, this.maxZoom);
        this.image.classList.add('drag-cursor');
        this.afterZoom();
    }

    afterZoom() {
        this.image.classList.add('transition');
        this.setDimension();

        // Center image when needed
        if (
            this.itemWidth * this.scale < window.innerWidth ||
            this.itemHeight * this.scale < window.innerHeight
        ) {
            this.dragY = 0;
            this.dragX = 0;
        }

        this.onMove(true);
    }

    resetZoom() {
        this.scale = 1;
        this.image.classList.remove('drag-cursor');
        this.afterZoom();
    }

    onMouseDown({ target, preventDefault }) {
        if (target.classList.contains('lightbox__img')) {
            this.image.classList.remove('transition');
            this.onDrag = true;
            this.firstDrag = true;
            preventDefault();
        }
    }

    onMouseUp() {
        this.onDrag = false;
    }

    onWeel({ spinY, target }) {
        this.scale = this.clamp(this.scale + spinY / 20, 1, this.maxZoom);

        if (this.scale > 1) {
            this.image.classList.add('drag-cursor');
        } else {
            this.image.classList.remove('drag-cursor');
        }

        this.afterZoom();
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    onMove(force = false, x, y) {
        if (this.scale == 1) this.onDrag = false;

        const { xgap, ygap } = (() => {
            if (!this.onDrag) return { xgap: 0, ygap: 0 };

            if (this.firstDrag) {
                this.firstDrag = false;
                return {
                    xgap: 0,
                    ygap: 0,
                };
            } else {
                return {
                    xgap: x - this.lastX,
                    ygap: y - this.lastY,
                };
            }
        })();

        /**
         * Get x value clamped to min max if is dragging or last vlue
         */
        const dragX =
            this.onDrag || force
                ? this.clamp(this.dragX + xgap, -this.limitX, this.limitX)
                : this.dragX;

        /**
         * Get y value clamped to min max if is dragging or last vlue
         */
        const dragY =
            this.onDrag || force
                ? this.clamp(this.dragY + ygap, -this.limitY, this.limitY)
                : this.dragY;

        const { xComputed, yComputed } = (() => {
            if (this.onDrag || force) {
                return {
                    xComputed: dragX,
                    yComputed: dragY,
                };
            } else {
                return {
                    xComputed: x,
                    yComputed: y,
                };
            }
        })();

        /**
         * Get final value if item is bigger then container
         */
        const xValue = this.itemWidth < this.contWidth ? 0 : xComputed;
        const yValue = this.itemHeight < this.contHeight ? 0 : yComputed;

        /**
         * Update gobal value
         */
        this.dragX = dragX;
        this.dragY = dragY;

        this.lastX = x;
        this.lastY = y;

        if (this.onDrag || force) {
            // this.image.style.transform = `translateX(${xValue}px) translateY(${yValue}px) scale(${this.scale})`;
            core.useFrame(() => {
                this.image.style.transform = `translateX(${xValue}px) translateY(${yValue}px) scale(${this.scale})`;
            });
        }
    }
}

export const lightPichZoom = new LightPichZoomClass();
