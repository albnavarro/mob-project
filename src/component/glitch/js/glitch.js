import { eventManager } from '../../../js/base/eventManager.js';
import { GlitchItemClass } from './glitchItem.js';

class GlitchClass {
    constructor() {
        this.glitchItem = document.querySelectorAll(
            "*[data-conponent='m-comp--glitch']"
        );
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.glitchItem);
        const dataArray = itemArray.map((item, i) => {
            return this.getItemData(item, i);
        });

        for (const item of dataArray) {
            const glitchItem = new GlitchItemClass(item);
            this.instances.push(glitchItem);
            glitchItem.init();
        }
    }


    getItemData(item, i) {
        const data = {};
        data.item = item;
        data.steptime = item.getAttribute('data-steptime') || 3000;
        data.duration = item.getAttribute('data-duration') || 1000;
        data.increase = item.getAttribute('data-increase') || 0.1;
        data.multiplier = item.getAttribute('data-multiplier') || 0.2;
        data.breackpoint = item.getAttribute('data-breackpoint') || 'desktop';
        data.queryType = item.getAttribute('data-queryType') || 'min';
        data.counter = i;
        return data;
    }
}

export const glitch = new GlitchClass();
