import { eventManager } from '../../../js/base/eventManager.js';
import { ParallaxItemClass } from './parallaxItem.js';

class ParallaxClass {
    constructor() {
        this.parallaxItem = document.querySelectorAll(
            "*[data-conponent='m-comp--parallax']"
        );
        this.id = 0;
        this.instances = [];
    }

    init() {
        eventManager.push('load', this.inzializeData.bind(this));
    }

    inzializeData() {
        const dataArray = [...this.parallaxItem].map((item) => {
            return this.getItemData(item);
        });

        dataArray.forEach((item, i) => {
            this.id++;
            const parallaxItem = new ParallaxItemClass(item);
            this.instances.push({ id: this.id, istance: parallaxItem });
            parallaxItem.init();
        });
    }

    refresh() {
        for (const item of this.instances) {
            const { istance } = item;
            if (istance) istance.refresh();
        }
    }

    move() {
        for (const item of this.instances) {
            const { istance } = item;
            if (istance) istance.move();
        }
    }

    add(istance) {
        this.id++;
        this.instances.push({ id: this.id, istance: istance });
        return (() => this.remove(this.id))
    }

    remove(id) {
        const newInstances = this.instances.filter((item) => {
            const { id: instaceId, istance } = item;
            const itemToRemove = instaceId === id;

            if (itemToRemove) {
                istance.unsubscribe();
            }
            return !itemToRemove;
        });

        this.instances = newInstances;
    }

    getItemData(item) {
        const data = {};
        data.item = item;

        // String: fixed || default
        data.computationType =
            item.getAttribute('data-computationType') || 'default';

        // String: 'VERTICAL' || 'HORIZONTAL'
        data.direction = item.getAttribute('data-direction');

        // Custom container with a transate movement
        data.scroller = item.getAttribute('data-scroller');

        // Custom screen
        data.screen = item.getAttribute('data-screen');

        // FIXED PROPS

        // Boolean
        // Mandatory computationType = 'fixed'
        // Inverts the calculated minimum and maximum values
        data.fixedFromTo = item.hasAttribute('data-fixedFromTo');

        // String: 0 to infinite
        // shilft animation start 0 - 100 -> vh value
        data.fixedOffset = item.getAttribute('data-fixedOffset');

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
        data.range = item.getAttribute('data-range');

        // String: in-stop - in-back - out-stop - out-back
        // Mandatory computationType = 'default' doasn't work with opacity
        // in-stop: stop the calculation reached zero
        // in-back : revert the calculation reached zero
        // out-stop: move element only ofter reached 0
        // out-back
        data.onSwitch = item.getAttribute('data-onSwitch');

        // String
        // Mandatory computationType = 'default'
        // start - top - center - bottom - end  || 1-100
        // start = zero at top of the document
        // top = zero at top of the viewport
        // center = zero at middle of the viewport
        // bottom = zero at bottom of the viewport
        // end = zero at bottom of the document
        data.align = item.getAttribute('data-align');

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity starts
        data.opacityStart = item.getAttribute('data-opacityStart');

        // String
        // Mandatory propierties = 'opacity'
        // 1- 100: percentage of the viewport from which the opcity ends
        data.opacityEnd = item.getAttribute('data-opacityEnd');

        // COMMON PROPS

        data.perspective = item.getAttribute('data-perspective');

        // String: DOM element
        // Custom element on which to apply the calculated values
        // Default itself
        data.applyTo = document.querySelector(
            item.getAttribute('data-applyTo')
        );

        // String: DOM element
        // Performs calculations based on another element of the DOM at your choice
        data.scrollTrigger = item.getAttribute('data-scrollTrigger');

        // String
        data.breackpoint = item.getAttribute('data-breackpoint');

        // String
        // refer to mediaManager obj
        data.queryType = item.getAttribute('data-queryType');

        // Boolean
        // By default the calculations are performed when the element is visible in the viewport,
        // with this attribute they will always be performed
        data.limiterOff = item.hasAttribute('data-limiterOff');

        // String
        // 1 - 10
        data.scrub = item.getAttribute('data-scrub');

        // Boolean
        // Mandatory computationType = 'default'
        // inverts the calculated value
        data.reverse = item.hasAttribute('data-reverse');

        // String
        // Linear || smooth
        data.ease = item.hasAttribute('data-ease');

        // String
        // vertical , horizontal , rotate , border-width , opacity, scale
        data.propierties = item.getAttribute('data-propierties');

        // String
        // ccs || js
        // Ease calculated in css or js
        data.easeType = item.getAttribute('data-easeType');

        return data;
    }
}

export const parallax = new ParallaxClass();
