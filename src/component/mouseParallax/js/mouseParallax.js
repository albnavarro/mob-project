import { MouseParallaxItemClass } from './mouseParallaxitem.js';

class MouseParallaxClass {
    constructor() {
        this.mouseItem = document.querySelectorAll(
            "*[data-conponent='m-comp--mouseParallax']"
        );
        this.instances = [];
    }

    init() {
        this.inzializeData();
    }

    inzializeData() {
        const itemArray = Array.from(this.mouseItem);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const mouseParallaxItem = new MouseParallaxItemClass(item);
            this.instances.push(mouseParallaxItem);
            mouseParallaxItem.init();
        }
    }

    refresh() {
        for (const item of this.instances) {
            item.refresh();
        }
    }

    getItemData(item) {
        const data = {};
        data.item = item;
        data.container = item.closest('.mouseParallax__container');
        data.centerToViewoport = item.hasAttribute('data-centerToViewoport');
        data.range = item.getAttribute('data-range') || 20;
        return data;
    }
}

export const mouseParallax = new MouseParallaxClass();
