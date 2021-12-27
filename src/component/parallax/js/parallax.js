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
        this.inzializeData();
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
        return () => this.remove(this.id);
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
        data.fromTo = item.hasAttribute('data-fromTo');

        // any:
        // data-start="20" -> start from 20vw form bottom
        // data-start="20px" -> start from 20px form bottom
        // add special keyword:
        // h = height -> +h -h +h/ -h/
        // w = width- > +w -w +w/ -w/
        // h/ = height -> height/2
        // w/ = width- > width/2
        // "20px +h" || "20px +h/" || "20 -w/" || "-h" || "-w" etc..
        data.start = item.getAttribute('data-start');

        // any:
        // data-end="20" || -> end at 20vw form top
        // data-end="20px" -> end at 20px form top
        // add special keyword:
        // h = height -> +h -h +h/ -h/
        // w = width- > +w -w +w/ -w/
        // h/ = height -> height/2
        // w/ = width- > width/2
        // "20px +h" || "20px +h/" || "20 -w/" || "-h" || "-w/" etc..
        // with no value animation end at height or width ( depend by scrolldirection ) from start value
        data.end = item.getAttribute('data-end');

        // Boolean
        // start animation form opposite side ( top in vetical, right in horizontal)
        data.invertSide = item.hasAttribute('data-invertSide');

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

        // Any
        // Range of movement
        // computationType = 'default'
        // form .1 to up less is the number bigger is the movement
        // computationType = 'fixed'
        // horzontal / vertical:
        // '100h%' => percent of item height
        // '100w%' => percent of item width
        // '100px  => pixel value
        // '100vw' => pervent of viewport width
        // '100wh' => pervent of viewport height
        // negative number is valid es: '-100px' or '-100h%'
        // other ( scale rotate margin etcc..)
        // '90' -> 90 deg etc..
        data.range = item.getAttribute('data-range');

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

        // spring config
        // use string form spingConfig.js definition
        data.springConfig = item.getAttribute('data-springConfig');

        // spring config
        // use string form spingConfig.js definition
        data.lerpConfig = item.getAttribute('data-lerpConfig');

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
        // SPRING || LERP
        // Ease calculated in css or js
        data.easeType = item.getAttribute('data-easeType');

        return data;
    }
}

export const parallax = new ParallaxClass();
