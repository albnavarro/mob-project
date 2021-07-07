import { eventManager } from '../../../js/base/eventManager.js';
import { mouseManager } from '../../../js/base/mouseManager.js';
import {
    outerHeight,
    outerWidth,
    offset,
} from '../../../js/utility/vanillaFunction.js';

class LightPichZoomClass {
    constructor() {
        this.scale = 1;
        this.maxZoom = 2;
        this.touchstart = null;
        this.touchend = null;
        this.mousedown = null;
        this.mouseup = null;
        this.touchmove = null;
        this.mousemove = null;
        this.onresize = null;
    }

    init({ image, wrapper }) {
        this.image = image;
        this.wrapper = wrapper;
        this.resetData();

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

        const zoomOutbtn = document.querySelector('.lightbox__zoom__in');
        zoomOutbtn.addEventListener('click', () => this.zoomOut());

        const zoomInBtn = document.querySelector('.lightbox__zoom__out');
        zoomInBtn.addEventListener('click', () => this.zoomIn());

        this.image.addEventListener(
            'mousedown',
            (e) => e.preventDefault(),
            false
        );
        this.wrapper.addEventListener(
            'mousedown',
            (e) => e.preventDefault(),
            false
        );

        this.image.addEventListener('wheel', (e) => this.onWeel(e));

        if (Modernizr.touchevents) {
            this.touchstart = mouseManager.push('touchstart', () =>
                this.onMouseDown()
            );
            this.touchend = mouseManager.push('touchend', () =>
                this.onMouseUp()
            );
        } else {
            this.mousedown = mouseManager.push('mousedown', () =>
                this.onMouseDown()
            );
            this.mouseup = mouseManager.push('mouseup', () => this.onMouseUp());
        }

        this.touchmove = mouseManager.push('touchmove', () => this.onMove());
        this.mousemove = mouseManager.push('mousemove', () => this.onMove());
        this.onresize = eventManager.push('resizeW', () => this.resetZoom());
    }

    zoomIn() {
        if (this.scale > 1) this.scale -= 0.5;
        if (this.scale == 1) this.image.classList.remove('drag-cursor');

        this.dragY = 0;
        this.dragX = 0;

        this.image.classList.add('transition');
        const style = {
            transform: `translateX(${this.dragX}px) translateY(${this.dragY}px) scale(${this.scale})`,
        };
        Object.assign(this.image.style, style);
    }

    zoomOut() {
        if (this.scale < this.maxZoom) this.scale += 0.5;

        this.image.classList.add('transition');
        const style = {
            transform: `translateX(${this.dragX}px) translateY(${this.dragY}px) scale(${this.scale})`,
        };
        Object.assign(this.image.style, style);

        this.image.classList.add('drag-cursor');
    }

    resetZoom() {
        this.scale = 1;
        this.dragY = 0;
        this.dragX = 0;

        this.image.classList.add('transition');
        const style = {
            transform: `translateX(${this.dragX}px) translateY(${this.dragY}px) scale(${this.scale})`,
        };
        Object.assign(this.image.style, style);

        this.image.classList.remove('drag-cursor');
    }

    onWeel(e) {
        let delta = 0;
        if (e.deltaY !== 0) {
            delta = e.deltaY > 0 ? -0.2 : 0.2;
        }

        this.scale += delta;

        if (this.scale < 1) this.scale = 1;

        if (this.scale > this.maxZoom) this.scale = 2;

        if (this.scale > 1) {
            this.image.classList.add('drag-cursor');
        } else {
            this.image.classList.remove('drag-cursor');
        }

        this.dragY = 0;
        this.dragX = 0;

        this.image.classList.add('transition');
        const style = {
            transform: `translateX(${this.dragX}px) translateY(${this.dragY}px) scale(${this.scale})`,
        };
        Object.assign(this.image.style, style);
    }

