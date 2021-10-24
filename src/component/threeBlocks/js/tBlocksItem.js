import { eventManager } from '../../../js/base/eventManager.js';
import {
    position,
    outerWidth,
    outerHeight,
    offset,
} from '../../../js/utility/vanillaFunction.js';
import { bodyScrollTo } from '../../../js/utility/animation.js';
import { modernzier } from '../../../js/utility/modernizr.js';
import { SimpleStore } from '../../../js/utility/simpleStore.js';

export class tBlocksItemClass {
    constructor(container) {
        this.UP = 'UP';
        this.DOWN = 'DOWN';
        this.SX = 'SX';
        this.DX = 'DX';
        this.container = container;
        this.items = container.querySelectorAll('.tBlocks__item');

        this.store = new SimpleStore({
            activeItem: this.container.querySelector('.tBlocks__item--active'),
            itemNotActive: null,
            swapItem: null,
            clone: null,
            offsetLeft: 0,
            horizontalDirection: this.DX,
            verticalDirection: this.UP,
            center: 0,
        });

        Object.freeze(this);
    }

    init() {
        [...this.items].forEach((item, i) => {
            item.addEventListener('click', (event) => this.onClick(event));
        });

        this.container.dataset.diretction = this.UP.toLowerCase();

        eventManager.push('load', () => this.setWidth());
        eventManager.push('load', () => this.calcCenter());
        eventManager.push('load', () => this.setActiveitemTransformOrigin());
        eventManager.push('load', () => this.setActiveitemStyle());
        eventManager.push('resize', () => this.setWidth());
        eventManager.push('resize', () => this.calcCenter());
        eventManager.push('resize', () => this.store.setProp('clone', null));

        this.store.watch('activeItem', (newVal, oldVal) => {
            const item = newVal;
            const lastItem = oldVal;
            if (item === lastItem) return;
            this.onItemChange(item, lastItem);
        });

        this.store.watch('clone', (newVal, oldVal) => {
            const item = newVal;
            const lastItem = oldVal;
            this.onCloneChange(item, lastItem);
        });

        this.store.watch('swapItem', (newVal, oldVal) => {
            const item = newVal;
            const lastItem = oldVal;
            this.onSwapChange(item, lastItem);
        });

        this.store.watch('itemNotActive', (newVal, oldVal) => {
            const items = newVal;
            this.onItemNotActiveChange(items);
        });
    }

    calcCenter() {
        const center =
            position(this.container).left + outerWidth(this.container) / 2;

        this.store.setProp('center', center);
    }

    setWidth() {
        const width = outerWidth(this.container);
        [...this.items].forEach((item, i) => {
            const innerElement = item.querySelector('.tBlocks__item__wrap');
            innerElement.style.width = `${width / 2}px`;
        });
    }

    onClick(event) {
        const item = event.currentTarget;
        this.store.setProp('activeItem', item);
    }

    setNotActiveitemStyle() {
        const itemNotActive = this.container.querySelectorAll(
            '.tBlocks__item:not(.tBlocks__item--active)'
        );

        [...itemNotActive].forEach((item, i) => {
            const innerEl = item.querySelector('.tBlocks__item__wrap');
            innerEl.style.transform = `translate3d(0,0,0) scale(1,1)`;

            const content = item.querySelector('.tBlocks__item__notScaled');
            content.style.transform = `translate3d(0,0,0) scale(1,1)`;
        });
    }

    setActiveitemStyle() {
        const activeItem = this.store.getProp('activeItem');
        const child = activeItem.querySelector('.tBlocks__item__wrap');
        const itemH = outerHeight(activeItem);
        const childH = outerHeight(child);
        const scaleYVal = itemH / childH;

        child.style.transform = `translate3d(0,0,0) scale(2,${scaleYVal})`;

        const content = child.querySelector('.tBlocks__item__notScaled');
        content.style.transform = `translate3d(0,0,0) scale(.5,${
            1 / scaleYVal
        })`;
    }

