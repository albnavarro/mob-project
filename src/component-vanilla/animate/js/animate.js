import { eventManager } from "../../../js/base/eventManager.js";
import { animateItemClass } from "./animateItem.js";

class animateClass {
    constructor() {
        this.componentItem = document.querySelectorAll("*[data-conponent='m-comp--animate']");
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.componentItem);
        const dataArray = itemArray.map(item => {
            return this.getItemData(item);
        })

        for (const item of dataArray) {
            const componentItem = new animateItemClass(item);
            this.instances.push(componentItem);
            componentItem.init();
        }
    }

    getItemData(item) {
        const data = {};
        data.compRoot = item;
        data.rootMargin = item.getAttribute('data-rootMargin') || 0 ;
        data.threshold = item.getAttribute('data-threshold') || .15 ;
        data.triggerEl = item.getAttribute('data-triggerEl') || null;

        return data;
    }
}

export const animate = new animateClass()