    onMove() {
        if (this.scale == 1) this.onDrag = false;

        let x = mouseManager.clientX();
        let y = mouseManager.clientY();

        if (Modernizr.touchevents) {
            x = mouseManager.pageX();
            y = mouseManager.pageY();
        }

        let xgap = 0;
        let ygap = 0;
        if (this.onDrag) {
            if (this.firstDrag) {
                xgap = 0;
                ygap = 0;
                this.firstDrag = false;
            } else {
                xgap = x - this.lastX;
                ygap = y - this.lastY;
            }

            this.dragX += xgap;
            x = this.dragX;

            this.dragY += ygap;
            y = this.dragY;
        }

        // XLIMITER TO CONTAINER ( window )
        const imagePosleft = offset(this.image).left;
        const imagewidth = outerWidth(this.image) * this.scale;
        const limitX = (imagewidth - eventManager.windowsWidth()) / 2;

        if (imagewidth < eventManager.windowsWidth()) {
            // NO DRAG ON X
            x = 0;
            this.dragX -= xgap;
        } else if (this.dragX <= -limitX && this.dragX <= limitX) {
            // RIGHT LIMIT
            x = -limitX;
            this.dragX -= this.dragX + limitX;
        } else if (this.dragX > -limitX && this.dragX >= limitX) {
            // LEFT LIMIT
            x = limitX;
            this.dragX -= this.dragX - limitX;
        }
        ////

        // YLIMITER TO CONTAINER ( window )
        const imagePostop = offset(this.image).top;
        const imageheight = outerHeight(this.image) * this.scale;
        const limitY = (imageheight - eventManager.windowsHeight()) / 2;

        if (imageheight < eventManager.windowsHeight()) {
            // NO DRAG ON Y
            y = 0;
            this.dragY -= ygap;
        } else if (this.dragY <= -limitY && this.dragY <= limitY) {
            // BOTTOM LIMIT
            y = -limitY;
            this.dragY -= this.dragY + limitY;
        } else if (this.dragY > -limitY && this.dragY >= limitY) {
            // TOP LIMIT
            y = limitY;
            this.dragY -= this.dragY - limitY;
        }
        ////

        this.lastX = mouseManager.clientX();
        this.lastY = mouseManager.clientY();

        if (Modernizr.touchevents) {
            this.lastX = mouseManager.pageX();
            this.lastY = mouseManager.pageY();
        }

        if (this.onDrag) {
            const style = {
                transform: `translateX(${x}px) translateY(${y}px) scale(${this.scale})`,
            };
            Object.assign(this.image.style, style);
        }
    }

    onMouseDown() {
        const target = mouseManager.getTarget();

        if (target.classList.contains('lightbox__img')) {
            this.image.classList.remove('transition');
            this.onDrag = true;
            this.firstDrag = true;
        }
    }

    onMouseUp() {
        this.onDrag = false;
    }

    resetData() {
        this.lastX = 0;
        this.dragX = 0;
        this.lastY = 0;
        this.dragY = 0;
        this.onDrag = false;
        this.firstDrag = false;
        this.scale = 1;

        if (Modernizr.touchevents) {
            mouseManager.remove('touchstart', this.touchstart);
            mouseManager.remove('touchend', this.touchend);
        } else {
            mouseManager.remove('mousedown', this.mousedown);
            mouseManager.remove('mouseup', this.mouseup);
        }

        mouseManager.remove('touchmove', this.touchmove);
        mouseManager.remove('mousemove', this.mousemove);
        eventManager.remove('resize', this.onresize);

        if (typeof this.wrapper != 'undefined' && this.wrapper != null) {
            const lightbox = this.wrapper.closest('.lightbox');
            const zoom = lightbox.querySelector('.lightbox__zoom');

            if (typeof zoom != 'undefined' && zoom != null) {
                lightbox.removeChild(zoom);
            }
        }
    }
}

export const lightPichZoom = new LightPichZoomClass();
