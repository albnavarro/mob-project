import { WaveItemClass } from './waveItem.js';

class waveClass {
    constructor() {
        this.waveItem = document.querySelectorAll(
            "*[data-conponent='m-comp--wave']"
        );
        this.instances = [];
    }

    init() {
        this.inzializeData();
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
        data.breackpoint = item.getAttribute('data-breackpoint') || 'desktop';
        data.queryType = item.getAttribute('data-queryType') || 'min';
        return data;
    }
}

export const wave = new waveClass();
