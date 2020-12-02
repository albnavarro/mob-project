import { eventManager } from "../../../js/base/eventManager.js";
import { position, outerWidth, outerHeight, offset } from "../../../js/utility/vanillaFunction.js";
import { bodyScrollTo } from "../../../js/utility/animation.js";
import {modernzier} from "../../../js/utility/modernizr.js"

export class tBlocksItemClass {
    constructor(container) {
        this.container = container;
        this.items = container.querySelectorAll('.tGallery__item');
        this.activeHDirection = 'dx';
        this.center = position(container).left + outerWidth(container) / 2;
        this.transformProperty = Modernizr.prefixed('transform');
    }

    init() {
        const itemArray = Array.from(this.items);
        for (const el of itemArray) {
            el.addEventListener('click', this.onClick.bind(this))
        }
        eventManager.push('load', this.setWidth.bind(this))
        eventManager.push('load', this.setTransformOrigin.bind(this))
        eventManager.push('load', this.setActiveTransform.bind(this))
        eventManager.push('resize', this.setWidth.bind(this))
        eventManager.push('resize', this.removeSwapItem.bind(this))
    }

    calcCenter() {
        this.center = position(this.container).left + outerWidth(this.container) / 2;
    }

    setWidth() {
        const itemArray = Array.from(this.items);
        const width = outerWidth(this.container);
        for (const el of itemArray) {
            const innerElement = el.querySelector('.tGallery__item__wrap');
            innerElement.style.width = `${width/2}px`;
        }
        this.calcCenter();
    }

    setActiveTransform(item = null, child = null) {
        if (item == null) item = this.container.querySelector('.tGallery__item--active');
        if (child == null) child = item.querySelector('.tGallery__item__wrap');

        const childH = outerHeight(child);
        const itemH = outerHeight(item);
        const scaleYVal = itemH / childH;

        let style = {}
        style[this.transformProperty] = `translate3d(0,0,0) scale(2,${scaleYVal})`;
        Object.assign(child.style, style);

        const content = child.querySelector('.tGallery__item__notScaled');
        style[this.transformProperty] = `translate3d(0,0,0) scale(.5,${1/scaleYVal})`;
        Object.assign(content.style, style);
    }

    resetTransform(items) {
        const style = {};
        style[this.transformProperty] = `translate3d(0,0,0) scale(1,1)`;

        for (const el of items) {
            const innerEl = el.querySelector('.tGallery__item__wrap')
            Object.assign(innerEl.style, style);

            const content = el.querySelector('.tGallery__item__notScaled');
            Object.assign(content.style, style);
        }
    }

    setTransformOrigin(item = null, child = null, posX = null) {
        if (item == null) item = this.container.querySelector('.tGallery__item--active');
        if (child == null) child = item.querySelector('.tGallery__item__wrap');
        if (posX == null) posX = offset(item).left;

        if(posX > this.center - 20) {
            child.classList.add('tg-form-right');
            child.classList.remove('tg-form-left')
            this.activeHDirection = 'sx'

        } else {
            child.classList.add('tg-form-left');
            child.classList.remove('tg-form-right')
            this.activeHDirection = 'dx'
        }
    }

    removeSwapItem() {
        const prevSwapItem = this.container.querySelector('.t-swap-item');
        if (typeof(prevSwapItem) != 'undefined' && prevSwapItem != null) {
            prevSwapItem.classList.remove('t-swap-item')
            prevSwapItem.classList.remove('t-swap-item--formLeft')
            prevSwapItem.classList.remove('t-swap-item--formRight')
        }

        const clonedSwap = this.container.querySelector('.t-clone');
        if (typeof(prevSwapItem) != 'undefined' && prevSwapItem != null) {
            clonedSwap.remove()
        }
    }

    onClick(event) {
        const item = event.currentTarget;

        if (item.classList.contains('tGallery__item--active')) return;

        // reset lastSwapItem ( item that change layout position)
        this.removeSwapItem();

        const posX = offset(item).left;
        const width = outerWidth(this.container);
        const currentInnerElement = item.querySelector('.tGallery__item__wrap');
        let itemNotActive = this.container.querySelectorAll('.tGallery__item:not(.tGallery__item--active)');
        let itemNotActiveArray = Array.from(itemNotActive);
        let vDirection = this.container.getAttribute('data-diretction');

        // POSIZIONO "NEL MEZZO" gli item non attivi
        for (const el of itemNotActiveArray) {
            el.style.order = 2;
        }

        // find item that change layout position
        const swapItem = itemNotActiveArray.find((el) => {
            return el !== item;
        })
        swapItem.classList.add('t-swap-item');

        // Posizione il precendete elemento attivo a dx o sx
        const activerItem = this.container.querySelector('.tGallery__item--active');
        if (this.activeHDirection == 'sx') {
            activerItem.style.order = 3;
            swapItem.classList.add('t-swap-item--formLeft');
        } else {
            activerItem.style.order = 1;
            swapItem.classList.add('t-swap-item--formRight');
        }

        // // Posiziono l'attuale elemento attivo
        this.setTransformOrigin(item,currentInnerElement,posX);

        //CLONE
        const swapClone = swapItem.cloneNode(true);
        swapClone.classList.add('t-clone');
        this.container.appendChild(swapClone);
        (this.activeHDirection == 'sx') ? swapClone.classList.add('t-clone--sx') : swapClone.classList.add('t-clone--dx');
        (vDirection == 'up') ? swapClone.classList.add('t-clone--down') : swapClone.classList.add('t-clone--up');

        // Setto l'altrnanza top/bottom
        (vDirection == 'up') ?  vDirection = 'down' :  vDirection = 'up';
        this.container.setAttribute('data-diretction', vDirection )

        const scrollDestination = offset(this.container).top;
        bodyScrollTo(scrollDestination);

        // RESET LAST ACTIVE ITEM
        activerItem.classList.remove('tGallery__item--active')

        // SET NEW ACTIVE ITEM
        item.classList.add('tGallery__item--active')

        itemNotActive = this.container.querySelectorAll('.tGallery__item:not(.tGallery__item--active)');
        itemNotActiveArray = Array.from(itemNotActive);

        this.resetTransform(itemNotActiveArray)
        this.setActiveTransform(item,currentInnerElement);
    }
}
