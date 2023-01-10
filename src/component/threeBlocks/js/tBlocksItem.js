import {
    position,
    outerWidth,
    outerHeight,
    offset,
} from '../../../js/mobbu/utils/';
import { core } from '../../../js/mobbu';
import { bodyScroll } from '../../../js/mobbu/plugin';

export class tBlocksItemClass {
    constructor(container) {
        this.UP = 'UP';
        this.DOWN = 'DOWN';
        this.SX = 'SX';
        this.DX = 'DX';
        this.ADD = 'ADD';
        this.UPDATE = 'UPDATE';
        this.REMOVE = 'REMOVE';
        this.container = container;
        this.items = container.querySelectorAll('.tBlocks__item');

        this.container.querySelectorAll(
            '.tBlocks__item:not(.tBlocks__item--active)'
        );

        this.store = core.createStore({
            itemsNotActive: () => ({
                value: this.container.querySelectorAll(
                    '.tBlocks__item:not(.tBlocks__item--active)'
                ),
                type: NodeList,
            }),
            activeItem: () => ({
                value: this.container.querySelector('.tBlocks__item--active'),
                type: Element,
            }),
            swapItem: {
                item: () => ({
                    value: document.createElement('div'),
                    type: Element,
                }),
                action: () => ({
                    value: '',
                    type: String,
                    validate: (val) => {
                        const values = [this.UPDATE, this.REMOVE];
                        return values.includes(val);
                    },
                }),
            },
            clone: {
                item: () => ({
                    value: document.createElement('div'),
                    type: Element,
                }),
                action: () => ({
                    value: '',
                    type: String,
                    validate: (val) => {
                        const values = [this.REMOVE, this.ADD];
                        return values.includes(val);
                    },
                }),
            },
            horizontalDirection: () => ({
                value: this.DX,
                type: String,
                validate: (val) => {
                    const values = [this.SX, this.DX];
                    return values.includes(val);
                },
            }),
            verticalDirection: () => ({
                value: this.UP,
                type: String,
                validate: (val) => {
                    const values = [this.UP, this.DOWN];
                    return values.includes(val);
                },
            }),
            offsetLeft: () => ({
                value: 0,
                type: Number,
            }),
            center: () => ({
                value: 0,
                type: Number,
            }),
            unsubscribeResize: () => ({
                value: () => {},
                type: Function,
            }),
        });

        Object.freeze(this);
    }

    init() {
        [...this.items].forEach((item, i) => {
            item.addEventListener('click', (event) => this.onClick(event));
        });

        this.container.dataset.diretction = this.UP.toLowerCase();

        this.setWidth();
        this.calcCenter();
        this.setActiveitemTransformOrigin();
        this.setActiveitemStyle();

        const unsubscribeResize = core.useResize(() => {
            this.setWidth();
            this.calcCenter();
            this.store.set('clone', { action: this.REMOVE });
        });
        this.store.set('unsubscribeResize', unsubscribeResize);

        // SET WATCHER
        this.store.watch('activeItem', (newVal, oldVal) => {
            const item = newVal;
            const oldItem = oldVal;
            if (item === oldItem) return;
            this.onItemChange(item, oldItem);
        });

        this.store.watch('clone', (newVal, oldVal) => {
            const item = newVal;
            this.onCloneChange(item);
        });

        this.store.watch('swapItem', (newVal, oldVal) => {
            const item = newVal;
            this.onSwapChange(item);
        });

        this.store.watch('itemsNotActive', (newVal, oldVal) => {
            const items = newVal;
            this.onitemsNotActiveChange(items);
        });
    }

    destroy() {
        const { unsubscribeResize } = this.store.get();
        unsubscribeResize();
    }

    /**
     * Handler
     */
    onClick(event) {
        const item = event.currentTarget;
        this.store.set('activeItem', item);
    }

    /**
     * Utils
     */
    calcCenter() {
        const center =
            position(this.container).left + outerWidth(this.container) / 2;

        this.store.set('center', center);
    }

    setWidth() {
        const width = outerWidth(this.container);
        [...this.items].forEach((item, i) => {
            const innerElement = item.querySelector('.tBlocks__item__wrap');
            innerElement.style.width = `${width / 2}px`;
        });
    }

