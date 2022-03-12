import { tBlocksItemClass } from './tBlocksItem.js';

class tBlocksClass {
    constructor(data) {
        (this.item = document.querySelectorAll('.js-tblocks')),
            (this.instances = []);
    }

    init() {
        this.inzializeData();
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
