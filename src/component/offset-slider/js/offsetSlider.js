import { eventManager } from '../../../js/base/eventManager.js';
import { offsetSliderItemClass } from './offsetSliderItem.js';

class offsetSliderClass {
    constructor(data) {
        (this.item = document.querySelectorAll(
            "*[data-conponent='m-comp--offSetSlider']"
        )),
            (this.instances = []);
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.item);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const offsetSliderItem = new offsetSliderItemClass(item);
            this.instances.push(offsetSliderItem);
            offsetSliderItem.init();
        }
    }

    getItemData(item) {
        const data = {};
        data.component = item;
        data.step = item.getAttribute('data-step') || '8';
        return data;
    }
}

export const offsetSlider = new offsetSliderClass();
