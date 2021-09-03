import { eventManager } from '../../../js/base/eventManager.js';
import { PageScrollItemClass } from './pageScrollItem.js';

class PageScrollClass {
    constructor() {
        this.pageScrollItem = document.querySelectorAll(
            "*[data-conponent='m-comp--pageScroller']"
        );
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.pageScrollItem);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const pageScrollItem = new PageScrollItemClass(item);
            this.instances.push(pageScrollItem);
            pageScrollItem.init();
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


        return data;
    }
}

export const pageScroll = new PageScrollClass();
