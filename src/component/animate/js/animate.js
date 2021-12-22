import { AnimateItemClass } from './animateItem.js';

class AnimateClass {
    constructor() {
        this.componentItem = document.querySelectorAll(
            "*[data-conponent='m-comp--animate']"
        );
        this.instances = [];
    }

    init() {
        this.inzializeData();
    }

    inzializeData() {
        const itemArray = Array.from(this.componentItem);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const componentItem = new AnimateItemClass(item);
            this.instances.push(componentItem);
            componentItem.init();
        }
    }

    getItemData(item) {
        const data = {};
        data.compRoot = item;
        data.rootMargin = item.getAttribute('data-rootMargin') || 0;
        data.threshold = item.getAttribute('data-threshold') || 0.15;
        data.triggerEl = item.getAttribute('data-triggerEl') || null;
        data.noRepeat = item.hasAttribute('data-noRepeat');

        return data;
    }
}

export const animate = new AnimateClass();
