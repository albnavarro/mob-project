import { eventManager } from '../../../js/base/eventManager.js';
import { tBlocksItemClass } from './tBlocksItem.js';

class tBlocksClass {
    constructor(data) {
        (this.item = document.querySelectorAll(
            "*[data-conponent='m-comp--tBlocks']"
        )),
            (this.instances = []);
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.item);
        for (const item of itemArray) {
            const tBlocksItem = new tBlocksItemClass(item);
            this.instances.push(tBlocksItem);
            tBlocksItem.init();
        }
    }
}

export const tBlocks = new tBlocksClass();
