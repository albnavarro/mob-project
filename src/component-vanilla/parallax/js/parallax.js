import {eventManager} from "../../../js/base/eventManager.js";
import {parallaxItemClass} from "./parallaxItem.js";

class parallaxClass {
    constructor() {
        this.parallaxItem = document.querySelectorAll("*[data-conponent='m-comp--parallax']");
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const dataArray = Array.from(this.parallaxItem).map(item => {
            return this.getItemData(item);
        })

        for (const item of dataArray) {
            const parallaxItem = new parallaxItemClass(item);
            this.instances.push(parallaxItem);
            parallaxItem.init();
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

        // String: DOM element
        // Reference element to retrieve height and offset
        data.container = item.closest('.parallax__container');

        // String: fixed || default
        data.computationType = item.getAttribute('data-computationType') || 'default';

        // String: 0 to infinite
        // Mandatory computationType = 'fixed'
        // Value calculated based on the height / width of the container
        data.fixedRange = item.getAttribute('data-fixedRange') || null;

        // Boolean:
        // Mandatory computationType = 'fixed'
        // Get value in vh/vw
        data.scalable = item.hasAttribute('data-scalable');

        // String
        // Mandatory scalable
        // Width beyond which the calculated value will be in px
        data.scalableBreackpoint = item.getAttribute('data-scalableBreackpoint') || 'x-large';

        // Boolean
        // Mandatory computationType = 'fixed'
        // Inverts the calculated minimum and maximum values
        data.fromCalculatedValue = (item.hasAttribute('data-fromCalculatedValue'));

        // String: DOM element
        // Custom element on which to apply the calculated values
        // Default itself
        data.applyOn = document.querySelector(item.getAttribute('data-applyOn')) || null;

        // Boolean
        // Mandatory computationType = 'fixed'
        // Inhibits the application of the maximum value
        data.applyEndOff = item.hasAttribute('data-applyEndOff');

        // Boolean
        // Mandatory computationType = 'fixed'
        // Inhibits the application of the minimum value
        data.applyStartOff = item.hasAttribute('data-applyStartOff');

        // String
        data.breackpoint = item.getAttribute('data-breackpoint') || 'desktop';

        // String
        // refer to mediaManager obj
        data.queryType = item.getAttribute('data-queryType') || 'min';

        // String: DOM element
        // Performs calculations based on another element of the DOM at your choice
        data.useOtherPosition = item.getAttribute('data-otherPos') || null;

        // Boolean
        // By default the calculations are performed when the element is visible in the viewport,
        // with this attribute they will always be performed
        data.limiterOff = item.hasAttribute('data-limiterOff');

        // String
        // Mandatory computationType = 'default'
        // 1 - 10
        data.distance = item.getAttribute('data-distance') || 8;

        // String
        // 1 - 10
        data.jsVelocity = item.getAttribute('data-jsVelocity') || 8;

        // Boolean
        // Mandatory computationType = 'default'
        // inverts the calculated value
        data.reverse = item.hasAttribute('data-reverse');

        // String: toStop - toBack
        // Mandatory computationType = 'default'
        // toStop: stop the calculation reached zero
        // toBack: revert the calculation reached zero
        data.oneDirection = item.getAttribute('data-oneDirection') || '';

        // String
        // Mandatory computationType = 'default'
        // start - top - center - bottom - end  || 1-100
        // start = zero at top of the document
        // top = zero at top of the viewport
        // center = zero at middle of the viewport
        // bottom = zero at bottom of the viewport
        // end = zero at bottom of the document
        data.align = item.getAttribute('data-align') || 'top';

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity starts
        data.opacityStart = item.getAttribute('data-opacityStart') || 100;

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity ends
        data.opacityEnd = item.getAttribute('data-opacityEnd') || 0;

        // String
        // Linear || smooth
        data.ease = item.getAttribute('data-ease') || 'linear';

        // String
        // vertical , horizontal , rotate , border-width , opacity, scale
        data.propierties = item.getAttribute('data-propierties') || 'vertical';

        // String
        // ccs || js
        // Ease calculated in css or js
        data.smoothType = item.getAttribute('data-smoothType') || 'js';

        return data;
    }


}

export const parallax = new parallaxClass()
