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
        const delta = ((e) => {
            if (e.deltaY !== 0) {
                return e.deltaY > 0 ? -0.2 : 0.2;
            } else {
                return 0;
            }
        })(e);

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

        const { x, y } = (() => {
            if (Modernizr.touchevents) {
                return {
                    x: mouseManager.pageX(),
                    y: mouseManager.pageY(),
                };
            } else {
                return {
                    x: mouseManager.clientX(),
                    y: mouseManager.clientY(),
                };
            }
        })();

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

        if (this.onDrag) {
            this.dragX += xgap;
            this.dragY += ygap;
        }

        const { xComputed, yComputed } = (() => {
            if (this.onDrag) {
                return {
                    xComputed: this.dragX,
                    yComputed: this.dragY,
                };
            } else {
                return {
                    xComputed: x,
                    yComputed: y,
                };
            }
        })();

        const imagewidth = outerWidth(this.image) * this.scale;
        const imageheight = outerHeight(this.image) * this.scale;
        const limitX = (imagewidth - eventManager.windowsWidth()) / 2;
        const limitY = (imageheight - eventManager.windowsHeight()) / 2;

        const xCondition = (() => {
            if (imagewidth < eventManager.windowsWidth()) {
                return 'NO-DRAG';
            } else if (this.dragX <= -limitX && this.dragX <= limitX) {
                return 'RIGHT-LIMIT';
            } else if (this.dragX > -limitX && this.dragX >= limitX) {
                return 'LEFT-LIMIT';
            } else {
                return 'DEFAULT';
            }
        })();

        const yCondition = (() => {
            if (imageheight < eventManager.windowsHeight()) {
                return 'NO-DRAG';
            } else if (this.dragY <= -limitY && this.dragY <= limitY) {
                return 'BOTTOM-LIMIT';
            } else if (this.dragY > -limitY && this.dragY >= limitY) {
                return 'TOP-LIMIT';
            } else {
                return 'DEFAULT';
            }
        })();

        const xLimited = (() => {
            switch (xCondition) {
                case 'NO-DRAG':
                    return 0;

                case 'RIGHT-LIMIT':
                    return -limitX;

                case 'LEFT-LIMIT':
                    return limitX;

                case 'DEFAULT':
                    return xComputed;
            }
        })();

        const yLimited = (() => {
            switch (yCondition) {
                case 'NO-DRAG':
                    return 0;

                case 'BOTTOM-LIMIT':
                    return -limitY;

                case 'TOP-LIMIT':
                    return limitY;

                case 'DEFAULT':
                    return yComputed;
            }
        })();

        switch (xCondition) {
            case 'NO-DRAG':
                this.dragX -= xgap;
                break;

            case 'RIGHT-LIMIT':
                this.dragX -= this.dragX + limitX;
                break;

            case 'LEFT-LIMIT':
                this.dragX -= this.dragX - limitX;
                break;
        }

        switch (yCondition) {
            case 'NO-DRAG':
                this.dragY -= ygap;
                break;

            case 'BOTTOM-LIMIT':
                this.dragY -= this.dragY + limitY;
                break;

            case 'TOP-LIMIT':
                this.dragY -= this.dragY - limitY;
                break;
        }

        this.lastX = x;
        this.lastY = y;

        if (this.onDrag) {
            const style = {
                transform: `translateX(${xLimited}px) translateY(${yLimited}px) scale(${this.scale})`,
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
