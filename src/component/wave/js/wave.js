import { eventManager } from '../../../js/base/eventManager.js';
import { WaveItemClass } from './waveItem.js';

class waveClass {
    constructor() {
        this.waveItem = document.querySelectorAll(
            "*[data-conponent='m-comp--wave']"
        );
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.waveItem);
        const dataArray = itemArray.map((item, i) => {
            return this.getItemData(item, i);
        });

        for (const item of dataArray) {
            const waveItem = new WaveItemClass(item);
            this.instances.push(waveItem);
            waveItem.init();
        }
    }


    getItemData(item, i) {
        const data = {};
        data.item = item;
        data.counter = i;
        data.baseFrequency = item.getAttribute('data-basefrequency') || '0.05';
        data.duration = item.getAttribute('data-duration') || '1.5';
        data.scale = item.getAttribute('data-scale') || '20';
        return data;
    }
}

export const wave = new waveClass();
