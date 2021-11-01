import { eventManager } from '../../../js/base/eventManager.js';
import { DraggerItemClass } from './draggerItem.js';

class DraggerClass {
    constructor() {
        this.componentItem = document.querySelectorAll(
            "*[data-conponent='m-comp--dragger']"
        );
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.componentItem);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const componentItem = new DraggerItemClass(item);
            this.instances.push(componentItem);
            componentItem.init();
        }
    }

    getItemData(item) {
        const data = {};
        data.compRoot = item;
        data.ease = item.getAttribute('data-ease') || 8;
        data.position = item.getAttribute('data-position') || 'CENTER';
        return data;
    }
}

export const dragger = new DraggerClass();
