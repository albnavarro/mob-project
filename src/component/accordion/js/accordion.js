import { eventManager } from '../../../js/base/eventManager.js';
import { AccordionItemClass } from './accordionItem.js';

class AccordionClass {
    constructor() {
        this.accordionItem = document.querySelectorAll(
            "*[data-conponent='m-comp--accordion']"
        );
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.accordionItem);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const accordionItem = new AccordionItemClass(item);
            this.instances.push(accordionItem);
            accordionItem.init();
        }
    }

    getItemData(item) {
        const data = {};
        data.container = item;
        data.breackpoint = item.getAttribute('data-breackpoint') || 'x-small';
        data.queryType = item.getAttribute('data-queryType') || 'min';
        data.multiple = item.hasAttribute('data-multiple');
        data.notAllClose = item.hasAttribute('data-notAllClose');

        return data;
    }
}

export const accordion = new AccordionClass();