    setActiveitemTransformOrigin() {
        const activeItem = this.store.getProp('activeItem');
        const offsetLeft = this.store.getProp('offsetLeft');
        const center = this.store.getProp('center');
        const child = activeItem.querySelector('.tBlocks__item__wrap');

        if (offsetLeft > center - 20) {
            child.classList.add('tg-form-right');
            child.classList.remove('tg-form-left');
            this.store.setProp('horizontalDirection', this.SX);
        } else {
            child.classList.add('tg-form-left');
            child.classList.remove('tg-form-right');
            this.store.setProp('horizontalDirection', this.DX);
        }
    }

    // Add or remove clone on clone prop change
    onCloneChange(clone, lastClone) {
        if (clone !== null) {
            // ADD CLONE
            const verticalDirection = this.store.getProp('verticalDirection');
            const horizontalDirection = this.store.getProp(
                'horizontalDirection'
            );

            clone.classList.add('t-clone');
            this.container.appendChild(clone);

            horizontalDirection == this.SX
                ? clone.classList.add('t-clone--sx')
                : clone.classList.add('t-clone--dx');

            verticalDirection == this.UP
                ? clone.classList.add('t-clone--down')
                : clone.classList.add('t-clone--up');
        } else {
            // REMOVE CLONE
            const prevSwapItem = this.container.querySelector('.t-swap-item');

            if (typeof prevSwapItem != 'undefined' && prevSwapItem != null) {
                prevSwapItem.classList.remove('t-swap-item');
                prevSwapItem.classList.remove('t-swap-item--formLeft');
                prevSwapItem.classList.remove('t-swap-item--formRight');
            }

            if (typeof lastClone != 'undefined' && lastClone != null) {
                lastClone.remove();
            }
        }
    }

    onSwapChange(item, lastItem) {
        if (item === null) return;

        const horizontalDirection = this.store.getProp('horizontalDirection');
        item.classList.add('t-swap-item');

        if (horizontalDirection == this.SX) {
            item.classList.add('t-swap-item--formLeft');
        } else {
            item.classList.add('t-swap-item--formRight');
        }
    }

    onItemNotActiveChange(items) {
        if (items === null) return;

        [...items].forEach((item, i) => {
            item.style.order = 2;
        });
    }

    onItemChange(item, lastItem) {
        const verticalDirection = this.store.getProp('verticalDirection');
        const horizontalDirection = this.store.getProp('horizontalDirection');

        // Remove clone
        this.store.setProp('clone', null);

        // Get new offset value
        this.store.setProp('offsetLeft', offset(item).left);

        // Set non active item order style
        const itemNotActive = this.container.querySelectorAll(
            '.tBlocks__item:not(.tBlocks__item--active)'
        );
        this.store.setProp('itemNotActive', itemNotActive);

        // Set item that change layout position
        const swapItem = [...itemNotActive].find((el) => {
            return el !== item;
        });
        this.store.setProp('swapItem', swapItem);

        // Position the previous active element on the right or left
        lastItem.style.order = horizontalDirection === this.SX ? 3 : 1;

        // Set transform origin of the current active element and recalculate the value of horizontalDirection
        this.setActiveitemTransformOrigin();

        // create Clone
        const clone = swapItem.cloneNode(true);
        this.store.setProp('clone', clone);

        // Update top/bottom value
        const newVerticalDirection =
            verticalDirection === this.UP ? this.DOWN : this.UP;
        this.container.dataset.diretction = newVerticalDirection.toLowerCase();
        this.store.setProp('verticalDirection', newVerticalDirection);

        // Get active id
        const activeId = item.dataset.id;
        this.container.dataset.activeid = activeId;
        const activeIndex = activeId;

        // RESET LAST ACTIVE ITEM
        lastItem.classList.remove('tBlocks__item--active');

        // SET NEW ACTIVE ITEM
        item.classList.add('tBlocks__item--active');

        this.setNotActiveitemStyle();
        this.setActiveitemStyle();

        this.container.dispatchEvent(
            new CustomEvent('itemChange', {
                detail: {
                    hDirection: newVerticalDirection,
                    index: activeIndex,
                },
            })
        );

        setTimeout(() => {
            const scrollDestination = offset(this.container).top;
            bodyScrollTo(scrollDestination);
        }, 500);
    }
}

// EVENT itemChange
// < container ( this.container) >.addEventListener('itemChange', (e) => {
//     console.log(e.detail)
// }, false);
