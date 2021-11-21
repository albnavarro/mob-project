import { eventManager } from '../../../js/base/eventManager.js';
import { ParallaxItemClass } from './parallaxItem.js';

class ParallaxClass {
    constructor() {
        this.parallaxItem = document.querySelectorAll(
            "*[data-conponent='m-comp--parallax']"
        );
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const itemArray = Array.from(this.parallaxItem);
        const dataArray = itemArray.map((item) => {
            return this.getItemData(item);
        });

        for (const item of dataArray) {
            const parallaxItem = new ParallaxItemClass(item);
            this.instances.push(parallaxItem);
            parallaxItem.init();
        }
    }

    refresh() {
        for (const item of this.instances) {
            item.refresh();
        }
    }

    move() {
        for (const item of this.instances) {
            item.move();
        }
    }

    getItemData(item) {
        const data = {};
        data.item = item;

        // String: fixed || default
        data.computationType =
            item.getAttribute('data-computationType') || 'default';

        // String: 'VERTICAL' || 'HORIZONTAL'
        data.direction = item.getAttribute('data-direction') || 'vertical';

        // Custom container with a transate movement
        data.scroller = item.getAttribute('data-scroller') || window;

        // Custom screen
        data.screen = item.getAttribute('data-screen') || window;

        // FIXED PROPS

        // Boolean
        // Mandatory computationType = 'fixed'
        // Inverts the calculated minimum and maximum values
        data.fixedInward = item.hasAttribute('data-fixedInward');

        // String: 0 to infinite
        // shilft animation start 0 - 100 -> vh value
        data.fixedOffset = item.getAttribute('data-fixedOffset') || 0;

        // Boolean
        // Mandatory computationType = 'fixed'
        // Inhibits the application of the maximum value
        // Dont use with ease === 'smooth'
        data.fixedEndOff = item.hasAttribute('data-fixedEndOff');

        // Boolean
        // Mandatory computationType = 'fixed'
        // Inhibits the application of the minimum value
        // Dont use with ease === 'smooth'
        data.fixedStartOff = item.hasAttribute('data-fixedStartOff');

        // Boolean
        // start animation form opposite side ( top in vetical, right in horizontal)
        data.fixedInvertSide = item.hasAttribute('data-fixedInvertSide');

        // LINEAR PROPS
        // String
        // Mandatory computationType = 'default'
        // 1 - 10
        data.range = item.getAttribute('data-range') || 8;

        // String: in-stop - in-back - out-stop - out-back
        // Mandatory computationType = 'default' doasn't work with opacity
        // in-stop: stop the calculation reached zero
        // in-back : revert the calculation reached zero
        // out-stop: move element only ofter reached 0
        // out-back
        data.onSwitch = item.getAttribute('data-onSwitch') || '';

        // String
        // Mandatory computationType = 'default'
        // start - top - center - bottom - end  || 1-100
        // start = zero at top of the document
        // top = zero at top of the viewport
        // center = zero at middle of the viewport
        // bottom = zero at bottom of the viewport
        // end = zero at bottom of the document
        data.align = item.getAttribute('data-align') || 'center';

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity starts
        data.opacityStart = item.getAttribute('data-opacityStart') || 100;

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity ends
        data.opacityEnd = item.getAttribute('data-opacityEnd') || 0;

        // COMMON PROPS

        data.perspective = item.getAttribute('data-perspective') || null;

        // String: DOM element
        // Custom element on which to apply the calculated values
        // Default itself
        data.applyEl =
            document.querySelector(item.getAttribute('data-applyEl')) || null;

        // String: DOM element
        // Performs calculations based on another element of the DOM at your choice
        data.triggerEl = item.getAttribute('data-triggerEl') || null;

        // String
        data.breackpoint = item.getAttribute('data-breackpoint') || 'desktop';

        // String
        // refer to mediaManager obj
        data.queryType = item.getAttribute('data-queryType') || 'min';

        // Boolean
        // By default the calculations are performed when the element is visible in the viewport,
        // with this attribute they will always be performed
        data.limiterOff = item.hasAttribute('data-limiterOff');

        // String
        // 1 - 10
        data.jsDelta = item.getAttribute('data-jsDelta') || 8;

        // Boolean
        // Mandatory computationType = 'default'
        // inverts the calculated value
        data.reverse = item.hasAttribute('data-reverse');

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

export const parallax = new ParallaxClass();
