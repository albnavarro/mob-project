import { PageScrollItemClass } from './pageScrollItem.js';

class PageScrollClass {
    constructor() {
        this.pageScrollItem = document.querySelectorAll(
            "*[data-conponent='m-comp--pageScroller']"
        );
        this.instances = [];
    }

    init() {
        this.inzializeData();
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

        data.speed = item.getAttribute('data-speed') || 15;

        // String
        data.breackpoint = item.getAttribute('data-breackpoint') || 'desktop';

        // String
        // refer to mediaManager obj
        data.queryType = item.getAttribute('data-queryType') || 'min';

        return data;
    }
}

export const pageScroll = new PageScrollClass();
