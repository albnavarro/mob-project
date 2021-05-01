import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { eventManager } from "../../../js/base/eventManager.js";
import { outerHeight, outerWidth, position } from "../../../js/utility/vanillaFunction.js";

export class overlayClass {

    constructor(data) {
        this.overlay = document.querySelector(data.element);
        this.delay = data.delay || 300;
        this._callBack = null;
        this.bodyOverflow = false;
        this.body = document.querySelector('body');

        this.init();
    }

    init() {
        if (typeof(this.overlay) === 'undefined' || this.overlay === null) return;

        this.overlay.addEventListener('click', (e) => this.onClick())
    }

    onClick() {
        this.close();

        if (this._callBack != null) {
            this._callBack();
        }
    }

    // DATA:
    // top: DOM element element to which it must align on top || number,
    // right: DOM element element to which it must align on right || number
    // bottom: DOM element element to which it must align on bottom || number
    // left: DOM element element to which it must align on bottom || left
    // name: name applied on each call,
    // bodyOverflow
    // REMEMBER the element is in fixed position so use with elment on scrollTop = 0

    open(data) {
        let top = 0;
        let right = 0;
        let bottom = 0;
        let left = 0;
        let dataName = '';

        setTimeout(() => {
            this.bodyOverflow = data.bodyOverflow;
            if (this.bodyOverflow) disableBodyScroll(this.overlay);

            if (isNaN(data.top)) {
                const el = document.querySelector(data.top);
                top = parseInt(position(el).top) + parseInt(outerHeight(el)) + 'px'
            } else {
                top = `${data.top}px`;
            }

            if (isNaN(data.right)) {
                const el = document.querySelector(data.right);
                right = eventManager.windowsWidth() - parseInt(position(el).left) + 'px';
            } else {
                right = `${data.right}px`;
            }

            if (isNaN(data.bottom)) {
                const el = document.querySelector(data.bottom);
                bottom = eventManager.windowsHeight() - parseInt(position(el).top) + 'px';
            } else {
                bottom = `${data.bottom}px`;
            }

            if (isNaN(data.left)) {
                const el = document.querySelector(data.left);
                left = parseInt(position(el).left) + parseInt(outerWidth(el)) + 'px';
            } else {
                left = `${data.left}px`;
            }

            if (data.name) dataName = data.name;

            const style = {
                'top': top,
                'bottom': bottom,
                'left': left,
                'right': right
            };
            Object.assign(this.overlay.style, style);

            this.overlay.classList.add('active');
            this.overlay.setAttribute('data-name', dataName)

        }, this.delay);
    }

    close() {
        this.overlay.classList.remove('active');
        this.overlay.setAttribute('data-name', '')
        if (this.bodyOverflow) enableBodyScroll(this.overlay);
    }

    set callback(fn) {
        this._callBack = fn;
    }

}