    setNotActiveitemStyle() {
        const itemsNotActive = this.container.querySelectorAll(
            '.tBlocks__item:not(.tBlocks__item--active)'
        );

        [...itemsNotActive].forEach((item, i) => {
            const innerEl = item.querySelector('.tBlocks__item__wrap');
            innerEl.style.transform = `translate3d(0,0,0) scale(1,1)`;

            const content = item.querySelector('.tBlocks__item__notScaled');
            content.style.transform = `translate3d(0,0,0) scale(1,1)`;
        });
    }

    setActiveitemStyle() {
        const { activeItem } = this.store.get();
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
        const { activeItem, offsetLeft, center } = this.store.get();
        const child = activeItem.querySelector('.tBlocks__item__wrap');

        if (offsetLeft > center - 20) {
            child.classList.add('tg-form-right');
            child.classList.remove('tg-form-left');
            this.store.set('horizontalDirection', this.SX);
        } else {
            child.classList.add('tg-form-left');
            child.classList.remove('tg-form-right');
            this.store.set('horizontalDirection', this.DX);
        }
    }

    /**
     * Watch methods
     */

    // Add or remove clone on clone prop change
    onCloneChange(newItem) {
        const { item, action } = newItem;

        if (item === null) return;

        if (action === this.ADD) {
            // ADD CLONE
            const { verticalDirection, horizontalDirection } = this.store.get();

            item.classList.add('t-clone');
            horizontalDirection == this.SX
                ? item.classList.add('t-clone--sx')
                : item.classList.add('t-clone--dx');

            verticalDirection == this.UP
                ? item.classList.add('t-clone--down')
                : item.classList.add('t-clone--up');

            this.container.appendChild(item);
        } else if (action === this.REMOVE) {
            // REMOVE PREVIOUS CLONE ( new item is null )
            item.remove();
        }
    }

    onSwapChange(newItem) {
        const { item, action } = newItem;

        if (item === null) return;

        if (action === this.UPDATE) {
            // Set swap item prop
            const { horizontalDirection } = this.store.get();
            item.classList.add('t-swap-item');

            if (horizontalDirection == this.SX) {
                item.classList.add('t-swap-item--formLeft');
            } else {
                item.classList.add('t-swap-item--formRight');
            }
        } else if (action === this.REMOVE) {
            // Remove swap item prop
            item.classList.remove('t-swap-item');
            item.classList.remove('t-swap-item--formLeft');
            item.classList.remove('t-swap-item--formRight');
        }
    }

    onitemsNotActiveChange(items) {
        if (items === null) return;

        [...items].forEach((item, i) => {
            item.style.order = 2;
        });
    }

    onItemChange(item, prevItem) {
        const { verticalDirection, horizontalDirection } = this.store.get();

        // Reset clone
        this.store.set('clone', { action: this.REMOVE });

        // Reset swap Item
        this.store.set('swapItem', { action: this.REMOVE });

        // Get new offset value
        this.store.set('offsetLeft', offset(item).left);

        // Set non active item order style
        const itemsNotActive = this.container.querySelectorAll(
            '.tBlocks__item:not(.tBlocks__item--active)'
        );
        this.store.set('itemsNotActive', itemsNotActive);

        // Set item that change layout position
        const swapItem = [...itemsNotActive].find((el) => {
            return el !== item;
        });
        this.store.set('swapItem', { item: swapItem, action: this.UPDATE });

        // Position the previous active element on the right or left
        prevItem.style.order = horizontalDirection === this.SX ? 3 : 1;

        // Set transform origin of the current active element and recalculate the value of horizontalDirection
        this.setActiveitemTransformOrigin();

        // create Clone
        const clone = swapItem.cloneNode(true);
        this.store.set('clone', { item: clone, action: this.ADD });

        // Update top/bottom value
        const newVerticalDirection =
            verticalDirection === this.UP ? this.DOWN : this.UP;
        this.container.dataset.diretction = newVerticalDirection.toLowerCase();
        this.store.set('verticalDirection', newVerticalDirection);

        // Get active id
        const activeId = item.dataset.id;
        this.container.dataset.activeid = activeId;
        const activeIndex = activeId;

        // RESET LAST ACTIVE ITEM
        prevItem.classList.remove('tBlocks__item--active');

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
            bodyScroll.to({ target: this.container });
        }, 500);
    }
}

// EVENT itemChange
// < container ( this.container) >.addEventListener('itemChange', (e) => {
//     console.log(e.detail)
// }, false);
