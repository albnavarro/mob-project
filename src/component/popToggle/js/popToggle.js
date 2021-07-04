import { eventManager } from '../../../js/base/eventManager.js';
import {
    slideUpDownReset,
    slideUp,
    slideDown,
} from '../../../js/utility/animation.js';

export class popToggleClass {
    constructor(data) {
        this._name = data.name || '';
        this.btn = document.querySelector(data.openButton);
        this.target = document.querySelector(data.target);
        this.closeBtn = document.querySelector(data.closeButton); // Optional
        this._openCallBack = []; // funzioni opzionale da eseguire all'apertura del sigolo PopUp
        this._closeCallBack = []; // funzioni opzionale da eseguire alla chiusura del sigolo PopUp
        this.isDropDown =
            typeof data.isDropDown === 'undefined' ? false : data.isDropDown;
        this.manager = data.manager;

        this.init();
    }

    init() {
        this.manager.pushToggle(this);

        /// GASP INITIAL STATE
        if (this.isDropDown) {
            if (typeof this.target != 'undefined' && this.target != null) {
                slideUpDownReset(this.target);
            }
        }

        if (typeof this.btn != 'undefined' && this.btn != null) {
            this.btn.addEventListener('click', (e) => this.openPop());
        }

        if (typeof this.closeBtn != 'undefined' && this.closeBtn != null) {
            this.closeBtn.addEventListener('click', (e) => this.closePop());
        }
    }

    openPop() {
        if (this.target.classList.contains('active')) {
            this.closePop();
        } else {
            this.target.classList.add('active');
            this.btn.classList.add('active');

            if (this.isDropDown) {
                slideDown(this.target).then(() => {
                    eventManager.execute('resize');
                });
            }

            if (this._openCallBack.length) {
                for (const item of this._openCallBack) {
                    item();
                }
            }
        }

        this.manager.onOpenPop(this._name);
    }

    closePop() {
        if (this.target.classList.contains('active')) {
            this.target.classList.remove('active');
            this.btn.classList.remove('active');

            if (this.isDropDown) {
                slideUp(this.target).then(() => {
                    eventManager.execute('resize');
                });
            }

            if (this._closeCallBack.length) {
                for (const item of this._closeCallBack) {
                    item();
                }
            }
        }
    }

    set openCallBack(fn) {
        this._openCallBack.push(fn);
    }

    set closeCallBack(fn) {
        this._closeCallBack.push(fn);
    }

    get name() {
        return this._name;
    }
}
