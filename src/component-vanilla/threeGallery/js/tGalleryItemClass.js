import { eventManager } from "../../../js/base/eventManager.js";
import { position, outerWidth, outerHeight, offset } from "../../../js/utility/vanillaFunction.js";
import { bodyScrollTo } from "../../../js/utility/animation.js";

export class tGalleryItemClass {
    constructor(container) {
        this.container = container;
        this.items = container.querySelectorAll('.tGallery__item');
        this.activeHDirection = 'dx';
        this.center = position(container).left + outerWidth(container) / 2;
    }

    init() {
        const itemArray = Array.from(this.items);
        for (const el of itemArray) {
            el.addEventListener('click', this.onClick.bind(this))
        }
        eventManager.push('load', this.setWidth.bind(this))
        eventManager.push('resize', this.setWidth.bind(this))
    }

    calcCenter() {
        this.center = position(this.container).left + outerWidth(this.container) / 2;
    }

    setWidth() {
        const itemArray = Array.from(this.items);
        for (const el of itemArray) {
            const innerElement = el.querySelector('.tGallery__item__wrap');
            const width = outerWidth(el);
            innerElement.style.width = `${width}px`;
        }
        this.calcCenter();
    }

    onClick(event) {
        const item = event.currentTarget;

        if (item.classList.contains('tGallery__item--active')) return;

        // reset lastSwapItem ( item that change layout position)
        const prevSwapItem = this.container.querySelector('.t-swap-item');
        if (typeof(prevSwapItem) != 'undefined' && prevSwapItem != null) {
            prevSwapItem.classList.remove('t-swap-item')
            prevSwapItem.classList.remove('t-swap-item--formLeft')
            prevSwapItem.classList.remove('t-swap-item--formRight')
        }

        // Remove swapCLone
        const clonedSwap = this.container.querySelector('.t-clone');
        if (typeof(prevSwapItem) != 'undefined' && prevSwapItem != null) {
            clonedSwap.remove()
        }

        const itemPosX = offset(item).left;
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

        // Posiziono l'attuale elemento attivo
        if(itemPosX > this.center - 20) {
            currentInnerElement.classList.add('tg-form-right');
            currentInnerElement.classList.remove('tg-form-left')
            this.activeHDirection = 'sx'

        } else {
            currentInnerElement.classList.add('tg-form-left');
            currentInnerElement.classList.remove('tg-form-right')
            this.activeHDirection = 'dx'
        }

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

        // REFRESH ITEM NEW NOT ACTIVE WIDTH
        itemNotActive = this.container.querySelectorAll('.tGallery__item:not(.tGallery__item--active)');
        itemNotActiveArray = Array.from(itemNotActive);

        // Fix IE11 animationinto flex fail
        for (const el of itemNotActiveArray) {
            const innerEl = el.querySelector('.tGallery__item__wrap')
            innerEl.style.width = `${width/2}px`;
        }

        // ACTIVE ITEM WIDTH
        currentInnerElement.style.width = `${width}px`;
    }
}
