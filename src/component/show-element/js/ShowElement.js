import { showElementItemClass } from './ShowElementItem.js';

class showElementClass {
    constructor(data) {
        (this.item = document.querySelectorAll(
            "*[data-conponent='m-comp--toggleEl']"
        )),
            (this.instances = []);
    }

    init() {
        this.inzializeData();
    }

    inzializeData() {
        const itemArray = Array.from(this.item);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const showElementItem = new showElementItemClass(item);
            this.instances.push(showElementItem);
            showElementItem.init();
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
        data.useOtherPosition = item.getAttribute('data-otherPos') || null;
        data.OtherPositionGap = item.getAttribute('data-otherPosGap') || 0;
        data.onlyOnce = item.hasAttribute('data-onlyOnce');
        data.startClass = item.getAttribute('data-startClass');
        data.gap = parseInt(item.getAttribute('data-gap')) || 0;
        data.endClass = item.getAttribute('data-endClass');

        return data;
    }
}

export const showElement = new showElementClass();
